const { KnowledgeDocument, KnowledgeChunk, KnowledgeEmbedding, Service } = require('../models/models');
const embeddingService = require('./embeddingService');
const { Sequelize } = require('sequelize');

class RAGService {
    constructor() {
        this.chunkSize = 500; // Размер фрагмента в символах
        this.chunkOverlap = 50; // Перекрытие между фрагментами
    }

    /**
     * Разбивает текст на фрагменты
     */
    chunkText(text) {
        const chunks = [];
        let start = 0;

        while (start < text.length) {
            const end = Math.min(start + this.chunkSize, text.length);
            let chunk = text.substring(start, end);

            // Пытаемся разбить по предложениям
            if (end < text.length) {
                const lastPeriod = chunk.lastIndexOf('.');
                const lastNewline = chunk.lastIndexOf('\n');
                const splitPoint = Math.max(lastPeriod, lastNewline);

                if (splitPoint > start + this.chunkSize / 2) {
                    chunk = text.substring(start, start + splitPoint + 1);
                    start = start + splitPoint + 1 - this.chunkOverlap;
                } else {
                    start = end - this.chunkOverlap;
                }
            } else {
                start = end;
            }

            if (chunk.trim().length > 0) {
                chunks.push(chunk.trim());
            }
        }

        return chunks;
    }

    /**
     * Загружает документ в базу знаний
     */
    async uploadDocument(title, content, documentType, serviceId, uploadedBy, documentId = null) {
        try {
            let document;
            
            if (documentId) {
                // Обновление существующего документа
                document = await KnowledgeDocument.findByPk(documentId);
                if (!document) {
                    throw new Error('Документ не найден');
                }
                
                // Удаляем старые фрагменты и embeddings
                const oldChunks = await KnowledgeChunk.findAll({ where: { documentId } });
                for (const chunk of oldChunks) {
                    await KnowledgeEmbedding.destroy({ where: { chunkId: chunk.id } });
                }
                await KnowledgeChunk.destroy({ where: { documentId } });
                
                // Обновляем документ
                await document.update({
                    title,
                    content,
                    documentType,
                    serviceId: serviceId || null,
                    version: document.version + 1,
                });
            } else {
                // Создание нового документа
                document = await KnowledgeDocument.create({
                    title,
                    content,
                    documentType,
                    serviceId: serviceId || null,
                    version: 1,
                    isActive: true,
                    uploadedBy,
                });
            }

            // Разбиение на фрагменты
            const textChunks = this.chunkText(content);

            // Создание фрагментов и генерация embeddings
            for (let i = 0; i < textChunks.length; i++) {
                const chunk = await KnowledgeChunk.create({
                    documentId: document.id,
                    content: textChunks[i],
                    chunkIndex: i,
                    metadata: {
                        documentType,
                        serviceId,
                    },
                });

                // Генерация embedding
                const embedding = await embeddingService.generateEmbedding(textChunks[i]);

                await KnowledgeEmbedding.create({
                    chunkId: chunk.id,
                    embedding,
                });
            }

            return document;
        } catch (error) {
            console.error('Ошибка загрузки документа:', error);
            throw error;
        }
    }

    /**
     * Семантический поиск по базе знаний
     */
    async semanticSearch(query, serviceId = null, topK = 5) {
        try {
            // Генерация embedding для запроса
            const queryEmbedding = await embeddingService.generateEmbedding(query);
            
            if (!queryEmbedding || !Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
                console.error('Ошибка: не удалось сгенерировать embedding для запроса');
                return [];
            }

            console.log(`Поиск для запроса: "${query}", размерность embedding: ${queryEmbedding.length}`);

            // Построение SQL запроса - получаем больше результатов для фильтрации
            let whereClause = 'ke.embedding IS NOT NULL';
            const replacements = {};

            if (serviceId) {
                whereClause += ' AND (kd."serviceId" = :serviceId OR kd."serviceId" IS NULL)';
                replacements.serviceId = serviceId;
            }

            // Получаем больше результатов (в 3 раза больше), чтобы потом отфильтровать по similarity
            const fetchLimit = topK * 3;

            const querySQL = `
                SELECT 
                    kc.id,
                    kc."documentId",
                    kc.content,
                    kc."chunkIndex",
                    kd.title as "documentTitle",
                    kd."documentType",
                    kd."serviceId",
                    ke.embedding
                FROM "KnowledgeChunks" kc
                INNER JOIN "KnowledgeDocuments" kd ON kc."documentId" = kd.id
                INNER JOIN "KnowledgeEmbeddings" ke ON kc.id = ke."chunkId"
                WHERE ${whereClause} AND kd."isActive" = true
                LIMIT :fetchLimit
            `;

            replacements.fetchLimit = fetchLimit;

            const results = await KnowledgeChunk.sequelize.query(querySQL, {
                replacements,
                type: Sequelize.QueryTypes.SELECT,
            });

            console.log(`Найдено записей в БД: ${results.length}`);

            if (results.length === 0) {
                return [];
            }

            // Извлекаем ключевые слова из запроса для дополнительной проверки релевантности
            const queryLower = query.toLowerCase();
            // Удаляем стоп-слова (местоимения, предлоги и т.д.)
            const stopWords = ['можно', 'ли', 'перед', 'за', 'дней', 'перед', 'процедурой', 'процедуры', 'исследованием', 'исследования', 'что', 'как', 'где', 'когда', 'почему', 'который', 'которая', 'которое', 'которые'];
            const queryWords = queryLower
                .replace(/[^\w\sа-яё]/gi, ' ')
                .split(/\s+/)
                .filter(word => word.length > 2 && !stopWords.includes(word)); // Слова длиннее 2 символов, исключая стоп-слова

            // Вычисление косинусного расстояния в JavaScript
            const resultsWithSimilarity = results.map(result => {
                const embedding = result.embedding;
                
                // Обработка разных форматов embedding из БД
                let embeddingArray = embedding;
                if (!Array.isArray(embedding)) {
                    if (typeof embedding === 'string') {
                        try {
                            embeddingArray = JSON.parse(embedding);
                        } catch (e) {
                            console.warn('Не удалось распарсить embedding:', e);
                            return { ...result, similarity: 0 };
                        }
                    } else {
                        console.warn('Неожиданный формат embedding:', typeof embedding);
                        return { ...result, similarity: 0 };
                    }
                }

                if (!Array.isArray(embeddingArray) || embeddingArray.length === 0) {
                    return { ...result, similarity: 0 };
                }

                // Косинусное сходство
                let dotProduct = 0;
                let normA = 0;
                let normB = 0;

                const minLength = Math.min(queryEmbedding.length, embeddingArray.length);
                
                for (let i = 0; i < minLength; i++) {
                    const a = queryEmbedding[i] || 0;
                    const b = embeddingArray[i] || 0;
                    dotProduct += a * b;
                    normA += a * a;
                    normB += b * b;
                }

                let similarity = normA === 0 || normB === 0 
                    ? 0 
                    : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));

                // Бонус к similarity, если в документе или заголовке есть ключевые слова из запроса
                const contentLower = (result.content || '').toLowerCase();
                const titleLower = (result.documentTitle || '').toLowerCase();
                const combinedText = `${titleLower} ${contentLower}`;

                let keywordBonus = 0;
                queryWords.forEach(word => {
                    if (combinedText.includes(word)) {
                        // Бонус больше, если слово в заголовке
                        if (titleLower.includes(word)) {
                            keywordBonus += 0.15; // Большой бонус за совпадение в заголовке
                        } else {
                            keywordBonus += 0.05; // Меньший бонус за совпадение в тексте
                        }
                    }
                });

                // Применяем бонус (но не более чем до 1.0)
                similarity = Math.min(1.0, similarity + keywordBonus);

                return { ...result, similarity, keywordBonus };
            });

            // Сортировка по similarity (от большего к меньшему)
            resultsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

            const maxSimilarity = resultsWithSimilarity[0]?.similarity || 0;
            const minSimilarity = resultsWithSimilarity[resultsWithSimilarity.length - 1]?.similarity || 0;
            
            // Логируем топ-3 результата для отладки
            const topResults = resultsWithSimilarity.slice(0, 3).map(r => ({
                title: r.documentTitle,
                serviceId: r.serviceId,
                similarity: r.similarity?.toFixed(3),
                keywordBonus: r.keywordBonus?.toFixed(3)
            }));
            console.log(`Similarity диапазон: ${maxSimilarity.toFixed(3)} - ${minSimilarity.toFixed(3)}`);
            console.log(`Топ-3 результатов:`, JSON.stringify(topResults, null, 2));

            // Адаптивный порог: используем более низкий порог (0.15) для более гибкого поиска
            // Если нет результатов выше порога, но есть результаты, берем топ-N с наивысшей similarity
            const threshold = 0.15;
            let relevantChunks = resultsWithSimilarity.filter(r => r.similarity >= threshold);

            // Если нет результатов выше порога, но есть результаты, берем топ-N с наивысшей similarity
            if (relevantChunks.length === 0 && resultsWithSimilarity.length > 0) {
                console.log(`Нет результатов выше порога ${threshold}, используем топ-${topK} с наивысшей similarity`);
                relevantChunks = resultsWithSimilarity.slice(0, topK);
            }

            console.log(`Релевантных чанков (similarity >= ${threshold} или топ-${topK}): ${relevantChunks.length}`);

            // Возвращаем только topK самых релевантных
            return relevantChunks.slice(0, topK).map(chunk => ({
                id: chunk.id,
                documentId: chunk.documentId,
                documentTitle: chunk.documentTitle,
                content: chunk.content,
                chunkIndex: chunk.chunkIndex,
                documentType: chunk.documentType,
                serviceId: chunk.serviceId,
                similarity: chunk.similarity,
            }));
        } catch (error) {
            console.error('Ошибка семантического поиска:', error);
            throw error;
        }
    }

    /**
     * Получение ответа на вопрос через RAG
     */
    async getAnswer(query, serviceId = null) {
        try {
            const llmService = require('./llmService');

            // Семантический поиск
            const relevantChunks = await this.semanticSearch(query, serviceId, 5);

            if (relevantChunks.length === 0) {
                return {
                    answer: 'К сожалению, в базе знаний не найдено релевантной информации для вашего вопроса. Пожалуйста, уточните вопрос или обратитесь к администратору или врачу.',
                    sources: [],
                };
            }

            // Генерация ответа через LLM
            const response = await llmService.generateResponse(query, relevantChunks, serviceId);

            return response;
        } catch (error) {
            console.error('Ошибка получения ответа RAG:', error);
            throw error;
        }
    }

    /**
     * Получение списка документов
     */
    async getDocuments(filters = {}) {
        try {
            const where = { isActive: true };

            if (filters.serviceId) {
                where.serviceId = filters.serviceId;
            }

            if (filters.documentType) {
                where.documentType = filters.documentType;
            }

            const documents = await KnowledgeDocument.findAll({
                where,
                include: [
                    {
                        model: Service,
                        attributes: ['id', 'name'],
                    },
                ],
                order: [['createdAt', 'DESC']],
            });

            return documents;
        } catch (error) {
            console.error('Ошибка получения документов:', error);
            throw error;
        }
    }

    /**
     * Удаление документа
     */
    async deleteDocument(documentId) {
        try {
            const document = await KnowledgeDocument.findByPk(documentId);
            if (!document) {
                throw new Error('Документ не найден');
            }

            // Каскадное удаление фрагментов и embeddings
            await document.destroy();

            return true;
        } catch (error) {
            console.error('Ошибка удаления документа:', error);
            throw error;
        }
    }
}

module.exports = new RAGService();
