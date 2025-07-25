@echo off
echo ===================================================
echo Configuracao do SendGrid para Envio de Emails
echo ===================================================
echo.

echo Instalando dependencias necessarias...
call npm install nodemailer dotenv @sendgrid/mail

echo.
echo Iniciando configuracao do SendGrid...
call npm run setup-sendgrid

echo.
pause