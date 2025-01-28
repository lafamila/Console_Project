from flask import Blueprint, render_template

bp = Blueprint("main_view", __name__, url_prefix="/")

@bp.route('/')
def index_page():
    return render_template("index.html")

@bp.route('/life')
def life_page():
    return render_template("life.html")

@bp.route('/diet')
def diet_page():
    return render_template("diet.html")