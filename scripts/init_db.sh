#!/bin/bash
# init_db.sh - Initialize database (Week 3+)

cd backend
python -c "from db.database import init_database; init_database()"
echo "Database initialized successfully"
