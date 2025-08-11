# GUIA VISUAL - Configuração No-IP Passo a Passo

## 🖥️ INTERFACE NO-IP - ONDE CLICAR

### **PASSO 1: Tela Inicial após Login**

```
┌────────────────────────────────────────────────────────────┐
│ No-IP Dashboard                                            │
├────────────────────────────────────────────────────────────┤
│ [Dynamic DNS] [Managed DNS] [Email] [Monitoring]          │
│                                                            │
│ ➡️ CLIQUE EM: "Dynamic DNS"                                │
│                                                            │
│ └─ No-IP Hostnames                                         │
│    └─ ➡️ CLIQUE EM: "Create Hostname" (botão azul)        │
└────────────────────────────────────────────────────────────┘
```

### **PASSO 2: Formulário de Criação**

```
┌────────────────────────────────────────────────────────────┐
│ Create a Hostname                                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Hostname: [sigma-pli        ] . [ddns.net     ▼]          │
│           ▲                    ▲                          │
│           DIGITE AQUI          ESCOLHA UM DOMÍNIO GRÁTIS  │
│                                                            │
│ Record Type: ( ) A ← ✅ MARQUE ESTA OPÇÃO                 │
│              ( ) AAAA                                      │
│              ( ) CNAME                                     │
│                                                            │
│ IP/Target: [54.237.45.153                    ]            │
│            ▲                                               │
│            DIGITE O IP DO SERVIDOR                         │
│                                                            │
│ ☐ Wildcard (*.sigma-pli.ddns.net)                         │
│ ▲                                                          │
│ ❌ NÃO MARQUE ESTA OPÇÃO                                   │
│                                                            │
│ ✅ Enable Dynamic DNS Update ← ✅ MARQUE ESTA OPÇÃO       │
│                                                            │
│ [Create Hostname] ← CLIQUE AQUI PARA FINALIZAR            │
└────────────────────────────────────────────────────────────┘
```

### **PASSO 3: Configurações Avançadas (Opcional)**

```
┌────────────────────────────────────────────────────────────┐
│ Advanced Settings (Expandir se necessário)                │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Offline Settings:                                          │
│ ✅ Email when host goes offline                           │
│ ✅ Enable offline detection                               │
│                                                            │
│ Security Settings:                                         │
│ ☐ Password protect this host ← ❌ NÃO MARQUE             │
│ ☐ Restrict access ← ❌ NÃO MARQUE                        │
│                                                            │
│ Port Settings:                                             │
│ Port: [8888] ← OPCIONAL: pode configurar depois           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 🎯 EXEMPLO PRÁTICO DE PREENCHIMENTO

### **Configuração Recomendada:**

```
┌────────────────────────────────────────────────────────────┐
│ ✅ EXEMPLO DE CONFIGURAÇÃO CORRETA                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Hostname: sigma-pli                                        │
│ Domain: ddns.net                                           │
│ Full hostname: sigma-pli.ddns.net                          │
│                                                            │
│ Record Type: ● A (selecionado)                             │
│ IP/Target: 54.237.45.153                                   │
│                                                            │
│ ☐ Wildcard (desmarcado)                                    │
│ ✅ Enable Dynamic DNS Update (marcado)                     │
│                                                            │
│ Advanced Settings:                                         │
│ ✅ Email when host goes offline                           │
│ ✅ Enable offline detection                               │
│ ☐ Password protect (desmarcado)                           │
│ ☐ Restrict access (desmarcado)                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 🚨 ERROS COMUNS E COMO EVITAR

### **❌ ERRO 1: Tipo de Record errado**

```
Errado: CNAME ← Não use!
Certo:  A (Host) ← Use este!
```

### **❌ ERRO 2: Wildcard marcado desnecessariamente**

```
Errado: ✅ Wildcard
Certo:  ☐ Wildcard (desmarcado)
```

### **❌ ERRO 3: Dynamic DNS desmarcado**

```
Errado: ☐ Enable Dynamic DNS
Certo:  ✅ Enable Dynamic DNS (obrigatório!)
```

### **❌ ERRO 4: IP incorreto**

```
Errado: 192.168.1.1 (IP local)
Certo:  54.237.45.153 (IP público do servidor)
```

## 🔍 VERIFICAÇÃO APÓS CRIAÇÃO

### **Tela de Confirmação:**

```
┌────────────────────────────────────────────────────────────┐
│ ✅ Hostname Created Successfully!                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Your new hostname: sigma-pli.ddns.net                      │
│ Points to: 54.237.45.153                                   │
│ Status: Active                                             │
│                                                            │
│ 🕐 DNS propagation may take 5-30 minutes                  │
│                                                            │
│ Test your hostname:                                        │
│ http://sigma-pli.ddns.net                                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 📱 ALTERNATIVAS SE HOSTNAME ESTIVER OCUPADO

### **Variações do Nome:**

```
1ª opção: sigma-pli.ddns.net
2ª opção: sigmapli.ddns.net
3ª opção: sigma-sistema.ddns.net
4ª opção: pli-cadastros.ddns.net
5ª opção: app-sigma.ddns.net
```

### **Diferentes Domínios Gratuitos:**

```
1. sigma-pli.ddns.net
2. sigma-pli.hopto.org
3. sigma-pli.servegame.com
4. sigma-pli.zapto.org
5. sigma-pli.bounceme.net
```

## 🎉 CONFIRMAÇÃO FINAL

Quando conseguir criar o hostname, você verá:

```
✅ Hostname: sigma-pli.ddns.net (ou a variação que escolheu)
✅ Status: Active
✅ IP: 54.237.45.153
✅ Type: A
✅ Dynamic DNS: Enabled
```

**IMPORTANTE:** Me informe exatamente qual hostname foi criado para eu configurar o Nginx no servidor!
