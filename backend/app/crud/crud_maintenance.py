from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.crud.base import CRUDBase
from app.models.maintenance import MaintenanceRequest, MaintenanceStatus
from app.models.unit import Unit
from app.models.property import Property
from app.schemas.maintenance import MaintenanceRequestCreate, MaintenanceRequestUpdate

class CRUDMaintenanceRequest(CRUDBase[MaintenanceRequest, MaintenanceRequestCreate, MaintenanceRequestUpdate]):
    def get_by_unit(self, db: Session, *, unit_id: int) -> List[MaintenanceRequest]:
        return db.query(self.model).filter(MaintenanceRequest.unit_id == unit_id).all()
    
    def get_by_tenant(self, db: Session, *, tenant_id: int) -> List[MaintenanceRequest]:
        return db.query(self.model).filter(MaintenanceRequest.reported_by == tenant_id).all()
    
    def get_by_owner(self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100) -> List[MaintenanceRequest]:
        return (
            db.query(self.model)
            .join(Unit).join(Property)
            .filter(Property.owner_id == owner_id)
            .offset(skip).limit(limit).all()
        )
    
    def create_for_unit(self, db: Session, *, obj_in: MaintenanceRequestCreate, reported_by: int) -> MaintenanceRequest:
        obj_in_data = obj_in.dict()
        obj_in_data["reported_by"] = reported_by
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def assign_to_user(self, db: Session, *, request_id: int, assigned_to: int, owner_id: int) -> Optional[MaintenanceRequest]:
        request = (
            db.query(self.model).join(Unit).join(Property)
            .filter(MaintenanceRequest.id == request_id, Property.owner_id == owner_id)
            .first()
        )
        if request:
            request.assigned_to = assigned_to
            request.assigned_at = datetime.utcnow()
            request.status = MaintenanceStatus.IN_PROGRESS
            db.commit()
            db.refresh(request)
        return request
    
    def resolve_request(self, db: Session, *, request_id: int, owner_id: int, actual_cost: str = None) -> Optional[MaintenanceRequest]:
        request = (
            db.query(self.model).join(Unit).join(Property)
            .filter(MaintenanceRequest.id == request_id, Property.owner_id == owner_id)
            .first()
        )
        if request:
            request.status = MaintenanceStatus.RESOLVED
            request.resolved_at = datetime.utcnow()
            if actual_cost:
                request.actual_cost = actual_cost
            db.commit()
            db.refresh(request)
        return request

maintenance_request = CRUDMaintenanceRequest(MaintenanceRequest)