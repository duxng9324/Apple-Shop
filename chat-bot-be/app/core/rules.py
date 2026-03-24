import re
from typing import List
from unidecode import unidecode
from app.schemas.chat import IntentData

CATEGORY_MAP = {
    "iphone": "iphone",
    "ipad": "ipad",
    "mac": "mac",
    "macbook": "mac",
    "watch": "watch",
    "apple watch": "watch",
    "phu kien": "phu-kien",
    "phukien": "phu-kien",
    "airpods": "phu-kien",
    "sac": "phu-kien",
    "cap": "phu-kien",
}

KW_GREETING = [
    "hi", "hello", "hey", "xin chao", "chao", "alo", "shop oi", "ad oi", "bot oi",
]

KW_SEARCH = [
    "tim", "kiem", "search", "gia", "bao nhieu", "co hang", "con hang", "thong so",
    "mau", "bo nho", "ram", "rom", "xem san pham", "chi tiet",
]

KW_RECOMMEND = [
    "goi y", "tu van", "nen mua", "de xuat", "recommend", "suggest", "hot",
]

KW_PLACE_ORDER = [
    "dat hang", "dat mua", "mua ngay", "order", "them gio", "gio hang", "thanh toan", "checkout",
]

KW_TRACK_ORDER = [
    "don hang", "ma don", "kiem tra don", "theo doi don", "trang thai don", "order status",
]

KW_WEBSITE_GUIDE = [
    "huong dan", "cach dung", "su dung web", "dang nhap", "dang ky", "tim tren web", "mua tren web",
]

MEMORY_PATTERN = re.compile(r"\b(64|128|256|512|1024)\s*(gb|g|tb)?\b", re.IGNORECASE)
PRODUCT_CODE_PATTERN = re.compile(r"\b[A-Z0-9]{3,}(?:-[A-Z0-9]{2,})?\b")
ORDER_CODE_PATTERN = re.compile(r"\b(?:ODR|DH)[-_]?[A-Z0-9]{4,}\b", re.IGNORECASE)
QUANTITY_PATTERN = re.compile(r"\b(\d+)\s*(cai|chiec|sp|san pham)?\b", re.IGNORECASE)
PRICE_PATTERN = re.compile(r"(\d+(?:[.,]\d+)?)\s*(trieu|tr|m|nghin|ngan|k)", re.IGNORECASE)
PRICE_VND_PATTERN = re.compile(r"(\d{1,3}(?:[.,]\d{3})+|\d{5,9})\s*(vnd|dong|đ)", re.IGNORECASE)
PRICE_CONTEXT_PATTERN = re.compile(
    r"(?:gia|tam gia|khoang|khoang gia|budget)\s*(\d{5,9})",
    re.IGNORECASE,
)

KNOWN_COLORS = [
    "black", "white", "blue", "red", "green", "purple", "pink", "yellow", "gold", "silver", "gray", "grey",
    "den", "trang", "xanh", "do", "tim", "vang", "hong", "bac", "xam",
]


def normalize_text(text: str) -> str:
    return unidecode(text).lower().strip() if text else ""


def contains_any(message: str, keywords: List[str]) -> bool:
    return any(kw in message for kw in keywords)


def extract_category(msg_norm: str):
    # Accept common shorthand/typo for iPhone requests such as "ip", "iphon".
    if re.search(r"\bip\b|\biphon\b|\biphone\b", msg_norm):
        return "iphone"

    for k, v in CATEGORY_MAP.items():
        if k in msg_norm:
            return v
    return None


def extract_memory(msg_norm: str):
    match = MEMORY_PATTERN.search(msg_norm)
    if not match:
        return None

    value = int(match.group(1))
    unit = (match.group(2) or "gb").lower()
    if unit == "tb":
        value = value * 1024
    return f"{value}GB"


def extract_quantity(message: str):
    for match in QUANTITY_PATTERN.finditer(message):
        qty = int(match.group(1))
        if 1 <= qty <= 20:
            return qty
    return None


def extract_target_price(message: str):
    msg_norm = normalize_text(message)
    match = PRICE_PATTERN.search(msg_norm)

    if match:
        raw_value = (match.group(1) or "").replace(",", ".")
        unit = (match.group(2) or "").lower()

        try:
            numeric = float(raw_value)
        except Exception:
            numeric = None

        if numeric is not None:
            if unit in ["trieu", "tr", "m"]:
                return int(numeric * 1_000_000)
            if unit in ["nghin", "ngan", "k"]:
                return int(numeric * 1_000)

    vnd_match = PRICE_VND_PATTERN.search(msg_norm)
    if vnd_match:
        raw_value = re.sub(r"[.,]", "", vnd_match.group(1) or "")
        try:
            value = int(raw_value)
            if value >= 10_000:
                return value
        except Exception:
            pass

    context_match = PRICE_CONTEXT_PATTERN.search(msg_norm)
    if context_match:
        try:
            value = int(context_match.group(1))
            if value >= 10_000:
                return value
        except Exception:
            pass

    return None


def extract_product_code(message: str):
    for match in PRODUCT_CODE_PATTERN.finditer(message.upper()):
        candidate = match.group(0)
        # Product code must contain at least one digit to avoid matching normal words like "XIN" or "CHAO".
        if any(ch.isdigit() for ch in candidate):
            return candidate
    return None


def extract_order_code(message: str):
    match = ORDER_CODE_PATTERN.search(message.upper())
    return match.group(0) if match else None


def extract_color(msg_norm: str):
    for color in KNOWN_COLORS:
        if color in msg_norm:
            return color
    return None


def extract_product_name(message: str):
    lower_msg = message.lower()
    products = [
        "iphone 15", "iphone 14", "iphone 13", "iphone 16", "iphone",
        "ipad pro", "ipad air", "ipad mini", "ipad",
        "macbook air", "macbook pro", "imac", "mac mini", "mac studio", "macbook", "mac",
        "apple watch", "watch",
        "airpods", "airpods pro", "airpods max",
    ]

    for name in products:
        if name in lower_msg:
            return name.title()

    return None


def process_rule_based(message: str) -> IntentData:
    msg_norm = normalize_text(message)

    category = extract_category(msg_norm)
    memory = extract_memory(msg_norm)
    color = extract_color(msg_norm)
    quantity = extract_quantity(message)
    target_price = extract_target_price(message)
    product_code = extract_product_code(message)
    order_code = extract_order_code(message)
    product_name = extract_product_name(message)

    has_book = contains_any(msg_norm, KW_PLACE_ORDER)
    has_search = contains_any(msg_norm, KW_SEARCH)
    has_recommend = contains_any(msg_norm, KW_RECOMMEND)
    has_greeting = contains_any(msg_norm, KW_GREETING)
    has_guide = contains_any(msg_norm, KW_WEBSITE_GUIDE)
    has_track = contains_any(msg_norm, KW_TRACK_ORDER)

    intent = "UNKNOWN"

    if has_track or order_code:
        intent = "TRACK_ORDER"
    elif has_book:
        intent = "PLACE_ORDER"
    elif has_guide:
        intent = "WEBSITE_GUIDE"
    elif has_recommend:
        intent = "RECOMMEND_PRODUCT"
    elif len(msg_norm.split()) <= 8 and has_greeting and not any([
        has_search,
        category,
        product_name,
        product_code,
        target_price,
        memory,
        color,
    ]):
        intent = "GREETING"
    elif has_search or category or product_name or product_code or target_price or memory or color:
        intent = "SEARCH_PRODUCT"

    return IntentData(
        intent=intent,
        product_name=product_name,
        product_code=product_code,
        category=category,
        target_price=target_price,
        color=color,
        memory=memory,
        people=None,
        quantity=quantity,
        order_code=order_code,
        language="vi",
    )
