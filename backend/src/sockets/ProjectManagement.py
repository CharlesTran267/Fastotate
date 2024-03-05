from flask import Flask, request, jsonify, current_app as app
import numpy as np
import base64
import json
from flask_socketio import Namespace, emit
from ..utils.response import Response
from ..logger import logger
from src.utils.utils import findVerticesFromMasks


class ProjectManagement(Namespace):
    def on_connect(self):
        respose = Response(data=None, status=200, message="connected")
        emit("connected", respose.__dict__, to=request.sid)

    def on_disconnect(self):
        response = Response(data=None, status=200, message="disconnected")
        emit("disconnected", response.__dict__, to=request.sid)

    def on_add_annotation(self, data):
        project_id = data["project_id"]
        image_id = data["image_id"]
        points = json.loads(data["points"])
        class_name = data["class_name"]
        annotation = app.database.add_new_annotation(
            project_id, image_id, points, class_name
        )
        project = app.database.get_project(project_id)
        response = Response(
            data=project.dict(), status=200, message="Annotation added successfully"
        )
        emit("add_annotation", response.__dict__, to=request.sid)

    def on_add_annotations(self, data):
        project_id = data["project_id"]
        image_id = data["image_id"]
        annotations = json.loads(data["annotations"])
        for annotation in annotations:
            points = annotation["points"]
            class_name = annotation["className"]
            logger.debug(f"Adding annotation {annotation}")
            app.database.add_new_annotation(project_id, image_id, points, class_name)
        project = app.database.get_project(project_id)
        response = Response(
            data=project.dict(), status=200, message="Annotations added successfully"
        )
        logger.debug("Finished adding annotations")
        emit("add_annotations", response.__dict__, to=request.sid)

    def on_modify_annotation(self, data):
        logger.debug("Modifying annotation")
        project_id = data["project_id"]
        image_id = data["image_id"]
        annotation_id = data["annotation_id"]
        points = json.loads(data["points"])
        class_name = data["class_name"]
        app.database.modify_annotation(
            project_id, image_id, annotation_id, points, class_name
        )
        project = app.database.get_project(project_id)
        response = Response(
            data=project.dict(), status=200, message="Points set successfully"
        )
        emit("modify_annotation", response.__dict__, to=request.sid)
        logger.debug(f"Finished modifying annotation")

    def on_delete_project(self, data):
        project_id = data["project_id"]
        app.database.delete_project(project_id)
        response = Response(
            data=None, status=200, message="Project deleted successfully"
        )
        emit("delete_project", response.__dict__, to=request.sid)

    def on_delete_image(self, data):
        project_id = data["project_id"]
        image_id = data["image_id"]
        app.database.delete_image(project_id, image_id)
        project = app.database.get_project(project_id)
        response = Response(
            data=project.dict(), status=200, message="Image deleted successfully"
        )
        emit("delete_image", response.__dict__, to=request.sid)

    def on_delete_annotation(self, data):
        project_id = data["project_id"]
        image_id = data["image_id"]
        annotation_id = data["annotation_id"]
        app.database.delete_annotation(project_id, image_id, annotation_id)
        project = app.database.get_project(project_id)
        response = Response(
            data=project.dict(), status=200, message="Annotation deleted successfully"
        )
        emit("delete_annotation", response.__dict__, to=request.sid)

    def on_get_project(self, data):
        project_id = data["project_id"]
        project = app.database.get_project(project_id)
        response = Response(
            data=project.dict(), status=200, message="Project retrieved successfully"
        )
        emit("get_project", response.__dict__, to=request.sid)

    def on_add_class(self, data):
        project_id = data["project_id"]
        class_name = data["class_name"]
        app.database.add_class(project_id, class_name)
        project = app.database.get_project(project_id)
        response = Response(
            data=project.dict(), status=200, message="Class added successfully"
        )
        emit("add_class", response.__dict__, to=request.sid)

    def on_change_project_name(self, data):
        project_id = data["project_id"]
        name = data["name"]
        app.database.change_project_name(project_id, name)
        project = app.database.get_project(project_id)
        response = Response(
            data=project.dict(), status=200, message="Project name changed successfully"
        )
        emit("change_project_name", response.__dict__, to=request.sid)

    def on_set_default_class(self, data):
        project_id = data["project_id"]
        class_name = data["class_name"]
        app.database.set_default_class(project_id, class_name)
        project = app.database.get_project(project_id)
        response = Response(
            data=project.dict(), status=200, message="Default class set successfully"
        )
        emit("set_default_class", response.__dict__, to=request.sid)

    def on_set_magic_image(self, data):
        logger.debug("Setting magic image")
        project_id = data["project_id"]
        image_id = data["image_id"]
        image = app.database.get_image(image_id)
        if image is None:
            response = Response(data=None, status=404, message="Image not found")
            emit("set_magic_image", response.__dict__, to=request.sid)
            return

        image_embeddings = app.predictor.set_image(
            image.image_ndarray, image.image_embeddings
        )
        if image.image_embeddings is None:
            app.database.set_image_embeddings(image_id, image_embeddings)
        response = Response(data=None, status=200, message="Image set successfully")
        emit("set_magic_image", response.__dict__, to=request.sid)

    def on_add_magic_point(self, data):
        point = data["point"]
        label = data["label"]
        app.predictor.add_point(np.array(point), label)
        mask = app.predictor.predict()
        logger.info("Finish predict mask")
        response = Response(data=mask, status=200, message="Point added successfully")
        emit("add_magic_point", response.__dict__, to=request.sid)

    def on_add_magic_box(self, data):
        box = data["box"]
        app.predictor.set_input_box(np.array(box))
        mask = app.predictor.predict()
        logger.info("Finish predict mask")
        response = Response(data=mask, status=200, message="Box added successfully")
        emit("add_magic_box", response.__dict__, to=request.sid)

    def on_set_magic_points(self, data):
        points = json.loads(data["points"])
        labels = json.loads(data["labels"])
        if len(points) == 0:
            response = Response(data=None, status=400, message="No points set")
            emit("set_magic_points", response.__dict__, to=request.sid)
            return
        app.predictor.set_points(np.array(points), np.array(labels))
        masks = app.predictor.predict()
        vertices = findVerticesFromMasks(masks)
        response = Response(
            data=json.dumps(vertices),
            status=200,
            message="Points set successfully",
        )
        logger.info("Finish predict mask")
        emit("set_magic_points", response.__dict__, to=request.sid)
