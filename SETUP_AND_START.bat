@echo off
color 0A
cls

echo.
echo ================================================
echo   LICENSE PLATE RECOGNITION - AUTO SETUP
echo ================================================
echo.
echo   This will install and start everything.
echo   Please wait 10-15 minutes...
echo.
echo ================================================
echo.
pause

:: Step 1: Check Requirements
echo.
echo [1/7] Checking requirements...
echo.

py --version >nul 2>&1
if errorlevel 1 (
    python --version >nul 2>&1
    if errorlevel 1 (
        color 0C
        echo ERROR: Python not found!
        echo.
        echo Install Python: https://www.python.org/downloads/
        pause
        exit /b 1
    )
    set PYTHON_CMD=python
) else (
    set PYTHON_CMD=py
)
echo   [OK] Python found

node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ERROR: Node.js not found!
    echo.
    echo Install Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo   [OK] Node.js found

:: Add MongoDB to PATH
if exist "C:\Program Files\MongoDB\Server\7.0\bin" (
    set "PATH=%PATH%;C:\Program Files\MongoDB\Server\7.0\bin"
)
if exist "C:\Program Files\MongoDB\Server\6.0\bin" (
    set "PATH=%PATH%;C:\Program Files\MongoDB\Server\6.0\bin"
)
if exist "C:\Program Files\MongoDB\Server\5.0\bin" (
    set "PATH=%PATH%;C:\Program Files\MongoDB\Server\5.0\bin"
)

:: Add Tesseract to PATH
if exist "C:\Program Files\Tesseract-OCR" (
    set "PATH=%PATH%;C:\Program Files\Tesseract-OCR"
)
if exist "C:\Program Files (x86)\Tesseract-OCR" (
    set "PATH=%PATH%;C:\Program Files (x86)\Tesseract-OCR"
)

echo.
echo   Requirements OK!
timeout /t 2 >nul

:: Step 2: Start MongoDB
echo.
echo [2/7] Starting MongoDB...
echo.

net start MongoDB >nul 2>&1
if errorlevel 1 (
    echo   [WARN] MongoDB service not started
    echo   MongoDB may already be running
) else (
    echo   [OK] MongoDB started
)

timeout /t 2 >nul

:: Step 3: Backend Setup
echo.
echo [3/7] Setting up backend... (5-10 minutes)
echo.

cd backend

:: Remove old venv
if exist venv (
    echo   Cleaning old venv...
    rmdir /s /q venv
)

:: Create venv
echo   Creating virtual environment...
%PYTHON_CMD% -m venv venv
if errorlevel 1 (
    color 0C
    echo.
    echo ERROR: Cannot create virtual environment!
    pause
    exit /b 1
)

:: Update pip
echo   Updating pip...
venv\Scripts\python.exe -m pip install --upgrade pip --quiet

:: Install packages
echo   Installing backend packages... PLEASE WAIT!
venv\Scripts\python.exe -m pip install -r requirements.txt --quiet
if errorlevel 1 (
    color 0C
    echo.
    echo ERROR: Backend packages installation failed!
    echo.
    echo Check your internet connection.
    pause
    exit /b 1
)

echo   [OK] Backend setup complete

:: Create .env
if not exist .env (
    echo   Creating .env...
    echo MONGO_URL=mongodb://localhost:27017 > .env
    echo DB_NAME=plaka_tanima_db >> .env
    echo CORS_ORIGINS=http://localhost:3000 >> .env
)

cd ..
timeout /t 2 >nul

:: Step 4: Frontend Setup
echo.
echo [4/7] Setting up frontend... (5-10 minutes)
echo.

cd frontend

:: Remove old node_modules
if exist node_modules (
    echo   Cleaning old node_modules...
    rmdir /s /q node_modules
)

:: Clean cache
echo   Cleaning npm cache...
call npm cache clean --force >nul 2>&1

:: Install packages
echo   Installing frontend packages... PLEASE WAIT!
call npm install --legacy-peer-deps --silent
if errorlevel 1 (
    color 0C
    echo.
    echo ERROR: Frontend packages installation failed!
    echo.
    echo Check your internet connection.
    pause
    exit /b 1
)

:: Install ajv separately (fixes missing module error)
echo   Installing ajv package...
call npm install ajv@8 --legacy-peer-deps --silent

echo   [OK] Frontend setup complete

:: Create .env
if not exist .env (
    echo   Creating .env...
    echo REACT_APP_BACKEND_URL=http://localhost:8001 > .env
)

cd ..
timeout /t 2 >nul

:: Step 5: Create Start Scripts
echo.
echo [5/7] Creating start scripts...
echo.

:: Backend start script
echo @echo off > START_BACKEND.bat
echo cd backend >> START_BACKEND.bat
echo venv\Scripts\python.exe server.py >> START_BACKEND.bat
echo pause >> START_BACKEND.bat

:: Frontend start script
echo @echo off > START_FRONTEND.bat
echo cd frontend >> START_FRONTEND.bat
echo npm start >> START_FRONTEND.bat
echo pause >> START_FRONTEND.bat

echo   [OK] Scripts created

timeout /t 2 >nul

:: Step 6: Start Backend
echo.
echo [6/7] Starting backend...
echo.

cd backend
start "LICENSE PLATE SYSTEM - BACKEND" cmd /k "call venv\Scripts\activate && uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
cd ..

echo   [OK] Backend terminal opened
echo   Waiting for backend...

timeout /t 8 >nul

:: Step 7: Start Frontend
echo.
echo [7/7] Starting frontend...
echo.

cd frontend
start "LICENSE PLATE SYSTEM - FRONTEND" cmd /k "npm start"
cd ..

echo   [OK] Frontend terminal opened

timeout /t 3 >nul

:: Success
cls
color 0A
echo.
echo ================================================
echo   SETUP AND START COMPLETE!
echo ================================================
echo.
echo   2 terminal windows opened:
echo   1. Backend  (port 8001)
echo   2. Frontend (port 3000)
echo.
echo   Browser will open in 30 seconds:
echo   http://localhost:3000
echo.
echo   IMPORTANT: Do NOT close terminal windows!
echo.
echo ================================================
echo.
echo   To start system later:
echo   - START_BACKEND.bat
echo   - START_FRONTEND.bat
echo.
echo ================================================
echo.

:: Open browser
timeout /t 10 >nul
start http://localhost:3000

echo   System is running!
echo.
pause
