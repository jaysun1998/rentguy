from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, users, properties, units, tenants, leases, invoices, maintenance, whatsapp

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(units.router, prefix="/units", tags=["units"])
api_router.include_router(tenants.router, prefix="/tenants", tags=["tenants"])
api_router.include_router(leases.router, prefix="/leases", tags=["leases"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["maintenance"])
api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["whatsapp"])
