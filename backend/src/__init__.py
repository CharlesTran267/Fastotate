from .Database import Database
from flask import Flask
from flask_cors import CORS
from .predictor import PredictorWrapper
from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins="*")


def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)
    app.database = Database()
    app.predictor = PredictorWrapper()

    from src.sockets import ProjectManagement

    socketio.on_namespace(ProjectManagement("/project-management"))
    socketio.init_app(app)
    return app
