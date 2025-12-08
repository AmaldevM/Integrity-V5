@echo off
echo ===================================================
echo   Tertius Mobile App Launcher
echo ===================================================
echo.
echo 1. Setting IP Address to 192.168.1.17...
set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.17

echo 2. Starting Expo in OFFLINE mode (bypasses network errors)...
echo.
echo   [!] Please scan the QR code with your phone when it appears.
echo   [!] Ensure your phone is on the same WiFi (192.168.1.x)
echo.

call npx expo start --offline --clear
pause
