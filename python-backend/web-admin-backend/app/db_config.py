# web-admin-backend/app/db_config.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import os
from dotenv import load_dotenv

# Re-use models from the policy service path or define them here.
# Assuming models.py is copied/symlinked or accessible, for simplicity we define them locally.
from .models import Base 
from passlib.context import CryptContext

# Load environment variables
load_dotenv() 

# --- PostgreSQL Configuration ---
DB_PASSWORD = os.getenv('DB_PASSWORD', 'default_password')
# Use 'db' as the hostname, the service name in docker-compose
SQLALCHEMY_DATABASE_URL = (
    f"postgresql+psycopg2://mail_admin:{DB_PASSWORD}@db:5432/relay_db"
)

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
    # Ensure tables exist (development convenience)
    Base.metadata.create_all(bind=engine) 
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
except OperationalError as e:
    # Fatal error on startup if DB connection fails
    print(f"FATAL: Cannot connect to PostgreSQL: {e}")
    raise SystemExit(1)


# --- Security Context (Password Hashing) ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    """FastAPI Dependency for PostgreSQL Session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    """Hashes a password securely."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed one."""
    return pwd_context.verify(plain_password, hashed_password)