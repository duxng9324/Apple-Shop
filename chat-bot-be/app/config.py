from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OLLAMA_URL: str
    OLLAMA_MODEL: str
    JAVA_BACKEND_BASE: str
    FRONTEND_BASE_URL: str = "http://localhost:3000"
    
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    @property
    def TOUR_API(self):
        return f"{self.JAVA_BACKEND_BASE}/data"

    @property
    def TOUR_SEARCH_API(self):
        return f"{self.JAVA_BACKEND_BASE}/data"

    @property
    def PRODUCT_API(self):
        return f"{self.JAVA_BACKEND_BASE}/api/product"

    @property
    def CART_API(self):
        return f"{self.JAVA_BACKEND_BASE}/api/cart"

    @property
    def ORDER_API(self):
        return f"{self.JAVA_BACKEND_BASE}/api/order"

    class Config:
        env_file = ".env"

settings = Settings()