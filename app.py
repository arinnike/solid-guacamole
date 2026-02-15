from flask import Flask, jsonify, render_template, request, session, redirect, abort
from dotenv import load_dotenv
import os
import mysql.connector
from functools import wraps

# Load .env ONCE
load_dotenv(os.path.expanduser("~/.env"))

application = Flask(__name__)

# REQUIRED for sessions
application.secret_key = os.getenv("FLASK_SECRET", "dev-secret-change-me")

application.config["TEMPLATES_AUTO_RELOAD"] = True
application.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0

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
# Pages
# ------------------------

@application.route("/")
def home():
    return render_template(
        "index.html",
        SUPABASE_URL=os.getenv("SUPABASE_URL"),
        SUPABASE_KEY=os.getenv("SUPABASE_KEY"),
    )


@application.route("/reset-password")
def reset_password():
    return render_template(
        "reset-password.html",
        SUPABASE_URL=os.getenv("SUPABASE_URL"),
        SUPABASE_KEY=os.getenv("SUPABASE_KEY"),
    )

@application.route("/unauthorized")
def unauthorized():
    return render_template(
        "unauthorized.html",
        SUPABASE_URL=os.getenv("SUPABASE_URL"),
        SUPABASE_KEY=os.getenv("SUPABASE_KEY"),
    ), 401

# ------------------------
# PROTECTED PAGES
# ------------------------

@application.route("/settings")
@login_required
def settings():
    return render_template(
        "settings.html",
        SUPABASE_URL=os.getenv("SUPABASE_URL"),
        SUPABASE_KEY=os.getenv("SUPABASE_KEY"),
    )

@application.route("/primary_weapons")
@login_required
def weapons_page():
    return render_template(
        "primary_weapons.html",
        SUPABASE_URL=os.getenv("SUPABASE_URL"),
        SUPABASE_KEY=os.getenv("SUPABASE_KEY"),
        )

@application.route("/equipment")
@login_required
def equipment_page():
    return render_template(
        "equipment.html",
        SUPABASE_URL=os.getenv("SUPABASE_URL"),
        SUPABASE_KEY=os.getenv("SUPABASE_KEY"),
        )

# ------------------------
# Supabase → Flask Session
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
# API (already protected via pages)
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

# ------------------------
# Health
# ------------------------

@application.route("/health")
def health():
    return "OK"