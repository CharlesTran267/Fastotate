from flask import request, jsonify
from ..app import app
from ..utils.response import Response


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
    image = request.files["image"].read()
    project_id = data["project_id"]
    file_name = data["file_name"]
    image = app.database.add_new_image(file_name, image, project_id)
    project = app.database.get_project(project_id)
    response = Response(
        data=project.dict(), status=200, message="Image added successfully"
    )
    return jsonify(response.__dict__)
