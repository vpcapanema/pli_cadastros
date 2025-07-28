@echo off
title SIGMA-PLI - Restart Server
echo ================================================
echo   SIGMA-PLI - Reiniciador do Servidor
echo ================================================
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python nao encontrado!
    echo Instale o Python primeiro: https://python.org
    pause
    exit /b 1
)

REM Executar o script Python
python restart_server.py

REM Manter janela aberta em caso de erro
if errorlevel 1 (
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
)
