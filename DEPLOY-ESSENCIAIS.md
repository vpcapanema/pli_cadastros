# 🚀 LISTA RESUMIDA - ARQUIVOS ESSENCIAIS PARA DEPLOY

## ⚡ **ARQUIVOS CRÍTICOS (NÃO PODEM FALTAR)**

### **1. Configuração Principal:**
```
server.js                    # Servidor Express principal
package.json                 # Dependências e scripts NPM
.env                        # Variáveis de ambiente (CRÍTICO)
ecosystem.config.js         # Configuração PM2
```

### **2. Backend Completo (/src/):**
```
src/config/                 # Configurações (auth, database, cors)
src/controllers/            # Controladores (auth, PF, PJ, usuários)
src/middleware/             # Middlewares (auth, sessions)
src/models/                 # Models do banco
src/routes/                 # Todas as rotas da API
src/services/               # Serviços (auth, email, sessions)
src/utils/                  # Utilitários (logger, formatação)
src/jobs/                   # Jobs de sessão
```

### **3. Frontend Completo (/views/):**
```
views/*.html               # Todas as páginas (20 arquivos)
views/components/          # Componentes reutilizáveis
```

### **4. Assets Frontend (/static/):**
```
static/css/                # Estilos (9 arquivos CSS)
static/js/                 # JavaScript (38 arquivos JS)
├── components/            # Componentes JS
├── services/              # Serviços frontend
├── pages/                 # Scripts por página
└── config/                # Configurações JS
```

### **5. Banco de Dados (/database/):**
```
database/*.sql             # Scripts SQL
database/*.md              # Documentação estrutura
```

---

## 📋 **ARQUIVOS RECOMENDADOS**

### **Documentação:**
```
README.md                  # Documentação principal
docs/                      # Documentação completa (18 arquivos)
PLI-SYSTEMS-INFO.md        # Info sistemas PLI
```

### **Ferramentas de Deploy:**
```
deploy/                    # Guias de deploy (7 arquivos)
scripts/deploy-aws.sh      # Script deploy AWS
Dockerfile                 # Container Docker
docker-compose.yml         # Orquestração Docker
```

---

## 💎 **PRODUTOS DE VALOR (SISTEMAS PLI)**

### **Sistemas Desenvolvidos:**
```
PLI-Complete-Systems-v1.0.0.zip    # Sistema completo (206 KB)
PLI-Feedback-System-Package.zip    # Sistema feedback (58 KB)
PLI-Login-System-Package.zip       # Sistema login (148 KB)
```

---

## 📊 **CONTAGEM RÁPIDA**

| Categoria | Quantidade | Status |
|-----------|------------|--------|
| **Arquivos Core** | 4 | ✅ Crítico |
| **Backend (/src/)** | 27 | ✅ Crítico |
| **Frontend (/views/)** | 20 | ✅ Crítico |
| **Assets (/static/)** | 47 | ✅ Crítico |
| **Database** | 7 | ✅ Crítico |
| **Documentação** | 25+ | 📋 Recomendado |
| **Deploy Tools** | 12 | 📋 Recomendado |
| **Sistemas PLI** | 3 | 💎 Valor Agregado |

**Total: ~170 arquivos + 3 sistemas PLI**

---

## ⚠️ **ARQUIVOS QUE NÃO DEVEM SER ENVIADOS**

```
node_modules/              # Dependências (instalar no servidor)
.git/                      # Histórico Git (usar .gitignore)
package-lock.json          # Opcional (pode regenerar)
logs/*.log                 # Logs locais
.vscode/                   # Configuração IDE local
```

---

## 🎯 **COMANDO DE DEPLOY SUGERIDO**

```bash
# Arquivos essenciais para upload:
rsync -av --exclude='node_modules' --exclude='.git' \
  --exclude='logs/*.log' --exclude='.vscode' \
  ./ user@server:/path/to/app/

# Ou ZIP para upload manual:
zip -r pli-cadastros-deploy.zip . \
  -x "node_modules/*" ".git/*" "logs/*.log" ".vscode/*"
```

---

## ✅ **CHECKLIST PRE-DEPLOY**

- ✅ `server.js` presente
- ✅ `.env` configurado com variáveis de produção
- ✅ `package.json` com dependências corretas
- ✅ Pasta `/src/` completa
- ✅ Pasta `/views/` completa  
- ✅ Pasta `/static/` completa
- ✅ Scripts SQL em `/database/`
- ✅ Sistemas PLI preservados
- ✅ Documentação incluída

**🚀 DEPLOY READY!**
