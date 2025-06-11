from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.crud.base import CRUDBase
from app.models.lease import Lease, LeaseStatus
from app.models.unit import Unit
from app.models.property import Property
from app.schemas.lease import LeaseCreate, LeaseUpdate

class CRUDLease(CRUDBase[Lease, LeaseCreate, LeaseUpdate]):
    def get_by_unit(self, db: Session, *, unit_id: int) -> List[Lease]:
        return db.query(self.model).filter(Lease.unit_id == unit_id).all()
    
    def get_active_by_unit(self, db: Session, *, unit_id: int) -> Optional[Lease]:
        return (
            db.query(self.model)
            .filter(Lease.unit_id == unit_id, Lease.status == LeaseStatus.ACTIVE)
            .first()
        )
    
    def get_by_owner(self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100) -> List[Lease]:
        return (
            db.query(self.model)
            .join(Unit).join(Property)
            .filter(Property.owner_id == owner_id)
            .offset(skip).limit(limit).all()
        )
    
    def create_for_owner(self, db: Session, *, obj_in: LeaseCreate, owner_id: int) -> Lease:
        # Verify unit belongs to owner and is vacant
        unit = (
            db.query(Unit).join(Property)
            .filter(Unit.id == obj_in.unit_id, Property.owner_id == owner_id, Unit.is_vacant == True)
            .first()
        )
        if not unit:
            raise ValueError("Unit not found, not owned by user, or not vacant")
        
        # Check for existing active lease
        existing_lease = self.get_active_by_unit(db, unit_id=obj_in.unit_id)
        if existing_lease:
            raise ValueError("Unit already has an active lease")
        
        db_obj = self.model(**obj_in.dict())
        db.add(db_obj)
        
        # Mark unit as occupied
        unit.is_vacant = False
        
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def sign_lease(self, db: Session, *, lease_id: int, owner_id: int) -> Optional[Lease]:
        lease = (
            db.query(self.model).join(Unit).join(Property)
            .filter(Lease.id == lease_id, Property.owner_id == owner_id)
            .first()
        )
        if lease and lease.status == LeaseStatus.PENDING_SIGNATURE:
            lease.status = LeaseStatus.ACTIVE
            lease.digital_signed_at = datetime.utcnow()
            db.commit()
            db.refresh(lease)
        return lease

lease = CRUDLease(Lease)