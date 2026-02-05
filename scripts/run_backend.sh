#!/bin/bash
# run_backend.sh - Start Flask backend server

cd backend
source venv/bin/activate 2>/dev/null || python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py
