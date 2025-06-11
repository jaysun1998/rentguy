from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.db.base import get_db

router = APIRouter()

@router.get("/requests", response_model=List[schemas.MaintenanceRequest])
def read_maintenance_requests(
    db: Session = Depends(get_db),
    tenant_id: int = Query(None, description="Tenant ID to filter requests"),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve maintenance requests.
    """
    if tenant_id:
        # If filtering by tenant, user must be the tenant or property owner
        if current_user.id == tenant_id:
            # User is the tenant
            requests = crud.maintenance_request.get_by_tenant(db=db, tenant_id=tenant_id)
        else:
            # Verify tenant belongs to current user (property manager)
            tenant = crud.tenant.get_by_owner_and_id(db=db, tenant_id=tenant_id, owner_id=current_user.id)
            if not tenant:
                raise HTTPException(status_code=404, detail="Tenant not found")
            requests = crud.maintenance_request.get_by_tenant(db=db, tenant_id=tenant_id)
        return requests
    else:
        # Return all requests for properties owned by current user
        requests = crud.maintenance_request.get_by_owner(db=db, owner_id=current_user.id, skip=skip, limit=limit)
        return requests

@router.post("/requests", response_model=schemas.MaintenanceRequest)
def create_maintenance_request(
    *,
    db: Session = Depends(get_db),
    request_in: schemas.MaintenanceRequestCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new maintenance request.
    """
    # For MVP, allow any authenticated user to create requests
    # In production, verify tenant has access to the unit
    request = crud.maintenance_request.create_for_unit(
        db=db, obj_in=request_in, reported_by=current_user.id
    )
    return request

@router.put("/requests/{id}/assign", response_model=schemas.MaintenanceRequest)
def assign_maintenance_request(
    *,
    db: Session = Depends(get_db),
    id: int,
    assign_data: schemas.MaintenanceRequestAssign,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Assign maintenance request to a user.
    """
    request = crud.maintenance_request.assign_to_user(
        db=db, request_id=id, assigned_to=assign_data.assigned_to, owner_id=current_user.id
    )
    if not request:
        raise HTTPException(
            status_code=404, 
            detail="Maintenance request not found"
        )
    return request

@router.put("/requests/{id}/resolve", response_model=schemas.MaintenanceRequest)
def resolve_maintenance_request(
    *,
    db: Session = Depends(get_db),
    id: int,
    resolve_data: schemas.MaintenanceRequestResolve,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Resolve maintenance request.
    """
    request = crud.maintenance_request.resolve_request(
        db=db, request_id=id, owner_id=current_user.id, actual_cost=resolve_data.actual_cost
    )
    if not request:
        raise HTTPException(
            status_code=404, 
            detail="Maintenance request not found"
        )
    return request