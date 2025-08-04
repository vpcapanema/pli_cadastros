/**
 * Script para gerar automaticamente o mapa de rotas
 * Este script analisa o server.js e extrai todas as rotas registradas
 */

const fs = require('fs');
const path = require('path');
const logger = require('../src/utils/logger');

// Configurações
const SERVER_FILE = path.join(__dirname, '..', 'server.js');
const OUTPUT_FILE = path.join(__dirname, '..', 'static', 'data', 'routes-map.json');

// Expressões regulares para detectar rotas
const API_ROUTE_REGEX = /app\.(?:use|get|post|put|delete|patch)\(['"]\/api\/([^'"]+)['"]/g;
const PAGE_ROUTE_REGEX = /app\.get\(['"]\/pages\/([^'"]+)['"]/g;
const TEMPLATE_ROUTE_REGEX = /app\.get\(['"]\/templates\/([^'"]+)['"]/g;
const SPECIAL_ROUTE_REGEX = /app\.get\(['"]\/([^'"]+)['"]/g;
const FILE_PATH_REGEX = /path\.join\(__dirname,\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"]/g;
const REQUIRE_ROUTE_REGEX = /require\(['"]\.\/src\/routes\/([^'"]+)['"]\)/g;

/**
 * Extrai as rotas do arquivo do servidor
 */
function extractRoutes() {
    try {
        // Ler o arquivo do servidor
        const serverContent = fs.readFileSync(SERVER_FILE, 'utf8');
        
        // Inicializar estrutura de dados para as rotas
        const routes = {
            apiRoutes: [],
            pageRoutes: [],
            templateRoutes: [],
            specialRoutes: [],
            lastUpdated: new Date().toISOString()
        };
        
        // Coletar rotas de API
        let match;
        const apiRouteMatches = serverContent.matchAll(API_ROUTE_REGEX);
        for (const match of apiRouteMatches) {
            const path = '/api/' + match[1];
            const method = match[0].split('.')[1]; // get, post, etc.
            
            // Verificar se a rota usa um módulo externo
            let file = 'Handler interno';
            const requireMatches = Array.from(serverContent.matchAll(REQUIRE_ROUTE_REGEX));
            for (const reqMatch of requireMatches) {
                if (serverContent.includes(`app.use('${path}'`) || serverContent.includes(`app.use("${path}"`)) {
                    file = `./src/routes/${reqMatch[1]}.js`;
                    break;
                }
            }
            
            routes.apiRoutes.push({
                path,
                methods: [method.toUpperCase()],
                file,
                description: `Rota de API: ${path}`
            });
        }
        
        // Coletar rotas de páginas
        const pageRouteMatches = serverContent.matchAll(PAGE_ROUTE_REGEX);
        for (const match of pageRouteMatches) {
            const path = '/pages/' + match[1];
            
            // Encontrar o arquivo associado à rota
            const routeSection = serverContent.substring(match.index, match.index + 500);
            const filePathMatches = Array.from(routeSection.matchAll(FILE_PATH_REGEX));
            
            let file = 'Arquivo não encontrado';
            if (filePathMatches.length > 0) {
                file = `./${filePathMatches[0][1]}/${filePathMatches[0][2]}`;
            }
            
            routes.pageRoutes.push({
                path,
                methods: ['GET'],
                file,
                description: `Página HTML estática: ${path}`
            });
        }
        
        // Coletar rotas de templates
        const templateRouteMatches = serverContent.matchAll(TEMPLATE_ROUTE_REGEX);
        for (const match of templateRouteMatches) {
            const path = '/templates/' + match[1];
            
            routes.templateRoutes.push({
                path,
                methods: ['GET'],
                file: `./views/templates/${match[1]}.ejs`,
                description: `Template renderizado: ${path}`
            });
        }
        
        // Coletar rotas especiais
        const specialRouteMatches = serverContent.matchAll(SPECIAL_ROUTE_REGEX);
        for (const match of specialRouteMatches) {
            const path = '/' + match[1];
            
            // Ignorar rotas que já foram processadas
            if (path.startsWith('/api/') || path.startsWith('/pages/') || path.startsWith('/templates/')) {
                continue;
            }
            
            // Encontrar o arquivo associado à rota
            const routeSection = serverContent.substring(match.index, match.index + 500);
            const filePathMatches = Array.from(routeSection.matchAll(FILE_PATH_REGEX));
            
            let file = 'Handler interno';
            if (filePathMatches.length > 0) {
                file = `./${filePathMatches[0][1]}/${filePathMatches[0][2]}`;
            }
            
            routes.specialRoutes.push({
                path,
                methods: ['GET'],
                file,
                description: `Rota especial: ${path}`
            });
        }
        
        // Salvar dados
        saveRoutes(routes);
        return routes;
    } catch (error) {
        logger.error('Erro ao extrair rotas:', error);
        throw error;
    }
}

/**
 * Salva as rotas no arquivo JSON
 */
function saveRoutes(routes) {
    try {
        // Criar diretório de destino se não existir
        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Salvar arquivo JSON
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(routes, null, 2));
        logger.info(`Mapa de rotas atualizado em ${OUTPUT_FILE}`);
        
    } catch (error) {
        logger.error('Erro ao salvar rotas:', error);
        throw error;
    }
}

// Executar a extração se este arquivo for executado diretamente
if (require.main === module) {
    try {
        const routes = extractRoutes();
        logger.info('Extração de rotas concluída com sucesso!');
        logger.info(`Rotas encontradas: API: ${routes.apiRoutes.length}, Páginas: ${routes.pageRoutes.length}, Templates: ${routes.templateRoutes.length}, Especiais: ${routes.specialRoutes.length}`);
    } catch (error) {
        logger.error('Falha na extração de rotas:', error);
        process.exit(1);
    }
}

module.exports = { extractRoutes };
