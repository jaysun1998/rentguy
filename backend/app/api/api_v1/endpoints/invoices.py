from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.db.base import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Invoice])
def read_invoices(
    db: Session = Depends(get_db),
    lease_id: int = Query(None, description="Lease ID to filter invoices"),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve invoices owned by the current user.
    """
    if lease_id:
        invoices = crud.invoice.get_by_lease(db=db, lease_id=lease_id)
        # Verify lease ownership
        if invoices:
            lease = crud.lease.get(db=db, id=lease_id)
            if lease:
                unit = crud.unit.get_by_owner_and_id(db=db, unit_id=lease.unit_id, owner_id=current_user.id)
                if not unit:
                    raise HTTPException(status_code=404, detail="Lease not found")
        return invoices
    else:
        invoices = crud.invoice.get_by_owner(db=db, owner_id=current_user.id, skip=skip, limit=limit)
        return invoices

@router.post("/", response_model=schemas.Invoice)
def create_invoice(
    *,
    db: Session = Depends(get_db),
    invoice_in: schemas.InvoiceCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Generate invoice for a lease.
    """
    try:
        invoice = crud.invoice.create_for_lease(
            db=db, lease_id=invoice_in.lease_id, owner_id=current_user.id
        )
        return invoice
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{id}", response_model=schemas.Invoice)
def read_invoice(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get invoice by ID.
    """
    invoice = crud.invoice.get(db=db, id=id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Verify ownership
    lease = crud.lease.get(db=db, id=invoice.lease_id)
    if lease:
        unit = crud.unit.get_by_owner_and_id(db=db, unit_id=lease.unit_id, owner_id=current_user.id)
        if not unit:
            raise HTTPException(status_code=404, detail="Invoice not found")
    else:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return invoice