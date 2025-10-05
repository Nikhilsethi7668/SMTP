# policy-service/app/db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import redis
import os
from dotenv import load_dotenv

# Load environment variables from .env file (if running locally without Docker compose env)
load_dotenv() 

# --- PostgreSQL Configuration ---
DB_PASSWORD = os.getenv('DB_PASSWORD', 'default_password')
# Use 'db' as the hostname, which is the service name in docker-compose
SQLALCHEMY_DATABASE_URL = (
    f"postgresql+psycopg2://mail_admin:{DB_PASSWORD}@db:5432/relay_db"
)

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
    # Create tables if they don't exist (only for initial setup/dev)
    from .models import Base
    # WARNING: Use Alembic for migrations in production!
    Base.metadata.create_all(bind=engine) 

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
except OperationalError as e:
    print(f"FATAL: Cannot connect to PostgreSQL: {e}")
    # In a real system, you might gracefully exit or retry here.


# --- Redis Configuration ---
# Use 'redis' as the hostname
R_CONN = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

# Helper function for getting connections (used like FastAPI dependencies)
def get_db_session():
    """Provides a fresh database session."""
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

def get_redis_conn():
    """Returns the Redis connection instance."""
    try:
        R_CONN.ping()
        return R_CONN
    except Exception as e:
        print(f"Redis is unavailable: {e}")
        # When Redis is critical for rate limits, failing fast is safer than sending uncontrolled
        raise ConnectionError("Redis cache service is down.")