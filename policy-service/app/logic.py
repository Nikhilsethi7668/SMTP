# policy-service/app/logic.py
from .db import get_redis_conn, get_db_session
from .models import Account, Quota
from sqlalchemy import select
import time
from typing import Dict
import redis
def check_rate_limit(r: redis.Redis, user_id: str, limit: int, window_sec: int) -> bool:
    """
    Implements Fixed Window Rate Limiting using Redis atomic operations.
    Returns True if allowed, False if limit exceeded.
    """
    # Key includes the time window ID to ensure proper windowing
    current_window = int(time.time() / window_sec)
    key = f"rate:{user_id}:{window_sec}:{current_window}" 

    # Atomic: Increment the counter and set the key expiration
    pipe = r.pipeline()
    pipe.incr(key)
    pipe.expire(key, window_sec + 1) # Add a buffer second
    
    current_count, _ = pipe.execute()
    
    return current_count <= limit


def make_policy_decision(request_data: Dict[str, str]) -> Dict[str, str]:
    """
    Main function to determine Postfix action (OK, REJECT, DEFER).
    """
    # 1. AUTHENTICATION (Post-SASL check)
    sasl_username = request_data.get('sasl_username')
    if not sasl_username:
        # Should not happen if Postfix is configured to only check authenticated users
        return {"action": "REJECT", "reason": "550 Authentication required."}

    # 2. LOAD USER & QUOTA
    db = get_db_session()
    stmt = select(Account, Quota).join(Quota).where(Account.username == sasl_username)
    result = db.execute(stmt).first()

    if not result:
        return {"action": "REJECT", "reason": "550 Invalid account or inactive."}
    
    account, quota = result

    r = get_redis_conn() # Get Redis connection

    # 3. REAL-TIME RATE LIMITS (High-performance check via Redis)
    if not check_rate_limit(r, sasl_username, quota.rate_limit_per_second, 1):
        return {"action": "DEFER", "reason": "450 Rate limit (per second) exceeded. Try again."}
        
    if not check_rate_limit(r, sasl_username, quota.rate_limit_per_minute, 60):
        return {"action": "DEFER", "reason": "450 Rate limit (per minute) exceeded. Try again."}

    # 4. MONTHLY QUOTA CHECK (PostgreSQL)
    # The actual quota decrement is often handled by a final POST-QUEUE process
    # But for a strict, synchronous check:
    if quota.monthly_sent >= quota.monthly_limit:
        return {"action": "REJECT", "reason": "550 Monthly quota exhausted."}

    # 5. IP ROTATION / ASSIGNMENT
    # Postfix expects this back to bind the outbound connection to a specific IP
    assigned_ip = account.dedicated_ip if account.dedicated_ip else "dynamic_pool_ip"

    # The Postfix policy protocol does not allow us to directly UPDATE the DB here
    # (it must be FAST). We defer logging/decrement to a separate post-queue step.

    # 6. ACCEPTED
    return {
        "action": "OK", 
        "smtp_bind_address": assigned_ip
    }