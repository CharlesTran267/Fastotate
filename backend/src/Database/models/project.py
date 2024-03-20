from ...logger import logger
from typing import List
from .imageAnnotation import ImageAnnotation
from .videoAnnotation import VideoAnnotation
from ...config import defaultProjectConfig
import uuid
from pydantic import BaseModel, Field


class Project(BaseModel):
    project_id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    name: str = defaultProjectConfig.name
    classes: List[str] = defaultProjectConfig.classes
    default_class: str = defaultProjectConfig.default_class
    imageAnnotations: List[ImageAnnotation] = []
    videoAnnotations: List[VideoAnnotation] = []

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

    def getImageAnnotation(
        self, imageAnnotationId: str, videoAnnotationId: str = None
    ) -> ImageAnnotation:
        if videoAnnotationId:
            video = self.getVideoAnnotation(videoAnnotationId)
            for image in video.videoFrames:
                if image.image_id == imageAnnotationId:
                    return image
            logger.warning(
                f"ImageAnnotation {imageAnnotationId} not in videoFrames list"
            )
            return None

        for image in self.imageAnnotations:
            if image.image_id == imageAnnotationId:
                return image
        logger.warning(
            f"ImageAnnotation {imageAnnotationId} not in imageAnnotations list"
        )
        return None

    def getProjectSummary(self) -> dict:
        return {
            "project_id": self.project_id,
            "name": self.name,
            "classes": self.classes,
            "default_class": self.default_class,
            "num_images": len(self.imageAnnotations),
        }

    def set_classes(self, classes: List[str], default_class: str):
        if default_class not in classes:
            raise ValueError("Default class must be in classes list")
        self.classes = classes
        self.default_class = default_class

        # Make sure all annotations are in the new classes
        for image in self.imageAnnotations:
            for annotation in image.annotations:
                if annotation.class_name not in classes:
                    annotation.class_name = default_class
        for video in self.videoAnnotations:
            for frame in video.videoFrames:
                for annotation in frame.annotations:
                    if annotation.class_name not in classes:
                        annotation.class_name = default_class

    def addVideoAnnotation(self, videoAnnotation: VideoAnnotation) -> None:
        self.videoAnnotations.append(videoAnnotation)

    def getVideoAnnotation(self, video_id: str) -> VideoAnnotation:
        for video in self.videoAnnotations:
            if video.video_id == video_id:
                return video
        logger.warning(f"VideoAnnotation {video_id} not in videoAnnotations list")
        return None

    def removeVideoAnnotation(self, video_id: str) -> None:
        for video in self.videoAnnotations:
            if video.video_id == video_id:
                self.videoAnnotations.remove(video)
                return
        logger.warning(f"VideoAnnotation {video_id} not in videoAnnotations list")
