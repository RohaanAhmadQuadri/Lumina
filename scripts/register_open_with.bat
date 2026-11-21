@echo off
title LUMINA - Register Windows Open With
cd /d "%~dp0.."

set "EXE_PATH=%CD%\dist\win-unpacked\LUMINA.exe"

if not exist "%EXE_PATH%" (
    echo Error: Could not find LUMINA.exe at "%EXE_PATH%".
    echo Please make sure the application has been built or packaged.
    pause
    exit /b 1
)

echo ===================================================
echo     LUMINA - Register Windows "Open with" Handler
echo ===================================================
echo.
echo Registering LUMINA executable:
echo "%EXE_PATH%"
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$exe = '%EXE_PATH%';" ^
    "$appKey = 'HKCU:\Software\Classes\Applications\LUMINA.exe';" ^
    "New-Item -Path $appKey -Force | Out-Null;" ^
    "Set-ItemProperty -Path $appKey -Name 'FriendlyAppName' -Value 'LUMINA Photo Editor';" ^
    "New-Item -Path \"$appKey\DefaultIcon\" -Force | Out-Null;" ^
    "Set-ItemProperty -Path \"$appKey\DefaultIcon\" -Name '(Default)' -Value \"`\"$exe`\",0\";" ^
    "New-Item -Path \"$appKey\shell\open\command\" -Force | Out-Null;" ^
    "Set-ItemProperty -Path \"$appKey\shell\open\command\" -Name '(Default)' -Value \"`\"$exe`\" `\"%%1`\"\";" ^
    "$typesKey = \"$appKey\SupportedTypes\";" ^
    "New-Item -Path $typesKey -Force | Out-Null;" ^
    "$exts = @('.jpg','.jpeg','.png','.webp','.bmp','.gif','.tiff','.tif');" ^
    "foreach ($ext in $exts) {" ^
    "    Set-ItemProperty -Path $typesKey -Name $ext -Value '';" ^
    "    $owpKey = \"HKCU:\Software\Classes\$ext\OpenWithProgids\";" ^
    "    New-Item -Path $owpKey -Force | Out-Null;" ^
    "    Set-ItemProperty -Path $owpKey -Name 'LUMINA.Image' -Value '';" ^
    "}" ^
    "$progKey = 'HKCU:\Software\Classes\LUMINA.Image';" ^
    "New-Item -Path $progKey -Force | Out-Null;" ^
    "Set-ItemProperty -Path $progKey -Name '(Default)' -Value 'LUMINA Supported Image';" ^
    "New-Item -Path \"$progKey\DefaultIcon\" -Force | Out-Null;" ^
    "Set-ItemProperty -Path \"$progKey\DefaultIcon\" -Name '(Default)' -Value \"`\"$exe`\",0\";" ^
    "New-Item -Path \"$progKey\shell\open\command\" -Force | Out-Null;" ^
    "Set-ItemProperty -Path \"$progKey\shell\open\command\" -Name '(Default)' -Value \"`\"$exe`\" `\"%%1`\"\";" ^
    "$code = '[DllImport(\"shell32.dll\")] public static extern void SHChangeNotify(int eventId, int flags, IntPtr item1, IntPtr item2);';" ^
    "$type = Add-Type -MemberDefinition $code -Name ShellUtil -Namespace Win32 -PassThru;" ^
    "$type::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero);" ^
    "Write-Host 'Successfully registered LUMINA in Windows Open with!';"

echo.
echo ===================================================
echo Done! LUMINA is now registered in Windows "Open with"
echo for .jpg, .jpeg, .png, .webp, .bmp, .gif, .tiff, .tif.
echo ===================================================
echo.
pause
