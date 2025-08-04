#!/bin/bash
# AWS CLI Helper Scripts para PLI Cadastros

echo "🚀 AWS CLI Configurada e Funcionando!"
echo "======================================="

echo ""
echo "📋 Informações da Conta AWS:"
aws sts get-caller-identity

echo ""
echo "🗄️ Bancos RDS Disponíveis:"
aws rds describe-db-instances --region us-east-1 --query 'DBInstances[].{Nome:DBInstanceIdentifier,Engine:Engine,Status:DBInstanceStatus,Endpoint:Endpoint.Address}' --output table

echo ""
echo "📦 Comandos AWS Úteis:"
echo "  aws rds describe-db-instances                    # Listar bancos RDS"
echo "  aws s3 ls                                        # Listar buckets S3"
echo "  aws logs describe-log-groups                     # Listar logs"
echo "  aws sts get-caller-identity                      # Info da conta"
echo ""
echo "🎯 Recursos do Projeto PLI:"
echo "  - Banco PostgreSQL: pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com"
echo "  - Região Principal: us-east-1"
echo "  - Usuário: adm_vinicius"
echo "  - Account ID: 600802701258"
