# app.py - Flask entry point
# Week 1: Basic setup, Week 2+: Full implementation

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Week 2+: Import routes
# from api import routes_health, routes_baseline, routes_location, routes_stats

@app.route('/')
def index():
    return jsonify({
        "message": "TimroData API Server",
        "version": "1.0.0",
        "status": "running"
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
