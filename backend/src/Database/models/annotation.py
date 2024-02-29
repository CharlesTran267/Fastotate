from ...logger import logger
from typing import List
import uuid
from pydantic import BaseModel, Field


class Annotation(BaseModel):
    annotation_id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    className: str = ""
    points: List[List[float]] = []

    def setClassName(self, className: str) -> None:
        self.className = className

    def modify_annotation(self, points: List[List[float]], class_name: str) -> None:
        self.points = points
        self.className = class_name
