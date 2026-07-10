#!/bin/bash

# Test script to verify local Claude endpoint works

echo "🧪 Testing Local Claude Integration"
echo "===================================="
echo ""

# Check if llama-server is running
echo "1️⃣  Checking if llama-server is running on port 9090..."
if curl -s http://localhost:9090/v1/models > /dev/null 2>&1; then
    echo "✅ llama-server is running"
else
    echo "❌ llama-server not found on http://localhost:9090"
    echo "   Start it with: llama-server --port 9090 --model <model_path>"
    exit 1
fi

echo ""
echo "2️⃣  Testing direct API call to local Claude..."
RESPONSE=$(curl -s -X POST http://localhost:9090/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "local",
    "messages": [{"role": "user", "content": "What are the key CU Boulder entrepreneurship programs? List 3 briefly."}],
    "max_tokens": 300,
    "temperature": 0.7
  }')

if echo "$RESPONSE" | grep -q "choices"; then
    echo "✅ Local Claude is responding"
    echo ""
    echo "Sample response:"
    echo "$RESPONSE" | grep -o '"content":"[^"]*' | head -1 | cut -d'"' -f4
else
    echo "❌ Local Claude returned an error"
    echo "$RESPONSE"
    exit 1
fi

echo ""
echo "3️⃣  Building TypeScript..."
cd "$(dirname "$0")"
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "4️⃣  Starting local Wrangler dev server..."
echo "    This will start on http://localhost:8787"
echo "    It will route to your local llama-server on port 9090"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

wrangler dev --env local
