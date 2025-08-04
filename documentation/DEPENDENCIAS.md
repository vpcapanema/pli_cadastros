# 📦 DEPENDÊNCIAS DO SISTEMA SIGMA-PLI

## Backend (Node.js)
- express
- pg
- dotenv
- bcrypt
- jsonwebtoken
- nodemailer
- @sendgrid/mail
- cookie-parser
- cors
- node-cron

### Dev
- nodemon

---

## Frontend (CDN/import)
- Bootstrap 5.1.3 (CSS/JS)
- Font Awesome 6.x (CSS)
- Google Fonts (Montserrat)
- jQuery 3.6.0
- SweetAlert2
- jQuery Mask Plugin
- Custom CSS: `/static/css/sistema_aplicacao_cores_pli.css`
- Custom JS: `/static/js/components/*.js`, `/static/js/services/api.js`, etc.

---

## Serviços Externos
- Gmail SMTP (Nodemailer)
- SendGrid (opcional)
- PostgreSQL (RDS/AWS)
- SweetAlert2 (CDN)

---

## Scripts e Utilitários
- Scripts de deploy: `deploy-manager.sh`, `deploy-manager.ps1`
- Scripts de organização: `organize-project.js`, `start_pli.py`
- Scripts de banco: `setup-db.js`, `test-db.js`, etc.

---

## Observações
- Todas as dependências do backend estão listadas em `package.json`.
- As dependências do frontend são carregadas via CDN nas páginas HTML principais.
- Scripts utilitários e de deploy estão na pasta `/scripts/`.
- Banco de dados principal: PostgreSQL (RDS/AWS).

---

**Atualizado em 31/07/2025**
