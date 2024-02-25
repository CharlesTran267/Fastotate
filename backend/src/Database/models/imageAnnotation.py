from ...logger import logger
from typing import List, Any
from .annotation import Annotation
import uuid
import torch
import base64
from pydantic import BaseModel
from ...utils.hexBytes import HexBytes


class ImageAnnotation(BaseModel):
    image_id: str = uuid.uuid4().hex
    annotations: List[Annotation] = []
    file_name: str = None
    image: HexBytes = None
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
