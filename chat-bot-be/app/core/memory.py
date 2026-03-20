import json
import redis.asyncio as redis
from app.config import settings

SESSION_TTL = 60 * 60 * 6  # 6 tiếng


rds = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    decode_responses=True,
    socket_connect_timeout=2,
)


async def check_redis():
    """Fail fast khi startup"""
    try:
        await rds.ping()
        print("✅ Redis connected")
    except Exception as e:
        raise RuntimeError(f"❌ Redis connection failed: {e}")


DEFAULT_SESSION = {
    "category": "",
    "product_name": "",
    "product_code": "",
    "memory": "",
    "color": "",
    "stage": "IDLE",
    "language": "vi",
    "history": "[]",  # lưu string cho hash
}


def _key(user_id: str):
    return f"session:{user_id}"


async def get_session(user_id: str):
    key = _key(user_id)

    data = await rds.hgetall(key)

    if not data:
        await rds.hset(key, mapping=DEFAULT_SESSION)
        await rds.expire(key, SESSION_TTL)
        return {
            **DEFAULT_SESSION,
            "history": []
        }

    data["history"] = json.loads(data["history"])
    return data


async def update_session(user_id: str, updates: dict):
    key = _key(user_id)

    if "history" in updates:
        updates["history"] = json.dumps(updates["history"])

    await rds.hset(key, mapping=updates)
    await rds.expire(key, SESSION_TTL)


async def add_history(user_id: str, role: str, content: str):
    session = await get_session(user_id)

    history = session["history"]
    history.append({
        "role": role,
        "content": content
    })

    history = history[-20:]

    await update_session(user_id, {"history": history})
