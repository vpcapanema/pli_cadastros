# SIGMA-PLI Copilot Instructions

## Development Environment

- **Operating System**: Windows
- **Terminal**: Bash for Windows (bash.exe)
- **Command execution**: All terminal commands should be executed in bash shell, not CMD or PowerShell

## Project Architecture

This is a **Node.js/Express cadastral management system** with PostgreSQL backend and modular frontend. Key architectural decisions:

- **Config location**: All environment variables in `config/.env` (NOT root `.env`)
- **Database configuration**: Database access credentials and connection settings are in `config/.env`
- **Frontend architecture**: Component-based with `static/js/components/` for reusable modules
- **CSS methodology**: ITCSS structure in `static/css/` with numbered folders (00-settings → 06-pages)
- **Security-first**: Multiple middleware layers in `src/middleware/` for SQL injection, XSS, and audit logging

## Critical Patterns

### Database Access

```javascript
// Always use the configured pool from src/config/database.js
const { query } = require('../config/database');
// Tables use snake_case: pessoa_fisica, usuario_sistema, sessao_controle
```

### Frontend Module Loading

```javascript
// Components self-register pattern in static/js/components/
// Load via: <script src="/static/js/navbar-loader.js"></script>
// Each page has specific script in static/js/pages/[page-name].js
```

### CSS Variable System

```css
/* Use PLI-prefixed custom properties from 00-settings/_root.css */
--pli-header-height: 70px;
--pli-spacing-md: 1rem;
/* Responsive variants available: --pli-spacing-responsive-* */
```

## Development Workflows

### Local Development

```bash
node server.js          # Start server (not npm start - avoids PM2)
# Server expects PostgreSQL configured in config/.env
# Frontend loads at http://localhost:8888
# Use bash terminal for all commands on Windows
```

### CSS Development

- **Never modify** `static/css/main.css` - it's an import orchestrator
- **Add new components** in `05-components/_component-name.css`
- **Page-specific styles** go in `06-pages/_page-name.css`
- **Use responsive system**: Files auto-include `_responsive.css` for device detection

### JavaScript Architecture

```javascript
// Global utilities in static/js/utils/
// Page scripts follow pattern: static/js/pages/[page-name].js
// Components auto-load via loader scripts (navbar-loader.js, footer-loader.js)
```

## Project-Specific Conventions

### Security Implementation

- **All routes** protected by multiple middleware: audit → sanitize → validate → rate-limit
- **SQL queries** use parameterized statements via database pool
- **Frontend sanitization** happens before backend receives data

### Modular HTML Strategy

```html
<!-- Pages load components dynamically -->
<div id="navbar-container"></div>
<script src="/static/js/navbar-loader.js"></script>
<!-- This pattern repeated for footer, modals, etc. -->
```

### File Naming

- **Backend**: camelCase for JavaScript, snake_case for database
- **Frontend**: kebab-case for CSS files, camelCase for JS
- **Routes**: `/api/[resource]` pattern with plural nouns

## Integration Points

### Database Schema

- **Primary schemas**: `cadastro` (person data), `usuarios` (system users)
- **Session management**: `sessao_controle` table with intelligent cleanup jobs
- **Audit trail**: All actions logged to `audit_log` with IP tracking

### External Dependencies

- **PostgreSQL Database**: Database connection and credentials configured in `config/.env`
- **Gmail SMTP**: Email service (configured in config/.env)
- **Bootstrap 5 + Font Awesome 6**: UI framework (CDN loaded)

## Terminal Usage

- **Default shell**: bash.exe (Windows)
- **Command execution**: All commands should be given for bash terminal
- **Script execution**: Use bash syntax for shell scripts and commands

When modifying this codebase:

1. **Environment config**: Always check `config/.env` for service credentials and database connection
2. **Terminal commands**: Format all commands for bash shell on Windows
3. **CSS changes**: Follow ITCSS structure, use existing PLI variables
4. **New routes**: Add to appropriate controller in `src/controllers/`, include middleware chain
5. **Database changes**: Update migrations in `database/migrations/`, follow snake_case naming
