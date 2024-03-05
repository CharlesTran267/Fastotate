from ...logger import logger
from typing import List
from .imageAnnotation import ImageAnnotation
from ...config import defaultProjectConfig
import uuid
from pydantic import BaseModel, Field


class Project(BaseModel):
    project_id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    name: str = defaultProjectConfig.name
    classes: List[str] = defaultProjectConfig.classes
    default_class: str = defaultProjectConfig.default_class
    imageAnnotations: List[ImageAnnotation] = []

    def setProjectName(self, name: str) -> None:
        self.name = name

    def addClass(self, className: str) -> None:
        if className not in self.classes:
            self.classes.append(className)
        else:
            logger.warning(f"Class {className} already in classes list")

    def removeClass(self, className: str) -> None:
        if className in self.classes:
            self.classes.remove(className)
        else:
            logger.warning(f"Class {className} not in classes list")

    def setDefaultClass(self, className: str) -> None:
        if className in self.classes:
            self.default_class = className
        else:
            logger.warning(f"Class {className} not in classes list")

    def addImageAnnotation(self, imageAnnotation: ImageAnnotation) -> None:
        self.imageAnnotations.append(imageAnnotation)

    def removeImageAnnotation(self, imageAnnotation_id: str) -> None:
        for image in self.imageAnnotations:
            if image.image_id == imageAnnotation_id:
                self.imageAnnotations.remove(image)
                return
        logger.warning(
            f"ImageAnnotation {imageAnnotation_id} not in imageAnnotations list"
        )

    def getImageAnnotation(self, imageAnnotationId: str) -> ImageAnnotation:
        for image in self.imageAnnotations:
            if image.image_id == imageAnnotationId:
                return image
        logger.warning(
            f"ImageAnnotation {imageAnnotationId} not in imageAnnotations list"
        )
        return None
