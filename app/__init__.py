from flask import Flask
from .controllers.main_controller import bp as main_view
from .controllers.api_controller import bp as api_controller

app = Flask(__name__)
app.register_blueprint(main_view)
app.register_blueprint(api_controller)

