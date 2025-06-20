# Import order matters for SQLAlchemy relationships
# Import models using string literals to prevent circular imports
from app.models.enums import UserRole

# Import models at the end of the file to avoid circular imports
from app.models.user import User
from app.models.property import Property
from app.models.unit import Unit  
from app.models.tenant import Tenant, ScreeningResult
from app.models.lease import Lease
from app.models.invoice import Invoice, VATEntry
from app.models.maintenance import MaintenanceRequest
from app.models.bank_connection import BankConnection, BankAccount, BankConnectionStatus
from app.models.transaction import Transaction, TransactionType, TransactionStatus

__all__ = [
    "UserRole",
    "User",
    "Property",
    "Unit",
    "Tenant",
    "ScreeningResult",
    "Lease", 
    "Invoice",
    "VATEntry",
    "MaintenanceRequest",
    "BankConnection",
    "BankAccount", 
    "BankConnectionStatus",
    "Transaction",
    "TransactionType",
    "TransactionStatus"
]
