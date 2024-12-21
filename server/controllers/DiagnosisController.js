// controllers/DiagnosisController.js

const { Diagnosis } = require('../models/models'); 
const { validationResult } = require('express-validator');

class DiagnosisController {
    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, conclusion } = req.body;

            const diagnosis = await Diagnosis.create({
                name,
                conclusion,
            });

            res.status(201).json({
                id: diagnosis.id,
                name: diagnosis.name,
                conclusion: diagnosis.conclusion,
                createdAt: diagnosis.createdAt,
                updatedAt: diagnosis.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при создании диагностики:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findOne(req, res) {
        try {
            const diagnosis = await Diagnosis.findByPk(req.params.id);
            if (!diagnosis) {
                return res.status(404).json({ message: 'Диагностика не найдена' });
            }
            res.json(diagnosis);
        } catch (error) {
            console.error('Ошибка при получении диагностики:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findAll(req, res) {
        try {
            const diagnoses = await Diagnosis.findAll();
            res.json(diagnoses);
        } catch (error) {
            console.error('Ошибка при получении списка диагностик:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async update(req, res) {
        try {
            const { name, conclusion } = req.body;
            const diagnosisId = req.params.id;

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const diagnosis = await Diagnosis.findByPk(diagnosisId);
            if (!diagnosis) {
                return res.status(404).json({ message: 'Диагностика не найдена' });
            }

            await diagnosis.update({
                name: name || diagnosis.name,
                conclusion: conclusion !== undefined ? conclusion : diagnosis.conclusion,
            });

            res.json({
                id: diagnosis.id,
                name: diagnosis.name,
                conclusion: diagnosis.conclusion,
                createdAt: diagnosis.createdAt,
                updatedAt: diagnosis.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при обновлении диагностики:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async delete(req, res) {
        try {
            const diagnosisId = req.params.id;

            const diagnosis = await Diagnosis.findByPk(diagnosisId);
            if (!diagnosis) {
                return res.status(404).json({ message: 'Диагностика не найдена' });
            }

            await diagnosis.destroy();

            res.status(200).json({ message: 'Диагностика успешно удалена' });
        } catch (error) {
            console.error('Ошибка при удалении диагностики:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new DiagnosisController();
