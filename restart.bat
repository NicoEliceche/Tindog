@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
set "WEB_PORT=3000"
set "EXPO_PORT=8083"
set "LAN_IP="

for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$candidate = Get-NetIPConfiguration ^| Where-Object { $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq 'Up' } ^| ForEach-Object { $_.IPv4Address.IPAddress } ^| Where-Object { $_ -notlike '169.254.*' } ^| Select-Object -First 1; if ($candidate) { $candidate }"`) do set "LAN_IP=%%I"

echo ==========================================
echo    Tindog Dev Server Manager (Web + Expo)
echo ==========================================

echo [1/4] Cerrando sesiones previas...
taskkill /FI "WINDOWTITLE eq Tindog_Web_Logs" /F /T >nul 2>nul
taskkill /FI "WINDOWTITLE eq Tindog_Expo_Logs" /F /T >nul 2>nul

echo [2/4] Liberando puertos %WEB_PORT% y %EXPO_PORT% si estan en uso...
powershell -NoProfile -Command "$ports = @(%WEB_PORT%, %EXPO_PORT%); foreach($port in $ports) { $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue; if($connections) { $connections | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } } }"

echo [3/4] Levantando servidor Next.js...
start "Tindog_Web_Logs" /d "%ROOT%" cmd /k "echo. && echo http://localhost:%WEB_PORT% && echo ------------------------------------------ && echo. && call npm run dev"

echo [4/4] Levantando Expo Dev Client en PowerShell...
start "Tindog_Expo_Logs" powershell -NoLogo -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%ROOT%apps\mobile'; Write-Host ''; Write-Host 'Expo Dev Client logs'; Write-Host '------------------------------------------'; Write-Host 'Abri la app Tindog instalada. No uses Expo Go.' -ForegroundColor Yellow; if ('%LAN_IP%') { Write-Host 'Conexion manual: http://%LAN_IP%:%EXPO_PORT%' -ForegroundColor Cyan }; Write-Host ''; npm run start:dev-client"

echo.
echo ------------------------------------------
echo    PROCESO COMPLETADO
echo    Web:  http://localhost:%WEB_PORT%
echo    Expo Dev Client: abre Tindog instalada y revisa Tindog_Expo_Logs
if defined LAN_IP echo    Conexion manual: http://%LAN_IP%:%EXPO_PORT%
echo ------------------------------------------
echo.

timeout /t 2 /nobreak >nul
start http://localhost:%WEB_PORT%

pause
