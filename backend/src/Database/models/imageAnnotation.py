from ...logger import logger
from typing import List, Any, Optional
from .annotation import Annotation
import uuid
import torch
import base64
from pydantic import BaseModel, Field, field_serializer
from ...utils.serialisableTensor import TorchTensor


class ImageAnnotation(BaseModel):
    image_id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    annotations: List[Annotation] = []
    file_name: str
    width: Optional[int] = 0
    height: Optional[int] = 0

    def addAnnotation(self, annotation: Annotation) -> None:
        self.annotations.append(annotation)

    def removeAnnotation(self, annotation_id: str) -> None:
        for ann in self.annotations:
            if ann.annotation_id == annotation_id:
                self.annotations.remove(ann)
                return
        logger.warning(f"Annotation {annotation_id} not in annotations list")

    def getAnnotation(self, annotationId: str) -> Annotation:
        for ann in self.annotations:
            if ann.annotation_id == annotationId:
                return ann
        logger.warning(f"Annotation {annotationId} not in annotations list")
