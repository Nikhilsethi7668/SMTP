# web-admin-backend/app/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, BigInteger, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.schema import UniqueConstraint

Base = declarative_base()

class Account(Base):
    """Represents an SMTP Relay Account (User)."""
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False) # Hashed password
    is_active = Column(Boolean, default=True)
    dedicated_ip = Column(String, unique=True, index=True) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    quotas = relationship("Quota", back_populates="account", uselist=False)

class Quota(Base):
    """Defines sending limits for an Account."""
    __tablename__ = "quotas"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    
    monthly_limit = Column(BigInteger, default=10000)
    monthly_sent = Column(BigInteger, default=0)
    
    rate_limit_per_minute = Column(Integer, default=100)
    rate_limit_per_second = Column(Integer, default=5)
    
    account = relationship("Account", back_populates="quotas")
    
    __table_args__ = (
        UniqueConstraint('account_id', name='uq_account_quota'),
    )

class Blacklist(Base):
    """Global or account-specific blacklisted domains/IPs."""
    __tablename__ = "blacklist"

    id = Column(Integer, primary_key=True, index=True)
    entity_value = Column(String, unique=True, nullable=False)
    entity_type = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)