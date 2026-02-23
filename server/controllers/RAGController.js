const ragService = require('../services/ragService');
const { KnowledgeDocument, Service } = require('../models/models');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Настройка multer для загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({ storage });

class RAGController {
    async askQuestion(req, res) {
        try {
            const { question, serviceId } = req.body;
            const userId = req.user.userId;

            if (!question || question.trim().length === 0) {
                return res.status(400).json({ message: 'Вопрос не может быть пустым' });
            }

            const response = await ragService.getAnswer(question, serviceId || null);

            res.json({
                question,
                answer: response.answer,
                sources: response.sources,
            });
        } catch (error) {
            console.error('Ошибка обработки вопроса:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async uploadDocument(req, res) {
        try {
            const { title, documentType, serviceId } = req.body;
            const userId = req.user.userId;

            if (!title || !documentType) {
                return res.status(400).json({ message: 'Название и тип документа обязательны' });
            }

            let content = '';

            // Если загружен файл
            if (req.file) {
                content = req.file.buffer.toString('utf-8');
            } else if (req.body.content) {
                content = req.body.content;
            } else {
                return res.status(400).json({ message: 'Содержимое документа не предоставлено' });
            }

            if (content.trim().length === 0) {
                return res.status(400).json({ message: 'Содержимое документа не может быть пустым' });
            }

            const document = await ragService.uploadDocument(
                title,
                content,
                documentType,
                serviceId || null,
                userId
            );

            res.status(201).json({
                message: 'Документ успешно загружен',
                document: {
                    id: document.id,
                    title: document.title,
                    documentType: document.documentType,
                    serviceId: document.serviceId,
                    version: document.version,
                    createdAt: document.createdAt,
                },
            });
        } catch (error) {
            console.error('Ошибка загрузки документа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getDocuments(req, res) {
        try {
            const { serviceId, documentType } = req.query;
            const filters = {};

            if (serviceId) {
                filters.serviceId = parseInt(serviceId);
            }

            if (documentType) {
                filters.documentType = documentType;
            }

            const documents = await ragService.getDocuments(filters);

            res.json(documents);
        } catch (error) {
            console.error('Ошибка получения документов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getDocument(req, res) {
        try {
            const document = await KnowledgeDocument.findByPk(req.params.id, {
                include: [
                    {
                        model: Service,
                        attributes: ['id', 'name'],
                    },
                ],
            });

            if (!document) {
                return res.status(404).json({ message: 'Документ не найден' });
            }

            res.json(document);
        } catch (error) {
            console.error('Ошибка получения документа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async updateDocument(req, res) {
        try {
            const { title, content, documentType, serviceId } = req.body;
            const userId = req.user.userId;

            if (!title || !content) {
                return res.status(400).json({ message: 'Название и содержимое документа обязательны' });
            }

            const document = await KnowledgeDocument.findByPk(req.params.id);
            if (!document) {
                return res.status(404).json({ message: 'Документ не найден' });
            }

            // Пересоздаём фрагменты и embeddings для обновлённого документа
            const updatedDocument = await ragService.uploadDocument(
                title,
                content,
                documentType || document.documentType,
                serviceId || null,
                userId,
                document.id // Передаём ID для обновления существующего документа
            );

            // Обновляем документ после пересоздания фрагментов
            await updatedDocument.reload();

            res.json({
                message: 'Документ успешно обновлён',
                document: {
                    id: updatedDocument.id,
                    title: updatedDocument.title,
                    documentType: updatedDocument.documentType,
                    serviceId: updatedDocument.serviceId,
                    version: updatedDocument.version,
                    updatedAt: updatedDocument.updatedAt,
                },
            });
        } catch (error) {
            console.error('Ошибка обновления документа:', error);
            if (error.message === 'Документ не найден') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async deleteDocument(req, res) {
        try {
            await ragService.deleteDocument(req.params.id);

            res.json({ message: 'Документ успешно удалён' });
        } catch (error) {
            console.error('Ошибка удаления документа:', error);
            if (error.message === 'Документ не найден') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getServicesWithDocuments(req, res) {
        try {
            const { Sequelize } = require('sequelize');
            const sequelize = KnowledgeDocument.sequelize;

            // Получаем уникальные serviceId из активных документов через SQL запрос
            const querySQL = `
                SELECT DISTINCT "serviceId"
                FROM "KnowledgeDocuments"
                WHERE "isActive" = true AND "serviceId" IS NOT NULL
            `;

            const results = await sequelize.query(querySQL, {
                type: Sequelize.QueryTypes.SELECT,
            });

            // Извлекаем serviceId из результатов
            const serviceIds = results.map(row => row.serviceId);

            // Если нет услуг с документами, возвращаем пустой массив
            if (serviceIds.length === 0) {
                return res.json([]);
            }

            // Получаем услуги по найденным ID
            const services = await Service.findAll({
                where: {
                    id: serviceIds,
                },
                attributes: ['id', 'name', 'price'],
                order: [['name', 'ASC']],
            });

            res.json(services);
        } catch (error) {
            console.error('Ошибка получения услуг с документами:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Middleware для загрузки файлов
    uploadMiddleware() {
        return upload.single('file');
    }
}

module.exports = new RAGController();
