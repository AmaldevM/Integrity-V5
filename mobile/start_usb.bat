@echo off
echo ===================================================
echo   Tertius Mobile App - USB MODE
echo ===================================================
echo.
echo 1. Setting up USB connection...
"C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081

echo 2. Starting Expo (USB Mode)...
echo.
echo   [!] Please scan the QR code with your phone.
echo   [!] Ensure your phone is connected via USB.
echo.

set REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1
call npx expo start --clear --offline
pause
