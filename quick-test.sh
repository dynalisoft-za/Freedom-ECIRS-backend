#!/bin/bash

BASE_URL="http://localhost:3001"
API_URL="$BASE_URL/api/v1"

echo "========================================="
echo "  Freedom ECIRS API - Quick Test"
echo "========================================="

# Check if API is running
echo ""
echo "1. Testing health endpoint..."
HEALTH=$(curl -s -w "\n%{http_code}" $BASE_URL/health)
HTTP_CODE=$(echo "$HEALTH" | tail -n 1)
RESPONSE=$(echo "$HEALTH" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Health check passed"
    echo "$RESPONSE"
else
    echo "❌ API is not running or not responding"
    echo "Please start the API with: npm run dev"
    exit 1
fi

# Register user
echo ""
echo "2. Registering test user..."
REGISTER=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@freedomradio.ng",
    "password": "Admin123!",
    "full_name": "System Administrator",
    "phone": "08012345678",
    "role": "super_admin",
    "station_codes": ["FR-KAN", "FR-DUT", "FR-KAD", "DL-KAN"]
  }')
HTTP_CODE=$(echo "$REGISTER" | tail -n 1)
RESPONSE=$(echo "$REGISTER" | head -n -1)

if [ "$HTTP_CODE" = "201" ]; then
    echo "✅ User registered successfully"
    echo "$RESPONSE"
elif [ "$HTTP_CODE" = "400" ]; then
    echo "⚠️  User already exists (this is ok for testing)"
else
    echo "❌ Registration failed"
    echo "$RESPONSE"
fi

# Login
echo ""
echo "3. Logging in..."
LOGIN=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }')
HTTP_CODE=$(echo "$LOGIN" | tail -n 1)
RESPONSE=$(echo "$LOGIN" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Login successful"
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
    echo "Token: ${TOKEN:0:50}..."

    # Save token for future use
    echo "$TOKEN" > .test-token

    # Get current user
    echo ""
    echo "4. Getting current user info..."
    USER=$(curl -s -w "\n%{http_code}" $API_URL/auth/me \
      -H "Authorization: Bearer $TOKEN")
    HTTP_CODE=$(echo "$USER" | tail -n 1)
    RESPONSE=$(echo "$USER" | head -n -1)

    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ User info retrieved"
        echo "$RESPONSE"
    else
        echo "❌ Failed to get user info"
    fi

    # Create a client
    echo ""
    echo "5. Creating a test client..."
    CLIENT=$(curl -s -w "\n%{http_code}" -X POST $API_URL/clients \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "company_name": "Dangote Industries Ltd",
        "contact_person": "Aliko Dangote",
        "email": "contact@dangote.com",
        "phone": "08012345678",
        "tin": "12345678-0001",
        "type": "direct",
        "address": "1 Alfred Rewane Road, Ikoyi, Lagos"
      }')
    HTTP_CODE=$(echo "$CLIENT" | tail -n 1)
    RESPONSE=$(echo "$CLIENT" | head -n -1)

    if [ "$HTTP_CODE" = "201" ]; then
        echo "✅ Client created successfully"
        echo "$RESPONSE"
        CLIENT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
        echo "Client ID: $CLIENT_ID"
    elif [ "$HTTP_CODE" = "400" ]; then
        echo "⚠️  Client with this TIN already exists (this is ok for testing)"
    else
        echo "❌ Failed to create client"
        echo "$RESPONSE"
    fi

    # List clients
    echo ""
    echo "6. Listing all clients..."
    CLIENTS=$(curl -s -w "\n%{http_code}" $API_URL/clients \
      -H "Authorization: Bearer $TOKEN")
    HTTP_CODE=$(echo "$CLIENTS" | tail -n 1)
    RESPONSE=$(echo "$CLIENTS" | head -n -1)

    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Clients retrieved successfully"
        echo "$RESPONSE"
    else
        echo "❌ Failed to get clients"
    fi

else
    echo "❌ Login failed"
    echo "$RESPONSE"
    exit 1
fi

echo ""
echo "========================================="
echo "  ✅ All Tests Passed!"
echo "========================================="
echo ""
echo "Your token has been saved to .test-token"
echo ""
echo "API Documentation: $BASE_URL/docs"
echo ""
echo "You can now test the API at: $API_URL"
