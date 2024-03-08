from flask import request, jsonify
from ..app import app
from ..utils.response import Response
from ..utils.utils import exportProjectToCOCO
import base64
from src.logger import logger


@app.route("/api/create-project", methods=["POST"])
def create_project():
    data = request.json
    session_token = data["token"]
    logger.debug(f"Creating project for user {session_token}")
    project = app.database.add_new_project(session_token=session_token)
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


@app.route("/api/signup", methods=["POST"])
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
    except ValueError:
        response = Response(data=None, status=400, message="Incorrect password")
        return jsonify(response.__dict__)

    response = Response(
        data=session_token, status=200, message="User logged in successfully"
    )
    return jsonify(response.__dict__)


@app.route("/api/logout", methods=["POST"])
def logout():
    data = request.json
    session_token = data["token"]

    app.database.user_logout(session_token)

    response = Response(data=None, status=200, message="User logged out successfully")
    return jsonify(response.__dict__)


@app.route("/api/get-projects-summary", methods=["GET"])
def get_projects():
    session_token = request.args.get("session_token")
    projects = app.database.get_projects_for_user(session_token)
    response = Response(
        data=projects, status=200, message="Projects retrieved successfully"
    )
    return jsonify(response.__dict__)


@app.route("/api/delete-project", methods=["POST"])
def delete_project():
    data = request.json
    session_token = data["token"]
    project_id = data["project_id"]
    app.database.delete_project(project_id, session_token)
    response = Response(data=None, status=200, message="Project deleted successfully")
    return jsonify(response.__dict__)


@app.route("/api/change-project-name", methods=["POST"])
def change_project_name():
    data = request.json
    session_token = data["token"]
    project_id = data["project_id"]
    new_name = data["name"]
    app.database.change_project_name(project_id, new_name)
    response = Response(
        data=None, status=200, message="Project name changed successfully"
    )
    return jsonify(response.__dict__)


@app.route("/api/save-project", methods=["POST"])
def save_project():
    data = request.json
    user_email = data["email"]
    project_id = data["project_id"]
    app.database.save_project_to_db(user_email, project_id)
    response = Response(data=None, status=200, message="Project saved successfully")
    return jsonify(response.__dict__)
