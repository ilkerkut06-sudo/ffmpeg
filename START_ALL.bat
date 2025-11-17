@echo off
chcp 65001 >nul
color 0A
cls

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo ============================================================
echo   🚀 PLAKA OKUMA SİSTEMİ - TÜM SERVİSLER BAŞLATILIYOR
echo ============================================================
echo.
echo 📂 Ana dizin: %CD%
echo.

echo [1/3] MongoDB başlatılıyor...
net start MongoDB >nul 2>&1
if errorlevel 1 (
    echo   ⚠️  MongoDB zaten çalışıyor veya başlatılamadı
) else (
    echo   ✅ MongoDB başlatıldı
)
timeout /t 2 >nul
echo.

echo [2/3] Backend başlatılıyor...
if not exist "backend\START_BACKEND.bat" (
    echo   ❌ HATA: backend\START_BACKEND.bat bulunamadı!
    echo   📂 Aranan: %CD%\backend\START_BACKEND.bat
    pause
    exit /b 1
)
start "BACKEND - Plaka Tanima" cmd /k "cd /d "%CD%\backend" && START_BACKEND.bat"
echo   ✅ Backend terminal açıldı
timeout /t 5 >nul
echo.

echo [3/3] Frontend başlatılıyor...
if not exist "frontend\START_FRONTEND.bat" (
    echo   ❌ HATA: frontend\START_FRONTEND.bat bulunamadı!
    echo   📂 Aranan: %CD%\frontend\START_FRONTEND.bat
    pause
    exit /b 1
)
start "FRONTEND - Plaka Tanima" cmd /k "cd /d "%CD%\frontend" && START_FRONTEND.bat"
echo   ✅ Frontend terminal açıldı
echo.

echo ⏳ Servislerin başlaması bekleniyor (10 saniye)...
timeout /t 10 >nul

echo.
echo 🌐 Tarayıcı açılıyor: http://localhost:3000
start http://localhost:3000

echo.
echo ============================================================
echo   ✅ SISTEM BAŞLATILDI!
echo ============================================================
echo.
echo 📋 2 terminal penceresi açıldı:
echo    1. BACKEND  - Backend loglarını buradan izleyin
echo    2. FRONTEND - Frontend loglarını buradan izleyin
echo.
echo 🌐 Uygulama: http://localhost:3000
echo.
echo ⚠️  Sorun yaşıyorsanız:
echo    • Backend terminalinde hata mesajlarını kontrol edin
echo    • MongoDB'nin çalıştığından emin olun
echo    • NASIL_KULLANILIR.txt dosyasına bakın
echo.
echo ============================================================
pause
