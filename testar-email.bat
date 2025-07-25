@echo off
echo ===================================================
echo Testando o servico de email - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
echo ===================================================
echo.

echo Instalando dependencias necessarias...
call npm install nodemailer dotenv

echo.
echo Testando o envio de email...
call npm run test-email

echo.
pause