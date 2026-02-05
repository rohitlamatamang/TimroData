#!/bin/bash
# run_frontend.sh - Start frontend (simple HTTP server)

cd frontend
python -m http.server 8000
