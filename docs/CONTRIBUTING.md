# 🤝 Guia de Contribuição

Obrigado por seu interesse em contribuir com o SIGMA-PLI | Módulo de Gerenciamento de Cadastros! Este documento fornece diretrizes para contribuições.

## 📋 Antes de Começar

- Certifique-se de ter lido o [README.md](README.md)
- Verifique as [issues abertas](https://github.com/vpcapanema/pli_cadastros/issues)
- Familiarize-se com a estrutura do projeto

## 🔄 Processo de Contribuição

### 1. Fork e Clone
```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/seu-usuario/pli_cadastros.git
cd pli_cadastros

# Adicione o repositório original como upstream
git remote add upstream https://github.com/vpcapanema/pli_cadastros.git
```

### 2. Crie uma Branch
```bash
# Atualize sua branch master
git checkout master
git pull upstream master

# Crie uma nova branch para sua feature/bugfix
git checkout -b feature/nome-da-feature
# ou
git checkout -b bugfix/nome-do-bug
```

### 3. Faça suas Alterações
- Mantenha o código limpo e bem documentado
- Siga os padrões de código estabelecidos
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário

### 4. Teste suas Alterações
```bash
# Execute os testes
npm test

# Verifique o linting
npm run lint

# Teste manualmente a funcionalidade
```

### 5. Commit e Push
```bash
# Adicione os arquivos modificados
git add .

# Faça commit seguindo o padrão
git commit -m "feat: adiciona nova funcionalidade X"

# Envie para seu fork
git push origin feature/nome-da-feature
```

### 6. Abra um Pull Request
- Vá para o GitHub e abra um Pull Request
- Descreva detalhadamente as mudanças
- Referencie issues relacionadas
- Aguarde o review

## 📝 Padrões de Código

### Convenção de Commits
Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(escopo): descrição

[corpo opcional]

[rodapé opcional]
```

**Tipos:**
- `feat`: nova funcionalidade
- `fix`: correção de bug
- `docs`: documentação
- `style`: formatação, ponto e vírgula, etc
- `refactor`: refatoração de código
- `test`: adição ou correção de testes
- `chore`: tarefas de build, configurações, etc

**Exemplos:**
```
feat(auth): adiciona autenticação com Google
fix(api): corrige validação de CPF
docs(readme): atualiza instruções de instalação
```

### JavaScript/Node.js
- Use ESLint configurado no projeto
- Prefira `const` sobre `let`, evite `var`
- Use arrow functions quando apropriado
- Mantenha funções pequenas e focadas
- Comente código complexo em português
- Use nomes descritivos para variáveis e funções

### HTML/CSS
- Use indentação de 2 espaços
- Mantenha HTML semântico
- Use classes CSS descritivas
- Prefira Flexbox/Grid sobre floats
- Mantenha CSS modular

### Estrutura de Arquivos
- Organize arquivos por funcionalidade
- Use nomes de arquivo descritivos
- Mantenha estrutura consistente
- Evite arquivos muito grandes

## 🧪 Testes

### Tipos de Teste
- **Unitários**: Testam funções isoladas
- **Integração**: Testam interação entre módulos
- **E2E**: Testam fluxos completos

### Executando Testes
```bash
# Todos os testes
npm test

# Testes específicos
npm test -- --grep "auth"

# Coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Escrevendo Testes
```javascript
describe('AuthService', () => {
  it('deve validar credenciais corretas', async () => {
    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
  });
});
```

## 📊 Review de Código

### Checklist do Reviewer
- [ ] O código funciona conforme esperado?
- [ ] O código está bem testado?
- [ ] A documentação foi atualizada?
- [ ] O código segue os padrões estabelecidos?
- [ ] Não há problemas de segurança?
- [ ] A performance não foi degradada?

### Checklist do Autor
- [ ] Testei em diferentes browsers/dispositivos?
- [ ] Adicionei testes para novas funcionalidades?
- [ ] Atualizei a documentação?
- [ ] O commit message está correto?
- [ ] Não há console.logs esquecidos?
- [ ] O código está otimizado?

## 🐛 Reportando Bugs

### Template de Bug Report
```markdown
**Descrição do Bug**
Descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role para baixo até '...'
4. Veja o erro

**Comportamento Esperado**
Descrição do que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 91]
- Versão: [ex: 1.0.0]

**Contexto Adicional**
Qualquer outro contexto sobre o problema.
```

## 💡 Sugerindo Features

### Template de Feature Request
```markdown
**A feature está relacionada a um problema? Descreva.**
Descrição clara do problema: "Estou sempre frustrado quando [...]"

**Descreva a solução que gostaria**
Descrição clara da solução desejada.

**Descreva alternativas consideradas**
Descrição de soluções alternativas consideradas.

**Contexto Adicional**
Qualquer outro contexto ou screenshots sobre a feature.
```

## 🏷️ Labels do GitHub

- `bug` - Algo não está funcionando
- `enhancement` - Nova funcionalidade ou request
- `documentation` - Melhorias na documentação
- `good first issue` - Bom para novos contribuidores
- `help wanted` - Ajuda extra é desejada
- `question` - Mais informações são necessárias
- `wontfix` - Não será resolvido
- `duplicate` - Issue duplicada
- `invalid` - Issue inválida

## 🎯 Prioridades

### Alta Prioridade
- Bugs críticos que afetam funcionalidade principal
- Problemas de segurança
- Correções para produção

### Média Prioridade
- Novas funcionalidades planejadas
- Melhorias de performance
- Refatorações importantes

### Baixa Prioridade
- Melhorias de interface
- Documentação
- Otimizações menores

## 📞 Contato

- **Issues**: [GitHub Issues](https://github.com/vpcapanema/pli_cadastros/issues)
- **Discussões**: [GitHub Discussions](https://github.com/vpcapanema/pli_cadastros/discussions)
- **Email**: suporte@pli.gov.br

---

**Obrigado por contribuir com o SIGMA-PLI | Módulo de Gerenciamento de Cadastros! 🚀**
