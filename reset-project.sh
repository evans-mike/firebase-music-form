#!/bin/bash

echo "Starting project cleanup and setup..."

# Make scripts executable
chmod +x cleanup.sh
chmod +x setup.sh

# Run cleanup
./cleanup.sh

# Run setup
./setup.sh

# Update package.json
cat > package.json << EOF
{
  "name": "firebase-music-form",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && firebase deploy --only hosting"
  },
  "dependencies": {
    "firebase": "^10.x",
    "@firebase/firestore": "^4.x",
    "@firebase/auth": "^1.x",
    "react": "^18.x",
    "react-dom": "^18.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "@vitejs/plugin-react": "^4.x",
    "vite": "^4.x"
  }
}
EOF

# Install dependencies
npm install

echo "Project reset completed!"