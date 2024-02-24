from .Database import Database
from flask import Flask
from flask_cors import CORS
from .predictor import PredictorWrapper


def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)
    app.database = Database()
    app.predictor = PredictorWrapper()
    return app
