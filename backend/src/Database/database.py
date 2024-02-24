import redis
from typing import List
from .models import Project, ImageAnnotation, Annotation


class Database:
    def __init__(
        self, redis_url: str = "", redis_host: str = "localhost", redis_port: int = 6379
    ):
        if not redis_url:
            redis_url = f"redis://@{redis_host}:{redis_port}"
        self.db = redis.from_url(redis_url)

    def get_project(self, projectId: str) -> Project:
        if not self.db.exists(projectId):
            raise KeyError(f"Project {projectId} not found")
        project = self.db.hgetall(projectId)
        project_data = {}
        for key, value in project.items():
            project_data[key.decode("utf-8")] = value.decode("utf-8")

        return Project.parse_obj(project_data)

    def store_project(self, project: Project) -> None:
        self.db.hmset(project.project_id, project.dict())

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
        image = ImageAnnotation(file_name=file_name, image=image)
        project.addImageAnnotation(image)
        self.store_project(project)
        return image

    def add_new_annotation(
        self, projectId: str, imageId: str, points: List[List[int]], className: str
    ) -> Annotation:
        project = self.get_project(projectId)
        image = project.getImageAnnotation(imageId)
        annotation = Annotation(className=className, points=points)
        image.addAnnotation(annotation)
        self.store_project(project)
        return annotation

    def setPoints(
        self, projectId: str, imageId: str, annotationId: str, points: List[List[int]]
    ) -> None:
        project = self.get_project(projectId)
        image = project.getImageAnnotation(imageId)
        annotation = image.getAnnotation(annotationId)
        annotation.setPoints(points)
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
