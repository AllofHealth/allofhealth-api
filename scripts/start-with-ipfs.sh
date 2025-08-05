#!/bin/bash

# AllOfHealth API Startup Script with IPFS (local binary support)

set -e

echo "🚀 Starting AllOfHealth API with IPFS..."

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down IPFS daemon..."
    if [ ! -z "$IPFS_PID" ]; then
        kill $IPFS_PID 2>/dev/null || true
    fi
    exit
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Define IPFS binary path (prefer local if available)
if [ -x "./kubo/ipfs" ]; then
    IPFS_CMD="./kubo/ipfs"
elif command -v ipfs &> /dev/null; then
    IPFS_CMD=$(command -v ipfs)
else
    echo "❌ IPFS is not installed or not found in ./kubo or PATH"
    exit 1
fi

echo "📦 IPFS version: $($IPFS_CMD version --number)"

# Initialize IPFS if not already done
if [ ! -d "$HOME/.ipfs" ]; then
    echo "🔧 Initializing IPFS..."
    $IPFS_CMD init

    echo "⚙️  Configuring IPFS..."
    $IPFS_CMD config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
    $IPFS_CMD config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
    $IPFS_CMD config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization", "Content-Type"]'

    $IPFS_CMD config Addresses.API /ip4/127.0.0.1/tcp/5001
    $IPFS_CMD config Addresses.Gateway /ip4/127.0.0.1/tcp/8080
else
    echo "✅ IPFS already initialized"
fi

# Start IPFS daemon
echo "🌟 Starting IPFS daemon..."
$IPFS_CMD daemon > /tmp/ipfs.log 2>&1 &
IPFS_PID=$!

# Wait for IPFS to be ready
echo "⏳ Waiting for IPFS daemon to start..."
for i in {1..30}; do
    if curl -s -X POST http://localhost:5001/api/v0/version > /dev/null 2>&1; then
        echo "✅ IPFS daemon is ready"
        break
    fi

    if [ $i -eq 30 ]; then
        echo "❌ IPFS daemon failed to start within 30 seconds"
        echo "📝 IPFS logs:"
        cat /tmp/ipfs.log
        exit 1
    fi

    echo "⏳ Waiting for IPFS... ($i/30)"
    sleep 1
done

# Test IPFS functionality
echo "🧪 Testing IPFS functionality..."
TEST_RESPONSE=$(curl -s -X POST http://localhost:5001/api/v0/version)
if [ $? -eq 0 ]; then
    echo "✅ IPFS API is responding: $TEST_RESPONSE"
else
    echo "❌ IPFS API test failed"
    exit 1
fi

# Set environment variables for the Node.js application
export IPFS_HOST=127.0.0.1
export IPFS_PORT=5001
export IPFS_PROTOCOL=http
export IPFS_API_KEY=
export IPFS_API_SECRET=

echo "🚀 Starting Node.js application with PM2..."
pm2 start dist/main.js --name allofhealth-api

# Start the Node.js application
echo "🚀 Starting Node.js application..."
echo "✅ AllOfHealth API started successfully!"
echo "📊 IPFS WebUI: http://localhost:5001/webui"
echo "🌐 IPFS Gateway: http://localhost:8080"
echo "🔗 API Server: http://localhost:3001"

# Run PM2 in Docker-friendly foreground mode
exec pm2-runtime start allofhealth-api
