import os
import subprocess
import webbrowser
import sys

PORT=3000

def create_and_activate_venv():
    if not os.path.exists(".venv"):
        subprocess.run([sys.executable, "-m", "venv", ".venv"])
    activate_script = os.path.join(".venv", "Scripts", "activate")
    return activate_script

def find_npm():
    # Tenta encontrar o caminho do npm
    for path in os.environ["PATH"].split(os.pathsep):
        npm_path = os.path.join(path, "npm.cmd")
        if os.path.exists(npm_path):
            return npm_path
    return None

def start_backend():
    npm_cmd = find_npm()
    if not npm_cmd:
        print("Erro: npm não encontrado no PATH. Instale o Node.js e garanta que o npm está disponível.")
        return None
    # Instala dependências e inicia backend no diretório correto
    backend_dir = os.path.join(os.getcwd(), "backend")
    subprocess.run([npm_cmd, "install"], cwd=backend_dir)
    backend_proc = subprocess.Popen([npm_cmd, "start"], cwd=backend_dir)
    return backend_proc

def start_frontend():
    # Inicia servidor frontend servindo todos os arquivos estáticos
    os.chdir("frontend")
    frontend_proc = subprocess.Popen([sys.executable, "-m", "http.server", "8080"])
    os.chdir("..")
    return frontend_proc

def open_dashboard():
    webbrowser.open("http://localhost:8080/dashboard.html")

def open_cadastro():
    webbrowser.open("http://localhost:8080/pessoa-fisica.html")

if __name__ == "__main__":
    print("Criando e ativando ambiente virtual...")
    activate_script = create_and_activate_venv()
    print(f"Ative o ambiente virtual com: {activate_script}")
    print("Iniciando backend...")
    start_backend()
    print("Iniciando frontend...")
    start_frontend()
    print("Abrindo dashboard...")
    open_dashboard()