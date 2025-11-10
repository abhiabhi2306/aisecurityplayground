#!/bin/bash

echo "🚀 Setting up AI Security Playground..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Create environment file
echo "🔧 Setting up environment..."
if [ ! -f server/.env ]; then
    cp server/.env.example server/.env
    echo "⚠️  Please add your Azure OpenAI configuration to server/.env"
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Configure your Azure OpenAI settings in server/.env"
echo "2. Run 'npm run dev' to start the application"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Happy hacking! 🛡️"
