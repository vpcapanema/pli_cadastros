@echo off
echo ===================================================
echo PLI Cadastros - Iniciando Monitor de Sistema
echo ===================================================

start chrome http://localhost:8887
cd %~dp0..
node tools/system-monitor.js

pause
