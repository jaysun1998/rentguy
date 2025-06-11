from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.db.base import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Tenant])
def read_tenants(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve tenants owned by the current user.
    """
    tenants = crud.tenant.get_by_owner(
        db=db, owner_id=current_user.id, skip=skip, limit=limit
    )
    return tenants

@router.post("/", response_model=schemas.Tenant)
def create_tenant(
    *,
    db: Session = Depends(get_db),
    tenant_in: schemas.TenantCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new tenant.
    """
    # Check if tenant email already exists for this owner
    existing_tenant = crud.tenant.get_by_email_and_owner(
        db=db, email=tenant_in.email, owner_id=current_user.id
    )
    if existing_tenant:
        raise HTTPException(
            status_code=400,
            detail="A tenant with this email already exists"
        )
    
    tenant = crud.tenant.create_with_owner(
        db=db, obj_in=tenant_in, owner_id=current_user.id
    )
    return tenant

@router.get("/{id}", response_model=schemas.Tenant)
def read_tenant(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get tenant by ID.
    """
    tenant = crud.tenant.get_by_owner_and_id(
        db=db, tenant_id=id, owner_id=current_user.id
    )
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

@router.post("/screening/request", response_model=schemas.ScreeningResult)
def request_screening(
    *,
    db: Session = Depends(get_db),
    screening_in: schemas.ScreeningResultCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Request screening for a tenant.
    """
    # Verify tenant belongs to current user
    tenant = crud.tenant.get_by_owner_and_id(
        db=db, tenant_id=screening_in.tenant_id, owner_id=current_user.id
    )
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Check if screening already exists
    existing_screening = crud.screening_result.get_by_tenant(
        db=db, tenant_id=screening_in.tenant_id
    )
    if existing_screening:
        raise HTTPException(
            status_code=400, 
            detail="Screening already exists for this tenant"
        )
    
    screening = crud.screening_result.create_screening_request(
        db=db, 
        tenant_id=screening_in.tenant_id,
        screening_provider=screening_in.screening_provider
    )
    
    # Simulate approval (in real app, this would be async)
    import asyncio
    import time
    time.sleep(1)  # Simulate processing
    screening = crud.screening_result.approve_screening(
        db=db, tenant_id=screening_in.tenant_id, result_data="Approved - Mock Result"
    )
    
    return screening

@router.get("/screening/{tenant_id}", response_model=schemas.ScreeningResult)
def get_screening(
    *,
    db: Session = Depends(get_db),
    tenant_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get screening results for a tenant.
    """
    # Verify tenant belongs to current user
    tenant = crud.tenant.get_by_owner_and_id(
        db=db, tenant_id=tenant_id, owner_id=current_user.id
    )
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    screening = crud.screening_result.get_by_tenant(db=db, tenant_id=tenant_id)
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found")
    
    return screening