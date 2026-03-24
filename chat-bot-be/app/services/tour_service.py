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


def _lowest_price(product: dict):
    prices = []
    for item in product.get("list", []) or []:
        if not isinstance(item, dict):
            continue
        value = item.get("price")
        if value is None:
            continue
        try:
            prices.append(int(value))
        except Exception:
            pass
    return min(prices) if prices else None


def _sort_by_nearest_price(products: list, target_price: int):
    with_price = []
    without_price = []

    for product in products:
        lowest = _lowest_price(product)
        if lowest is None:
            without_price.append(product)
            continue
        with_price.append((abs(lowest - target_price), lowest, product))

    with_price.sort(key=lambda item: (item[0], item[1]))
    return [item[2] for item in with_price] + without_price


def _keep_near_price(products: list, target_price: int):
    if not products or not target_price or target_price <= 0:
        return products

    # Dynamic threshold keeps candidates around the budget while still allowing low-budget queries.
    tolerance = max(300_000, int(target_price * 0.35))
    near = []

    for product in products:
        lowest = _lowest_price(product)
        if lowest is None:
            continue
        if abs(lowest - target_price) <= tolerance:
            near.append(product)

    # If no product falls into tolerance, keep globally nearest products.
    return near if near else products


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
    target_price: int = None,
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
        if target_price and target_price > 0:
            result = _sort_by_nearest_price(result, target_price)
            result = _keep_near_price(result, target_price)
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
