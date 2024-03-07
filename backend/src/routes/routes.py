from flask import request, jsonify
from ..app import app
from ..utils.response import Response
from ..utils.utils import exportProjectToCOCO
import base64


@app.route("/api/create-project", methods=["POST"])
def create_project():
    project = app.database.add_new_project()
    response = Response(
        data=project.dict(), status=200, message="Project created successfully"
    )
    return jsonify(response.__dict__)


@app.route("/api/add-image", methods=["POST"])
def add_image():
    data = request.form
    image_bytes = request.files["image"].read()
    project_id = data["project_id"]
    file_name = data["file_name"]
    image = app.database.add_new_image(file_name, image_bytes, project_id)
    imageInfo = {
        "image_id": image.image_id,
    }

    project = app.database.get_project(project_id)
    response = Response(
        data={"project": project.dict(), "image": imageInfo},
        status=200,
        message="Image added successfully",
    )
    return jsonify(response.__dict__)


@app.route("/api/get-image", methods=["GET"])
def get_image():
    image_id = request.args.get("image_id")
    image = app.database.get_image(image_id)
    base64Image = base64.b64encode(image.image_bytes).decode("utf-8")
    response = Response(
        data=base64Image, status=200, message="Image retrieved successfully"
    )
    return jsonify(response.__dict__)


@app.route("/api/get-coco-format", methods=["GET"])
def get_coco_format():
    project_id = request.args.get("project_id")
    project = app.database.get_project(project_id)
    coco = exportProjectToCOCO(project)
    response = Response(data=coco, status=200, message="Project exported successfully")
    return jsonify(response.__dict__)

@app.route("/api/register", methods=["POST"])
def register():
    data = request.form
    email = data["email"]
    password = data["password"]
    try:
        app.database.add_new_user(email, password)
    except KeyError:
        response = Response(data=None, status=400, message="User already exists")
        return jsonify(response.__dict__)

    response = Response(data=None, status=200, message="User registered successfully")
    return jsonify(response.__dict__)

@app.route("/api/login", methods=["POST"])
def login():
    data = request.form
    email = data["email"]
    password = data["password"]

    try:
        session_token = app.database.user_login(email, password)
    except KeyError:
        response = Response(data=None, status=400, message="User not found")
        return jsonify(response.__dict__)

    response = Response(data=session_token, status=200, message="User logged in successfully")
    return jsonify(response.__dict__)

@app.route("/api/logout", methods=["POST"])
def logout():
    data = request.form
    session_token = data["session_token"]

    app.database.user_logout(session_token)

    response = Response(data=None, status=200, message="User logged out successfully")
    return jsonify(response.__dict__)
