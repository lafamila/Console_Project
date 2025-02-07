from flask import Blueprint, render_template, jsonify
from .connectors.db_connector import DB
bp = Blueprint("api", __name__, url_prefix="/api")



@bp.route('/load_files', methods=['POST'])
def load_files():
    db = DB()
    curs = db.cursor()
    curs.execute("SELECT * FROM files WHERE 1=1")
    files = curs.fetchall()
    curs.close()
    db.close()
    return jsonify(files)

