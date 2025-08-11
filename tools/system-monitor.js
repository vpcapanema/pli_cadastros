/**
 * Monitor de Recursos do Sistema para PLI Cadastros
 *
 * Este script cria um servidor web simples que exibe informações
 * de recursos do sistema em tempo real.
 */

const http = require('http');
const os = require('os');

// Porta para o servidor de monitoramento
const PORT = 8887;

// Função para formatar bytes em unidades legíveis
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Função para obter uso de CPU
function getCpuUsage(callback) {
  const startMeasure = os.cpus().map((cpu) => {
    return {
      idle: cpu.times.idle,
      total: Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0),
    };
  });

  setTimeout(() => {
    const endMeasure = os.cpus().map((cpu) => {
      return {
        idle: cpu.times.idle,
        total: Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0),
      };
    });

    const cpuUsages = startMeasure.map((start, i) => {
      const end = endMeasure[i];
      const idleDiff = end.idle - start.idle;
      const totalDiff = end.total - start.total;
      const usagePercent = 100 - Math.round((100 * idleDiff) / totalDiff);
      return usagePercent;
    });

    callback(cpuUsages);
  }, 100);
}

// Função para criar o HTML da página de monitoramento
function createMonitorPage(cpuUsage, memInfo, processInfo) {
  return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PLI Cadastros - Monitor de Sistema</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                color: #333;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                padding: 20px;
            }
            h1 {
                color: #0066cc;
                text-align: center;
                margin-bottom: 30px;
            }
            .card {
                background: white;
                border-radius: 8px;
                box-shadow: 0 1px 5px rgba(0,0,0,0.1);
                padding: 15px;
                margin-bottom: 20px;
            }
            .card h2 {
                margin-top: 0;
                color: #444;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
            }
            .progress-container {
                height: 24px;
                background-color: #e9ecef;
                border-radius: 5px;
                margin-bottom: 15px;
                position: relative;
            }
            .progress-bar {
                height: 100%;
                border-radius: 5px;
                background-color: #0066cc;
                width: 0;
                transition: width 1s;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }
            .progress-bar.warning {
                background-color: #ffc107;
            }
            .progress-bar.danger {
                background-color: #dc3545;
            }
            .system-info {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
            }
            .refresh {
                text-align: center;
                margin-top: 20px;
                color: #666;
            }
            .cpu-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 10px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            table th, table td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            table th {
                background-color: #f2f2f2;
            }
            .auto-refresh {
                display: flex;
                justify-content: center;
                margin: 20px 0;
            }
            button {
                background-color: #0066cc;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            button:hover {
                background-color: #0055b3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>PLI Cadastros - Monitor de Sistema</h1>
            
            <div class="auto-refresh">
                <button onclick="toggleRefresh()" id="refreshBtn">Iniciar Atualização Automática</button>
            </div>
            
            <div class="system-info">
                <div class="card">
                    <h2>Uso de Memória</h2>
                    <div class="progress-container">
                        <div class="progress-bar ${
                          memInfo.usagePercent > 80
                            ? 'danger'
                            : memInfo.usagePercent > 60
                              ? 'warning'
                              : ''
                        }" 
                             style="width: ${memInfo.usagePercent}%">
                            ${memInfo.usagePercent}%
                        </div>
                    </div>
                    <p>Total: ${memInfo.total}</p>
                    <p>Livre: ${memInfo.free}</p>
                    <p>Usada: ${memInfo.used}</p>
                </div>
                
                <div class="card">
                    <h2>Informações do Sistema</h2>
                    <p><strong>Sistema Operacional:</strong> ${os.type()} ${os.release()}</p>
                    <p><strong>Hostname:</strong> ${os.hostname()}</p>
                    <p><strong>Uptime:</strong> ${Math.floor(os.uptime() / 3600)} horas, ${Math.floor(
                      (os.uptime() % 3600) / 60
                    )} minutos</p>
                    <p><strong>Arquitetura:</strong> ${os.arch()}</p>
                    <p><strong>Número de CPUs:</strong> ${os.cpus().length}</p>
                </div>
                
                <div class="card">
                    <h2>Processo Node.js</h2>
                    <p><strong>PID:</strong> ${process.pid}</p>
                    <p><strong>Memória RSS:</strong> ${processInfo.rss}</p>
                    <p><strong>Heap Total:</strong> ${processInfo.heapTotal}</p>
                    <p><strong>Heap Usado:</strong> ${processInfo.heapUsed}</p>
                    <p><strong>Heap Externo:</strong> ${processInfo.external}</p>
                    <p><strong>Tempo de Atividade:</strong> ${Math.floor(process.uptime() / 60)} minutos</p>
                </div>
            </div>
            
            <div class="card">
                <h2>Uso de CPU</h2>
                <div class="cpu-grid">
                    ${cpuUsage
                      .map(
                        (usage, index) => `
                        <div>
                            <p>Core ${index}</p>
                            <div class="progress-container">
                                <div class="progress-bar ${usage > 80 ? 'danger' : usage > 60 ? 'warning' : ''}" 
                                     style="width: ${usage}%">
                                    ${usage}%
                                </div>
                            </div>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </div>
            
            <p class="refresh">Última atualização: ${new Date().toLocaleString()}</p>
        </div>

        <script>
            let refreshInterval;
            let isRefreshing = false;
            
            function toggleRefresh() {
                const btn = document.getElementById('refreshBtn');
                
                if (isRefreshing) {
                    clearInterval(refreshInterval);
                    btn.textContent = 'Iniciar Atualização Automática';
                    isRefreshing = false;
                } else {
                    refreshInterval = setInterval(() => {
                        location.reload();
                    }, 3000);
                    btn.textContent = 'Parar Atualização Automática';
                    isRefreshing = true;
                }
            }
        </script>
    </body>
    </html>
    `;
}

// Criar o servidor HTTP
const server = http.createServer((req, res) => {
  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }

  getCpuUsage((cpuUsage) => {
    const memInfo = {
      total: formatBytes(os.totalmem()),
      free: formatBytes(os.freemem()),
      used: formatBytes(os.totalmem() - os.freemem()),
      usagePercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
    };

    const processInfo = {
      rss: formatBytes(process.memoryUsage().rss),
      heapTotal: formatBytes(process.memoryUsage().heapTotal),
      heapUsed: formatBytes(process.memoryUsage().heapUsed),
      external: formatBytes(process.memoryUsage().external || 0),
    };

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(createMonitorPage(cpuUsage, memInfo, processInfo));
  });
});

// Iniciar o servidor
server.listen(PORT, () => {
  console.log(`
    =====================================================================
    🔍 PLI Cadastros - Monitor de Sistema iniciado em http://localhost:${PORT}
    =====================================================================
    
    Pressione CTRL+C para encerrar o monitor.
    `);
});
