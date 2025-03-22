#!/bin/bash

# Install dependencies
npm install firebase
npm install @firebase/firestore
npm install @firebase/auth

# Create necessary directories
mkdir -p src/hooks
mkdir -p src/components
mkdir -p src/utils

echo "Setup completed!"