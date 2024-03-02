import redis
from typing import List
from .models import Project, ImageAnnotation, Annotation
from ..logger import logger
import torch


class Database:
    def __init__(
        self, redis_url: str = "", redis_host: str = "localhost", redis_port: int = 6379
    ):
        if not redis_url:
            redis_url = f"redis://@{redis_host}:{redis_port}"
        self.db = redis.from_url(redis_url)

    def get_project(self, projectId: str) -> Project:
        if not self.db.exists(projectId):
            logger.debug(f"Project {projectId} not found")
            raise KeyError(f"Project {projectId} not found")
        project_data = self.db.get(projectId)
        return Project.parse_raw(project_data)

    def store_project(self, project: Project) -> None:
        self.db.set(project.project_id, project.json())

    def delete_project(self, projectId: str) -> None:
        self.db.delete(projectId)

    def get_image(self, projectId: str, imageId: str) -> ImageAnnotation:
        project = self.get_project(projectId)
        return project.getImageAnnotation(imageId)

    def add_new_project(self) -> Project:
        project = Project()
        self.store_project(project)
        return project

    def add_new_image(
        self, file_name: str, image: bytes, projectId: str
    ) -> ImageAnnotation:
        project = self.get_project(projectId)
        newImage = ImageAnnotation()
        newImage.file_name = file_name
        newImage.image = image
        project.addImageAnnotation(newImage)
        self.store_project(project)
        return newImage

    def add_new_annotation(
        self, projectId: str, imageId: str, points: List[List[int]], className: str
    ) -> Annotation:
        project = self.get_project(projectId)
        image = project.getImageAnnotation(imageId)
        annotation = Annotation(className=className, points=points)
        image.addAnnotation(annotation)
        self.store_project(project)
        return annotation

    def modify_annotation(
        self,
        projectId: str,
        imageId: str,
        annotationId: str,
        points: List[List[int]],
        class_name: str,
    ) -> None:
        project = self.get_project(projectId)
        image = project.getImageAnnotation(imageId)
        annotation = image.getAnnotation(annotationId)
        annotation.modify_annotation(points, class_name)
        self.store_project(project)

    def delete_image(self, projectId: str, imageId: str) -> None:
        project = self.get_project(projectId)
        project.removeImageAnnotation(imageId)
        self.store_project(project)

    def delete_annotation(
        self, projectId: str, imageId: str, annotationId: str
    ) -> None:
        project = self.get_project(projectId)
        image = project.getImageAnnotation(imageId)
        image.removeAnnotation(annotationId)
        self.store_project(project)

    def add_class(self, projectId: str, className: str) -> None:
        project = self.get_project(projectId)
        project.addClass(className)
        self.store_project(project)

    def change_project_name(self, projectId: str, name: str) -> None:
        project = self.get_project(projectId)
        project.setProjectName(name)
        self.store_project(project)

    def set_default_class(self, projectId: str, className: str) -> None:
        project = self.get_project(projectId)
        project.setDefaultClass(className)
        self.store_project(project)

    def set_image_embeddings(
        self, projectId: str, imageId: str, embeddings: torch.Tensor
    ) -> None:
        project = self.get_project(projectId)
        image = project.getImageAnnotation(imageId)
        image.setImageEmbeddings(embeddings)
        self.store_project(project)
