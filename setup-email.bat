@echo off
echo ===================================================
echo Configuracao do Servico de Email - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
echo ===================================================
echo.

echo Instalando dependencias necessarias...
call npm install nodemailer dotenv

echo.
echo Testando conexao com o servidor de email...
call npm run test-email

echo.
echo Configuracao concluida!
echo.
echo Para testar novamente o servico de email, execute:
echo npm run test-email
echo.
pause