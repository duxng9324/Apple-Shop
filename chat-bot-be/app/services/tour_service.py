import requests
import time
import re
from unidecode import unidecode
from app.config import settings


_http = requests.Session()
_PRODUCT_CACHE = {
    "data": [],
    "expires_at": 0.0,
}
_CACHE_TTL_SECONDS = 45
_QUERY_STOPWORDS = {
    "tim", "kiem", "mua", "cho", "toi", "minh", "can", "con", "nao", "voi",
    "mau", "color", "phien", "ban", "bo", "nho", "memory", "gb", "tb",
    "dien", "thoai", "apple", "shop",
}


def _normalize(value: str):
    text = unidecode((value or "")).lower().strip()
    return re.sub(r"\s+", " ", text)


def _compact(value: str):
    return re.sub(r"[^a-z0-9]+", "", _normalize(value))


def _to_int(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return int(value)

    text = str(value).strip()
    if not text:
        return None

    text = text.replace(",", "").replace("_", "")
    try:
        return int(float(text))
    except Exception:
        return None


def _category_candidates(product: dict):
    category_code = str(product.get("categoryCode") or "")
    category_dto = product.get("categoryDTO") if isinstance(product.get("categoryDTO"), dict) else {}
    dto_code = str(category_dto.get("code") or "")
    dto_name = str(category_dto.get("name") or "")

    return [candidate for candidate in [category_code, dto_code, dto_name] if candidate]


def _matches_text(text: str, keyword: str):
    if not keyword:
        return True

    normalized_text = _normalize(text)
    normalized_keyword = _normalize(keyword)
    if normalized_keyword in normalized_text:
        return True

    compact_text = _compact(text)
    compact_keyword = _compact(keyword)
    return bool(compact_keyword) and compact_keyword in compact_text


def _query_tokens(query: str):
    normalized = _normalize(query)
    tokens = re.findall(r"[a-z0-9]+", normalized)
    filtered = [token for token in tokens if len(token) > 1 and token not in _QUERY_STOPWORDS]
    return filtered[:8]


def _matches_query(product: dict, query: str):
    if not query:
        return True

    haystack = " ".join([
        str(product.get("name", "")),
        str(product.get("description", "")),
        str(product.get("code", "")),
        str(product.get("categoryCode", "")),
    ])
    if _matches_text(haystack, query):
        return True

    tokens = _query_tokens(query)
    if not tokens:
        return True

    normalized_haystack = _normalize(haystack)
    compact_haystack = _compact(haystack)
    return all(
        token in normalized_haystack or token in compact_haystack
        for token in tokens
    )


def _extract_memories(product: dict):
    memories = []
    for item in product.get("list", []) or []:
        memory = (item.get("memory") or item.get("type")) if isinstance(item, dict) else None
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
        parsed = _to_int(value)
        if parsed is not None:
            prices.append(parsed)
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
        target_price = _to_int(target_price)
        products = _fetch_all_products()

        result = []
        for product in products:
            code = str(product.get("code", ""))
            name = str(product.get("name", ""))
            description = str(product.get("description", ""))
            category_values = _category_candidates(product)

            if product_code and not _matches_text(code, product_code):
                continue

            if query and not _matches_query(product, query):
                continue

            if category and not any(_matches_text(candidate, category) for candidate in category_values):
                continue

            if memory:
                memories = _extract_memories(product)
                if not any(_matches_text(m, memory) for m in memories):
                    continue

            if color:
                color_candidates = [
                    str(c.get("name") or c.get("color") or "")
                    for c in (product.get("colorDTOs", []) or [])
                    if isinstance(c, dict)
                ]
                if not any(_matches_text(c, color) for c in color_candidates):
                    continue

            result.append(product)
        if target_price is not None and target_price > 0:
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
