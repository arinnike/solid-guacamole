from flask import Flask
from dotenv import load_dotenv
import os
import mysql.connector

#Load .env ONCE, explicitly
load_dotenv(os.path.expanduser("~/.env"))

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        database=os.getenv("DB_NAME")
    )

@app.route("/")
def home():
    return os.getenv("Placeholder", "Env not loaded")