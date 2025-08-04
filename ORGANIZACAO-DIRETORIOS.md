# 📁 Organização de Diretórios - SIGMA-PLI

## 🎯 Estrutura Reorganizada

A estrutura do projeto foi reorganizada para melhor manutenibilidade e clareza:

### **📂 Diretórios Principais:**

#### **🤖 `/automation/`**
Scripts e ferramentas de automação:
- `*.bat` - Scripts batch do Windows
- `*.sh` - Scripts shell Linux/Unix  
- `*.sql` - Scripts SQL para testes e configuração
- `check-tables.js` - Verificação de tabelas

#### **📚 `/documentation/`**
Toda a documentação do projeto:
- `README.md` - Documentação principal
- `*-IMPLEMENTADO.md` - Relatórios de implementação
- `INSTRUCOES-*.md` - Guias e instruções
- `DEPLOY-*.md` - Documentação de deploy
- `RELATORIO-*.md` - Relatórios diversos

#### **🚀 `/deployment/`**
Arquivos de deploy e configuração:
- `docker-compose.yml` - Configuração Docker
- `Dockerfile` - Imagem Docker
- `ecosystem.config.js` - Configuração PM2
- `nginx-domain.conf` - Configuração Nginx
- `favicon.ico` - Ícone da aplicação

### **📂 Diretórios Existentes (mantidos):**
- `/.vscode/` - Configurações VS Code
- `/config/` - Configurações da aplicação
- `/database/` - Scripts e configurações de banco
- `/deploy/` - Scripts específicos de deploy AWS
- `/docs/` - Documentação adicional
- `/logs/` - Logs da aplicação
- `/node_modules/` - Dependências Node.js
- `/scripts/` - Scripts específicos da aplicação
- `/src/` - Código fonte principal
- `/static/` - Arquivos estáticos (CSS, JS, imagens)
- `/tools/` - Ferramentas auxiliares
- `/views/` - Templates HTML

### **📄 Arquivos Raiz (mantidos):**
- `server.js` - Servidor principal
- `package.json` - Configuração npm
- `package-lock.json` - Lock de dependências
- `.gitignore` - Arquivos ignorados pelo Git
- `.hintrc` - Configuração de hints
- `.copilotrc.json` - Configuração Copilot

## ✅ Benefícios da Reorganização:

1. **Clareza:** Separação lógica por tipo de função
2. **Manutenção:** Mais fácil localizar arquivos específicos
3. **Organização:** Redução da poluição no diretório raiz
4. **Escalabilidade:** Estrutura preparada para crescimento

## 🔧 Acesso Rápido:

```bash
# Scripts de automação
./automation/abrir-aplicacao.bat

# Documentação
cat documentation/README.md

# Deploy
docker-compose -f deployment/docker-compose.yml up
```

---
**Reorganizado em:** 3 de agosto de 2025  
**Mantém:** Funcionalidade completa da aplicação
