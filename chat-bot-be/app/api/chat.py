from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import re
import json
from urllib.parse import quote

from app.schemas.chat import ChatRequest, ChatResponse, HistoryResponse
from app.core.memory import get_session, update_session, add_history, rds
from app.services import llm_service, tour_service, intent_service
from app.core import i18n
from app.config import settings

router = APIRouter()


def _build_product_url(product: dict):
    category = str(product.get("categoryCode") or "iphone").strip().strip("/")
    code = str(product.get("code") or "").strip().strip("/")
    if not code:
        return None
    return f"{settings.FRONTEND_BASE_URL.rstrip('/')}/{quote(category)}/{quote(code)}"


def _merge_recommend_candidates(primary: list, fallback: list, limit: int = 12):
    merged = []
    seen = set()

    for product in primary + fallback:
        code = str(product.get("code", "")).strip().lower()
        if not code or code in seen:
            continue
        seen.add(code)
        merged.append(product)
        if len(merged) >= limit:
            break

    return merged


def _is_generic_recommend_request(message: str, intent_data) -> bool:
    msg_norm = (message or "").lower()
    explicit_keywords = [
        "iphone", "ipad", "mac", "macbook", "watch", "airpods", "phu kien", "phụ kiện",
        "mau", "màu", "memory", "bo nho", "bộ nhớ", "gia", "giá",
    ]
    has_explicit_hint = any(keyword in msg_norm for keyword in explicit_keywords)
    return not any([intent_data.product_name, intent_data.product_code, intent_data.category, has_explicit_hint])


def _ensure_category_diversity(suggested_products: list, candidates: list, max_items: int = 3):
    if not suggested_products:
        return []

    selected = suggested_products[:max_items]
    categories = {str(item.get("categoryCode", "")).lower() for item in selected}

    if len(categories) > 1:
        return selected

    for candidate in candidates:
        category = str(candidate.get("categoryCode", "")).lower()
        if category and category not in categories and candidate not in selected:
            selected[-1] = candidate
            categories.add(category)
            break

    return selected


def _extract_lowest_price(product: dict):
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


def _extract_memories(product: dict):
    values = []
    for item in product.get("list", []) or []:
        if isinstance(item, dict):
            memory = item.get("memory") or item.get("type")
            if memory:
                values.append(str(memory).upper())
    return sorted(list(set(values)))


def _extract_colors(product: dict):
    values = []
    for color in product.get("colorDTOs", []) or []:
        if isinstance(color, dict):
            color_name = color.get("name") or color.get("color")
            if color_name:
                values.append(str(color_name))
    return sorted(list(set(values)))


def _to_int(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return int(value)

    text = str(value).strip().replace(",", "")
    if not text:
        return None

    try:
        return int(float(text))
    except Exception:
        return None


def _description_summary(product: dict, max_len: int = 180):
    description = str(product.get("description") or "").strip()
    if not description:
        return "N/A"

    # Normalize markdown-heavy content from BE so comparison stays concise and readable.
    text = re.sub(r"[`*_>#\-]+", " ", description)
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return "N/A"

    return (text[:max_len].rstrip() + "...") if len(text) > max_len else text


def _max_memory_capacity(product: dict):
    max_capacity = 0
    for memory in _extract_memories(product):
        numbers = re.findall(r"\d+", memory)
        if not numbers:
            continue
        try:
            max_capacity = max(max_capacity, int(numbers[0]))
        except Exception:
            pass
    return max_capacity


def _build_budget_comparison(products: list, target_price: int, lang: str = "vi"):
    target_price = _to_int(target_price)
    if target_price is None:
        return ""

    if not products:
        return ""

    rows = []
    for product in products[:3]:
        price = _extract_lowest_price(product)
        if price is None:
            continue
        diff = price - target_price
        rows.append((product, price, diff))

    if not rows:
        return ""

    best_product, best_price, best_diff = min(
        rows,
        key=lambda row: (abs(row[2]), -_max_memory_capacity(row[0]), row[1]),
    )

    target_price_text = i18n.format_price(target_price, lang)
    lines = []

    lines.append(f"### So sánh giá & thông số (mục tiêu: {target_price_text})")
    for idx, (product, price, diff) in enumerate(rows, 1):
        memories = ", ".join(_extract_memories(product)[:3]) or "N/A"
        colors = ", ".join(_extract_colors(product)[:3]) or "N/A"
        if diff >= 0:
            diff_text = f"cao hơn {i18n.format_price(abs(diff), lang)}"
        else:
            diff_text = f"thấp hơn {i18n.format_price(abs(diff), lang)}"
        lines.append(
            f"{idx}. {product.get('name', 'Sản phẩm Apple')}: {i18n.format_price(price, lang)} "
            f"({diff_text} so với mức bạn đặt) | Bộ nhớ: {memories} | Màu: {colors}"
        )

    if best_diff >= 0:
        reason = f"sát ngân sách nhất, chỉ cao hơn {i18n.format_price(abs(best_diff), lang)}"
    else:
        reason = f"sát ngân sách nhất và tiết kiệm hơn {i18n.format_price(abs(best_diff), lang)}"
    lines.append(
        f"Gợi ý chốt: {best_product.get('name', 'Sản phẩm Apple')} vì {reason}, đồng thời thông số vẫn cạnh tranh."
    )
    return "\n".join(lines)


def _build_recommend_intro(product: dict, lang: str = "vi"):
    name = product.get("name", "Sản phẩm Apple")
    price = _extract_lowest_price(product)
    memories = ", ".join(_extract_memories(product)[:3]) or "N/A"
    colors = ", ".join(_extract_colors(product)[:3]) or "N/A"
    price_text = i18n.format_price(price, lang) if price is not None else "N/A"

    return (
        f"AI gợi ý bạn ưu tiên {name} vì cân bằng tốt giữa giá và cấu hình "
        f"(giá từ {price_text}, bộ nhớ: {memories}, màu: {colors})."
    )


def _build_detailed_comparison(products: list, lang: str = "vi", limit: int = 3, base_url: str = None, target_price: int = None):
    """
    Tạo chuỗi so sánh chi tiết cho tối đa `limit` sản phẩm:
    - Thông số kỹ thuật (bộ nhớ, giá thấp nhất, màu)
    - Ưu/nhược điểm dựa trên giá và dung lượng bộ nhớ
    - Gợi ý chốt
    """
    if not products:
        return ""

    selected = products[:limit]

    lines = []
    lines.append(f"Mình giới hạn so sánh chi tiết {len(selected)} sản phẩm phù hợp nhất:")

    # Build per-product detail
    for idx, product in enumerate(selected, 1):
        name = product.get("name") or "Sản phẩm Apple"
        code = product.get("code") or ""
        category = product.get("categoryCode") or ""
        price = _extract_lowest_price(product)
        memories = _extract_memories(product)
        colors = _extract_colors(product)
        description_summary = _description_summary(product)

        price_text = i18n.format_price(price, lang) if price is not None else "N/A"
        memories_text = ", ".join(memories) if memories else "N/A"
        colors_text = ", ".join(colors) if colors else "N/A"

        # technical specs
        lines.append("")
        lines.append(f"### {idx}. {name}")
        lines.append(f"- Mã SP: {code}")
        lines.append(f"- Danh mục: {category}")
        lines.append(f"- Giá: {price_text}")
        lines.append(f"- Bộ nhớ: {memories_text}")
        lines.append(f"- Màu: {colors_text}")
        lines.append(f"- Mô tả nhanh: {description_summary}")

        # show memory-price pairs if available
        if product.get("list"):
            lines.append("- Chi tiết bộ nhớ / giá:")
            for mem in product.get("list")[:5]:
                if isinstance(mem, dict):
                    m = mem.get("memory") or mem.get("type") or "-"
                    p = mem.get("price")
                    p_text = i18n.format_price(int(p), lang) if p is not None else "N/A"
                    lines.append(f"  - {m}: {p_text}")

        # pros/cons heuristics
        pros = []
        cons = []
        # good price
        if price is not None:
            # relative to median of selected
            prices = [p for p in (_extract_lowest_price(x) for x in selected) if p is not None]
            if prices:
                median = sorted(prices)[len(prices)//2]
                if price <= median:
                    pros.append("Giá cạnh tranh")
                else:
                    cons.append("Giá tương đối cao")

        # memory
        max_mem = _max_memory_capacity(product)
        if max_mem >= 128:
            pros.append("Dung lượng lớn phù hợp lưu trữ")
        elif max_mem == 0:
            cons.append("Không có thông tin bộ nhớ rõ ràng")

        if colors and len(colors) >= 2:
            pros.append("Nhiều lựa chọn màu")
        else:
            cons.append("Lựa chọn màu hạn chế")

        if pros:
            lines.append(f"- Ưu điểm: {', '.join(pros)}")
        if cons:
            lines.append(f"- Nhược điểm: {', '.join(cons)}")

        # link
        url = None
        if base_url:
            url = f"{base_url.rstrip('/')}/{category}/{code}" if code else None
        else:
            url = _build_product_url(product)

        if url:
            lines.append(f"- Chi tiết: {url}")

    # final recommendation
    # choose best: prefer close to target_price if provided, else prefer high memory + low price
    best = None
    parsed_target_price = _to_int(target_price)
    if parsed_target_price:
        best = min(selected, key=lambda p: (abs((_extract_lowest_price(p) or 10**9) - parsed_target_price), -_max_memory_capacity(p), _extract_lowest_price(p) or 10**9))
    else:
        best = min(selected, key=lambda p: ((_extract_lowest_price(p) or 10**9), -_max_memory_capacity(p)))

    if best:
        best_name = best.get('name', 'Sản phẩm Apple')
        lines.append(f"\nGợi ý chốt: {best_name} — lựa chọn cân bằng giữa giá và thông số.")

    return "\n".join(lines)


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    user_id = req.user_id or "guest"

    await add_history(user_id, "user", req.message)

    session = await get_session(user_id)

    intent_data = intent_service.get_smart_intent(session, req.message)

    updates = {}
    if intent_data.category:
        updates["category"] = intent_data.category
    if intent_data.product_name:
        updates["product_name"] = intent_data.product_name
    if intent_data.product_code:
        updates["product_code"] = intent_data.product_code
    if intent_data.color:
        updates["color"] = intent_data.color
    if intent_data.memory:
        updates["memory"] = intent_data.memory
    if intent_data.target_price:
        updates["target_price"] = intent_data.target_price

    if updates:
        await update_session(user_id, updates)

    session = await get_session(user_id)

    current_lang = "vi"
    intent = intent_data.intent

    reply_text = ""
    products_for_ai = []

    if intent == "SEARCH_PRODUCT":
        category_filter = intent_data.category or session.get("category")
        target_price = intent_data.target_price or session.get("target_price")
        query_text = intent_data.product_name or session.get("product_name")
        if not query_text and not any([intent_data.product_code, category_filter]):
            query_text = req.message

        products = tour_service.search_products(
            query=query_text,
            product_code=intent_data.product_code,
            category=category_filter,
            target_price=target_price,
            memory=intent_data.memory,
            color=intent_data.color,
        )

        if not products:
            reply_text = i18n.get_msg(current_lang, "no_product")
        else:
            products_for_ai = products[:12]
            if target_price:
                budget_text = i18n.format_price(target_price, current_lang)
                intro_text = f"Mình tìm được {len(products)} sản phẩm gần với mức giá {budget_text} mà bạn yêu cầu."
            else:
                intro_text = llm_service.call_ollama_intro_fast(
                    req.message,
                    len(products),
                    lang=current_lang,
                )
            top_products = products[:5]
            list_text = "\n\n".join(
                [
                    i18n.format_product_card(
                        product,
                        i,
                        lang=current_lang,
                        product_url=_build_product_url(product),
                    )
                    for i, product in enumerate(top_products, 1)
                ]
            )
            # Budget + specs comparison will be generated by AI in one unified section.
            reply_text = f"{intro_text}\n\n{list_text}"

    elif intent == "RECOMMEND_PRODUCT":

        # NOTE: Force AI-only selection — ignore rule-based intent filters
        # Fetch the full catalog and let AI pick the best matches based solely on the user message.
        products = tour_service.search_products()

        if not products:
            reply_text = i18n.get_msg(current_lang, "no_product")
        else:
            intro_text, suggested_products = llm_service.recommend_products_with_ai(
                products,
                req.message,
                lang=current_lang,
                limit=3,
            )
            if _is_generic_recommend_request(req.message, intent_data):
                suggested_products = _ensure_category_diversity(suggested_products, products, max_items=3)
            products_for_ai = suggested_products[:3] if suggested_products else products[:3]

            # Keep recommendation intro grounded in system data to avoid hallucinated specs.
            if products_for_ai:
                intro_text = _build_recommend_intro(products_for_ai[0], lang=current_lang)

            list_text = "\n\n".join(
                [
                    i18n.format_product_card(
                        product,
                        i,
                        lang=current_lang,
                        product_url=_build_product_url(product),
                    )
                    for i, product in enumerate(products_for_ai, 1)
                ]
            )
            reply_text = f"{intro_text}\n\n{list_text}"

    elif intent == "PLACE_ORDER":
        product_candidates = tour_service.search_products(
            query=intent_data.product_name,
            product_code=intent_data.product_code,
            category=intent_data.category or session.get("category"),
            target_price=intent_data.target_price or session.get("target_price"),
            memory=intent_data.memory,
            color=intent_data.color,
        )

        user_id_num = int(user_id) if re.fullmatch(r"\d+", str(user_id)) else None

        if user_id_num and product_candidates:
            selected = product_candidates[0]
            products_for_ai = product_candidates[:3]
            cart_result = tour_service.add_to_cart(
                user_id=user_id_num,
                product_id=selected.get("id"),
                memory=intent_data.memory,
                color=intent_data.color,
            )
            if cart_result:
                reply_text = (
                    f"Đã thêm {selected.get('name', 'sản phẩm')} vào giỏ hàng cho bạn. "
                    "Bạn có thể vào /cart để kiểm tra và thanh toán ngay."
                )
            else:
                reply_text = i18n.get_msg(current_lang, "order_guide")
        else:
            reply_text = i18n.get_msg(current_lang, "order_guide")

    elif intent == "WEBSITE_GUIDE":
        reply_text = i18n.get_msg(current_lang, "website_guide")

    elif intent == "TRACK_ORDER":
        reply_text = i18n.get_msg(current_lang, "track_order")

    elif intent == "GREETING":
        reply_text = i18n.get_msg(current_lang, "greeting")

    else:
        reply_text = llm_service.call_ollama_chat_raw(
            session,
            req.message,
            lang=current_lang,
        )

    # Only compare products for product-related intents.
    if intent in {"SEARCH_PRODUCT", "RECOMMEND_PRODUCT"} and products_for_ai:
        target_price = intent_data.target_price or session.get("target_price")
        detailed_compare_text = _build_detailed_comparison(
            products_for_ai,
            lang=current_lang,
            limit=3,
            target_price=target_price,
        )
        if detailed_compare_text:
            reply_text = f"{reply_text}\n\n{detailed_compare_text}" if reply_text else detailed_compare_text

        if target_price:
            budget_compare_text = _build_budget_comparison(products_for_ai, int(target_price), lang=current_lang)
            if budget_compare_text:
                reply_text = f"{reply_text}\n\n{budget_compare_text}" if reply_text else budget_compare_text

        cta_text = i18n.get_msg(current_lang, "cta")
        reply_text = f"{reply_text}\n\n{cta_text}" if reply_text else cta_text

    await add_history(user_id, "ai", reply_text)

    return ChatResponse(reply=reply_text)


@router.get("/history/{user_id}", response_model=HistoryResponse)
async def get_chat_history(user_id: str):
    session = await get_session(user_id)

    return HistoryResponse(
        user_id=user_id,
        history=session.get("history", []),
    )


@router.delete("/history/{user_id}")
async def clear_chat_history(user_id: str):
    try:
        key = f"session:{user_id}"
        await rds.delete(key)
        return {"status": "success", "message": "Đã xóa lịch sử chat"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/chat_stream")
async def chat_stream_endpoint(req: ChatRequest):
    async def generate():
        try:
            chat_response = await chat_endpoint(req)
            reply = chat_response.reply or ""

            chunk_size = 80
            for i in range(0, len(reply), chunk_size):
                chunk = reply[i:i + chunk_size]
                payload = json.dumps({"delta": chunk}, ensure_ascii=False)
                yield f"data: {payload}\n\n"

            yield "data: [DONE]\n\n"
        except Exception as e:
            payload = json.dumps({"error": str(e)}, ensure_ascii=False)
            yield f"data: {payload}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
