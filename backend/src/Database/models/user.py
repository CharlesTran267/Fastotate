from src.logger import logger
from typing import List, Any, Optional
import uuid
from pydantic import BaseModel, Field
from src.utils.utils import hashString


class User(BaseModel):
    email: str
    hashed_password: str
    projects: List[str] = []

    @property
    def user_id(self):
        return hashString(self.email)

    def addProject(self, project_id: str) -> None:
        self.projects.append(project_id)


class LoginSession(BaseModel):
    session_token: str = Field(default_factory=lambda: uuid.uuid4().hex)
    user_id: str
    expiry: int
