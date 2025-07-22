#!/usr/bin/env python3
"""
Script principal para iniciar a aplicação PLI Cadastros
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
    """Menu principal"""
    print("=" * 50)
    print("PLI CADASTROS - SISTEMA DE GERENCIAMENTO")
    print("=" * 50)
    print("\nEscolha o modo de execução:")
    print("1. Modo Normal")
    print("2. Modo Debug")
    print("3. Modo Desenvolvimento (com hot-reload)")
    print("4. Matar processos Node.js")
    print("0. Sair")
    
    try:
        choice = input("\nDigite sua escolha (0-4): ")
        
        if choice == "1":
            kill_processes()
            print("Iniciando em modo normal...")
            os.system("node server.js")
        elif choice == "2":
            kill_processes()
            print("Iniciando em modo debug...")
            print("\nModo DEBUG ativado!")
            print("Abra Chrome e acesse: chrome://inspect")
            print("Clique em 'Open dedicated DevTools for Node'")
            os.system("node --inspect server.js")
        elif choice == "3":
            kill_processes()
            print("Iniciando em modo desenvolvimento com hot-reload...")
            os.system("npx nodemon server.js")
        elif choice == "4":
            kill_processes()
            print("\nPressione Enter para voltar ao menu...")
            input()
            main()
        elif choice == "0":
            print("Saindo...")
            sys.exit(0)
        else:
            print("Opção inválida. Por favor, escolha 0-4.")
            time.sleep(1)
            main()
    except KeyboardInterrupt:
        print("\nSaindo...")
        sys.exit(0)

if __name__ == "__main__":
    if check_node():
        main()
    else:
        input("Pressione Enter para sair...")
        sys.exit(1)