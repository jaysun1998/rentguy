# This module imports all models to ensure they are registered with SQLAlchemy
# Import all models here to ensure they are registered with the metadata
from app.models.user import User
from app.models.property import Property
from app.models.unit import Unit
from app.models.tenant import Tenant, ScreeningResult
from app.models.lease import Lease
from app.models.invoice import Invoice, VATEntry
from app.models.maintenance import MaintenanceRequest
from app.models.bank_connection import BankConnection, BankAccount
from app.models.transaction import Transaction

# Re-export the database session components
from app.db.session import SessionLocal, engine, get_db
from app.db.base_class import Base

__all__ = ["Base", "SessionLocal", "engine", "get_db"]