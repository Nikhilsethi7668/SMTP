# web-admin-backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from typing import List

from . import schemas
from .models import Account, Quota, Blacklist
from .db_config import get_db, hash_password

app = FastAPI(title="SMTP Relay Admin API")

# --- Helper Function ---
def get_account_with_quota(db: Session, account_id: int):
    """Fetches an Account along with its Quota in a single query."""
    stmt = (
        select(Account)
        .options(joinedload(Account.quotas))
        .where(Account.id == account_id)
    )
    return db.execute(stmt).scalar_one_or_none()

# --- Endpoint: Accounts (Users) ---

@app.post("/accounts/", response_model=schemas.AccountOut, status_code=status.HTTP_201_CREATED)
def create_account(account_in: schemas.AccountCreate, db: Session = Depends(get_db)):
    """Creates a new SMTP relay account and assigns a default quota."""
    
    # Check for existing username
    if db.scalar(select(Account).where(Account.username == account_in.username)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered.")
    
    hashed_password = hash_password(account_in.password)
    
    new_account = Account(
        username=account_in.username,
        password_hash=hashed_password,
        is_active=account_in.is_active,
        dedicated_ip=account_in.dedicated_ip
    )
    db.add(new_account)
    db.flush() # Ensure the account gets an ID before creating the quota

    # Create default quota
    default_quota = Quota(account_id=new_account.id)
    db.add(default_quota)
    db.commit()
    db.refresh(new_account)
    
    # Prepare output model with nested quota fields
    out = schemas.AccountOut.model_validate(new_account)
    if new_account.quotas:
        out.monthly_limit = new_account.quotas.monthly_limit
        out.monthly_sent = new_account.quotas.monthly_sent
    
    return out

@app.get("/accounts/{account_id}", response_model=schemas.AccountOut)
def read_account(account_id: int, db: Session = Depends(get_db)):
    """Retrieves a single account and its quota details."""
    account = get_account_with_quota(db, account_id)
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found.")
        
    out = schemas.AccountOut.model_validate(account)
    if account.quotas:
        out.monthly_limit = account.quotas.monthly_limit
        out.monthly_sent = account.quotas.monthly_sent
        
    return out

# --- Endpoint: Quota Management ---

@app.put("/quotas/{account_id}", response_model=schemas.AccountOut)
def update_quota(account_id: int, quota_in: schemas.QuotaUpdate, db: Session = Depends(get_db)):
    """Updates the quota settings for a specific account."""
    account = get_account_with_quota(db, account_id)
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found.")
        
    quota = account.quotas
    if not quota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quota record missing.")

    # Apply updates from Pydantic model
    quota_data = quota_in.model_dump(exclude_unset=True)
    for key, value in quota_data.items():
        setattr(quota, key, value)
        
    db.add(quota)
    db.commit()
    db.refresh(account)
    
    # Return the updated account structure
    return read_account(account_id, db)

# --- Endpoint: Blacklist Management ---

@app.post("/blacklist/", response_model=schemas.BlacklistOut, status_code=status.HTTP_201_CREATED)
def add_to_blacklist(blacklist_in: schemas.BlacklistBase, db: Session = Depends(get_db)):
    """Adds a new entry (domain/IP/keyword) to the blacklist."""
    # Check for existing entry to prevent duplication
    if db.scalar(select(Blacklist).where(Blacklist.entity_value == blacklist_in.entity_value)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Blacklist entry already exists.")

    new_entry = Blacklist(**blacklist_in.model_dump())
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@app.get("/blacklist/", response_model=List[schemas.BlacklistOut])
def list_blacklist(db: Session = Depends(get_db)):
    """Retrieves all active blacklist entries."""
    stmt = select(Blacklist).where(Blacklist.is_active == True)
    return db.scalars(stmt).all()

# --- Endpoint: Health Check ---

@app.get("/status", response_model=schemas.Status)
def health_check():
    """Simple status check for the service."""
    return {"status": "ok"}