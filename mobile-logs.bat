@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
set "MOBILE_DIR=%ROOT%apps\mobile"

echo ==========================================
echo    Tindog Mobile Logs
echo ==========================================
echo.
echo Abriendo Metro/Expo Dev Client logs...
start "Tindog_Expo_Logs" /d "%MOBILE_DIR%" cmd /k "echo. && echo Metro + Expo Dev Client logs && echo ------------------------------------------ && echo. && call npm run start:dev-client -- --clear"

where adb >nul 2>nul
if %errorlevel%==0 (
  echo Abriendo Android logcat...
  start "Tindog_Android_Logcat" cmd /k "echo. && echo Android logcat (ReactNativeJS / Expo / AndroidRuntime) && echo ------------------------------------------ && echo. && adb logcat -v time ReactNativeJS:V Expo:V ReactNative:V ExpoModulesCore:V AndroidRuntime:E *:S"
) else (
  echo.
  echo adb no esta disponible. Solo queda abierta la consola de Metro.
)

echo.
echo Cierra estas ventanas cuando termines de copiar los errores.
echo.
pause
