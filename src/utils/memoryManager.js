/**
 * Utilitário para Prevenção de Memory Leaks - SIGMA-PLI
 * Monitora e limpa recursos para evitar vazamentos de memória
 */

class MemoryManager {
    constructor() {
        this.intervals = new Set();
        this.timeouts = new Set();
        this.listeners = new Map();
        this.connections = new Set();
    }

    /**
     * Registra um interval para limpeza automática
     */
    registerInterval(intervalId) {
        this.intervals.add(intervalId);
        return intervalId;
    }

    /**
     * Registra um timeout para limpeza automática
     */
    registerTimeout(timeoutId) {
        this.timeouts.add(timeoutId);
        return timeoutId;
    }

    /**
     * Registra um event listener para remoção automática
     */
    registerListener(element, event, callback) {
        const key = `${element}-${event}`;
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
        element.addEventListener(event, callback);
    }

    /**
     * Registra uma conexão de banco para fechamento automático
     */
    registerConnection(connection) {
        this.connections.add(connection);
        return connection;
    }

    /**
     * Limpa todos os recursos registrados
     */
    cleanup() {
        // Limpar intervals
        this.intervals.forEach(id => {
            clearInterval(id);
        });
        this.intervals.clear();

        // Limpar timeouts
        this.timeouts.forEach(id => {
            clearTimeout(id);
        });
        this.timeouts.clear();

        // Remover event listeners
        this.listeners.forEach((callbacks, key) => {
            const [element, event] = key.split('-');
            callbacks.forEach(callback => {
                if (element && element.removeEventListener) {
                    element.removeEventListener(event, callback);
                }
            });
        });
        this.listeners.clear();

        // Fechar conexões
        this.connections.forEach(connection => {
            if (connection && typeof connection.close === 'function') {
                connection.close();
            } else if (connection && typeof connection.end === 'function') {
                connection.end();
            }
        });
        this.connections.clear();
    }

    /**
     * Monitora uso de memória
     */
    monitorMemory() {
        if (typeof process !== 'undefined') {
            const used = process.memoryUsage();
            const memoryReport = {
                timestamp: new Date().toISOString(),
                rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
                heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
                heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
                external: Math.round(used.external / 1024 / 1024 * 100) / 100
            };

            // Alertar se o uso de memória estiver alto
            if (memoryReport.heapUsed > 500) { // 500MB
                console.warn('⚠️ Alto uso de memória detectado:', memoryReport);
            }

            return memoryReport;
        }
        return null;
    }

    /**
     * Força garbage collection (se disponível)
     */
    forceGC() {
        if (typeof global !== 'undefined' && global.gc) {
            global.gc();
            console.log('🧹 Garbage collection executado');
        }
    }
}

// Instância global para uso em toda a aplicação
const memoryManager = new MemoryManager();

// Limpeza automática ao encerrar a aplicação
if (typeof process !== 'undefined') {
    process.on('exit', () => {
        memoryManager.cleanup();
    });

    process.on('SIGINT', () => {
        memoryManager.cleanup();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        memoryManager.cleanup();
        process.exit(0);
    });
}

// Monitoramento periódico de memória (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
    memoryManager.registerInterval(
        setInterval(() => {
            memoryManager.monitorMemory();
        }, 30000) // A cada 30 segundos
    );
}

module.exports = { MemoryManager, memoryManager };
