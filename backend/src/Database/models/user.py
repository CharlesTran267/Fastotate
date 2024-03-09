from src.logger import logger
from typing import List, Any, Optional
import uuid
from pydantic import BaseModel, Field, validator
from src.utils.utils import hashString
import random
import time


class User(BaseModel):
    email: str
    hashed_password: str
    projects: List[str] = []
    user_id: str = None
    activated: bool = False

    @validator("user_id", pre=True, always=True)
    def set_user_id(cls, v, values, **kwargs):
        if v is None:
            return hashString(values["email"])
        return v

    def addProject(self, project_id: str) -> None:
        self.projects.append(project_id)

    def activateAccount(self) -> None:
        self.activated = True


class LoginSession(BaseModel):
    session_token: str = Field(default_factory=lambda: uuid.uuid4().hex)
    user_id: str
    expiry: int


class VerificationCode(BaseModel):
    code: int = Field(default_factory=lambda: random.randint(100000, 999999))
    user_id: str
    expiry: int = Field(default_factory=lambda: int(time.time()) + 310)

    def isExpired(self) -> bool:
        return int(time.time()) > self.expiry
