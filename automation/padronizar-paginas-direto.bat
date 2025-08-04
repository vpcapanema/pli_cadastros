@echo off
echo Iniciando processo de padronização direta de páginas HTML...
echo Esta abordagem substitui apenas o cabeçalho e rodapé, mantendo o conteúdo principal das páginas.
powershell -ExecutionPolicy Bypass -File "%~dp0padronizar-paginas-direto.ps1"
echo.
echo Processo finalizado! Pressione qualquer tecla para sair...
pause > nul
