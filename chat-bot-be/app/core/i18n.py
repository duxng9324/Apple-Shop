MESSAGES = {
    "vi": {
        "greeting": "Xin chào bạn, mình là AppleShop Assistant. Mình có thể giúp bạn tìm sản phẩm, tư vấn lựa chọn, hướng dẫn đặt hàng hoặc kiểm tra đơn hàng.",
        "no_product": "Tiếc quá, mình chưa tìm thấy sản phẩm phù hợp với từ khóa của bạn.",
        "cta": "Bạn muốn mình lọc tiếp theo màu, dung lượng hay tầm giá?",
        "order_guide": (
            "Bạn làm theo các bước để đặt hàng nhanh:\n"
            "1. Mở sản phẩm bạn muốn mua\n"
            "2. Chọn màu + dung lượng\n"
            "3. Nhấn Thêm vào giỏ hàng\n"
            "4. Vào trang Giỏ hàng và nhấn Thanh toán\n"
            "5. Điền thông tin nhận hàng và xác nhận đơn"
        ),
        "website_guide": (
            "Hướng dẫn sử dụng website AppleShop:\n"
            "- Trang chủ: xem sản phẩm nổi bật\n"
            "- Danh mục: /iphone, /ipad, /mac, /watch, /phu-kien\n"
            "- Chi tiết sản phẩm: /{{category}}/{{productCode}}\n"
            "- Giỏ hàng: /cart\n"
            "- Đơn hàng: /order\n"
            "- Tài khoản: /login, /signup, /user"
        ),
        "track_order": "Bạn có thể vào trang /order để kiểm tra lịch sử và trạng thái đơn hàng. Nếu cần, gửi mình mã đơn để mình hướng dẫn nhanh hơn.",
        "labels": {
            "code": "Mã SP",
            "name": "Ten",
            "category": "Danh mục",
            "memory": "Bộ nhớ",
            "price": "Giá",
            "detail": "Chi tiết",
            "currency": "VND",
        },
    },
    "en": {
        "greeting": "Hello, I am AppleShop Assistant. I can help you find products, suggest options, guide checkout, or check order status.",
        "no_product": "Sorry, I could not find products matching your request.",
        "cta": "Would you like me to filter by color, memory, or budget?",
        "order_guide": (
            "Quick order flow:\n"
            "1. Open product details\n"
            "2. Pick color + memory\n"
            "3. Click Add to cart\n"
            "4. Go to /cart and click Checkout\n"
            "5. Fill shipping info and confirm order"
        ),
        "website_guide": (
            "AppleShop website guide:\n"
            "- Home: featured products\n"
            "- Categories: /iphone, /ipad, /mac, /watch, /phu-kien\n"
            "- Product details: /{category}/{productCode}\n"
            "- Cart: /cart\n"
            "- Orders: /order\n"
            "- Account: /login, /signup, /user"
        ),
        "track_order": "You can open /order to check your order history and statuses. Share an order code if you want step-by-step support.",
        "labels": {
            "code": "Code",
            "name": "Name",
            "category": "Category",
            "memory": "Memory",
            "price": "Price",
            "detail": "Details",
            "currency": "VND",
        },
    },
}


def get_msg(lang, key, **kwargs):
    lang_dict = MESSAGES.get(lang, MESSAGES["vi"])
    template = lang_dict.get(key, MESSAGES["vi"].get(key, ""))
    return template.format(**kwargs)


def format_price(price, lang="vi"):
    try:
        if price is None:
            return "Liên hệ" if lang == "vi" else "Contact"

        price_int = int(price)
        currency = MESSAGES.get(lang, MESSAGES["vi"])["labels"]["currency"]
        if lang == "vi":
            return f"{price_int:,}".replace(",", ".") + f" {currency}"
        return f"{price_int:,} {currency}"
    except Exception:
        return str(price)


def _extract_lowest_price(product: dict):
    prices = []
    for item in product.get("list", []) or []:
        if not isinstance(item, dict):
            continue
        value = item.get("price")
        if value is not None:
            try:
                prices.append(int(value))
            except Exception:
                pass
    return min(prices) if prices else None


def _extract_memories(product: dict):
    values = []
    for item in product.get("list", []) or []:
        if isinstance(item, dict) and item.get("memory"):
            values.append(str(item.get("memory")).upper())
    return sorted(list(set(values)))


def format_product_card(product, index, lang="vi", product_url=None):
    labels = MESSAGES.get(lang, MESSAGES["vi"])["labels"]

    code = product.get("code", "N/A")
    name = product.get("name", "Apple Product")
    category = product.get("categoryCode", "")
    memories = _extract_memories(product)
    memory_text = ", ".join(memories[:3]) if memories else "N/A"
    price_text = format_price(_extract_lowest_price(product), lang)

    card = (
        f"### {index}. {name}\n"
        f"- {labels['code']}: {code}\n"
        f"- {labels['category']}: {category}\n"
        f"- {labels['memory']}: {memory_text}\n"
        f"- {labels['price']}: {price_text}\n"
    )

    if product_url:
        if lang == "en":
            card += f"- {labels['detail']}: [Open product]({product_url})\n"
        else:
            card += f"- {labels['detail']}: [Mở sản phẩm]({product_url})\n"

    return card
