import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
    APP_NAME: str = os.getenv("APP_NAME", "URL Shortener AI Service")
    APP_ENV: str = os.getenv("APP_ENV", "local")


settings = Settings()