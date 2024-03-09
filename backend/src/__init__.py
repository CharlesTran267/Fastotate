from .Database import Database
from flask import Flask
from flask_cors import CORS
from .predictor import PredictorWrapper
from .email_service import MailService
from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins="*")


def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)
    app.database = Database()
    app.predictor = PredictorWrapper()
    # Mail settings
    app.config["MAIL_SERVER"] = "smtp.gmail.com"
    app.config["MAIL_PORT"] = 465
    app.config["MAIL_USERNAME"] = "dungtranhsgs@gmail.com"
    app.config["MAIL_PASSWORD"] = "fcuf esvb exhz poru "
    app.config["MAIL_USE_TLS"] = False
    app.config["MAIL_USE_SSL"] = True

    app.mail_service = MailService(app)

    from src.sockets import ProjectManagement

    socketio.on_namespace(ProjectManagement("/project-management"))
    socketio.init_app(app)
    return app
