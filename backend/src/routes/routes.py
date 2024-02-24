from flask import current_app as app
from dataclasses import dataclass
from flask import request, jsonify
import numpy as np


@dataclass
class Response:
    data: any
    status: int
    message: str


@app.routes("/api/semiauto-annotate/set-image", methods=["POST"])
def set_image():
    data = request.data
    project_id = data["project_id"]
    image_id = data["image_id"]
    image = app.database.get_image(project_id, image_id)
    if image is None:
        response = Response(data=None, status=404, message="Image not found")
        return jsonify(response.__dict__)

    app.predictor.set_image(np.ndarray(image.image))
    response = Response(data=None, status=200, message="Image set successfully")
    return jsonify(response.__dict__)


@app.routes("/api/semiauto-annotate/add_point", methods=["POST"])
def add_point():
    data = request.data
    point = data["point"]
    label = data["label"]
    app.predictor.add_point(np.ndarray(point), label)
    mask = app.predictor.predict()
    response = Response(data=mask, status=200, message="Point added successfully")
    return jsonify(response.__dict__)


@app.routes("/api/semiauto-annotate/add_box", methods=["POST"])
def add_box():
    data = request.data
    box = data["box"]
    app.predictor.set_input_box(np.ndarray(box))
    mask = app.predictor.predict()
    response = Response(data=mask, status=200, message="Box added successfully")
    return jsonify(response.__dict__)


@app.routes("/api/create-project", methods=["POST"])
def create_project():
    project = app.database.add_new_project()
    response = Response(
        data=project.dict(), status=200, message="Project created successfully"
    )
    return jsonify(response.__dict__)


@app.routes("/api/add-image", methods=["POST"])
def add_image():
    data = request.data
    project_id = data["project_id"]
    file_name = data["file_name"]
    image = data["image"]
    image = app.database.add_new_image(file_name, image, project_id)
    response = Response(
        data=image.dict(), status=200, message="Image added successfully"
    )
    return jsonify(response.__dict__)


@app.routes("/api/add-annotation", methods=["POST"])
def add_annotation():
    data = request.data
    project_id = data["project_id"]
    image_id = data["image_id"]
    points = data["points"]
    class_name = data["class_name"]
    annotation = app.database.add_new_annotation(
        project_id, image_id, points, class_name
    )
    response = Response(
        data=annotation.dict(), status=200, message="Annotation added successfully"
    )
    return jsonify(response.__dict__)


@app.routes("/api/set-points", methods=["POST"])
def set_points():
    data = request.data
    project_id = data["project_id"]
    image_id = data["image_id"]
    annotation_id = data["annotation_id"]
    points = data["points"]
    app.database.setPoints(project_id, image_id, annotation_id, points)
    response = Response(data=None, status=200, message="Points set successfully")
    return jsonify(response.__dict__)


@app.routes("/api/delete-project", methods=["POST"])
def delete_project():
    data = request.data
    project_id = data["project_id"]
    app.database.delete_project(project_id)
    response = Response(data=None, status=200, message="Project deleted successfully")
    return jsonify(response.__dict__)


@app.routes("/api/delete-image", methods=["POST"])
def delete_image():
    data = request.data
    project_id = data["project_id"]
    image_id = data["image_id"]
    app.database.delete_image(project_id, image_id)
    response = Response(data=None, status=200, message="Image deleted successfully")
    return jsonify(response.__dict__)


@app.routes("/api/delete-annotation", methods=["POST"])
def delete_annotation():
    data = request.data
    project_id = data["project_id"]
    image_id = data["image_id"]
    annotation_id = data["annotation_id"]
    app.database.delete_annotation(project_id, image_id, annotation_id)
    response = Response(
        data=None, status=200, message="Annotation deleted successfully"
    )
    return jsonify(response.__dict__)

@app.routes("/api/get-project", methods=["GET"])
def get_project():
    project_id = request.data["project_id"]
    project = app.database.get_project(project_id)
    response = Response(data=project.dict(), status=200, message="Project retrieved successfully")
    return jsonify(response.__dict__)


