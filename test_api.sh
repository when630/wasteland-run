#!/bin/bash
API_URL="http://localhost:8080/api"
USER="testuser_$RANDOM"
PASS="password123"

echo "1. Registering..."
curl -s -X POST "$API_URL/auth/register" -H "Content-Type: application/json" -d "{\"username\":\"$USER\",\"password\":\"$PASS\"}" > /dev/null

echo "2. Logging in..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" -H "Content-Type: application/json" -d "{\"username\":\"$USER\",\"password\":\"$PASS\"}" | grep -o '"token":"[^"]*' | cut -d '"' -f 4)

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed."
    exit 1
fi
echo " - Token: ${TOKEN:0:15}..."

echo "3. Saving Run Data..."
SAVE_PAYLOAD='{"currentHp":45,"maxHp":70,"currentLayer":2,"gold":120,"deckJson":"[]","relicsJson":"[]","runSeed":"seed_xyz123","currentScene":"MAP","currentMapNode":"f2-p1","isActive":true}'

SAVE_RES=$(curl -s -X POST "$API_URL/run" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$SAVE_PAYLOAD")
echo " - Save Response: $SAVE_RES"

echo "4. Loading Run Data..."
LOAD_RES=$(curl -s -X GET "$API_URL/run" -H "Authorization: Bearer $TOKEN")
echo " - Load Response: $LOAD_RES"

# Check if seed is returned correctly
if echo "$LOAD_RES" | grep -q '"runSeed":"seed_xyz123"'; then
    echo "✅ [SUCCESS] RunData save/load is working perfectly!"
else
    echo "❌ [FAILURE] Data mismatch or missing fields."
fi
