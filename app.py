from flask import Flask, jsonify, render_template, request, session, redirect
from dotenv import load_dotenv
import os
import mysql.connector
from functools import wraps

# ------------------------
# Load Environment
# ------------------------

load_dotenv(os.path.expanduser("~/.env"))

application = Flask(__name__)
application.secret_key = os.getenv("FLASK_SECRET", "dev-secret-change-me")

application.config["TEMPLATES_AUTO_RELOAD"] = True
application.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0

# ------------------------
# Global Template Context
# ------------------------

@application.context_processor
def inject_supabase_config():
    return {
        "SUPABASE_URL": os.getenv("SUPABASE_URL"),
        "SUPABASE_KEY": os.getenv("SUPABASE_KEY"),
    }

# ------------------------
# Database
# ------------------------

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        database=os.getenv("DB_NAME")
    )

# ------------------------
# Auth Decorator
# ------------------------

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user" not in session:
            return redirect("/unauthorized")
        return f(*args, **kwargs)
    return decorated

@application.route("/debug-session")
def debug():
    return str(session)

# ------------------------
# Public Pages
# ------------------------

@application.route("/")
def home():
    return render_template("index.html")

@application.route("/reset-password")
def reset_password():
    return render_template("reset-password.html")

@application.route("/unauthorized")
def unauthorized():
    return render_template("unauthorized.html"), 401

@application.route("/health")
def health():
    return "OK"

# ------------------------
# Protected Pages
# ------------------------

@application.route("/settings")
@login_required
def settings():
    return render_template("settings.html")

@application.route("/primary_weapons")
@login_required
def weapons_page():
    return render_template("primary_weapons.html")

@application.route("/equipment")
@login_required
def equipment_page():
    return render_template("equipment.html")

@application.route("/dice")
@login_required
def dice_page():
    return render_template("dice.html")

@application.route("/characters")
@login_required
def characters():
    return render_template("characters.html")

# ------------------------
# Supabase → Flask Session Sync
# ------------------------

@application.route("/set-session", methods=["POST"])
def set_session():
    data = request.json

    if not data or "user" not in data:
        return "Unauthorized", 401

    session["user"] = data["user"]["id"]
    return "ok"

@application.route("/logout")
def logout():
    session.clear()
    return redirect("/")

# ------------------------
# API Routes (MySQL)
# ------------------------

@application.route("/api/primary_weapons")
@login_required
def primaryWeapons_api():
    search = request.args.get("q", "")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    if search:
        cursor.execute("""
            SELECT *
            FROM primary_weapons
            WHERE name LIKE %s
        """, (f"%{search}%",))
    else:
        cursor.execute("SELECT * FROM primary_weapons")

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(rows)

@application.route("/api/secondary_weapons")
@login_required
def secondaryWeapons_api():
    search = request.args.get("q", "")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    if search:
        cursor.execute("""
            SELECT *
            FROM secondary_weapons
            WHERE name LIKE %s
        """, (f"%{search}%",))
    else:
        cursor.execute("SELECT * FROM secondary_weapons")

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(rows)

@application.route("/api/armor")
@login_required
def armor_api():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM armor")
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(rows)

@application.route("/api/consumables")
@login_required
def consumables_api():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM consumables")
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(rows)

@application.route("/api/loot")
@login_required
def loot_api():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM loot")
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(rows)