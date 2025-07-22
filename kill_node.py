#!/usr/bin/env python3
"""
Script para matar processos Node.js que possam estar usando a porta
"""
import os
import subprocess
import sys
import time

def kill_node_processes():
    """Mata todos os processos Node.js em execução"""
    print("Matando processos Node.js...")
    
    try:
        if os.name == 'nt':  # Windows
            # Listar processos Node.js
            result = subprocess.run(
                ["tasklist", "/FI", "IMAGENAME eq node.exe", "/FO", "CSV"],
                capture_output=True,
                text=True
            )
            
            if "node.exe" in result.stdout:
                # Matar processos Node.js
                subprocess.run(["taskkill", "/F", "/IM", "node.exe"], check=True)
                print("Processos Node.js encerrados com sucesso.")
            else:
                print("Nenhum processo Node.js encontrado.")
                
        else:  # Linux/Mac
            # Listar processos Node.js
            result = subprocess.run(
                ["pgrep", "node"],
                capture_output=True,
                text=True
            )
            
            if result.stdout:
                # Matar processos Node.js
                subprocess.run(["pkill", "-9", "node"], check=True)
                print("Processos Node.js encerrados com sucesso.")
            else:
                print("Nenhum processo Node.js encontrado.")
                
        # Aguardar um momento para garantir que os processos foram encerrados
        time.sleep(1)
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Erro ao matar processos Node.js: {e}")
        return False
    except Exception as e:
        print(f"Erro: {e}")
        return False

if __name__ == "__main__":
    kill_node_processes()