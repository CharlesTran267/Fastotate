from . import create_app, socketio

app = create_app()

from .routes import routes

if __name__ == "__main__":
    socketio.run(app, port=5000)
