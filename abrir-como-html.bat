@echo off
echo FORÇANDO ABERTURA DO ARQUIVO COMO HTML...
echo.

REM Fechar VS Code atual
echo Fechando VS Code...
taskkill /f /im Code.exe 2>nul

REM Aguardar um pouco
timeout /t 2 /nobreak >nul

REM Abrir VS Code com o workspace
echo Abrindo VS Code...
cd /d "D:\00_PLI-CADASTRO\pli_cadastros_hardened_final\pli_cadastros"
code . --wait

echo.
echo INSTRUÇÕES PARA FORÇAR HTML:
echo 1. Quando o VS Code abrir, pressione Ctrl+Shift+P
echo 2. Digite: Change Language Mode
echo 3. Pressione Enter
echo 4. Digite: HTML
echo 5. Pressione Enter
echo.
echo PRESSIONE QUALQUER TECLA PARA CONTINUAR...
pause >nul
