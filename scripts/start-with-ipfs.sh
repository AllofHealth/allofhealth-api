#!/bin/bash
# set -e

# echo "🚀 Starting AllOfHealth API with IPFS (always binding to 0.0.0.0)..."

# cleanup() {
#     echo "🛑 Shutting down IPFS daemon..."
#     [ -n "$IPFS_PID" ] && kill "$IPFS_PID" 2>/dev/null || true
#     exit
# }
# trap cleanup SIGTERM SIGINT

# # Prefer local binary if available
# if [ -x "./kubo/ipfs" ]; then
#     IPFS_CMD="./kubo/ipfs"
# elif command -v ipfs &>/dev/null; then
#     IPFS_CMD=$(command -v ipfs)
# else
#     echo "❌ IPFS binary not found"
#     exit 1
# fi

# echo "📦 IPFS version: $($IPFS_CMD version --number)"

# # Initialize if missing
# if [ ! -d "/root/.ipfs" ]; then
#     echo "🔧 Initializing IPFS..."
#     $IPFS_CMD init
# else
#     echo "✅ IPFS repo already exists"
# fi

# # Force correct config every time
# echo "⚙️ Configuring IPFS to bind API/Gateway to all interfaces..."
# $IPFS_CMD config Addresses.API /ip4/0.0.0.0/tcp/5001
# $IPFS_CMD config Addresses.Gateway /ip4/0.0.0.0/tcp/8080

# $IPFS_CMD config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
# $IPFS_CMD config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
# $IPFS_CMD config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization", "Content-Type"]'

# # Start IPFS daemon
# echo "🌟 Starting IPFS daemon..."
# $IPFS_CMD daemon --migrate=true > /tmp/ipfs.log 2>&1 &
# IPFS_PID=$!

# # Wait for API to come online
# echo "⏳ Waiting for IPFS API..."
# for i in {1..30}; do
#     if curl -s http://127.0.0.1:5001/api/v0/version >/dev/null; then
#         echo "✅ IPFS API ready on 0.0.0.0:5001"
#         break
#     fi
#     echo "⏳ Attempt $i/30..."
#     sleep 1
#     if [ $i -eq 30 ]; then
#         echo "❌ IPFS failed to start"
#         cat /tmp/ipfs.log
#         exit 1
#     fi
# done

# # Environment for Node app
# export IPFS_HOST=143.110.170.157
# export IPFS_PORT=5001
# export IPFS_PROTOCOL=http

cd /usr/src/app
pm2 start dist/src/main.js --name allofhealth-api
exec pm2-runtime start allofhealth-api
