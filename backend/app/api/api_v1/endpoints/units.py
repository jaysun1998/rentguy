from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.db.base import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Unit])
def read_units(
    db: Session = Depends(get_db),
    property_id: int = Query(..., description="Property ID to filter units"),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve units for a property owned by current user.
    """
    units = crud.unit.get_by_property_owner(
        db=db, property_id=property_id, owner_id=current_user.id
    )
    return units

@router.post("/", response_model=schemas.Unit)
def create_unit(
    *,
    db: Session = Depends(get_db),
    unit_in: schemas.UnitCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new unit.
    """
    try:
        unit = crud.unit.create_for_property(
            db=db, obj_in=unit_in, owner_id=current_user.id
        )
        return unit
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{id}", response_model=schemas.Unit)
def update_unit(
    *,
    db: Session = Depends(get_db),
    id: int,
    unit_in: schemas.UnitUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a unit.
    """
    unit = crud.unit.get_by_owner_and_id(
        db=db, unit_id=id, owner_id=current_user.id
    )
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    unit = crud.unit.update(db=db, db_obj=unit, obj_in=unit_in)
    return unit

@router.delete("/{id}", response_model=schemas.Unit)
def delete_unit(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a unit.
    """
    unit = crud.unit.get_by_owner_and_id(
        db=db, unit_id=id, owner_id=current_user.id
    )
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    unit = crud.unit.remove(db=db, id=id)
    return unit