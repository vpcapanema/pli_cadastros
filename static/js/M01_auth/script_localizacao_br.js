/* Script LocalizacaoBR adaptado para PLI-CADASTRO (fallback para static JSONs) */

class LocalizacaoBRManager {
    constructor() {
        this.ufs = [];
        this.municipios = {};
        this.initialized = false;
    }

    async carregarUFs() {
        // Tenta endpoint da API, se falhar usa arquivo static/local
        try {
            const response = await fetch('/api/v1/localizacao/ufs');
            if (response.ok) {
                const data = await response.json();
                this.ufs = data.ufs;
                console.log(`✅ ${data.total} UFs carregados via API`);
                return true;
            }
        } catch (e) {
            console.warn('⚠️ Falha ao carregar UFs via API, tentando fallback estático', e);
        }

        // Fallback para arquivo estático
        try {
            const response = await fetch('/static/data/estados-br.json');
            if (!response.ok) throw new Error('Arquivo estados-br.json não encontrado');
            const data = await response.json();
            this.ufs = data;
            console.log(`✅ ${this.ufs.length} UFs carregados via static file`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao carregar UFs (fallback):', error);
            return false;
        }
    }

    async carregarMunicipios(uf) {
        uf = uf.toUpperCase().trim();

        if (this.municipios[uf]) return this.municipios[uf];

        // Tenta API
        try {
            const response = await fetch(`/api/v1/localizacao/municipios/${uf}`);
            if (response.ok) {
                const data = await response.json();
                this.municipios[uf] = data.municipios;
                console.log(`✅ ${data.total} municípios de ${uf} carregados via API`);
                return this.municipios[uf];
            }
        } catch (e) {
            console.warn(`⚠️ Falha ao carregar municípios de ${uf} via API, tentando fallback`, e);
        }

        // Fallback para arquivos estáticos (/static/data/municipios-<uf>.json)
        try {
            const response = await fetch(`/static/data/municipios-${uf.toLowerCase()}.json`);
            if (!response.ok) throw new Error('Arquivo de municípios não encontrado');
            const data = await response.json();
            this.municipios[uf] = data;
            console.log(`✅ ${data.length} municípios de ${uf} carregados via static file`);
            return this.municipios[uf];
        } catch (error) {
            console.error(`❌ Erro ao carregar municípios de ${uf} (fallback):`, error);
            return [];
        }
    }

    async preencherSelectUFs(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return false;

        if (this.ufs.length === 0) {
            const success = await this.carregarUFs();
            if (!success) return false;
        }

        while (select.options.length > 1) select.remove(1);

        this.ufs.forEach((uf) => {
            const option = document.createElement('option');
            option.value = uf.sigla || uf.sigla;
            option.textContent = `${uf.sigla || uf.sigla} - ${uf.nome || uf.nome}`;
            select.appendChild(option);
        });

        console.log(`✅ Select #${selectId} preenchido com ${this.ufs.length} UFs`);
        return true;
    }

    async preencherSelectMunicipios(ufSelectId, municipioSelectId) {
        const ufSelect = document.getElementById(ufSelectId);
        const municipioSelect = document.getElementById(municipioSelectId);

        if (!ufSelect || !municipioSelect) return false;

        ufSelect.addEventListener('change', async (e) => {
            const ufSelecionado = e.target.value;

            while (municipioSelect.options.length > 1) municipioSelect.remove(1);

            if (!ufSelecionado) {
                municipioSelect.disabled = true;
                return;
            }

            municipioSelect.disabled = true;
            municipioSelect.innerHTML = '<option value="">Carregando municípios...</option>';

            const municipios = await this.carregarMunicipios(ufSelecionado);
            if (!municipios || municipios.length === 0) {
                municipioSelect.innerHTML = '<option value="">Municípios não disponíveis</option>';
                municipioSelect.disabled = true;
                return;
            }

            municipioSelect.innerHTML = '<option value="">Selecione o Município</option>';
            municipios.forEach((mun) => {
                const option = document.createElement('option');
                option.value = mun.codigo_ibge || mun.id || mun.nome;
                option.textContent = mun.nome;
                municipioSelect.appendChild(option);
            });

            municipioSelect.disabled = false;
            console.log(`✅ Municípios de ${ufSelecionado} carregados`);
        });

        return true;
    }

    async inicializar(ufSelectIds = [], linkMunicipios = []) {
        if (this.initialized) return true;

        const success = await this.carregarUFs();
        if (!success) {
            console.warn('⚠️ Falha ao carregar UFs');
            return false;
        }

        for (const selectId of ufSelectIds) await this.preencherSelectUFs(selectId);
        for (const link of linkMunicipios) await this.preencherSelectMunicipios(link.ufSelectId, link.municipioSelectId);

        this.initialized = true;
        console.log('✅ LocalizacaoBRManager inicializado (PLI-CADASTRO)');
        return true;
    }
}

window.localizacaoBR = new LocalizacaoBRManager();

console.log('✅ script_localizacao_br.js carregado com sucesso (PLI-CADASTRO)');
if (window.localizacaoBR) console.log('✅ window.localizacaoBR está disponível (PLI-CADASTRO)');
