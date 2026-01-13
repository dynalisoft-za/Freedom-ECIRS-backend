#!/bin/bash

echo "========================================="
echo "  Freedom ECIRS Backend - Local Setup"
echo "========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo ""
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop and try again."
    echo "1. Open Docker Desktop application"
    echo "2. Wait for Docker to start"
    echo "3. Run this script again"
    echo ""
    exit 1
fi

echo ""
echo "✓ Docker is running"
echo ""
echo "Starting PostgreSQL database..."
docker-compose up -d postgres

echo ""
echo "Waiting for database to be ready..."
sleep 8

echo ""
echo "Checking database status..."
docker-compose ps

echo ""
echo "========================================="
echo "  Database is ready!"
echo "========================================="
echo ""
echo "Now start the API with:"
echo "  npm run dev"
echo ""
echo "Or press Enter to start it now..."
read -r

npm run dev
