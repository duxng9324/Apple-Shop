import requests
import time
from app.config import settings


_http = requests.Session()
_PRODUCT_CACHE = {
    "data": [],
    "expires_at": 0.0,
}
_CACHE_TTL_SECONDS = 45


def _normalize(value: str):
    return (value or "").strip().lower()


def _matches_text(text: str, keyword: str):
    if not keyword:
        return True
    return _normalize(keyword) in _normalize(text)


def _extract_memories(product: dict):
    memories = []
    for item in product.get("list", []) or []:
        memory = item.get("memory") if isinstance(item, dict) else None
        if memory:
            memories.append(str(memory).upper())
    return memories


def _fetch_all_products():
    now = time.time()
    if _PRODUCT_CACHE["data"] and now < _PRODUCT_CACHE["expires_at"]:
        return _PRODUCT_CACHE["data"]

    print(f"[ProductSearch] GET {settings.PRODUCT_API}")
    response = _http.get(settings.PRODUCT_API, timeout=4)
    response.raise_for_status()

    products = response.json() or []
    if not isinstance(products, list):
        return []

    _PRODUCT_CACHE["data"] = products
    _PRODUCT_CACHE["expires_at"] = now + _CACHE_TTL_SECONDS
    return products


def search_products(
    query: str = None,
    product_code: str = None,
    category: str = None,
    memory: str = None,
    color: str = None,
):
    try:
        products = _fetch_all_products()

        result = []
        for product in products:
            code = str(product.get("code", ""))
            name = str(product.get("name", ""))
            description = str(product.get("description", ""))
            category_code = str(product.get("categoryCode", ""))

            if product_code and not _matches_text(code, product_code):
                continue

            if query and not (
                _matches_text(name, query)
                or _matches_text(description, query)
                or _matches_text(code, query)
            ):
                continue

            if category and not _matches_text(category_code, category):
                continue

            if memory:
                memories = _extract_memories(product)
                if not any(_normalize(memory) in _normalize(m) for m in memories):
                    continue

            if color:
                color_candidates = [
                    str(c.get("name", ""))
                    for c in (product.get("colorDTOs", []) or [])
                    if isinstance(c, dict)
                ]
                if not any(_matches_text(c, color) for c in color_candidates):
                    continue

            result.append(product)

        return result

    except Exception as e:
        print(f"⚠️ Product backend error: {e}")
        return []


def search_tours(departure: str = None, destination: str = None, people: int = None, days: int = None):
    # Backward-compatible wrapper for existing import paths.
    return search_products(query=destination)


def add_to_cart(user_id: int, product_id: int, memory: str = None, color: str = None):
    try:
        payload = {
            "userId": user_id,
            "productId": product_id,
            "memory": memory,
            "color": color,
        }
        response = _http.post(settings.CART_API, json=payload, timeout=8)
        if response.status_code not in [200, 201]:
            return None
        return response.json()
    except Exception as e:
        print(f"⚠️ Add cart error: {e}")
        return None
