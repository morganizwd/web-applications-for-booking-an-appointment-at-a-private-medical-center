
const { Diagnosis, Patient, Doctor, Appointment, User } = require('../models/models');
const { validationResult } = require('express-validator');

class DiagnosisController {
    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, conclusion, patientId, appointmentId } = req.body;
            const userId = req.user.userId;
            const userRole = req.user.primaryRole;

            // Только врачи и администраторы могут создавать диагнозы
            if (userRole !== 'doctor' && userRole !== 'admin') {
                return res.status(403).json({ message: 'Доступ запрещён' });
            }

            // Получение ID врача
            let finalDoctorId;
            if (userRole === 'doctor') {
                const doctor = await Doctor.findOne({ where: { userId } });
                if (!doctor) {
                    return res.status(404).json({ message: 'Профиль врача не найден' });
                }
                finalDoctorId = doctor.id;
            } else {
                // Администратор может указать любого врача
                finalDoctorId = req.body.doctorId;
                if (!finalDoctorId) {
                    return res.status(400).json({ message: 'ID врача обязателен для администратора' });
                }
            }

            const doctor = await Doctor.findByPk(finalDoctorId);
            if (!doctor) {
                return res.status(404).json({ message: 'Врач не найден' });
            }

            const patient = await Patient.findByPk(patientId);
            if (!patient) {
                return res.status(404).json({ message: 'Пациент не найден' });
            }

            // Проверка связи с приёмом, если указан
            if (appointmentId) {
                const appointment = await Appointment.findByPk(appointmentId);
                if (!appointment) {
                    return res.status(404).json({ message: 'Приём не найден' });
                }
                if (appointment.patientId !== patientId || appointment.doctorId !== finalDoctorId) {
                    return res.status(400).json({ message: 'Приём не соответствует указанным пациенту и врачу' });
                }
            }

            const diagnosis = await Diagnosis.create({
                name,
                conclusion: conclusion || null,
                doctorId: finalDoctorId,
                patientId,
                appointmentId: appointmentId || null,
            });

            const createdDiagnosis = await Diagnosis.findByPk(diagnosis.id, {
                include: [
                    {
                        model: Doctor,
                        attributes: ['id', 'firstName', 'lastName', 'specialization'],
                    },
                    {
                        model: Patient,
                        attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
                    },
                    {
                        model: Appointment,
                        attributes: ['id', 'date', 'status'],
                    },
                ],
            });

            res.status(201).json(createdDiagnosis);
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
                    {
                        model: Appointment,
                        attributes: ['id', 'date', 'status'],
                    },
                ],
            });

            if (!diagnosis) {
                return res.status(404).json({ message: 'Диагностика не найдена' });
            }

            // Проверка прав доступа
            const userId = req.user.userId;
            const userRole = req.user.primaryRole;

            if (userRole === 'patient') {
                const patient = await Patient.findOne({ where: { userId } });
                if (!patient || diagnosis.patientId !== patient.id) {
                    return res.status(403).json({ message: 'Доступ запрещён' });
                }
            } else if (userRole === 'doctor') {
                const doctor = await Doctor.findOne({ where: { userId } });
                if (!doctor || diagnosis.doctorId !== doctor.id) {
                    return res.status(403).json({ message: 'Доступ запрещён' });
                }
            }

            res.json(diagnosis);
        } catch (error) {
            console.error('Ошибка при получении диагностики:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findAll(req, res) {
        try {
            const { patientId, appointmentId } = req.query;
            const userId = req.user.userId;
            const userRole = req.user.primaryRole;

            const whereClause = {};

            // Ограничение доступа в зависимости от роли
            if (userRole === 'patient') {
                const patient = await Patient.findOne({ where: { userId } });
                if (patient) {
                    whereClause.patientId = patient.id;
                } else {
                    return res.json([]);
                }
            } else if (userRole === 'doctor') {
                const doctor = await Doctor.findOne({ where: { userId } });
                if (doctor) {
                    whereClause.doctorId = doctor.id;
                    if (patientId) {
                        whereClause.patientId = patientId;
                    }
                } else {
                    return res.json([]);
                }
            } else if (userRole === 'admin') {
                // Администратор видит все диагнозы, но может фильтровать
                if (patientId) {
                    whereClause.patientId = patientId;
                }
            }

            if (appointmentId) {
                whereClause.appointmentId = appointmentId;
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
                    {
                        model: Appointment,
                        attributes: ['id', 'date', 'status'],
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
            const userId = req.user.userId;
            const userRole = req.user.primaryRole;

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const diagnosis = await Diagnosis.findByPk(diagnosisId);
            if (!diagnosis) {
                return res.status(404).json({ message: 'Диагностика не найдена' });
            }

            // Проверка прав доступа
            if (userRole === 'doctor') {
                const doctor = await Doctor.findOne({ where: { userId } });
                if (!doctor || diagnosis.doctorId !== doctor.id) {
                    return res.status(403).json({ message: 'Доступ запрещён' });
                }
            } else if (userRole !== 'admin') {
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
                    {
                        model: Appointment,
                        attributes: ['id', 'date', 'status'],
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
            const userId = req.user.userId;
            const userRole = req.user.primaryRole;

            const diagnosis = await Diagnosis.findByPk(diagnosisId);
            if (!diagnosis) {
                return res.status(404).json({ message: 'Диагностика не найдена' });
            }

            // Проверка прав доступа
            if (userRole === 'doctor') {
                const doctor = await Doctor.findOne({ where: { userId } });
                if (!doctor || diagnosis.doctorId !== doctor.id) {
                    return res.status(403).json({ message: 'Доступ запрещён' });
                }
            } else if (userRole !== 'admin') {
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
