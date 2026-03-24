from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str

class IntentData(BaseModel):
    intent: str
    product_name: Optional[str] = None
    product_code: Optional[str] = None
    category: Optional[str] = None
    target_price: Optional[int] = None
    color: Optional[str] = None
    memory: Optional[str] = None
    people: Optional[int] = None
    quantity: Optional[int] = None
    order_code: Optional[str] = None
    language: Optional[str] = "vi"

class Message(BaseModel):
    role: str       # "user" hoặc "ai"
    content: str    # Nội dung tin nhắn

class HistoryResponse(BaseModel):
    user_id: str
    history: List[Message]