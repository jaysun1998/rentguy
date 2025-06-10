from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.unit import Unit
from app.models.property import Property
from app.schemas.unit import UnitCreate, UnitUpdate

class CRUDUnit(CRUDBase[Unit, UnitCreate, UnitUpdate]):
    def get_by_property(
        self, db: Session, *, property_id: int, skip: int = 0, limit: int = 100
    ) -> List[Unit]:
        return (
            db.query(self.model)
            .filter(Unit.property_id == property_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_property_owner(
        self, db: Session, *, property_id: int, owner_id: int
    ) -> List[Unit]:
        return (
            db.query(self.model)
            .join(Property)
            .filter(Unit.property_id == property_id, Property.owner_id == owner_id)
            .all()
        )
    
    def get_by_owner_and_id(
        self, db: Session, *, unit_id: int, owner_id: int
    ) -> Optional[Unit]:
        return (
            db.query(self.model)
            .join(Property)
            .filter(Unit.id == unit_id, Property.owner_id == owner_id)
            .first()
        )
    
    def create_for_property(
        self, db: Session, *, obj_in: UnitCreate, owner_id: int
    ) -> Unit:
        # Verify property belongs to owner
        property_obj = db.query(Property).filter(
            Property.id == obj_in.property_id, 
            Property.owner_id == owner_id
        ).first()
        if not property_obj:
            raise ValueError("Property not found or not owned by user")
        
        db_obj = self.model(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

unit = CRUDUnit(Unit)