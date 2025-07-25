/**
 * API Service - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Serviço para comunicação com a API do sistema
 */

const API = {
    /**
     * URL base da API
     */
    baseUrl: '/api',

    /**
     * Realiza uma requisição GET
     * @param {string} endpoint - Endpoint da API
     * @param {Object} params - Parâmetros da requisição
     * @returns {Promise} - Promise com o resultado da requisição
     */
    async get(endpoint, params = {}) {
        try {
            const url = new URL(`${window.location.origin}${this.baseUrl}${endpoint}`);
            
            // Adiciona os parâmetros à URL
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key]);
            });
            
            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao realizar requisição');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro na requisição GET:', error);
            throw error;
        }
    },

    /**
     * Realiza uma requisição POST
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados a serem enviados
     * @returns {Promise} - Promise com o resultado da requisição
     */
    async post(endpoint, data = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const token = localStorage.getItem('token');
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao realizar requisição');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro na requisição POST:', error);
            throw error;
        }
    },

    /**
     * Realiza uma requisição PUT
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados a serem enviados
     * @returns {Promise} - Promise com o resultado da requisição
     */
    async put(endpoint, data = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const token = localStorage.getItem('token');
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao realizar requisição');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro na requisição PUT:', error);
            throw error;
        }
    },

    /**
     * Realiza uma requisição DELETE
     * @param {string} endpoint - Endpoint da API
     * @returns {Promise} - Promise com o resultado da requisição
     */
    async delete(endpoint) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const token = localStorage.getItem('token');
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao realizar requisição');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro na requisição DELETE:', error);
            throw error;
        }
    }
};