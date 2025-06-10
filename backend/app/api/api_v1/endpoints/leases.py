from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.db.base import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Lease])
def read_leases(
    db: Session = Depends(get_db),
    unit_id: int = Query(None, description="Unit ID to filter leases"),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve leases owned by the current user.
    """
    if unit_id:
        leases = crud.lease.get_by_unit(db=db, unit_id=unit_id)
        # Verify ownership
        if leases:
            unit = crud.unit.get_by_owner_and_id(db=db, unit_id=unit_id, owner_id=current_user.id)
            if not unit:
                raise HTTPException(status_code=404, detail="Unit not found")
        return leases
    else:
        leases = crud.lease.get_by_owner(db=db, owner_id=current_user.id, skip=skip, limit=limit)
        return leases

@router.post("/", response_model=schemas.Lease)
def create_lease(
    *,
    db: Session = Depends(get_db),
    lease_in: schemas.LeaseCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new lease.
    """
    try:
        lease = crud.lease.create_for_owner(
            db=db, obj_in=lease_in, owner_id=current_user.id
        )
        return lease
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{id}/sign", response_model=schemas.Lease)
def sign_lease(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Sign a lease digitally.
    """
    lease = crud.lease.sign_lease(db=db, lease_id=id, owner_id=current_user.id)
    if not lease:
        raise HTTPException(
            status_code=404, 
            detail="Lease not found or not eligible for signing"
        )
    return lease

@router.get("/{id}", response_model=schemas.Lease)
def read_lease(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get lease by ID.
    """
    lease = crud.lease.get(db=db, id=id)
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    
    # Verify ownership
    unit = crud.unit.get_by_owner_and_id(db=db, unit_id=lease.unit_id, owner_id=current_user.id)
    if not unit:
        raise HTTPException(status_code=404, detail="Lease not found")
    
    return lease