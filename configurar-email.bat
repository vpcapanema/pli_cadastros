@echo off
echo ===================================================
echo Configuracao do Servico de Email - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
echo ===================================================
echo.

echo Instalando dependencias necessarias...
call npm install nodemailer dotenv

echo.
echo Iniciando configuracao do servico de email...
node configurar-email.js

echo.
pause