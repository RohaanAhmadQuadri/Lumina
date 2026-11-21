@echo off
title LUMINA - Professional Photo Editor
cd /d "%~dp0"

echo ===================================================
echo       LUMINA - Professional Photo Editor
echo ===================================================
echo.

if exist "dist\win-unpacked\LUMINA.exe" (
    echo Launching LUMINA Standalone Desktop Application...
    start "" "dist\win-unpacked\LUMINA.exe"
    exit /b 0
)

if exist "node_modules\.bin\electron.cmd" (
    echo Launching LUMINA in development mode...
    call npm run electron:start
    exit /b 0
)

echo Error: Neither packaged LUMINA.exe nor node_modules were found.
pause
exit /b 1