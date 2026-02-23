const { pipeline } = require('@xenova/transformers');
const axios = require('axios');

class EmbeddingService {
    constructor() {
        this.model = null;
        this.modelName = 'Xenova/all-MiniLM-L6-v2'; // Лёгкая модель для embeddings
        this.useOllama = process.env.USE_OLLAMA === 'true';
        this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        this.ollamaEmbeddingModel = process.env.OLLAMA_EMBEDDING_MODEL || 'embeddinggemma';
    }

    async initialize() {
        // Если используется Ollama, не инициализируем локальную модель
        if (this.useOllama) {
            return null;
        }

        if (!this.model) {
            try {
                this.model = await pipeline('feature-extraction', this.modelName);
            } catch (error) {
                console.error('Ошибка инициализации модели embeddings:', error);
                throw error;
            }
        }
        return this.model;
    }

    async generateEmbedding(text) {
        try {
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                throw new Error('Текст для генерации embedding не может быть пустым');
            }

            // Использование Ollama API
            if (this.useOllama) {
                try {
                    // Пробуем разные форматы запроса к Ollama
                    let response;
                    // Для embedding моделей Ollama использует поле 'input', а не 'prompt'
                    try {
                        // Формат 1: с полем 'input' (стандартный для embedding моделей)
                        response = await axios.post(`${this.ollamaUrl}/api/embed`, {
                            model: this.ollamaEmbeddingModel,
                            input: text,
                        }, {
                            timeout: 30000,
                        });
                    } catch (err) {
                        // Формат 2: с полем 'prompt' (для совместимости)
                        try {
                            response = await axios.post(`${this.ollamaUrl}/api/embed`, {
                                model: this.ollamaEmbeddingModel,
                                prompt: text,
                            }, {
                                timeout: 30000,
                            });
                        } catch (err2) {
                            throw err; // Бросаем первую ошибку
                        }
                    }

                    // Проверяем разные форматы ответа от Ollama
                    if (response && response.data) {
                        // Формат 1: { embeddings: [[...]] } (множественное число, массив массивов) - стандартный формат Ollama
                        if (response.data.embeddings && Array.isArray(response.data.embeddings)) {
                            // Если это массив массивов (внешний массив содержит один элемент - сам embedding)
                            if (response.data.embeddings.length > 0 && Array.isArray(response.data.embeddings[0])) {
                                return response.data.embeddings[0];
                            }
                            // Если это просто массив чисел (прямой embedding)
                            if (response.data.embeddings.length > 0 && typeof response.data.embeddings[0] === 'number') {
                                return response.data.embeddings;
                            }
                        }
                        // Формат 2: { embedding: [...] } (единственное число)
                        if (response.data.embedding && Array.isArray(response.data.embedding) && response.data.embedding.length > 0) {
                            return response.data.embedding;
                        }
                        // Формат 3: массив напрямую
                        if (Array.isArray(response.data) && response.data.length > 0) {
                            // Проверяем, не является ли это массивом массивов
                            if (Array.isArray(response.data[0])) {
                                return response.data[0];
                            }
                            return response.data;
                        }
                        // Формат 4: { data: [...] }
                        if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                            return response.data.data;
                        }
                    }
                    
                    console.warn('Неожиданный формат ответа от Ollama:', JSON.stringify(response?.data || {}).substring(0, 200));
                    throw new Error('Неверный формат ответа от Ollama или пустой массив embeddings');
                } catch (error) {
                    console.error('Ошибка запроса к Ollama:', error.message);
                    if (error.response) {
                        console.error('Статус:', error.response.status);
                        console.error('Данные:', JSON.stringify(error.response.data).substring(0, 200));
                    }
                    // Fallback на локальную модель при ошибке Ollama
                    console.log('Переключение на локальную модель embeddings...');
                    // Временно отключаем Ollama для этого запроса
                    const originalUseOllama = this.useOllama;
                    this.useOllama = false;
                    try {
                        const result = await this.generateEmbeddingLocal(text);
                        this.useOllama = originalUseOllama;
                        return result;
                    } catch (localError) {
                        this.useOllama = originalUseOllama;
                        throw localError;
                    }
                }
            }

            // Использование локальной модели
            return await this.generateEmbeddingLocal(text);
        } catch (error) {
            console.error('Ошибка генерации embedding:', error);
            throw error;
        }
    }

    async generateEmbeddingLocal(text) {
        // Убеждаемся, что модель инициализирована
        if (!this.model) {
            await this.initialize();
        }
        
        if (!this.model) {
            throw new Error('Не удалось инициализировать модель embeddings. Проверьте, что USE_OLLAMA=false или Ollama работает корректно.');
        }
        
        const output = await this.model(text, {
            pooling: 'mean',
            normalize: true,
        });

        // Преобразование в массив чисел
        const embedding = Array.from(output.data);
        return embedding;
    }

    async generateEmbeddings(texts) {
        try {
            await this.initialize();
            const embeddings = [];

            for (const text of texts) {
                const embedding = await this.generateEmbedding(text);
                embeddings.push(embedding);
            }

            return embeddings;
        } catch (error) {
            console.error('Ошибка генерации embeddings:', error);
            throw error;
        }
    }
}

module.exports = new EmbeddingService();
