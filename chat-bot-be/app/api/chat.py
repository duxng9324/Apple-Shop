from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import re
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


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    user_id = req.user_id or "guest"

    await add_history(user_id, "user", req.message)

    session = await get_session(user_id)

    intent_data = intent_service.get_smart_intent(session, req.message)

    updates = {}
    if intent_data.language:
        updates["language"] = intent_data.language
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

    if updates:
        await update_session(user_id, updates)

    session = await get_session(user_id)

    current_lang = session.get("language", "vi")
    intent = intent_data.intent

    reply_text = ""

    if intent == "SEARCH_PRODUCT":
        products = tour_service.search_products(
            query=intent_data.product_name or req.message,
            product_code=intent_data.product_code,
            category=intent_data.category or session.get("category"),
            memory=intent_data.memory,
            color=intent_data.color,
        )

        if not products:
            reply_text = i18n.get_msg(current_lang, "no_product")
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
            cta_text = i18n.get_msg(current_lang, "cta")
            reply_text = f"{intro_text}\n\n{list_text}\n\n{cta_text}"

    elif intent == "RECOMMEND_PRODUCT":
        is_generic_request = _is_generic_recommend_request(req.message, intent_data)

        focused_products = tour_service.search_products(
            query=intent_data.product_name,
            product_code=intent_data.product_code,
            category=intent_data.category or session.get("category"),
            memory=intent_data.memory,
            color=intent_data.color,
        )

        if is_generic_request:
            broad_products = tour_service.search_products()
        else:
            broad_products = tour_service.search_products(
                category=intent_data.category or session.get("category"),
                memory=intent_data.memory,
                color=intent_data.color,
            )

        products = _merge_recommend_candidates(focused_products, broad_products, limit=12)

        if not products:
            reply_text = i18n.get_msg(current_lang, "no_product")
        else:
            intro_text, suggested_products = llm_service.recommend_products_with_ai(
                products,
                req.message,
                lang=current_lang,
                limit=3,
            )
            suggested_products = _ensure_category_diversity(suggested_products, products, max_items=3)
            list_text = "\n\n".join(
                [
                    i18n.format_product_card(
                        product,
                        i,
                        lang=current_lang,
                        product_url=_build_product_url(product),
                    )
                    for i, product in enumerate(suggested_products, 1)
                ]
            )
            cta_text = i18n.get_msg(current_lang, "cta")
            reply_text = f"{intro_text}\n\n{list_text}\n\n{cta_text}"

    elif intent == "PLACE_ORDER":
        product_candidates = tour_service.search_products(
            query=intent_data.product_name,
            product_code=intent_data.product_code,
            category=intent_data.category or session.get("category"),
            memory=intent_data.memory,
            color=intent_data.color,
        )

        user_id_num = int(user_id) if re.fullmatch(r"\d+", str(user_id)) else None

        if user_id_num and product_candidates:
            selected = product_candidates[0]
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
    user_id = req.user_id or "guest"

    await add_history(user_id, "user", req.message)

    async def generate():
        full_response = ""

        for chunk in llm_service.call_ollama_chat_stream(req.message):
            full_response += chunk
            yield chunk

        await add_history(user_id, "ai", full_response)

    return StreamingResponse(generate(), media_type="text/event-stream")
