from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
from routes.properties import properties_bp
from routes.users import users_bp
from routes.auth import auth_bp
from routes.ml import ml_bp
import os

def create_app():
    app = Flask(__name__,
        static_folder=os.path.join(os.path.dirname(__file__), 'static'),
        static_url_path='/static'
    )
    app.config.from_object(Config)
    db.init_app(app)

    CORS(app,
        origins='*',
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allow_headers='*',
        supports_credentials=False
    )

    app.register_blueprint(properties_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(ml_bp)

    @app.errorhandler(413)
    def too_large(e):
        return jsonify({'error': 'File too large'}), 413

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': str(e)}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000, host='0.0.0.0')