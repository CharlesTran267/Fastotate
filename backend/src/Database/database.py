import redis
from typing import List
from .models import (
    Project,
    ImageAnnotation,
    Annotation,
    Image,
    User,
    LoginSession,
    VerificationCode,
    VideoAnnotation,
    VideoFrame,
)
from ..logger import logger
import torch
import io
import PIL.Image
from ..utils.utils import hashString
from pymongo import MongoClient
import json


class Database:
    def __init__(
        self,
        redis_url: str = "",
        redis_host: str = "localhost",
        redis_port: int = 6379,
        mongo_url: str = "",
        mongo_host: str = "localhost",
        mongo_port: int = 27017,
    ):
        if not redis_url:
            redis_url = f"redis://@{redis_host}:{redis_port}"
        self.cache = redis.from_url(redis_url)
        if not mongo_url:
            mongo_url = f"mongodb://{mongo_host}:{mongo_port}/"
        self.mongo = MongoClient(mongo_url)["fastotate_db"]

    def read_from_mongo(self, collection: str, query: dict):
        data = self.mongo[collection].find_one(query)
        if data is not None:
            data.pop("_id", None)
        return data

    def read_from_cache(self, cache_key: str):
        data = self.cache.get(cache_key)
        return data

    def read_db(self, collection: str, cache_key: str, query: dict = None):
        data = self.read_from_cache(cache_key)
        if data is None:
            logger.debug(f"{cache_key} not found in cache")
            if query is None:
                logger.info(f"{cache_key} not found in cache and no query provided")
                return None
            data = self.read_from_mongo(collection, query)
            logger.debug("Read successfully from mongo")
            if data is None:
                logger.info(f"{cache_key} not found in mongo")
            else:
                data.pop("_id", None)
                self.write_to_cache(cache_key, json.dumps(data))
        return data

    def write_to_mongo(self, collection: str, data: dict, query: dict = None):
        if query:
            self.mongo[collection].update_one(query, {"$set": data}, upsert=True)
        else:
            self.mongo[collection].insert_one(data)
        logger.debug(f"Writing successfully to mongo {collection}")

    def write_to_cache(self, cache_key: str, data: str):
        self.cache.set(cache_key, data)

    def write_db(
        self, collection: str, data: dict, cache_key: str = None, query: dict = None
    ):
        if cache_key and self.cache.exists(cache_key):
            self.cache.delete(cache_key)
            logger.info(f"Deleted {cache_key} from cache")

        self.write_to_mongo(collection, data, query)

    def delete_from_mongo(self, collection: str, query: dict):
        self.mongo[collection].delete_one(query)

    def delete_from_cache(self, cache_key: str):
        self.cache.delete(cache_key)

    def delete_db(self, collection: str, cache_key: str, query: dict = None):
        if self.cache.exists(cache_key):
            self.cache.delete(cache_key)
            logger.info(f"Deleted {cache_key} from cache")
        if query:
            self.mongo[collection].delete_one(query)
        else:
            logger.info("Query not provided")

    def get_project(self, projectId: str, from_mongo: bool = False) -> Project:
        if from_mongo:
            project_data = self.read_from_mongo("projects", {"project_id": projectId})
        else:
            project_data = self.read_db(
                "projects", projectId, query={"project_id": projectId}
            )
        if project_data is None:
            raise KeyError(f"Project {projectId} not found")

        if isinstance(project_data, (str, bytes)):
            project = Project.parse_raw(project_data)
        elif isinstance(project_data, dict):
            project = Project.parse_obj(project_data)
        return project

    def store_project(self, project: Project, cache_only: bool = True) -> None:
        if not cache_only:
            self.write_db(
                "projects",
                project.dict(),
                project.project_id,
                query={"project_id": project.project_id},
            )
        else:
            self.write_to_cache(project.project_id, project.json())

    def delete_project(self, projectId: str, session_token: str) -> None:
        user = self.get_user(session_token)
        if user is None:
            logger.debug("No user found")
            return
        if projectId in user.projects:
            user.projects.remove(projectId)
            self.store_user(user)
            self.delete_db("projects", projectId, query={"project_id": projectId})
        else:
            logger.warning(f"Project {projectId} not in user projects list")

    def get_image_annotation(
        self, projectId: str, imageId: str, video_id: str = None
    ) -> ImageAnnotation:
        project = self.get_project(projectId)
        return project.getImageAnnotation(imageId, video_id)

    def add_new_project(self, session_token: str = None) -> Project:
        project = Project()
        if session_token is not None:
            self.add_project_to_user(session_token, project.project_id)
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
        return newImageAnnotation

    def add_new_annotation(
        self,
        projectId: str,
        imageId: str,
        points: List[List[int]],
        className: str,
        videoId: str = None,
    ) -> Annotation:
        project = self.get_project(projectId)
        image = project.getImageAnnotation(imageId, videoId)
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
        videoId: str = None,
    ) -> None:
        project = self.get_project(projectId)
        image = project.getImageAnnotation(imageId, videoId)
        annotation = image.getAnnotation(annotationId)
        annotation.modify_annotation(points, class_name)
        self.store_project(project)

    def delete_image(self, projectId: str, imageId: str) -> None:
        project = self.get_project(projectId)
        project.removeImageAnnotation(imageId)
        self.delete_db("images", imageId, query={"image_id": imageId})
        self.store_project(project)

    def delete_annotation(
        self, projectId: str, imageId: str, annotationId: str, videoId: str = None
    ) -> None:
        project = self.get_project(projectId)
        image = project.getImageAnnotation(imageId, videoId)
        image.removeAnnotation(annotationId)
        self.store_project(project)

    def add_class(self, projectId: str, className: str) -> None:
        project = self.get_project(projectId)
        project.addClass(className)
        self.store_project(project)

    def set_classes(self, projectId: str, classes: List[str], default_class: str):
        project = self.get_project(projectId)
        project.set_classes(classes, default_class)
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

    def store_image(self, image: Image, cache_only: bool = True) -> None:
        if not cache_only:
            self.write_db(
                "images",
                image.dict(),
                image.image_id,
                query={"image_id": image.image_id},
            )
        else:
            self.write_to_cache(image.image_id, image.json())

    def get_image(self, imageID: str) -> Image:
        image_data = self.read_db("images", imageID, query={"image_id": imageID})
        if image_data is None:
            raise KeyError(f"Image {imageID} not found")

        if isinstance(image_data, (str, bytes)):
            image = Image.parse_raw(image_data)
        elif isinstance(image_data, dict):
            image = Image.parse_obj(image_data)
        return image

    def store_user(self, user: User, cache_only: bool = False) -> None:
        if not cache_only:
            self.write_db(
                "users", user.dict(), user.user_id, query={"user_id": user.user_id}
            )
        else:
            self.write_to_cache(user.user_id, user.json())

    def add_new_user(self, email: str, pass_word: str) -> None:
        user_id = hashString(email)
        if self.read_db("users", user_id, query={"user_id": user_id}):
            logger.debug(f"User {email} already exists")
            raise KeyError(f"User {email} already exists")

        user = User(email=email, hashed_password=hashString(pass_word))
        logger.debug(f"Adding user {user.user_id}")
        self.store_user(user, cache_only=False)

    def user_login(self, email: str, pass_word: str) -> str:
        user_id = hashString(email)
        user_data = self.read_db("users", user_id, query={"user_id": user_id})

        if user_data is None:
            raise KeyError(f"User {email} not found")

        if isinstance(user_data, (str, bytes)):
            user = User.parse_raw(user_data)
        elif isinstance(user_data, dict):
            user = User.parse_obj(user_data)
        else:
            raise Exception("user_data is not a string or a dict!")

        if user.hashed_password == hashString(pass_word):
            if user.activated is False:
                raise KeyError("User not activated!")
            session = LoginSession(user_id=user.user_id, expiry=3600)
            self.write_to_cache(session.session_token, session.json())
            return session.session_token
        else:
            raise ValueError("Invalid password!")

    def user_logout(self, session_token: str) -> None:
        self.delete_db("sessions", session_token)

    def get_user(self, session_token: str) -> User:
        if session_token is None:
            logger.debug("No session token provided!")
            return None

        try:
            session_data = self.read_from_cache(session_token)
        except:
            logger.debug(f"Session {session_token} not found")
            return None

        session = LoginSession.parse_raw(session_data)
        try:
            user_data = self.read_db(
                "users", session.user_id, query={"user_id": session.user_id}
            )
        except:
            logger.debug(f"User {session.user_id} not found")
            return None

        if isinstance(user_data, (str, bytes)):
            user = User.parse_raw(user_data)
        elif isinstance(user_data, dict):
            user = User.parse_obj(user_data)
        else:
            raise Exception("user_data is not a string or a dict")
        return user

    def add_project_to_user(
        self, session_token: str, project_id: str, cache_only: bool = True
    ) -> None:
        user = self.get_user(session_token)
        if user is None:
            logger.debug("No user found")
            return
        user.addProject(project_id)
        if not cache_only:
            self.store_user(user, cache_only=False)
        else:
            self.store_user(user, cache_only=True)

    def get_projects_for_user(self, session_token: str) -> List[Project]:
        user = self.get_user(session_token)
        if user is None:
            logger.debug("No user found")
            return []
        projects_sum = []
        for project_id in user.projects:
            try:
                project = self.get_project(project_id)
                projects_sum.append(project.getProjectSummary())
            except KeyError:
                logger.warning(f"Project {project_id} not found")
        return projects_sum

    def get_user_from_mongo(self, email: str) -> User:
        user_id = hashString(email)
        user_data = self.read_from_mongo("users", {"user_id": user_id})
        user = User.parse_obj(user_data)
        return user

    def save_project_to_db(self, user_email: str, project_id: str) -> None:
        user = self.get_user_from_mongo(user_email)
        if user is None:
            logger.debug("No user found")
            return

        if project_id not in user.projects:
            logger.debug(
                f"Project {project_id} not in user projects list. Adding project to user projects list"
            )
            user.addProject(project_id)
            self.store_user(user, cache_only=False)

        project = self.get_project(project_id)
        self.store_project(project, cache_only=False)
        for imageAnn in project.imageAnnotations:
            image = self.get_image(imageAnn.image_id)
            self.store_image(image, cache_only=False)

    def add_activation_code(self, user_email) -> None:
        user = self.get_user_from_mongo(user_email)
        if user is None:
            raise KeyError(f"User {user_email} not found")
        if user.activated:
            raise KeyError("User already activated")

        code = VerificationCode(user_id=user.user_id)
        self.write_to_cache(code.code, code.json())
        return code.code

    def verify_code(self, user: User, verification_code: str) -> None:
        code = self.read_from_cache(verification_code)
        if code is None:
            raise ValueError("Invalid verification code")
        code = VerificationCode.parse_raw(code)
        if code.user_id != user.user_id:
            raise ValueError("Invalid verification code")

        if code.isExpired():
            raise ValueError("Cerification code expired")

    def activate_user(self, user_email: str, verification_code: str) -> None:
        user = self.get_user_from_mongo(user_email)
        if user is None:
            raise ValueError(f"User {user_email} not found")
        if user.activated:
            raise ValueError("User already activated")

        self.verify_code(user, verification_code)
        user = self.get_user_from_mongo(user_email)
        user.activateAccount()
        self.store_user(user, cache_only=False)
        self.delete_from_cache(verification_code)

    def add_password_reset_code(self, user_email) -> int:
        user = self.get_user_from_mongo(user_email)
        if user is None:
            raise KeyError(f"User {user_email} not found")

        code = VerificationCode(user_id=user.user_id)
        self.write_to_cache(code.code, code.json())
        return code.code

    def reset_password(
        self, user_email: str, verification_code: str, new_password: str
    ) -> None:
        user = self.get_user_from_mongo(user_email)
        if user is None:
            raise ValueError(f"User {user_email} not found")
        if not user.activated:
            raise ValueError("User not activated")

        self.verify_code(user, verification_code)
        user.hashed_password = hashString(new_password)
        self.store_user(user, cache_only=False)
        self.delete_from_cache(verification_code)

    def add_new_video(
        self, images: List[bytes], file_name: str, fps: int, project_id: str
    ) -> None:
        videoAnnotation = VideoAnnotation(file_name=file_name, fps=fps)
        for idx, image in enumerate(images):
            imageObj = PIL.Image.open(io.BytesIO(image))
            width, height = imageObj.size
            newFrame = VideoFrame(
                frame_number=idx,
                width=width,
                height=height,
                file_name=f"{file_name}_{idx}",
            )
            videoAnnotation.addFrames(newFrame)
            newImage = Image(image_bytes=image, image_id=newFrame.image_id)
            self.store_image(newImage)

        project = self.get_project(project_id)
        project.addVideoAnnotation(videoAnnotation)
        self.store_project(project)
        return videoAnnotation

    def delete_video(self, project_id: str, video_id: str) -> None:
        project = self.get_project(project_id)
        video = project.getVideoAnnotation(video_id)

        if video is None:
            logger.warning(f"Video {video_id} not found")
            return
        for frame in video.videoFrames:
            self.delete_db("images", frame.image_id, query={"image_id": frame.image_id})

        project.removeVideoAnnotation(video_id)
        self.store_project(project)
