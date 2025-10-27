#!/bin/bash
# Change directory to backend and start FastAPI
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
