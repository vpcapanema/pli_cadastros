@echo off
REM SIGMA-PLI | Preparação para Deploy AWS (Windows)
REM ================================================

echo 🚀 Preparando aplicação para deploy na AWS...

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado! Instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar se npm está funcionando
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ NPM não encontrado!
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo ✅ NPM encontrado

REM Instalar dependências de produção
echo 📦 Instalando dependências de produção...
npm install --production

REM Criar diretório de logs se não existir
if not exist "logs" (
    mkdir logs
    echo ✅ Diretório de logs criado
)

REM Testar conexão com banco de dados
echo 🔍 Testando conexão com banco de dados...
node test_connection.js
if %errorlevel% equ 0 (
    echo ✅ Conexão com banco de dados OK
) else (
    echo ⚠️  Aviso: Problema na conexão com banco de dados
)

REM Verificar arquivo .env
if exist "config\.env" (
    echo ✅ Arquivo .env encontrado
) else (
    echo ❌ Arquivo config\.env não encontrado!
    echo Copie config\.env.example para config\.env e configure as variáveis
    pause
    exit /b 1
)

echo.
echo 🎉 Preparação concluída!
echo.
echo 📋 Próximos passos:
echo 1. Use git para fazer push para seu repositório
echo 2. Ou transfira os arquivos manualmente para EC2
echo 3. Siga as instruções nos arquivos deploy/
echo.
echo 📁 Arquivos de deploy criados em:
echo    - deploy\01-preparacao-local.md
echo    - deploy\02-criacao-ec2.md
echo    - deploy\03-configuracao-servidor.md
echo    - deploy\04-deploy-aplicacao.md
echo    - deploy\05-nginx-dominio.md
echo    - deploy\06-monitoramento-manutencao.md
echo    - deploy\RESUMO-EXECUTIVO.md

pause
