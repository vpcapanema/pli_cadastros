# FASE 2: CRIAÇÃO DA INSTÂNCIA EC2

## 2.1 Acesso ao Console AWS

1. Acesse: https://aws.amazon.com/console/
2. Faça login na sua conta AWS
3. Vá para o serviço **EC2**
4. Certifique-se de estar na região **us-east-1** (mesmo do RDS)

## 2.2 Lançar Nova Instância

1. Clique em **"Launch Instance"**
2. **Name:** `pli-cadastros-server`

## 2.3 Escolher AMI (Sistema Operacional)

```
Ubuntu Server 22.04 LTS (HVM), SSD Volume Type
AMI ID: ami-0c7217cdde317cfec (free tier eligible)
Arquitetura: 64-bit (x86)
```

## 2.4 Escolher Tipo de Instância

```
Para teste: t3.micro (1 vCPU, 1 GB RAM) - Free Tier
Para produção: t3.small (2 vCPU, 2 GB RAM) - ~$15/mês
```

## 2.5 Configurar Key Pair (Chave SSH)

1. **Create new key pair**
2. **Name:** `pli-cadastros-key`
3. **Type:** RSA
4. **Format:** .pem
5. **Download** e guarde a chave em local seguro!

## 2.6 Configurar Security Group (Firewall)

**Nome:** `pli-cadastros-sg`

**Regras de Entrada:**

```
Type        | Protocol | Port Range | Source      | Description
SSH         | TCP      | 22         | My IP       | SSH Access
HTTP        | TCP      | 80         | 0.0.0.0/0   | HTTP Access
HTTPS       | TCP      | 443        | 0.0.0.0/0   | HTTPS Access
Custom TCP  | TCP      | 3000       | 0.0.0.0/0   | Node.js App
```

## 2.7 Configurar Armazenamento

```
Volume Type: gp3
Size: 20 GB (8 GB mínimo para free tier)
Encrypt: Yes (recomendado)
```

## 2.8 Lançar Instância

1. Revisar configurações
2. **Launch Instance**
3. Aguardar status **Running**
4. Anotar o **Public IPv4 address**
