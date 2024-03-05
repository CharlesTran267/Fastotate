from ...logger import logger
from typing import List
import uuid
from pydantic import BaseModel, Field
import numpy as np


class Annotation(BaseModel):
    annotation_id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    className: str = ""
    points: List[List[float]] = []

    def setClassName(self, className: str) -> None:
        self.className = className

    def modify_annotation(self, points: List[List[float]], class_name: str) -> None:
        self.points = points
        self.className = class_name

    @property
    def area(self) -> float:
        x = np.array([point[0] for point in self.points])
        y = np.array([point[1] for point in self.points])

        return 0.5 * np.abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1)))
