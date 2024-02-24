from . import create_app

app = create_app()

from .routes import routes

if __name__ == "__main__":
    app.run(debug=True, port=5001)
