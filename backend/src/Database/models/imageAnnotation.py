from ...logger import logger
from typing import List
from .annotation import Annotation
import uuid
from pydantic import BaseModel
import torch


class ImageAnnotation(BaseModel):
    image_id: str = uuid.uuid4().hex
    annotations: List[Annotation] = []
    file_name: str = ""
    image: bytes = b""
    # image_embeddings: torch.Tensor = None

    def addAnnotation(self, annotation: Annotation) -> None:
        self.annotations.append(annotation)

    def removeAnnotation(self, annotation: Annotation) -> None:
        for ann in self.annotations:
            if ann.id == annotation.id:
                self.annotations.remove(ann)
                return
        logger.warning(f"Annotation {annotation.id} not in annotations list")

    def getAnnotation(self, annotationId: str) -> Annotation:
        for ann in self.annotations:
            if ann.id == annotationId:
                return ann
        logger.warning(f"Annotation {annotationId} not in annotations list")

    def setImageEmbeddings(self, embeddings: torch.Tensor) -> None:
        self.image_embeddings = embeddings
