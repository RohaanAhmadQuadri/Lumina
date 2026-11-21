@echo off
title LUMINA - Unregister Windows Open With
cd /d "%~dp0.."

echo ===================================================
echo     LUMINA - Remove Windows "Open with" Handler
echo ===================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$appKey = 'HKCU:\Software\Classes\Applications\LUMINA.exe';" ^
    "if (Test-Path $appKey) { Remove-Item -Path $appKey -Recurse -Force; }" ^
    "$progKey = 'HKCU:\Software\Classes\LUMINA.Image';" ^
    "if (Test-Path $progKey) { Remove-Item -Path $progKey -Recurse -Force; }" ^
    "$exts = @('.jpg','.jpeg','.png','.webp','.bmp','.gif','.tiff','.tif');" ^
    "foreach ($ext in $exts) {" ^
    "    $val = \"HKCU:\Software\Classes\$ext\OpenWithProgids\";" ^
    "    if (Test-Path $val) { Remove-ItemProperty -Path $val -Name 'LUMINA.Image' -ErrorAction SilentlyContinue; }" ^
    "}" ^
    "$code = '[DllImport(\"shell32.dll\")] public static extern void SHChangeNotify(int eventId, int flags, IntPtr item1, IntPtr item2);';" ^
    "$type = Add-Type -MemberDefinition $code -Name ShellUtil -Namespace Win32 -PassThru;" ^
    "$type::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero);" ^
    "Write-Host 'Successfully unregistered LUMINA from Windows Open with!';"

echo.
echo Done!
pause
