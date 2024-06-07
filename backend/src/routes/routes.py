from flask import request, jsonify, send_file
from ..app import app
from ..utils.response import Response
from ..utils.utils import exportProjectToCOCO
import base64
from src.logger import logger
import os

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


@app.route("/api/add-video", methods=["POST"])
def add_video():
    data = request.form
    image_list = [image.read() for image in request.files.getlist("images")]
    project_id = data["project_id"]
    file_name = data["file_name"]
    fps = int(data["fps"])
    video = app.database.add_new_video(image_list, file_name, fps, project_id)
    videoInfo = {
        "video_id": video.video_id,
    }

    project = app.database.get_project(project_id)
    response = Response(
        data={"project": project.dict(), "video": videoInfo},
        status=200,
        message="Video added successfully",
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

@app.route("/api/get-project-export", methods=["GET"])
def get_project_export():
    project_id = request.args.get("project_id")
    zip_path = app.database.get_project_export(project_id)
    logger.debug(f"Exported project to {zip_path}")
    return send_file(zip_path, as_attachment=True)

    
@app.route("/api/signup", methods=["POST"])
def register():
    data = request.form
    email = data["email"]
    password = data["password"]
    try:
        app.database.add_new_user(email, password)
    except Exception as e:
        response = Response(data=None, status=400, message=str(e))
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
    except Exception as e:
        response = Response(data=None, status=400, message=str(e))
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


@app.route("/api/send-activation-email", methods=["POST"])
def send_activation_email():
    data = request.json
    user_email = data["email"]
    try:
        activation_code = app.database.add_activation_code(user_email)
        app.mail_service.send_activation_email(user_email, activation_code)
        response = Response(
            data=None, status=200, message="Activation email sent successfully"
        )
        return jsonify(response.__dict__)
    except Exception as e:
        response = Response(data=None, status=400, message=str(e))
        return jsonify(response.__dict__)


@app.route("/api/send-reset-password-email", methods=["POST"])
def send_reset_password_email():
    data = request.json
    user_email = data["email"]
    try:
        reset_code = app.database.add_password_reset_code(user_email)
        app.mail_service.send_reset_password_email(user_email, reset_code)
    except Exception as e:
        response = Response(data=None, status=400, message=str(e))
        return jsonify(response.__dict__)
    response = Response(
        data=None, status=200, message="Reset password email sent successfully"
    )
    return jsonify(response.__dict__)


@app.route("/api/activate-account", methods=["POST"])
def activate_account():
    data = request.json
    user_email = data["email"]
    verification_code = data["verification_code"]
    try:
        app.database.activate_user(user_email, verification_code)
        response = Response(
            data=None, status=200, message="Account activated successfully"
        )
        return jsonify(response.__dict__)
    except ValueError as e:
        response = Response(data=None, status=400, message=str(e))
        return jsonify(response.__dict__)


@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    user_email = data["email"]
    verification_code = data["verification_code"]
    new_password = data["password"]
    try:
        app.database.reset_password(user_email, verification_code, new_password)
        response = Response(
            data=None, status=200, message="Password reset successfully"
        )
        return jsonify(response.__dict__)
    except ValueError as e:
        response = Response(data=None, status=400, message=str(e))
        return jsonify(response.__dict__)


@app.route("/api/interpolate-annotations", methods=["POST"])
def interpolate_annotations():
    data = request.json
    project_id = data["project_id"]
    video_id = data["video_id"]
    app.database.interpolate_annotations(project_id, video_id)
    project = app.database.get_project(project_id)
    response = Response(
        data=project.dict(), status=200, message="Annotations interpolated successfully"
    )
    return jsonify(response.__dict__)
