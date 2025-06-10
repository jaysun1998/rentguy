from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.crud.base import CRUDBase
from app.models.property import Property
from app.models.unit import Unit
from app.schemas.property import PropertyCreate, PropertyUpdate

class CRUDProperty(CRUDBase[Property, PropertyCreate, PropertyUpdate]):
    def get_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Property]:
        return (
            db.query(self.model)
            .filter(Property.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_owner_and_id(
        self, db: Session, *, owner_id: int, property_id: int
    ) -> Optional[Property]:
        return (
            db.query(self.model)
            .filter(Property.owner_id == owner_id, Property.id == property_id)
            .first()
        )
    
    def create_with_owner(
        self, db: Session, *, obj_in: PropertyCreate, owner_id: int
    ) -> Property:
        obj_in_data = obj_in.dict()
        obj_in_data["owner_id"] = owner_id
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_with_stats(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[dict]:
        """Get properties with unit count and vacancy statistics"""
        result = (
            db.query(
                Property,
                func.count(Unit.id).label('unit_count'),
                func.count(Unit.id).filter(Unit.is_vacant == True).label('vacant_count'),
                func.sum(Unit.current_rent).label('total_rent')
            )
            .outerjoin(Unit)
            .filter(Property.owner_id == owner_id)
            .group_by(Property.id)
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        properties_with_stats = []
        for property_obj, unit_count, vacant_count, total_rent in result:
            vacancy_rate = (vacant_count / unit_count * 100) if unit_count > 0 else 0.0
            properties_with_stats.append({
                **property_obj.__dict__,
                'unit_count': unit_count or 0,
                'vacancy_rate': round(vacancy_rate, 1),
                'total_rent': float(total_rent or 0.0)
            })
        
        return properties_with_stats

property = CRUDProperty(Property)