#!/usr/bin/env python3
"""
Script para iniciar a aplicação SIGMA-PLI | Módulo de Gerenciamento de Cadastros em modo debug
"""
import os
import subprocess
import sys

def start_application_debug():
    """Inicia a aplicação Node.js em modo debug"""
    print("Iniciando SIGMA-PLI | Módulo de Gerenciamento de Cadastros em modo DEBUG...")
    
    try:
        # Verificar se o Node.js está instalado
        subprocess.run(["node", "--version"], check=True, stdout=subprocess.PIPE)
        
        # Iniciar a aplicação em modo debug
        print("Node.js encontrado. Iniciando aplicação em modo debug...")
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # Mostrar instruções de debug
        print("\nModo DEBUG ativado!")
        print("Abra Chrome e acesse: chrome://inspect")
        print("Clique em 'Open dedicated DevTools for Node'")
        print("Ou conecte seu IDE ao debugger na porta 9229")
        
        # Mostrar saída em tempo real
        print("\nLog da aplicação:")
        print("=" * 50)
        
        # Definir variáveis de ambiente para debug
        env = os.environ.copy()
        env["NODE_ENV"] = "development"
        env["DEBUG"] = "pli:*"
        
        # Executar o comando diretamente
        os.system("node --inspect server.js")
            
    except subprocess.CalledProcessError:
        print("Node.js não encontrado. Por favor, instale o Node.js.")
        sys.exit(1)
    except Exception as e:
        print(f"Erro ao iniciar aplicação em modo debug: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_application_debug()