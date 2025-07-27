// Logger utilitário para logs detalhados no terminal
const fs = require('fs');
const path = require('path');

const LOG_LEVELS = ['info', 'warn', 'error', 'debug'];
const LOG_FILE = path.join(__dirname, '../../logs/pli.log');

function log(level, message, meta = {}) {
    if (!LOG_LEVELS.includes(level)) level = 'info';
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] [${level.toUpperCase()}] ${message}` + (Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '');
    // Log no terminal
    if (level === 'error') {
        console.error(logMsg);
    } else if (level === 'warn') {
        console.warn(logMsg);
    } else if (level === 'debug') {
        console.debug ? console.debug(logMsg) : console.log(logMsg);
    } else {
        console.log(logMsg);
    }
    // Log em arquivo
    fs.appendFile(LOG_FILE, logMsg + '\n', err => {
        if (err) console.error(`[LOGGER] Falha ao gravar log: ${err.message}`);
    });
}

module.exports = {
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta),
    debug: (msg, meta) => log('debug', msg, meta),
    log
};
