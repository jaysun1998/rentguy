from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta

from app.crud.base import CRUDBase
from app.models.invoice import Invoice, VATEntry
from app.models.lease import Lease
from app.models.unit import Unit
from app.models.property import Property
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, VATEntryCreate

class CRUDInvoice(CRUDBase[Invoice, InvoiceCreate, InvoiceUpdate]):
    def get_by_lease(self, db: Session, *, lease_id: int) -> List[Invoice]:
        return db.query(self.model).filter(Invoice.lease_id == lease_id).all()
    
    def get_by_owner(self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100) -> List[Invoice]:
        return (
            db.query(self.model)
            .join(Lease).join(Unit).join(Property)
            .filter(Property.owner_id == owner_id)
            .offset(skip).limit(limit).all()
        )
    
    def create_for_lease(self, db: Session, *, lease_id: int, owner_id: int) -> Invoice:
        # Verify lease belongs to owner
        lease = (
            db.query(Lease).join(Unit).join(Property)
            .filter(Lease.id == lease_id, Property.owner_id == owner_id)
            .first()
        )
        if not lease:
            raise ValueError("Lease not found or not owned by user")
        
        # Calculate amounts
        amount = lease.rent_amount
        vat_amount = amount * (lease.vat_rate / 100)
        total_amount = amount + vat_amount
        
        # Generate invoice number
        invoice_number = Invoice.generate_invoice_number()
        
        # Create invoice
        db_obj = Invoice(
            lease_id=lease_id,
            invoice_number=invoice_number,
            issue_date=date.today(),
            due_date=date.today() + timedelta(days=14),
            amount=amount,
            vat_amount=vat_amount,
            total_amount=total_amount,
            currency_iso=lease.currency_iso
        )
        db.add(db_obj)
        db.flush()  # Get the ID
        
        # Create VAT entry
        if vat_amount > 0:
            vat_entry = VATEntry(
                invoice_id=db_obj.id,
                vat_rate=lease.vat_rate,
                net_amount=amount,
                vat_amount=vat_amount,
                gross_amount=total_amount,
                country_iso=lease.unit.property.country_iso
            )
            db.add(vat_entry)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj

class CRUDVATEntry(CRUDBase[VATEntry, VATEntryCreate, VATEntryCreate]):
    def get_by_invoice(self, db: Session, *, invoice_id: int) -> List[VATEntry]:
        return db.query(self.model).filter(VATEntry.invoice_id == invoice_id).all()

invoice = CRUDInvoice(Invoice)
vat_entry = CRUDVATEntry(VATEntry)