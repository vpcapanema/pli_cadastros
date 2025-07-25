#!/usr/bin/env python3
"""
Script para iniciar a aplicação SIGMA-PLI | Módulo de Gerenciamento de Cadastros em modo normal
"""
import os
import subprocess
import sys

def start_application():
    """Inicia a aplicação Node.js"""
    print("Iniciando SIGMA-PLI | Módulo de Gerenciamento de Cadastros...")
    
    try:
        # Verificar se o Node.js está instalado
        subprocess.run(["node", "--version"], check=True, stdout=subprocess.PIPE)
        
        # Iniciar a aplicação
        print("Node.js encontrado. Iniciando aplicação...")
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # Usar node diretamente em vez de npm
        print("\nLog da aplicação:")
        print("=" * 50)
        
        # Executar o comando diretamente
        os.system("node server.js")
            
    except subprocess.CalledProcessError:
        print("Node.js não encontrado. Por favor, instale o Node.js.")
        sys.exit(1)
    except Exception as e:
        print(f"Erro ao iniciar aplicação: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_application()