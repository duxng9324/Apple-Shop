import requests
import json
import re
from typing import List, Tuple
from app.config import settings
from app.core.prompts import build_intent_prompt
from app.schemas.chat import IntentData

# ==========================================
# 1. CÁC HÀM BỔ TRỢ (HELPER)
# ==========================================


def extract_json(text: str):
    """
    Trích xuất chuỗi JSON từ phản hồi của AI (vì AI hay nói nhảm thêm ở đầu/đuôi).
    """
    try:
        # Tìm chuỗi bắt đầu bằng { và kết thúc bằng }
        match = re.search(r"\{[\s\S]*\}", text)
        return match.group(0) if match else None
    except:
        return None


def normalize_int(value):
    """
    Chuyển đổi text sang số (Ví dụ: "3 ngày" -> 3).
    """
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        match = re.search(r"\d+", value)
        return int(match.group()) if match else None
    return None


def local_chat_fallback(message: str, lang: str = "vi") -> str:
    msg_norm = message.lower().strip()

    if lang == "en":
        if any(k in msg_norm for k in ["your name", "who are you", "what are you"]):
            return "I am AppleShop Assistant. I can help you find Apple products, guide checkout, and support order tracking."
        if any(k in msg_norm for k in ["what can you do", "help me", "support"]):
            return (
                "I can help with: product search, recommendations by budget, checkout steps, "
                "and order tracking in /order."
            )
        return (
            "I am temporarily having trouble connecting to the AI service. "
            "You can still ask me to find products, suggest options, or guide checkout."
        )

    if any(k in msg_norm for k in ["tên", "ten", "bạn là ai", "ban la ai", "ai vậy", "ai vay"]):
        return "Mình là AppleShop Assistant, trợ lý ảo của cửa hàng. Mình có thể giúp bạn tìm sản phẩm, tư vấn và hướng dẫn đặt hàng."

    if any(k in msg_norm for k in ["làm gì", "lam gi", "giúp", "giup", "hỗ trợ", "ho tro"]):
        return (
            "Mình có thể hỗ trợ: tìm sản phẩm Apple, gợi ý theo nhu cầu/tầm giá, "
            "hướng dẫn đặt hàng, và kiểm tra đơn hàng tại /order."
        )

    return (
        "Hiện tại kết nối AI đang không ổn định, nhưng mình vẫn có thể hỗ trợ bạn "
        "tìm sản phẩm, tư vấn mua hàng và hướng dẫn các bước đặt hàng trên website."
    )


def _lowest_price(product: dict):
    prices = []
    for item in product.get("list", []) or []:
        if isinstance(item, dict) and item.get("price") is not None:
            try:
                prices.append(int(item.get("price")))
            except Exception:
                pass
    return min(prices) if prices else None


def _memories(product: dict):
    values = []
    for item in product.get("list", []) or []:
        if isinstance(item, dict):
            memory = item.get("memory") or item.get("type")
            if memory:
                values.append(str(memory).upper())
    return sorted(list(set(values)))


def _colors(product: dict):
    values = []
    for color in product.get("colorDTOs", []) or []:
        if isinstance(color, dict):
            color_name = color.get("name") or color.get("color")
            if color_name:
                values.append(str(color_name))
    return sorted(list(set(values)))


def _build_product_line(product: dict):
    code = str(product.get("code", ""))
    name = str(product.get("name", ""))
    category = str(product.get("categoryCode", ""))
    price = _lowest_price(product)
    memories = ",".join(_memories(product)[:3]) or "N/A"
    colors = ",".join(_colors(product)[:3]) or "N/A"
    return f"{code}|{name}|{category}|{price}|{memories}|{colors}"


def _pick_by_codes(products: List[dict], codes: List[str], limit: int):
    normalized = [str(c).strip().lower() for c in codes if c]
    selected = []

    for code in normalized:
        for product in products:
            product_code = str(product.get("code", "")).strip().lower()
            if product_code == code and product not in selected:
                selected.append(product)
                break
        if len(selected) >= limit:
            break

    return selected


def recommend_products_with_ai(products: List[dict], user_message: str, lang: str = "vi", limit: int = 3) -> Tuple[str, List[dict]]:
    if not products:
        return "", []

    candidates = products[:12]
    catalog = "\n".join([_build_product_line(product) for product in candidates])

    msg_norm = user_message.lower()
    strict_single_category = any(
        keyword in msg_norm
        for keyword in ["chi iphone", "chỉ iphone", "only iphone", "chi ipad", "chỉ ipad", "only ipad", "chi mac", "chỉ mac", "only mac"]
    )

    diversity_instruction_en = "Focus on diversity across categories when possible." if not strict_single_category else "Respect user's single-category preference."
    diversity_instruction_vi = "Ưu tiên đa dạng danh mục nếu có thể, không chỉ iPhone." if not strict_single_category else "Ưu tiên đúng danh mục mà người dùng yêu cầu."

    if lang == "en":
        prompt = f"""
You are AppleShop Assistant.
Pick the best {limit} products from catalog for this user request: "{user_message}".
{diversity_instruction_en}

Catalog format: code|name|category|lowest_price|memories|colors
{catalog}

Return strict JSON only:
{{
  "intro": "short recommendation summary in English",
  "codes": ["code1", "code2", "code3"]
}}
"""
        default_intro = "Here are the most suitable products for your request:"
    else:
        prompt = f"""
Bạn là AppleShop Assistant.
Hãy chọn {limit} sản phẩm phù hợp nhất từ danh sách cho nhu cầu: "{user_message}".
{diversity_instruction_vi}

Định dạng catalog: code|name|category|lowest_price|memories|colors
{catalog}

Chỉ trả về JSON hợp lệ:
{{
  "intro": "tóm tắt ngắn gọn lý do gợi ý bằng tiếng Việt có dấu",
  "codes": ["code1", "code2", "code3"]
}}
"""
        default_intro = "Mình đã chọn các sản phẩm phù hợp nhất theo nhu cầu của bạn:"

    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.2,
            "num_ctx": 768,
            "num_predict": 120,
        },
    }

    try:
        res = requests.post(settings.OLLAMA_URL, json=payload, timeout=18)
        res.raise_for_status()

        response_text = ""
        data = res.json() if res.content else {}
        if isinstance(data, dict):
            response_text = str(data.get("response", ""))

        json_text = extract_json(response_text)
        if json_text:
            parsed = json.loads(json_text)
            intro = parsed.get("intro") or default_intro
            codes = parsed.get("codes") or []
            selected = _pick_by_codes(candidates, codes, limit)
            if selected:
                if len(selected) < limit:
                    for product in candidates:
                        if product not in selected:
                            selected.append(product)
                        if len(selected) >= limit:
                            break
                return intro, selected[:limit]
    except Exception as e:
        print(f"⚠️ Recommend AI error: {e}")

    return default_intro, candidates[:limit]


def build_ai_comparison_reply(
    products: List[dict],
    user_message: str,
    intent: str = "UNKNOWN",
    lang: str = "vi",
    limit: int = 3,
    target_price: int = None,
) -> str:
    """
    Always use AI to produce a detailed comparison + final recommendation.
    Works for any intent by selecting top products first, then asking AI to compare.
    """
    if not products:
        return ""

    intro, selected = recommend_products_with_ai(products, user_message, lang=lang, limit=limit)
    if not selected:
        selected = products[:limit]

    catalog = "\n".join([_build_product_line(product) for product in selected[:limit]])

    if lang == "en":
        budget_line = f"Target budget: {target_price} VND" if target_price else "Target budget: not specified"
        prompt = f"""
You are AppleShop Assistant.
User intent: {intent}
User request: "{user_message}"
{budget_line}

Below are the top matching products in this format:
code|name|category|lowest_price|memories|colors
{catalog}

Write a concise but detailed markdown response in English with exactly these parts:
1) "### Detailed comparison (Top {limit})"
2) For each product: key specs + pros + cons + budget fit
3) "### Final recommendation" with one best choice and reason

Rules:
- Compare ONLY these products.
- Mention memory and color when available.
- If target budget exists, explicitly show price difference vs budget for each product.
- If a field is missing, write N/A.
- Keep practical shopping advice.
- Do not output JSON.
"""
        fallback_lines = [
            f"### Detailed comparison (Top {len(selected[:limit])})",
        ]
        for i, p in enumerate(selected[:limit], 1):
            lowest = _lowest_price(p)
            budget_fit = ""
            if target_price and lowest is not None:
                diff = int(lowest) - int(target_price)
                sign = "+" if diff >= 0 else "-"
                budget_fit = f" | Budget diff: {sign}{abs(diff)}"
            fallback_lines.append(
                f"{i}. {p.get('name', 'Apple Product')} | Price: {(lowest or 'N/A')} | Memory: {', '.join(_memories(p)) or 'N/A'} | Colors: {', '.join(_colors(p)) or 'N/A'}{budget_fit}"
            )
        fallback_lines.append("### Final recommendation")
        fallback_lines.append(f"Recommended: {selected[0].get('name', 'Apple Product')} based on overall fit.")
        fallback = "\n".join(fallback_lines)
    else:
        budget_line = f"Ngân sách mục tiêu: {target_price} VND" if target_price else "Ngân sách mục tiêu: chưa cung cấp"
        prompt = f"""
Bạn là AppleShop Assistant.
Intent người dùng: {intent}
Nhu cầu người dùng: "{user_message}"
{budget_line}

Danh sách sản phẩm phù hợp nhất (định dạng):
code|name|category|lowest_price|memories|colors
{catalog}

Hãy viết markdown bằng tiếng Việt có dấu với đúng các phần:
1) "### So sánh chi tiết (Top {limit})"
2) Mỗi sản phẩm: thông số chính + ưu điểm + nhược điểm + độ phù hợp ngân sách
3) "### Gợi ý chốt" nêu 1 lựa chọn tốt nhất và lý do

Quy tắc:
- Chỉ so sánh trong danh sách trên.
- Ưu tiên thông tin bộ nhớ, màu, giá.
- Nếu có ngân sách mục tiêu, bắt buộc nêu chênh lệch giá so với ngân sách cho từng sản phẩm.
- Thiếu dữ liệu thì ghi N/A.
- Văn phong ngắn gọn, thực tế, dễ quyết định mua.
- Không trả JSON.
"""
        fallback_lines = [
            f"### So sánh chi tiết (Top {len(selected[:limit])})",
        ]
        for i, p in enumerate(selected[:limit], 1):
            lowest = _lowest_price(p)
            budget_fit = ""
            if target_price and lowest is not None:
                diff = int(lowest) - int(target_price)
                if diff >= 0:
                    budget_fit = f" | Chênh ngân sách: +{abs(diff)}"
                else:
                    budget_fit = f" | Chênh ngân sách: -{abs(diff)}"
            fallback_lines.append(
                f"{i}. {p.get('name', 'Sản phẩm Apple')} | Giá: {(lowest or 'N/A')} | Bộ nhớ: {', '.join(_memories(p)) or 'N/A'} | Màu: {', '.join(_colors(p)) or 'N/A'}{budget_fit}"
            )
        fallback_lines.append("### Gợi ý chốt")
        fallback_lines.append(f"Nên chọn: {selected[0].get('name', 'Sản phẩm Apple')} vì phù hợp tổng thể nhất.")
        fallback = "\n".join(fallback_lines)

    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,
            "num_ctx": 1024,
            "num_predict": 420,
        },
    }

    try:
        res = requests.post(settings.OLLAMA_URL, json=payload, timeout=35)
        res.raise_for_status()
        data = res.json() if res.content else {}
        response_text = ""
        if isinstance(data, dict):
            response_text = str(data.get("response", "")).strip()

        if response_text:
            return f"{intro}\n\n{response_text}"
    except Exception as e:
        print(f"⚠️ AI comparison error: {e}")

    return f"{intro}\n\n{fallback}"

# ==========================================
# 2. CORE SERVICES
# ==========================================


def call_ollama_intent(session: dict, message: str, rule_intent: IntentData | None = None) -> IntentData:
    """
    Phân tích Intent bằng AI.
    ⚡ Rule-based luôn ưu tiên cao hơn AI.
    Nếu rule đã xác định intent != UNKNOWN → KHÔNG gọi AI.
    """

    use_ai = False

    if not rule_intent or rule_intent.intent == "UNKNOWN":
        use_ai = True
    else:
        # intent có rồi nhưng thiếu entity → vẫn gọi AI
        if not any([
            rule_intent.product_name,
            rule_intent.product_code,
            rule_intent.category,
            rule_intent.memory,
            rule_intent.color,
            rule_intent.order_code,
        ]):
            use_ai = True

    if not use_ai:
        print("⚡ Rule đủ dữ liệu → skip AI")
        return rule_intent

    print("🤖 Call AI for entity extraction...")

    # ========================
    # CALL AI
    # ========================
    prompt = build_intent_prompt(session, message)

    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0,
            "num_ctx": 512,
            "num_predict": 60,
        }
    }

    try:
        res = requests.post(settings.OLLAMA_URL, json=payload, timeout=60)
        res.raise_for_status()

        json_text = extract_json(res.json().get("response", ""))
        if not json_text:
            return rule_intent or IntentData(intent="UNKNOWN", language="vi")

        ai_data = json.loads(json_text)

        ai_data["quantity"] = normalize_int(ai_data.get("quantity"))
        ai_data["people"] = normalize_int(ai_data.get("people"))
        ai_data["target_price"] = normalize_int(ai_data.get("target_price"))

        ai_result = IntentData(**ai_data)

        # ========================
        # 🔥 MERGE (QUAN TRỌNG NHẤT)
        # Rule luôn ưu tiên intent
        # ========================
        if rule_intent:
            return IntentData(
                intent=rule_intent.intent,  # RULE ALWAYS WIN
                product_name=rule_intent.product_name or ai_result.product_name,
                product_code=rule_intent.product_code or ai_result.product_code,
                category=rule_intent.category or ai_result.category,
                target_price=rule_intent.target_price or ai_result.target_price,
                color=rule_intent.color or ai_result.color,
                memory=rule_intent.memory or ai_result.memory,
                quantity=rule_intent.quantity or ai_result.quantity,
                order_code=rule_intent.order_code or ai_result.order_code,
                people=rule_intent.people or ai_result.people,
                language=rule_intent.language or ai_result.language
            )

        return ai_result

    except Exception as e:
        print(f"❌ Intent Error: {e}")
        return rule_intent or IntentData(intent="UNKNOWN", language="vi")


# def call_ollama_intro_fast(user_msg: str, tour_count: int, dest_name: str = "", lang: str = "vi") -> str:
#     """
#     Viết câu intro cực nhanh theo ngôn ngữ (lang='vi' hoặc 'en')
#     """

    # Cấu hình Prompt theo ngôn ngữ
    # if lang == "en":
    #     lang_instruction = "English. Tone: Friendly, exciting, professional."
    #     example_found = f'"Here are {tour_count} amazing tours to {dest_name} for you:"'
    #     example_not_found = '"Sorry, I couldn\'t find any matching tours. Would you like to check other places?"'
    # else:
    #     lang_instruction = "Tiếng Việt. Giọng điệu: Thân thiện, hào hứng, chuyên nghiệp."
    #     example_found = f'"Dạ, mình tìm được {tour_count} tour đi {dest_name} cực hot cho bạn đây:"'
    #     example_not_found = '"Tiếc quá, hiện mình chưa có tour này. Bạn có muốn xem địa điểm khác không?"'

    # # Kịch bản prompt
    # if tour_count > 0:
    #     system_prompt = f"""
    #     Role: Travel Assistant.
    #     Task: Write ONE short sentence (under 20 words) in **{lang_instruction}** to introduce {tour_count} tours to {dest_name}.
    #     Use one emoji 🌟.
    #     Example: {example_found}
    #     """
    # else:
    #     system_prompt = f"""
    #     Role: Travel Assistant.
    #     Task: Write ONE short apology sentence in **{lang_instruction}** stating no tours found.
    #     Example: {example_not_found}
    #     """

    # payload = {
    #     "model": settings.OLLAMA_MODEL,
    #     "prompt": f"{system_prompt}\nUser Input: \"{user_msg}\"",
    #     "stream": False,
    #     "keep_alive": "30m",
    #     "options": {
    #         "num_predict": 60,
    #         "temperature": 0.5
    #     }
    # }

    # try:
    #     res = requests.post(settings.OLLAMA_URL, json=payload, timeout=60)
    #     intro = res.json().get("response", "").strip()
    #     # Fallback cứng nếu lỗi
    #     if not intro:
    #         return "Here is the list:" if lang == "en" else "Dưới đây là danh sách:"
    #     return intro
    # except:
    #     return "Here is the list:" if lang == "en" else "Dưới đây là danh sách:"


def call_ollama_chat_raw(session ,message: str, lang: str = "vi") -> str:
    history = ""
    for h in session.get("history", [])[-3:]:  
        role = "U" if h["role"] == "user" else "A"
        history += f"{role}:{h['content']}\n"
    """
    Hàm chat tự do (Non-stream) hỗ trợ đa ngôn ngữ.
    Dùng cho các trường hợp fallback hoặc khi không cần hiệu ứng gõ chữ.
    """
    print("Call chat raw")
    # 1. Cấu hình System Prompt theo ngôn ngữ
    if lang == "en":
        system_instruction = f"You are AppleShop Assistant, a helpful Apple products shopping AI assistant. Answer in English. Tone: friendly, concise, practical. You can guide search, ordering flow, and website navigation. History: {history}"
        error_msg = "I'm having some connection trouble right now. Please try again later! 😓"
    else:
        system_instruction = f"Bạn là AppleShop Assistant, trợ lý ảo cho website bán sản phẩm Apple. Trả lời bằng tiếng Việt có dấu, giọng thân thiện, ngắn gọn, thực dụng. Tuyệt đối không dùng tiếng Việt không dấu. Bạn có thể hướng dẫn tìm sản phẩm, đặt hàng và cách dùng website. Lịch sử chat: {history}"
        error_msg = "Hiện tại mình đang gặp chút trục trặc kết nối. Bạn thử lại sau nhé! 😓"

    # 2. Tạo Prompt
    prompt = f"""
    System: {system_instruction}
    User: {message}
    """

    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "keep_alive": "30m",
        "options": {
            "temperature": 0.4,
            "num_predict": 50,
            "num_ctx": 128,
            "top_k": 20,
            "top_p": 0.8
        }
    }

    try:
        res = requests.post(settings.OLLAMA_URL, json=payload, timeout=60)
        res.raise_for_status()

        data = res.json() if res.content else {}
        if isinstance(data, dict):
            answer = data.get("response") or data.get("text") or data.get("generated_text")
            if answer:
                return str(answer).strip()

        return local_chat_fallback(message, lang)
    except Exception as e:
        print(f"❌ Chat Raw Error: {e}")
        return local_chat_fallback(message, lang)


def call_ollama_intro_fast(user_msg: str, tour_count: int, dest_name: str = "", lang: str = "vi") -> str:
    if lang == "en":
        if tour_count > 0:
            return f"I found {tour_count} matching Apple products for you 🌟"
        return "Sorry, I could not find matching products. Want to try another keyword?"
    else:
        if tour_count > 0:
            return f"Mình tìm được {tour_count} sản phẩm phù hợp cho bạn đây 🌟"
        return "Tiếc quá, hiện chưa có sản phẩm phù hợp. Bạn thử từ khóa khác nhé?"


def call_ollama_chat_stream(message: str, lang: str = "vi"):
    """
    Chat Stream tự do (Greeting, hỏi đáp chung)
    """
    # System Prompt định hướng ngôn ngữ
    if lang == "en":
        system_instruction = "You are AppleShop Assistant. Answer in English. Keep it concise and friendly."
    else:
        system_instruction = "Bạn là AppleShop Assistant. Trả lời bằng Tiếng Việt. Giọng điệu thân thiện, ngắn gọn."

    prompt = f"""
    System: {system_instruction}
    User: {message}
    """

    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": True,
        "options": {"temperature": 0.7},
        "keep_alive": "30m",
    }

    try:
        with requests.post(settings.OLLAMA_URL, json=payload, stream=True, timeout=120) as r:
            # Check lỗi HTTP trước khi stream
            if r.status_code != 200:
                yield "Error: AI Service Unavailable"
                return

            for line in r.iter_lines():
                if line:
                    try:
                        body = json.loads(line)
                        token = body.get("response", "")
                        if token:
                            yield token
                    except:
                        pass
    except Exception as e:
        yield f"Error: {str(e)}"
