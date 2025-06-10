# Import order matters for SQLAlchemy relationships
from app.models.user import User, UserRole
from app.models.property import Property
from app.models.unit import Unit  
from app.models.tenant import Tenant, ScreeningResult
from app.models.lease import Lease
from app.models.invoice import Invoice, VATEntry
from app.models.maintenance import MaintenanceRequest

__all__ = [
    "User",
    "UserRole", 
    "Property",
    "Unit",
    "Tenant",
    "ScreeningResult",
    "Lease", 
    "Invoice",
    "VATEntry",
    "MaintenanceRequest"
]
