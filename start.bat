@echo off
echo ===================================================
echo PLI CADASTROS - SISTEMA DE GERENCIAMENTO
echo ===================================================
echo.
echo Escolha o modo de execucao:
echo 1. Modo Normal
echo 2. Modo Debug
echo 3. Modo Desenvolvimento (com hot-reload)
echo 4. Matar processos Node.js
echo 0. Sair
echo.

set /p choice="Digite sua escolha (0-4): "

if "%choice%"=="1" (
    echo Matando processos Node.js...
    taskkill /F /IM node.exe 2>nul
    echo Iniciando em modo normal...
    node server.js
) else if "%choice%"=="2" (
    echo Matando processos Node.js...
    taskkill /F /IM node.exe 2>nul
    echo Iniciando em modo debug...
    echo.
    echo Modo DEBUG ativado!
    echo Abra Chrome e acesse: chrome://inspect
    echo Clique em 'Open dedicated DevTools for Node'
    node --inspect server.js
) else if "%choice%"=="3" (
    echo Matando processos Node.js...
    taskkill /F /IM node.exe 2>nul
    echo Iniciando em modo desenvolvimento com hot-reload...
    npx nodemon server.js
) else if "%choice%"=="4" (
    echo Matando processos Node.js...
    taskkill /F /IM node.exe 2>nul
    echo Processos Node.js encerrados.
    pause
    start start.bat
) else if "%choice%"=="0" (
    echo Saindo...
    exit
) else (
    echo Opcao invalida. Por favor, escolha 0-4.
    timeout /t 1 >nul
    start start.bat
)