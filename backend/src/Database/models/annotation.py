from ...logger import logger
from typing import List
import uuid
from pydantic import BaseModel


class Annotation(BaseModel):
    annotation_id: str = uuid.uuid4().hex
    className: str = ""
    points: List[List[int]] = []

    def setClassName(self, className: str) -> None:
        self.className = className

    def setPoints(self, points: List[List[int]]) -> None:
        self.points = points
