#!/bin/bash

# Remove Firebase Functions related files
rm -rf functions/
rm -f .firebaserc
rm -f firebase.json

# Remove old configuration files
rm -f .firebase/
rm -f .github/workflows/firebase-functions-merge.yml

# Clean npm cache
npm cache clean --force

# Remove node_modules and lock files
rm -rf node_modules/
rm -f package-lock.json
rm -f yarn.lock

echo "Cleanup completed!"