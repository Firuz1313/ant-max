#!/bin/bash

# Start backend in background
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend
cd .. && npm run dev

# Clean up background process on exit
trap "kill $BACKEND_PID" EXIT
