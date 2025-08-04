# Relatório de Utilização de Arquivos CSS no Projeto PLI Cadastros

**Data:** 4 de agosto de 2025  
**Autor:** GitHub Copilot  
**Projeto:** SIGMA-PLI | Módulo de Gerenciamento de Cadastros

## 1. Visão Geral

O projeto está organizado com uma estrutura de CSS baseada na metodologia ITCSS (Inverted Triangle CSS), com os estilos organizados em camadas hierárquicas:

1. Settings - Variáveis e configurações
2. Tools - Mixins e funções (se usar preprocessador)
3. Generic - Reset/normalize
4. Elements - Elementos HTML básicos
5. Layout - Estrutura da página
6. Components - Componentes reutilizáveis
7. Pages - Estilos específicos por página
8. Utilities - Classes utilitárias

A maioria das páginas utiliza um conjunto comum de arquivos CSS, com `main.css` como arquivo principal que importa todos os outros arquivos específicos.

## 2. Arquivos CSS Externos (Bibliotecas)

A maioria das páginas utiliza as seguintes bibliotecas externas:

| Biblioteca | URL | Utilização |
|------------|-----|------------|
| Bootstrap | https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css | Framework CSS base |
| Font Awesome | https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css | Ícones |
| Google Fonts (Montserrat) | https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap | Tipografia |
| DataTables | https://cdn.datatables.net/1.13.7/css/dataTables.bootstrap5.min.css | Tabelas avançadas (apenas páginas com tabelas) |

## 3. Arquivos CSS Internos

### 3.1 Arquivo Principal
- **main.css**: Utilizado por todas as páginas do sistema, importa todos os outros arquivos CSS específicos

### 3.2 Arquivos Importados pelo main.css

#### 3.2.1 Settings
- **00-settings/_root.css**: Variáveis CSS globais
- **00-settings/_breakpoints.css**: Configurações de media queries

#### 3.2.2 Generic
- **01-generic/_reset-fixes.css**: Correções de reset/normalize

#### 3.2.3 Layout
- **04-layout/_base.css**: Estrutura base da página
- **04-layout/_header.css**: Estilos para o cabeçalho
- **04-layout/_footer.css**: Estilos para o rodapé
- **04-layout/_responsive.css**: Classes responsivas

#### 3.2.4 Components
- **05-components/_buttons.css**: Estilos para botões
- **05-components/_cards.css**: Estilos para cards
- **05-components/_login-glass.css**: Componente de login com efeito glass
- **05-components/_tables.css**: Estilos para tabelas
- **05-components/_forms.css**: Estilos para formulários

#### 3.2.5 Pages
- **06-pages/_pages-comum.css**: Estilos comuns para todas as páginas
- **06-pages/_index-page.css**: Estilos específicos da página inicial
- **06-pages/_dashboard-page.css**: Estilos específicos para o dashboard
- **06-pages/_usuarios-page.css**: Estilos específicos para página de usuários
- **06-pages/_login-page.css**: Estilos específicos para página de login
- **06-pages/_recuperar-senha-page.css**: Estilos específicos para recuperação de senha
- **06-pages/_meus-dados-page.css**: Estilos específicos para página "Meus Dados"
- **06-pages/_pessoa-fisica-page.css**: Estilos específicos para página de pessoa física
- **06-pages/_pessoa-juridica-page.css**: Estilos específicos para página de pessoa jurídica
- **06-pages/_sessions-manager-page.css**: Estilos específicos para gerenciador de sessões
- **06-pages/_solicitacoes-cadastro-page.css**: Estilos específicos para solicitações de cadastro
- **06-pages/_cadastro-pessoa-fisica-page.css**: Estilos específicos para cadastro público de pessoa física
- **06-pages/_cadastro-pessoa-juridica-page.css**: Estilos específicos para cadastro público de pessoa jurídica
- **06-pages/_cadastro-usuario-page.css**: Estilos específicos para cadastro público de usuário

#### 3.2.6 Utilities
- **07-utilities/_utilities.css**: Classes utilitárias gerais
- **07-utilities/_text-utilities.css**: Classes utilitárias para texto

## 4. Utilização por Página

### 4.1 Páginas da Área Administrativa (views/app)

#### 4.1.1 Dashboard (dashboard.html)
- Bootstrap 5.1.3
- Font Awesome 6.0.0
- main.css (com todas suas importações)
- Classe específica: `p-dashboard`

#### 4.1.2 Pessoa Física (pessoa-fisica.html)
- Bootstrap 5.1.3
- Font Awesome 6.0.0
- DataTables 1.13.7
- main.css (com todas suas importações)
- Classe específica: `p-pessoa-fisica`

#### 4.1.3 Pessoa Jurídica (pessoa-juridica.html)
- Bootstrap 5.1.3
- Font Awesome 6.0.0
- DataTables 1.13.7
- main.css (com todas suas importações)
- Classe específica: `p-pessoa-juridica`

#### 4.1.4 Gerenciador de Sessões (sessions-manager.html)
- Bootstrap 5.1.3
- Font Awesome 6.0.0
- DataTables 1.13.7
- main.css (com todas suas importações)
- Classe específica: `p-sessions-manager`

#### 4.1.5 Solicitações de Cadastro (solicitacoes-cadastro.html)
- Bootstrap 5.1.3
- Font Awesome 6.0.0
- DataTables 1.13.7
- main.css (com todas suas importações)
- Classe específica: `p-solicitacoes-cadastro`

#### 4.1.6 Usuários (usuarios.html)
- Bootstrap 5.1.3
- Font Awesome 6.0.0
- DataTables 1.13.7
- main.css (com todas suas importações)
- Classe específica: `p-usuarios`

#### 4.1.7 Meus Dados (meus-dados.html)
- Bootstrap 5.1.3
- Font Awesome 6.0.0
- main.css (com todas suas importações)
- Classe específica: `p-meus-dados`

### 4.2 Páginas Públicas (views/public)

#### 4.2.1 Cadastro de Pessoa Física (cadastro-pessoa-fisica.html)
- Bootstrap 5.1.3
- Font Awesome 6.0.0
- Google Fonts (Montserrat)
- main.css (com todas suas importações)
- Classe específica: `p-cadastro-pessoa-fisica`

#### 4.2.2 Cadastro de Pessoa Jurídica (cadastro-pessoa-juridica.html)
- Bootstrap 5.1.3
- Font Awesome 6.0.0
- Google Fonts (Montserrat)
- main.css (com todas suas importações)
- Classe específica: `p-cadastro-pessoa-juridica`

#### 4.2.3 Cadastro de Usuário (cadastro-usuario.html)
- Bootstrap 5.1.3
- Font Awesome 6.0.0
- Google Fonts (Montserrat)
- main.css (com todas suas importações)
- Classe específica: `p-cadastro-usuario`

#### 4.2.4 Login (login.html)
- Bootstrap 5.1.3
- Font Awesome 6.0.0
- Google Fonts (Montserrat)
- main.css (com todas suas importações)
- Classe específica: `p-login`

### 4.3 Componentes Reutilizáveis (views/components)

#### 4.3.1 Navbar (navbar.html)
- Utiliza os estilos importados pela página pai

#### 4.3.2 Footer (footer.html)
- Utiliza os estilos importados pela página pai

#### 4.3.3 Modal Templates (modal-templates.html)
- main.css (com todas suas importações)

### 4.4 Templates (views/templates)

#### 4.4.1 Base (base.html)
- Bootstrap 5.3.2
- Font Awesome 6.4.0
- main.css (com todas suas importações)

#### 4.4.2 Example Usage (example-usage.html)
- Bootstrap 5.3.2
- Font Awesome 6.4.0
- main.css (com todas suas importações)
- 06-pages/_login-page.css (diretamente importado)

### 4.5 Área de Admin (views/admin)

#### 4.5.1 Panel (panel.html)
- Bootstrap 5.3.0
- Bootstrap Icons 1.10.0
- /css/sistema_aplicacao_cores_pli.css (caminho diferente dos demais arquivos)

## 5. Sistema Responsivo

O sistema utiliza uma abordagem avançada para responsividade baseada em detecção de dispositivo via JavaScript:

### 5.1 Classes Responsivas

O arquivo `_responsive.css` define classes específicas para diferentes dispositivos:

- `.pli-device-phone-small`: Telefones pequenos (< 375px)
- `.pli-device-phone`: Telefones (< 576px)
- `.pli-device-tablet`: Tablets (< 768px)
- `.pli-device-desktop-small`: Desktops pequenos (< 992px)
- `.pli-device-desktop`: Desktops (< 1200px)
- `.pli-device-desktop-large`: Desktops grandes (< 1400px)
- `.pli-device-ultrawide`: Monitores ultrawide (≥ 1400px)

Além disso, existem classes para orientação do dispositivo:
- `.pli-orientation-portrait`: Modo retrato
- `.pli-orientation-landscape`: Modo paisagem

### 5.2 Integração JavaScript-CSS

O arquivo JavaScript `responsive-layout.js` detecta o tipo de dispositivo e aplica classes CSS apropriadas ao elemento body dinamicamente:

```javascript
// Aplicar novas classes
body.classList.add(`pli-device-${this.deviceType}`);
body.classList.add(`pli-orientation-${this.orientation}`);
```

### 5.3 Utilitários Responsivos

Existem utilitários para mostrar/esconder elementos conforme o dispositivo:

- `.pli-hide-on-phone`: Esconde elemento em telefones
- `.pli-show-on-phone`: Mostra elemento apenas em telefones
- `.pli-hide-on-tablet`: Esconde elemento em tablets
- `.pli-show-on-tablet`: Mostra elemento apenas em tablets

### 5.4 Animações Adaptativas

O sistema ajusta automaticamente a duração de animações conforme o dispositivo:

- Dispositivos móveis: Animações mais rápidas (0.2s)
- Desktops: Animações mais suaves (0.3s)

## 6. Observações e Recomendações

1. **Consistência**: A maioria das páginas segue um padrão consistente, utilizando o arquivo main.css que importa todos os outros arquivos CSS específicos.

2. **Organização ITCSS**: O projeto utiliza uma organização de CSS bem estruturada, seguindo a metodologia ITCSS que ajuda a controlar especificidade e cascata.

3. **Exceções**: O arquivo panel.html na pasta admin utiliza um caminho diferente para seus arquivos CSS (/css/ em vez de /static/css/), o que pode indicar uma inconsistência ou uma área administrativa separada.

4. **Classes Específicas de Página**: Cada página utiliza uma classe específica no elemento body (p-nome-da-pagina), o que facilita a aplicação de estilos específicos para cada página.

5. **Sistema Responsivo Avançado**: O projeto utiliza uma abordagem híbrida para responsividade, combinando media queries tradicionais com detecção de dispositivo via JavaScript.

6. **Futuras Melhorias**:
   - Considerar implementar um sistema de design tokens para centralizar valores como cores e espaçamentos
   - Documentar melhor o sistema de responsividade para futuros desenvolvedores
   - Padronizar a estrutura de pastas para o painel de administração (views/admin)

## 7. Conclusão

O sistema CSS do projeto PLI Cadastros apresenta uma arquitetura bem estruturada e modular, seguindo boas práticas de organização como ITCSS. A abordagem responsiva híbrida oferece grande flexibilidade para otimizações específicas por dispositivo. Os estilos são organizados em camadas lógicas, do mais genérico ao mais específico, facilitando a manutenção e escalabilidade do projeto.
