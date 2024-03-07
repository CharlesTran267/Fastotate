import redis
from typing import List
from .models import Project, ImageAnnotation, Annotation, Image
from ..logger import logger
import torch
import io
import PIL.Image


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
        project = Project.parse_raw(project_data)
        return project

    def store_project(self, project: Project) -> None:
        self.db.set(project.project_id, project.json())

    def delete_project(self, projectId: str) -> None:
        self.db.delete(projectId)

    def get_image_annotation(self, projectId: str, imageId: str) -> ImageAnnotation:
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
        imageObj = PIL.Image.open(io.BytesIO(image))
        width, height = imageObj.size
        logger.debug(f"Image size: {width}x{height}")
        newImageAnnotation = ImageAnnotation(
            file_name=file_name, width=width, height=height
        )
        project.addImageAnnotation(newImageAnnotation)
        self.store_project(project)

        newImage = Image(image_bytes=image, image_id=newImageAnnotation.image_id)
        self.store_image(newImage)
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

    def set_image_embeddings(self, imageId: str, embeddings: torch.Tensor) -> None:
        image = self.get_image(imageId)
        image.image_embeddings = embeddings
        self.store_image(image)

    def store_image(self, image: Image) -> None:
        self.db.set(image.image_id, image.json())

    def get_image(self, imageID: str) -> Image:
        if not self.db.exists(imageID):
            logger.debug(f"Image {imageID} not found")
            raise KeyError(f"Image {imageID} not found")

        image_data = self.db.get(imageID)
        image = Image.parse_raw(image_data)
        return image
    
    def add_new_user(self, email: str, pass_word: str) -> None:
        if self.db.exists(hash(email)):
            logger.debug(f"User {email} already exists")
            raise KeyError(f"User {email} already exists")
            
        hashed_password = hash(pass_word)
        user = User(email=email, hashed_password=hashed_password)
        self.db.set(hash(user.email), user.json())
    
    def user_login(self, email: str, pass_word: str) -> str:
        hashed_email = hash(email)
        if not self.db.exists(hashed_email):
            logger.debug(f"User {email} not found")
            raise KeyError(f"User {email} not found")
        
        user_data = self.db.get(hashed_email)
        user = User.parse_raw(user_data)
        if user.hashed_password == hash(pass_word):
            session = LoginSession(user_id=user.user_id, expiry=3600)
            self.db.set(session.session_token, session.json())
            return session.session_token
        else:
            raise ValueError("Invalid password")
    
    def user_logout(self, session_token: str) -> None:
        self.db.delete(session_token)


