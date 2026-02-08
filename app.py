from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv
import os
import mysql.connector

#Load .env ONCE, explicitly
load_dotenv(os.path.expanduser("~/.env"))

app = Flask(__name__)

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        database=os.getenv("DB_NAME")
    )

@app.route("/")
def home():
    return render_template("weapons.html")

# Supabase test route to verify env loading
@app.route("/supabase-test")
def supabase_test():
    return os.getenv("SUPABASE_URL", "Env not loaded")

# Check flask sanity
@app.route("/health")
def health():
    return "OK"

# Weapons table search
@app.route("/api/weapons")
def weapons_api():
    search = request.args.get("q", "")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    if search:
        cursor.execute("""
            SELECT *
            FROM weapons
            WHERE name LIKE %s
        """, (f"%{search}%",))
    else:
        cursor.execute("SELECT * FROM weapons")

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(rows)

# Flask needs to start the server.
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)