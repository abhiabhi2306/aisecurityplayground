@echo off
echo 🚀 Setting up AI Security Playground...

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install

REM Install server dependencies
echo 📦 Installing server dependencies...
cd server
call npm install
cd ..

REM Install client dependencies
echo 📦 Installing client dependencies...
cd client
call npm install
cd ..

REM Create environment file
echo 🔧 Setting up environment...
if not exist server\.env (
    copy server\.env.example server\.env
    echo ⚠️  Please add your Azure OpenAI configuration to server\.env
)

echo ✅ Setup complete!
echo.
echo 🎯 Next steps:
echo 1. Configure your Azure OpenAI settings in server\.env
echo 2. Run 'npm run dev' to start the application
echo 3. Open http://localhost:3000 in your browser
echo.
echo Happy hacking! 🛡️
pause
