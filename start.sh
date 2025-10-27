#!/bin/bash
set -e  # Exit immediately if a command fails

cd backend
pip install --upgrade pip
pip install -r requirements.txt

# Run FastAPI
uvicorn main:app --host 0.0.0.0 --port $PORT
