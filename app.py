from flask import Flask
from dotenv import load_dotenv
import os

load_dotenv()   # <-- reads your .env

app = Flask(__name__)

@app.route("/")
def home():
    return os.getenv("TEST_VAR", "Env not loaded")
