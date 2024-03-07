from src.logger import logger
from typing import List, Any, Optional
import uuid
from pydantic import BaseModel, Field

class User(BaseModel):
    user_id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    email: str
    hashed_password: str

class LoginSession(BaseModel):
    session_id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    user_id: str
    expiry: int