# Script para forçar arquivos HTML a serem reconhecidos como HTML
# Execute este script se as configurações não funcionarem

Write-Host "FORÇANDO DETECÇÃO HTML..." -ForegroundColor Green

# Caminho para o workspace
$workspacePath = "D:\00_PLI-CADASTRO\pli_cadastros_hardened_final\pli_cadastros"

# Criar arquivo .editorconfig para forçar HTML
$editorConfig = @"
# Configuração para forçar HTML
root = true

[*.html]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.htm]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[docs/**/*.html]
charset = utf-8

[views/**/*.html]
charset = utf-8

[templates/**/*.html]
charset = utf-8
"@

$editorConfigPath = Join-Path $workspacePath ".editorconfig"
$editorConfig | Out-File -FilePath $editorConfigPath -Encoding UTF8 -Force

Write-Host "✓ Criado .editorconfig para forçar HTML" -ForegroundColor Green

# Instruções finais
Write-Host ""
Write-Host "SOLUÇÕES APLICADAS:" -ForegroundColor Cyan
Write-Host "1. Configurações agressivas em .vscode/settings.json" -ForegroundColor White
Write-Host "2. Arquivo .editorconfig criado" -ForegroundColor White
Write-Host "3. Todas as configurações AWS SSM desabilitadas" -ForegroundColor White
Write-Host ""
Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Feche TODOS os arquivos HTML abertos" -ForegroundColor Red
Write-Host "2. Execute: Ctrl+Shift+P > 'Developer: Reload Window'" -ForegroundColor Red
Write-Host "3. Abra novamente o arquivo admin-panel.html" -ForegroundColor Red
Write-Host ""
Write-Host "Se AINDA não funcionar:" -ForegroundColor Red
Write-Host "- Clique na linguagem na barra de status (SSM-YAML)" -ForegroundColor White
Write-Host "- Digite 'HTML' e pressione Enter" -ForegroundColor White
Write-Host "- Isso forçará manualmente a linguagem HTML" -ForegroundColor White
