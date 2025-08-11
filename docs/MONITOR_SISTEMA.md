# Monitor de Sistema para PLI Cadastros

Este monitor de sistema fornece uma interface visual para acompanhar o uso de recursos do sistema em tempo real, facilitando o diagnóstico de problemas de desempenho e uso de memória.

## Recursos Monitorados

- **Uso de Memória**: Total, livre e percentual de uso
- **Uso de CPU**: Porcentagem de uso para cada núcleo do processador
- **Informações do Sistema**: Sistema operacional, hostname, tempo de atividade
- **Processo Node.js**: Uso de memória do processo, heap, tempo de execução

## Como Usar

### Opção 1: Usando scripts de automação

**Windows:**

```
cd automation
iniciar-monitor-sistema.bat
```

**Linux/Mac/Git Bash:**

```bash
cd automation
bash iniciar-monitor-sistema.sh
```

### Opção 2: Usando npm

```bash
npm run monitor
```

Após iniciar o monitor, uma janela do navegador será aberta automaticamente com o endereço http://localhost:8887.

## Funcionalidades

- **Atualização Automática**: Clique no botão "Iniciar Atualização Automática" para atualizar os dados a cada 3 segundos.
- **Indicação Visual**: As barras de progresso mudam de cor conforme o uso aumenta (azul → amarelo → vermelho).

## Casos de Uso

1. **Diagnóstico de Vazamento de Memória**: Acompanhe o crescimento da memória heap ao longo do tempo.
2. **Performance de Operações Pesadas**: Monitore o uso de CPU durante operações de processamento intensivo.
3. **Monitoramento de Recursos do Servidor**: Útil para verificar se o servidor está sob alta carga.

## Encerrando o Monitor

- Para encerrar o monitor, feche a janela do terminal ou pressione Ctrl+C no terminal onde o monitor está sendo executado.

## Notas Técnicas

- O monitor usa módulos nativos do Node.js (http, os) sem dependências externas.
- As medições de CPU são realizadas por amostragem e podem variar ligeiramente.
- Este monitor é apenas para uso em desenvolvimento e não deve ser exposto em um ambiente de produção sem proteção adequada.
