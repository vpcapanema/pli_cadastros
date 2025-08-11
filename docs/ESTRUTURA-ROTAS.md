# 🚦 ESTRUTURA DE ROTAS - SISTEMA PLI

## 📋 Organização das Rotas

O sistema PLI possui uma estrutura de rotas bem organizada que **NUNCA MISTURA** retorno de JSON e HTML na mesma rota.

### 🔗 **Tipos de Rotas**

| Prefixo        | Tipo            | Retorno          | Função                              |
| -------------- | --------------- | ---------------- | ----------------------------------- |
| `/api/*`       | API             | JSON             | Endpoints para comunicação AJAX/API |
| `/pages/*`     | Páginas         | HTML Estático    | Arquivos HTML servidos diretamente  |
| `/templates/*` | Templates       | HTML Renderizado | Templates EJS com dados dinâmicos   |
| Diretas        | Compatibilidade | Variado          | Mantém URLs existentes funcionando  |

---

## 🔧 **Rotas API (JSON)**

**Padrão:** `/api/*`  
**Retorno:** Sempre JSON  
**Middleware:** Autenticação, validação, rate limiting

### Exemplos:

```
GET  /api/health               → { status: "ok" }
POST /api/auth/login          → { token: "...", user: {...} }
GET  /api/usuarios            → [{ id: 1, nome: "..." }, ...]
POST /api/pessoa-fisica       → { success: true, id: 123 }
```

---

## 📄 **Rotas de Páginas (HTML Estático)**

**Padrão:** `/pages/*`  
**Retorno:** Arquivo HTML via `sendFile()`  
**Uso:** Páginas estáticas sem dados dinâmicos

### Exemplos:

```
GET /pages/login              → login.html
GET /pages/dashboard          → dashboard.html
GET /pages/cadastro-usuario   → cadastro-usuario.html
GET /pages/components/navbar  → navbar.html
```

---

## 🎨 **Rotas de Templates (HTML Renderizado)**

**Padrão:** `/templates/*`  
**Retorno:** HTML via `render()` (EJS)  
**Uso:** Páginas com dados dinâmicos, variáveis, lógica

### Exemplos:

```
GET /templates/base           → Template base renderizado
GET /templates/example        → Exemplo de uso com dados
GET /templates/login-demo     → Demo com navbar restrito
```

---

## 🔄 **Rotas de Compatibilidade**

**Função:** Manter URLs antigas funcionando  
**Tipos:** Redirecionamento (301) ou servir arquivo diretamente

### Exemplos:

```
GET /login.html               → Serve arquivo estático
GET /template/base            → Redireciona para /templates/base
GET /health                   → Página HTML de status
```

---

## ⚡ **Regras Importantes**

### ✅ **PERMITIDO:**

- `/api/usuarios` retorna JSON
- `/pages/login` retorna HTML estático
- `/templates/dashboard` retorna HTML renderizado
- Rotas de compatibilidade que redirecionam

### ❌ **PROIBIDO:**

- Misturar JSON e HTML na mesma rota
- `/api/something` retornar HTML
- `/pages/something` retornar JSON
- Inconsistência entre prefixo e tipo de retorno

---

## 📁 **Estrutura de Arquivos**

```
src/routes/
├── auth.js           → Rotas /api/auth/*
├── usuarios.js       → Rotas /api/usuarios/*
├── pages.js          → Rotas /api/pages/*
└── ...

views/
├── public/           → Arquivos para /pages/*
├── app/              → Arquivos para /pages/* (autenticadas)
├── admin/            → Arquivos para /pages/admin/*
├── components/       → Componentes HTML
└── templates/        → Templates EJS para /templates/*
    ├── base.ejs
    └── example-usage.ejs
```

---

## 🧪 **Testando as Rotas**

### Via Browser:

```
http://localhost:8888/health              → Status HTML
http://localhost:8888/templates/base      → Template base
http://localhost:8888/pages/login         → Página de login
http://localhost:8888/routes/docs         → Documentação JSON
```

### Via AJAX/Fetch:

```javascript
// API routes - sempre JSON
fetch('/api/health').then((r) => r.json());
fetch('/api/usuarios').then((r) => r.json());

// Page routes - sempre HTML
window.location.href = '/pages/dashboard';

// Template routes - sempre HTML renderizado
window.location.href = '/templates/example';
```

---

## 🎯 **Vantagens da Estrutura**

✅ **Clareza:** Fácil identificar o tipo de retorno pelo prefixo  
✅ **Manutenibilidade:** Mudanças organizadas por tipo  
✅ **Debugging:** Erros isolados por categoria  
✅ **Performance:** Middlewares específicos por tipo  
✅ **SEO:** URLs semânticas e organizadas  
✅ **Compatibilidade:** URLs antigas continuam funcionando

---

## 📞 **Rotas de Desenvolvimento**

```
GET /routes/docs      → Documentação completa (JSON)
GET /health           → Status do sistema (HTML)
GET /api/health       → Status do sistema (JSON)
```
