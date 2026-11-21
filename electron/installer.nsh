!macro customInstall
  DetailPrint "Registering LUMINA in Windows Open With menu..."

  ; Register Application Handler under HKCR
  WriteRegStr HKCR "Applications\LUMINA.exe" "FriendlyAppName" "LUMINA Photo Editor"
  WriteRegStr HKCR "Applications\LUMINA.exe\DefaultIcon" "" "$INSTDIR\LUMINA.exe,0"
  WriteRegStr HKCR "Applications\LUMINA.exe\shell\open\command" "" '"$INSTDIR\LUMINA.exe" "%1"'

  WriteRegStr HKCR "Applications\LUMINA.exe\SupportedTypes" ".jpg" ""
  WriteRegStr HKCR "Applications\LUMINA.exe\SupportedTypes" ".jpeg" ""
  WriteRegStr HKCR "Applications\LUMINA.exe\SupportedTypes" ".png" ""
  WriteRegStr HKCR "Applications\LUMINA.exe\SupportedTypes" ".webp" ""
  WriteRegStr HKCR "Applications\LUMINA.exe\SupportedTypes" ".bmp" ""
  WriteRegStr HKCR "Applications\LUMINA.exe\SupportedTypes" ".gif" ""
  WriteRegStr HKCR "Applications\LUMINA.exe\SupportedTypes" ".tiff" ""
  WriteRegStr HKCR "Applications\LUMINA.exe\SupportedTypes" ".tif" ""

  ; Register Application Handler under HKCU (Per-User classes)
  WriteRegStr HKCU "Software\Classes\Applications\LUMINA.exe" "FriendlyAppName" "LUMINA Photo Editor"
  WriteRegStr HKCU "Software\Classes\Applications\LUMINA.exe\DefaultIcon" "" "$INSTDIR\LUMINA.exe,0"
  WriteRegStr HKCU "Software\Classes\Applications\LUMINA.exe\shell\open\command" "" '"$INSTDIR\LUMINA.exe" "%1"'

  WriteRegStr HKCU "Software\Classes\Applications\LUMINA.exe\SupportedTypes" ".jpg" ""
  WriteRegStr HKCU "Software\Classes\Applications\LUMINA.exe\SupportedTypes" ".jpeg" ""
  WriteRegStr HKCU "Software\Classes\Applications\LUMINA.exe\SupportedTypes" ".png" ""
  WriteRegStr HKCU "Software\Classes\Applications\LUMINA.exe\SupportedTypes" ".webp" ""
  WriteRegStr HKCU "Software\Classes\Applications\LUMINA.exe\SupportedTypes" ".bmp" ""
  WriteRegStr HKCU "Software\Classes\Applications\LUMINA.exe\SupportedTypes" ".gif" ""
  WriteRegStr HKCU "Software\Classes\Applications\LUMINA.exe\SupportedTypes" ".tiff" ""
  WriteRegStr HKCU "Software\Classes\Applications\LUMINA.exe\SupportedTypes" ".tif" ""

  ; Register OpenWithProgids for all supported formats
  WriteRegStr HKCU "Software\Classes\LUMINA.Image" "" "LUMINA Supported Image"
  WriteRegStr HKCU "Software\Classes\LUMINA.Image\DefaultIcon" "" "$INSTDIR\LUMINA.exe,0"
  WriteRegStr HKCU "Software\Classes\LUMINA.Image\shell\open\command" "" '"$INSTDIR\LUMINA.exe" "%1"'

  WriteRegStr HKCU "Software\Classes\.jpg\OpenWithProgids" "LUMINA.Image" ""
  WriteRegStr HKCU "Software\Classes\.jpeg\OpenWithProgids" "LUMINA.Image" ""
  WriteRegStr HKCU "Software\Classes\.png\OpenWithProgids" "LUMINA.Image" ""
  WriteRegStr HKCU "Software\Classes\.webp\OpenWithProgids" "LUMINA.Image" ""
  WriteRegStr HKCU "Software\Classes\.bmp\OpenWithProgids" "LUMINA.Image" ""
  WriteRegStr HKCU "Software\Classes\.gif\OpenWithProgids" "LUMINA.Image" ""
  WriteRegStr HKCU "Software\Classes\.tiff\OpenWithProgids" "LUMINA.Image" ""
  WriteRegStr HKCU "Software\Classes\.tif\OpenWithProgids" "LUMINA.Image" ""

  ; Refresh Windows Shell file associations cache immediately
  System::Call 'Shell32::SHChangeNotify(i 0x08000000, i 0, i 0, i 0)'
!macroend

!macro customUninstall
  DeleteRegKey HKCR "Applications\LUMINA.exe"
  DeleteRegKey HKCU "Software\Classes\Applications\LUMINA.exe"
  DeleteRegKey HKCU "Software\Classes\LUMINA.Image"

  DeleteRegValue HKCU "Software\Classes\.jpg\OpenWithProgids" "LUMINA.Image"
  DeleteRegValue HKCU "Software\Classes\.jpeg\OpenWithProgids" "LUMINA.Image"
  DeleteRegValue HKCU "Software\Classes\.png\OpenWithProgids" "LUMINA.Image"
  DeleteRegValue HKCU "Software\Classes\.webp\OpenWithProgids" "LUMINA.Image"
  DeleteRegValue HKCU "Software\Classes\.bmp\OpenWithProgids" "LUMINA.Image"
  DeleteRegValue HKCU "Software\Classes\.gif\OpenWithProgids" "LUMINA.Image"
  DeleteRegValue HKCU "Software\Classes\.tiff\OpenWithProgids" "LUMINA.Image"
  DeleteRegValue HKCU "Software\Classes\.tif\OpenWithProgids" "LUMINA.Image"

  System::Call 'Shell32::SHChangeNotify(i 0x08000000, i 0, i 0, i 0)'
!macroend
