from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv
import os
import mysql.connector

#Load .env ONCE, explicitly
load_dotenv(os.path.expanduser("~/.env"))

application = Flask(__name__)

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        database=os.getenv("DB_NAME")
    )

# Index page
@application.route("/")
def home():
    return render_template("index.html",
        SUPABASE_URL=os.getenv("SUPABASE_URL"),
        SUPABASE_KEY=os.getenv("SUPABASE_SERVICE_KEY"),
    )

# Reset password
@application.route("/reset-password")
def reset_password():
    return render_template("reset-password.html")

# Primary weapons page    
@application.route("/primary_weapons")
def weapons_page():
    return render_template("primary_weapons.html")

# Supabase test route to verify env loading
@application.route("/supabase-test")
def supabase_test():
    return os.getenv("SUPABASE_URL", "Env not loaded")

# Check flask sanity
@application.route("/health")
def health():
    return "OK"

# Primary weapons table search
@application.route("/api/primary_weapons")
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