# RESOLVER PROBLEMA DE SSH NO WINDOWS

O erro `Permission denied (publickey)` e `Identity file ..\pli-ec2-key.pem not accessible` indica que o OpenSSH não está instalado no Windows.

## SOLUÇÕES

### ⭐ SOLUÇÃO 1: Instalar OpenSSH (RECOMENDADO)

#### Opção A - PowerShell como Administrador
```powershell
# 1. Abrir PowerShell como Administrador
# 2. Executar:
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0

# 3. Verificar instalação:
ssh -V
```

#### Opção B - Via Script Automático
```powershell
# Execute como Administrador:
.\install-openssh.ps1
```

#### Opção C - Windows Settings
1. Pressione `Win + I`
2. Vá em **Aplicativos** → **Recursos opcionais**
3. Clique em **Adicionar um recurso opcional**
4. Procure por **OpenSSH Client**
5. Instale

### ⭐ SOLUÇÃO 2: Git for Windows (ALTERNATIVA)

1. Baixe em: https://git-scm.com/download/win
2. Instale com opções padrão
3. Use o **Git Bash** em vez do PowerShell:
   ```bash
   cd /c/Users/vinic/pli_cadastros/scripts
   ./configure-hostname-nginx-bash.sh
   ```

## SCRIPTS DISPONÍVEIS

| Script | Descrição | Requisito |
|--------|-----------|-----------|
| `install-openssh.ps1` | Instala OpenSSH automaticamente | PowerShell Admin |
| `test-ssh-connection.ps1` | Testa conexão SSH | OpenSSH |
| `configure-hostname-nginx.ps1` | Script principal (PowerShell) | OpenSSH |
| `configure-hostname-nginx-bash.sh` | Script alternativo (Bash) | Git Bash |

## COMO EXECUTAR

### Após instalar OpenSSH:
```powershell
cd c:\Users\vinic\pli_cadastros\scripts
.\configure-hostname-nginx.ps1
```

### Com Git Bash:
```bash
cd /c/Users/vinic/pli_cadastros/scripts
./configure-hostname-nginx-bash.sh
```

## TESTE DE CONEXÃO

Para verificar se tudo está funcionando:
```powershell
.\test-ssh-connection.ps1
```

## TROUBLESHOOTING

### Erro: "ssh não é reconhecido"
- **Causa**: OpenSSH não instalado
- **Solução**: Execute `install-openssh.ps1` como administrador

### Erro: "Permission denied (publickey)"
- **Causa**: Problema com a chave SSH ou conectividade
- **Solução**: Execute `test-ssh-connection.ps1` para diagnóstico

### Erro: "Identity file not accessible"
- **Causa**: Arquivo `pli-ec2-key.pem` não encontrado
- **Solução**: Verifique se o arquivo está na raiz do projeto

## COMANDOS ÚTEIS

```powershell
# Verificar se SSH está instalado
ssh -V

# Testar conexão manual
ssh -v -i ..\pli-ec2-key.pem ubuntu@54.237.45.153

# Verificar arquivo de chave
Test-Path ..\pli-ec2-key.pem
```

## PRÓXIMOS PASSOS

1. ✅ Instalar OpenSSH ou Git
2. ✅ Testar conexão SSH
3. ✅ Executar configuração do Nginx
4. ✅ Acessar sua aplicação em http://sigma-pli.ddns.net

---

**💡 Dica**: Se você tem Git instalado, use o Git Bash que já inclui SSH!
