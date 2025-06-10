from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.db.base import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Property])
def read_properties(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve properties owned by the current user.
    """
    properties = crud.property.get_by_owner(
        db=db, owner_id=current_user.id, skip=skip, limit=limit
    )
    return properties

@router.post("/", response_model=schemas.Property)
def create_property(
    *,
    db: Session = Depends(get_db),
    property_in: schemas.PropertyCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new property.
    """
    property = crud.property.create_with_owner(
        db=db, obj_in=property_in, owner_id=current_user.id
    )
    return property

@router.put("/{id}", response_model=schemas.Property)
def update_property(
    *,
    db: Session = Depends(get_db),
    id: int,
    property_in: schemas.PropertyUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a property.
    """
    property = crud.property.get_by_owner_and_id(
        db=db, owner_id=current_user.id, property_id=id
    )
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    property = crud.property.update(db=db, db_obj=property, obj_in=property_in)
    return property

@router.get("/{id}", response_model=schemas.Property)
def read_property(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get property by ID.
    """
    property = crud.property.get_by_owner_and_id(
        db=db, owner_id=current_user.id, property_id=id
    )
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property

@router.delete("/{id}", response_model=schemas.Property)
def delete_property(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a property.
    """
    property = crud.property.get_by_owner_and_id(
        db=db, owner_id=current_user.id, property_id=id
    )
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    property = crud.property.remove(db=db, id=id)
    return property