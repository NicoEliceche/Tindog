@echo off
set PORT=3000

echo ==========================================
echo    Tindog Dev Server Manager (v3.2)
echo ==========================================

echo [1/3] Liberando puerto %PORT% si esta en uso...
powershell -NoProfile -Command "$p = Get-NetTCPConnection -LocalPort %PORT% -ErrorAction SilentlyContinue; if($p) { Stop-Process -Id $p.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo [2/3] Levantando servidor Next.js...
:: Abrimos la ventana de logs y ponemos la URL sola para que sea mas facil de detectar
start "Tindog_Server_Logs" cmd /k "echo. & echo http://localhost:3000 & echo ------------------------------------------ & echo. & call npm run dev"

echo [3/3] Abriendo navegador...
:: Esperamos 2 segundos para que Next empiece a levantar y abrimos la URL
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ------------------------------------------
echo    PROCESO COMPLETADO
echo    El navegador se deberia haber abierto.
echo ------------------------------------------
echo.
pause
