#!/usr/bin/env python3
"""
Script para verificar se a porta está em uso e, se estiver, matar o processo
"""
import os
import subprocess
import sys
import time

def check_port(port=8888):
    """Verifica se a porta está em uso e, se estiver, mata o processo"""
    print(f"Verificando se a porta {port} está em uso...")
    
    try:
        if os.name == 'nt':  # Windows
            # Verificar se a porta está em uso
            result = subprocess.run(
                ["netstat", "-ano", "|", "findstr", f":{port}"],
                shell=True,
                capture_output=True,
                text=True
            )
            
            if "LISTENING" in result.stdout:
                print(f"Porta {port} está em uso.")
                
                # Extrair PID do processo
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    if f":{port}" in line and "LISTENING" in line:
                        parts = line.strip().split()
                        pid = parts[-1]
                        print(f"Processo com PID {pid} está usando a porta {port}.")
                        
                        # Matar o processo
                        try:
                            subprocess.run(["taskkill", "/F", "/PID", pid], check=True)
                            print(f"Processo com PID {pid} foi encerrado.")
                            return True
                        except subprocess.CalledProcessError:
                            print(f"Não foi possível encerrar o processo com PID {pid}.")
                            return False
            else:
                print(f"Porta {port} está livre.")
                return True
                
        else:  # Linux/Mac
            # Verificar se a porta está em uso
            result = subprocess.run(
                ["lsof", "-i", f":{port}"],
                capture_output=True,
                text=True
            )
            
            if result.stdout:
                print(f"Porta {port} está em uso.")
                
                # Extrair PID do processo
                lines = result.stdout.strip().split('\n')
                if len(lines) > 1:  # Pular o cabeçalho
                    parts = lines[1].split()
                    pid = parts[1]
                    print(f"Processo com PID {pid} está usando a porta {port}.")
                    
                    # Matar o processo
                    try:
                        subprocess.run(["kill", "-9", pid], check=True)
                        print(f"Processo com PID {pid} foi encerrado.")
                        return True
                    except subprocess.CalledProcessError:
                        print(f"Não foi possível encerrar o processo com PID {pid}.")
                        return False
            else:
                print(f"Porta {port} está livre.")
                return True
                
    except Exception as e:
        print(f"Erro ao verificar porta: {e}")
        return False

if __name__ == "__main__":
    port = 8888
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Porta inválida. Usando porta padrão 8888.")
    
    check_port(port)