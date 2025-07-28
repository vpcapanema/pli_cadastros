#!/usr/bin/env python3
"""
Script para reiniciar o servidor PLI Cadastros
- Mata todos os processos Node.js
- Verifica se as portas estão livres
- Inicia o servidor na porta 8888
"""
import os
import subprocess
import sys
import time
import signal

def print_banner():
    """Imprime banner do script"""
    print("=" * 60)
    print("🚀 SIGMA-PLI | Reiniciador do Servidor")
    print("=" * 60)

def kill_node_processes():
    """Mata todos os processos Node.js em execução"""
    print("🔥 Matando processos Node.js...")
    
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
                print("✅ Processos Node.js encerrados com sucesso.")
            else:
                print("ℹ️  Nenhum processo Node.js encontrado.")
                
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
                print("✅ Processos Node.js encerrados com sucesso.")
            else:
                print("ℹ️  Nenhum processo Node.js encontrado.")
                
        # Aguardar um momento para garantir que os processos foram encerrados
        time.sleep(2)
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao matar processos Node.js: {e}")
        return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def check_port_free(port):
    """Verifica se a porta está livre (ignora conexões TIME_WAIT)"""
    print(f"🔍 Verificando porta {port}...")
    
    try:
        if os.name == 'nt':  # Windows
            result = subprocess.run(
                ["netstat", "-ano"],
                capture_output=True,
                text=True
            )
            
            # Verificar se há processos LISTENING na porta (ignora TIME_WAIT)
            lines = result.stdout.split('\n')
            listening = False
            for line in lines:
                if f":{port}" in line and "LISTENING" in line:
                    listening = True
                    break
            
            if listening:
                print(f"⚠️  Porta {port} está sendo usado por um processo ativo")
                return False
            else:
                print(f"✅ Porta {port} está livre (ignorando conexões TIME_WAIT)")
                return True
        else:  # Linux/Mac
            result = subprocess.run(
                ["lsof", "-i", f":{port}"],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print(f"⚠️  Porta {port} ainda está em uso")
                return False
            else:
                print(f"✅ Porta {port} está livre")
                return True
                
    except Exception as e:
        print(f"❌ Erro ao verificar porta {port}: {e}")
        return False

def install_dependencies():
    """Instala dependências do Node.js se necessário"""
    if not os.path.exists("node_modules"):
        print("📦 Instalando dependências...")
        try:
            subprocess.run(["npm", "install"], check=True)
            print("✅ Dependências instaladas com sucesso")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Erro ao instalar dependências: {e}")
            return False
    else:
        print("✅ Dependências já instaladas")
        return True

def start_server():
    """Inicia o servidor Node.js"""
    print("🚀 Iniciando servidor na porta 8888...")
    
    try:
        # Verificar se existe package.json
        if not os.path.exists("package.json"):
            print("❌ Arquivo package.json não encontrado!")
            return None
            
        # Verificar se existe server.js
        if not os.path.exists("server.js"):
            print("❌ Arquivo server.js não encontrado!")
            return None
            
        # Instalar dependências se necessário
        if not install_dependencies():
            return None
            
        # Iniciar servidor
        print("🎯 Executando: node server.js")
        process = subprocess.Popen(
            ["node", "server.js"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # Aguardar um momento para o servidor iniciar
        time.sleep(3)
        
        # Verificar se o processo ainda está rodando
        if process.poll() is None:
            print("✅ Servidor iniciado com sucesso!")
            print("🌐 Acesse: http://localhost:8888")
            print("📱 Dashboard: http://localhost:8888/dashboard.html")
            print("🏠 Página inicial: http://localhost:8888/index.html")
            print("\n⚠️  Pressione Ctrl+C para parar o servidor")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Erro ao iniciar servidor:")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return None
            
    except FileNotFoundError:
        print("❌ Node.js não encontrado! Instale o Node.js primeiro.")
        return None
    except Exception as e:
        print(f"❌ Erro ao iniciar servidor: {e}")
        return None

def signal_handler(signum, frame):
    """Handler para sinais de interrupção"""
    print("\n\n🛑 Interrompido pelo usuário")
    print("🔥 Matando processos Node.js...")
    kill_node_processes()
    sys.exit(0)

def main():
    """Função principal"""
    print_banner()
    
    # Configurar handler para Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Passo 1: Matar processos Node.js existentes
        if not kill_node_processes():
            print("⚠️  Continuando mesmo com erro ao matar processos...")
        
        # Passo 2: Verificar se a porta 8888 está livre
        max_attempts = 5
        attempt = 0
        
        while attempt < max_attempts:
            if check_port_free(8888):
                break
            else:
                attempt += 1
                if attempt < max_attempts:
                    print(f"⏳ Tentativa {attempt}/{max_attempts} - Aguardando porta ficar livre...")
                    time.sleep(2)
                else:
                    print("❌ Porta 8888 ainda não está livre após várias tentativas")
                    print("💡 Tente executar novamente ou verifique processos manualmente")
                    return False
        
        # Passo 3: Iniciar servidor
        server_process = start_server()
        
        if server_process:
            try:
                # Manter o script rodando e monitorar o servidor
                while True:
                    # Verificar se o processo ainda está rodando
                    if server_process.poll() is not None:
                        print("❌ Servidor parou inesperadamente!")
                        stdout, stderr = server_process.communicate()
                        print(f"STDOUT: {stdout}")
                        print(f"STDERR: {stderr}")
                        break
                    
                    time.sleep(1)
                    
            except KeyboardInterrupt:
                print("\n🛑 Parando servidor...")
                server_process.terminate()
                time.sleep(2)
                if server_process.poll() is None:
                    server_process.kill()
                print("✅ Servidor parado")
        else:
            print("❌ Falha ao iniciar servidor")
            return False
            
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main()
