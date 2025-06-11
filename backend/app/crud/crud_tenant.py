from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.crud.base import CRUDBase
from app.models.tenant import Tenant, ScreeningResult, ScreeningStatus
from app.schemas.tenant import TenantCreate, TenantUpdate, ScreeningResultCreate, ScreeningResultUpdate

class CRUDTenant(CRUDBase[Tenant, TenantCreate, TenantUpdate]):
    def get_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Tenant]:
        return (
            db.query(self.model)
            .filter(Tenant.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_owner_and_id(
        self, db: Session, *, tenant_id: int, owner_id: int
    ) -> Optional[Tenant]:
        return (
            db.query(self.model)
            .filter(Tenant.id == tenant_id, Tenant.owner_id == owner_id)
            .first()
        )
    
    def create_with_owner(
        self, db: Session, *, obj_in: TenantCreate, owner_id: int
    ) -> Tenant:
        obj_in_data = obj_in.dict()
        obj_in_data["owner_id"] = owner_id
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_by_email_and_owner(
        self, db: Session, *, email: str, owner_id: int
    ) -> Optional[Tenant]:
        return (
            db.query(self.model)
            .filter(Tenant.email == email, Tenant.owner_id == owner_id)
            .first()
        )

class CRUDScreeningResult(CRUDBase[ScreeningResult, ScreeningResultCreate, ScreeningResultUpdate]):
    def get_by_tenant(
        self, db: Session, *, tenant_id: int
    ) -> Optional[ScreeningResult]:
        return (
            db.query(self.model)
            .filter(ScreeningResult.tenant_id == tenant_id)
            .first()
        )
    
    def create_screening_request(
        self, db: Session, *, tenant_id: int, screening_provider: str = "internal"
    ) -> ScreeningResult:
        db_obj = ScreeningResult(
            tenant_id=tenant_id,
            screening_provider=screening_provider,
            status=ScreeningStatus.PENDING
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def approve_screening(
        self, db: Session, *, tenant_id: int, result_data: str = None
    ) -> Optional[ScreeningResult]:
        screening = self.get_by_tenant(db, tenant_id=tenant_id)
        if screening:
            screening.status = ScreeningStatus.APPROVED
            screening.completed_at = datetime.utcnow()
            if result_data:
                screening.result_data = result_data
            db.commit()
            db.refresh(screening)
        return screening

tenant = CRUDTenant(Tenant)
screening_result = CRUDScreeningResult(ScreeningResult)