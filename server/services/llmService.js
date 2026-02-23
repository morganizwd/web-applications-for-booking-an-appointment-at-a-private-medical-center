const OpenAI = require('openai');
const axios = require('axios');

class LLMService {
    constructor() {
        this.client = null;
        this.useOllama = process.env.USE_OLLAMA === 'true';
        this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        this.ollamaModel = process.env.OLLAMA_MODEL || 'gemma3:4b';
        this.initialize();
    }

    initialize() {
        // Если используется Ollama, не инициализируем OpenAI клиент
        if (this.useOllama) {
            console.log(`Используется Ollama: ${this.ollamaUrl}, модель: ${this.ollamaModel}`);
            return;
        }

        // Поддержка как локального, так и внешнего API
        const apiKey = process.env.OPENAI_API_KEY;
        const apiBase = process.env.LLM_API_BASE || 'https://api.openai.com/v1';
        
        if (apiKey) {
            this.client = new OpenAI({
                apiKey: apiKey,
                baseURL: apiBase,
            });
            console.log(`Используется OpenAI API: ${apiBase}`);
        } else {
            console.warn('LLM API ключ не настроен. Используется режим без LLM.');
        }
    }

    async generateResponse(query, contextChunks, serviceId = null) {
        // Проверка доступности сервиса
        if (!this.useOllama && !this.client) {
            return {
                answer: 'Консультант временно недоступен. Пожалуйста, обратитесь к администратору или врачу.',
                sources: [],
            };
        }

        try {
            const context = contextChunks
                .map((chunk, index) => `[Источник ${index + 1}]\n${chunk.content}`)
                .join('\n\n');

            const systemPrompt = `Ты - консультант медицинского центра. Твоя задача - отвечать на вопросы пациентов о регламентах клиники, подготовке к услугам и общих условиях.

ВАЖНО:
- Отвечай ТОЛЬКО на основе предоставленного контекста
- НЕ ставь диагнозы и НЕ назначай лечение
- Если информации недостаточно, рекомендовай обратиться к врачу или администратору
- Будь вежливым и профессиональным
- Указывай источники информации

Контекст:
${context}`;

            let answer;

            // Использование Ollama
            if (this.useOllama) {
                try {
                    // Формируем промпт для Ollama (он не поддерживает system/user роли напрямую)
                    const fullPrompt = `${systemPrompt}\n\nВопрос пациента: ${query}\n\nОтвет:`;

                    const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
                        model: this.ollamaModel,
                        prompt: fullPrompt,
                        stream: false,
                        options: {
                            temperature: 0.7,
                            num_predict: 500, // аналог max_tokens
                        },
                    }, {
                        timeout: 60000, // 60 секунд таймаут
                    });

                    if (response.data && response.data.response) {
                        answer = response.data.response.trim();
                    } else {
                        throw new Error('Неверный формат ответа от Ollama');
                    }
                } catch (error) {
                    console.error('Ошибка запроса к Ollama:', error.message);
                    return {
                        answer: 'Произошла ошибка при обращении к консультанту. Пожалуйста, попробуйте позже или обратитесь к администратору.',
                        sources: [],
                    };
                }
            } else {
                // Использование OpenAI API
                const completion = await this.client.chat.completions.create({
                    model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: query },
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                });

                answer = completion.choices[0].message.content;
            }

            return {
                answer,
                sources: contextChunks.map(chunk => ({
                    documentId: chunk.documentId,
                    documentTitle: chunk.documentTitle,
                    serviceId: chunk.serviceId,
                    chunkIndex: chunk.chunkIndex,
                })),
            };
        } catch (error) {
            console.error('Ошибка генерации ответа LLM:', error);
            return {
                answer: 'Произошла ошибка при генерации ответа. Пожалуйста, попробуйте позже или обратитесь к администратору.',
                sources: [],
            };
        }
    }
}

module.exports = new LLMService();
