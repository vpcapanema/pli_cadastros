@echo off
echo ========================================
echo    SIGMA-PLI - Abrindo Aplicacao
echo ========================================
echo.
echo Servidor: http://localhost:8888
echo Status: Verificando...
echo.

:: Verifica se o servidor está rodando
curl -s http://localhost:8888 >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Servidor ONLINE - Abrindo navegador...
    start http://localhost:8888
) else (
    echo ❌ Servidor OFFLINE - Iniciando aplicacao...
    cd /d "c:\Users\vinic\pli_cadastros"
    start "PLI-Server" cmd /k "npm start"
    timeout /t 5 /nobreak >nul
    start http://localhost:8888
)

echo.
echo 📋 URLs Disponiveis:
echo    • Pagina Inicial: http://localhost:8888
echo    • Login: http://localhost:8888/login.html
echo    • Admin: http://localhost:8888/admin
echo    • API Status: http://localhost:8888/api/estatisticas
echo    • Componentes: http://localhost:8888/test-footer.html
echo.
echo 📁 Estrutura Reorganizada:
echo    • Scripts: ./automation/
echo    • Documentação: ./documentation/
echo    • Deploy: ./deployment/
echo.
pause
