#!/usr/bin/env python3
"""
Script principal para iniciar a aplicação SIGMA-PLI | Módulo de Gerenciamento de Cadastros em produção
"""
import os
import sys
import time

def check_node():
    """Verifica se o Node.js está instalado"""
    try:
        os.system("node --version")
        return True
    except:
        print("Node.js não encontrado. Por favor, instale o Node.js.")
        return False

def kill_processes():
    """Mata processos que possam estar usando a porta"""
    if os.name == 'nt':  # Windows
        os.system("taskkill /F /IM node.exe 2>nul")
    else:
        os.system("pkill -f node")
    print("Processos Node.js encerrados.")

def main():
    """Inicia o sistema em modo produção"""
    print("=" * 50)
    print("SIGMA-PLI | Módulo de Gerenciamento de Cadastros - SISTEMA DE GERENCIAMENTO")
    print("=" * 50)
    print("\nIniciando sistema em modo produção...")
    
    # Mata processos existentes
    kill_processes()
    
    # Atualiza componentes compartilhados
    print("\nAtualizando componentes compartilhados...")
    os.system("npm run update-all")
    
    # Inicia o servidor
    print("\nIniciando servidor...")
    os.system("npm start")

if __name__ == "__main__":
    if check_node():
        try:
            main()
        except KeyboardInterrupt:
            print("\nEncerrando sistema...")
            sys.exit(0)
    else:
        input("Pressione Enter para sair...")
        sys.exit(1)