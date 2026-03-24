from app.core.rules import process_rule_based
from app.services.llm_service import call_ollama_intent # Giả sử hàm gọi AI của bạn ở đây

def get_smart_intent(session: dict, message: str):
    intent_data = process_rule_based(message)

    print(f"⚡ Rule Result: {intent_data.intent} | Product: {intent_data.product_name}")
    
    should_call_ai = False
    
    if intent_data.intent == "UNKNOWN":
        should_call_ai = True
        print("Reason: Rule returned UNKNOWN")
    
    elif intent_data.intent == "GREETING":
        return intent_data

    elif intent_data.intent == "SEARCH_PRODUCT" and not any([
        intent_data.product_name,
        intent_data.product_code,
        intent_data.category,
        intent_data.target_price,
    ]):
        should_call_ai = True
        print("Reason: Search intent but missing product entity")

    # --- BƯỚC 3: GỌI AI (NẾU CẦN) ---
    if should_call_ai:
        should_call_ai = False
        print("🤖 Fallback to AI (Ollama)...")
        ai_data = call_ollama_intent(session, message, intent_data)
        
        # Chỉ dùng kết quả AI nếu nó thực sự tìm ra cái gì đó có ích hơn
        if ai_data.intent != "UNKNOWN":
            intent_data = ai_data
            print(f"✅ AI Result: {intent_data} ")
        else:
            print("❌ AI also returned UNKNOWN")

    return intent_data