

const { Diagnosis, Patient, Doctor } = require('../models/models');
const { validationResult } = require('express-validator');

class DiagnosisController {
    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, conclusion, patientId } = req.body;
            const doctorId = req.user.doctorId; 

            
            console.log('Создание диагностики для доктора ID:', doctorId);

            
            const doctor = await Doctor.findByPk(doctorId);
            if (!doctor) {
                console.log('Доктор не найден в базе данных:', doctorId);
                return res.status(404).json({ message: 'Доктор не найден' });
            }

            
            const patient = await Patient.findByPk(patientId);
            if (!patient) {
                console.log('Пациент не найден в базе данных:', patientId);
                return res.status(404).json({ message: 'Пациент не найден' });
            }

            
            const diagnosis = await Diagnosis.create({
                name,
                conclusion,
                doctorId,
                patientId,
            });

            res.status(201).json({
                id: diagnosis.id,
                name: diagnosis.name,
                conclusion: diagnosis.conclusion,
                doctorId: diagnosis.doctorId,
                patientId: diagnosis.patientId,
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
            const diagnosis = await Diagnosis.findByPk(req.params.id, {
                include: [
                    {
                        model: Doctor,
                        attributes: ['id', 'firstName', 'lastName', 'specialization'],
                    },
                    {
                        model: Patient,
                        attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
                    },
                ],
            });
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
            const { patientId } = req.query;
            const { doctorId, patientId: userPatientId } = req.user;

            
            const isDoctor = Boolean(doctorId);
            const isPatient = Boolean(userPatientId);

            if (!isDoctor && !isPatient) {
                return res.status(401).json({ message: 'Не авторизован' });
            }

            const whereClause = {};

            if (isDoctor) {
                whereClause.doctorId = doctorId;
                if (patientId) {
                    whereClause.patientId = patientId;
                }
            } else if (isPatient) {
                whereClause.patientId = userPatientId;
            }

            const diagnoses = await Diagnosis.findAll({
                where: whereClause,
                include: [
                    {
                        model: Doctor,
                        attributes: ['id', 'firstName', 'lastName', 'specialization'],
                    },
                    {
                        model: Patient,
                        attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
                    },
                ],
                order: [['createdAt', 'DESC']],
            });

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

            
            if (diagnosis.doctorId !== req.user.doctorId) { 
                return res.status(403).json({ message: 'Доступ запрещён' });
            }

            
            await diagnosis.update({
                name: name || diagnosis.name,
                conclusion: conclusion !== undefined ? conclusion : diagnosis.conclusion,
            });

            
            const updatedDiagnosis = await Diagnosis.findByPk(diagnosisId, {
                include: [
                    {
                        model: Doctor,
                        attributes: ['id', 'firstName', 'lastName', 'specialization'],
                    },
                    {
                        model: Patient,
                        attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
                    },
                ],
            });

            res.json(updatedDiagnosis);
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

            
            if (diagnosis.doctorId !== req.user.doctorId) { 
                return res.status(403).json({ message: 'Доступ запрещён' });
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
