@echo off
setlocal

:: 1. Comprobar permisos de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Solicitando permisos de administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: 2. FORZAR la ruta de trabajo actual ANTES de hacer nada
cd /d "%~dp0"
set OPENCLAW_WORKSPACE=%CD%

:: 3. Matar absolutamente todo proceso previo de Node o Gateway para liberar el puerto 18789
echo [!] Limpiando instancias anteriores de OpenClaw...
taskkill /f /im node.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -a -n -o ^| findstr :18789') do taskkill /f /pid %%a >nul 2>&1
timeout /t 2 >nul

:: 4. Iniciar UNICO Gateway en segundo plano minimizado
echo Iniciando Gateway de OpenClaw...
start "" /min cmd.exe /d /c "C:\Users\NicoE\.openclaw\gateway.cmd"
echo Esperando 10 segundos para que el Gateway estabilice...
timeout /t 10

:: 5. Iniciar la consola de chat asegurando que el directorio sea el del proyecto
echo ==========================================
echo    OPENCLAW - TINDOG (ADMIN)
echo    Workspace: %CD%
echo    Modelo: qwen3:8b
echo ==========================================
echo.
pwsh -NoExit -Command "Set-Location '%CD%'; $env:OPENCLAW_WORKSPACE='%CD%'; ollama launch openclaw --model qwen3:8b"
