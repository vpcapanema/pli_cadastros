@echo off
echo Iniciando servidor PLI Cadastros...
cd %~dp0
powershell -ExecutionPolicy Bypass -File iniciar-servidor.ps1
