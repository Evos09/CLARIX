@echo off
title CLARIX
cd /d "%~dp0"
echo ===========================================
echo    Starting CLARIX
echo    - This builds the latest version, then
echo      launches it at http://localhost:3000
echo    - KEEP THIS WINDOW OPEN while using it
echo    - CLOSE this window (or press Ctrl+C) to stop
echo ===========================================
echo.
echo Building... (this takes about 30 seconds)
call npm run build
if errorlevel 1 (
  echo.
  echo BUILD FAILED - see the messages above.
  pause
  exit /b 1
)
echo.
echo Opening your browser...
start "" http://localhost:3000
echo.
echo CLARIX is running. Leave this window open.
call npm start
pause
