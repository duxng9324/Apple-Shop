from pydantic import BaseModel
from typing import List, Optional


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: Optional[str] = None
    user_id: Optional[str] = None
    history: Optional[List[Message]] = None


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


class HistoryResponse(BaseModel):
    user_id: str
    history: List[Message]
