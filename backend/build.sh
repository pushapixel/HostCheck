#!/bin/bash
set -e
echo "Building frontend..."
cd "$(dirname "$0")/../frontend"
npm install
npm run build
echo "Frontend built successfully"