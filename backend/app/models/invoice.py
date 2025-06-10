from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, func, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime, timedelta

from app.db.base import Base

class InvoiceStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    lease_id = Column(Integer, ForeignKey("leases.id"), nullable=False)
    invoice_number = Column(String, nullable=False, unique=True, index=True)
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    vat_amount = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False)
    currency_iso = Column(String(3), nullable=False, default="EUR")
    status = Column(String, nullable=False, default=InvoiceStatus.PENDING)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    lease = relationship("Lease", back_populates="invoices")
    vat_entries = relationship("VATEntry", back_populates="invoice")

    def __repr__(self):
        return f"<Invoice {self.invoice_number} - {self.total_amount} {self.currency_iso}>"

    @property
    def is_overdue(self) -> bool:
        from datetime import date
        return self.status == InvoiceStatus.PENDING and self.due_date < date.today()

    @classmethod
    def generate_invoice_number(cls, date_obj: datetime = None) -> str:
        if date_obj is None:
            date_obj = datetime.now()
        date_str = date_obj.strftime("%Y%m%d")
        # In production, this should include a sequence number from the database
        return f"INV-{date_str}-{datetime.now().microsecond}"

class VATEntry(Base):
    __tablename__ = "vat_entries"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    vat_rate = Column(Float, nullable=False)
    net_amount = Column(Float, nullable=False)
    vat_amount = Column(Float, nullable=False)
    gross_amount = Column(Float, nullable=False)
    country_iso = Column(String(2), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    invoice = relationship("Invoice", back_populates="vat_entries")

    def __repr__(self):
        return f"<VATEntry {self.vat_rate}% - {self.vat_amount}>"