# policy-service/app/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, BigInteger, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.schema import UniqueConstraint

Base = declarative_base()

class Account(Base):
    """Represents an SMTP Relay Account (User)."""
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    # In a real app, this should be a secure hash, not plain text
    password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    quotas = relationship("Quota", back_populates="account")

    # This is the dedicated IP assigned for the Postfix IP Rotation feature
    dedicated_ip = Column(String, unique=True, index=True) 

class Quota(Base):
    """Defines sending limits for an Account."""
    __tablename__ = "quotas"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    
    # Monthly/Total Quota (Managed by PostgreSQL)
    monthly_limit = Column(BigInteger, default=10000)
    monthly_sent = Column(BigInteger, default=0)
    
    # Rate Limits (Managed by Redis for real-time checks)
    rate_limit_per_minute = Column(Integer, default=100)
    rate_limit_per_second = Column(Integer, default=5)
    
    account = relationship("Account", back_populates="quotas")
    
    __table_args__ = (
        UniqueConstraint('account_id', name='uq_account_quota'),
    )

# --- Additional Models (e.g., for blacklisting) ---
class Blacklist(Base):
    """Global or account-specific blacklisted domains/IPs."""
    __tablename__ = "blacklist"

    id = Column(Integer, primary_key=True, index=True)
    entity_value = Column(String, unique=True, nullable=False) # e.g., "spammer.com"
    entity_type = Column(String, nullable=False) # e.g., "domain", "ip", "keyword"
    is_active = Column(Boolean, default=True)