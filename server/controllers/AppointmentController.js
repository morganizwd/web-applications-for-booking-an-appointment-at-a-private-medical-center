// controllers/AppointmentController.js

const { Appointment, Doctor, Patient } = require('../models/models'); // Убедитесь, что путь правильный
const { validationResult } = require('express-validator');

class AppointmentController {
    // Создание нового приема
    async create(req, res) {
        try {
            // Валидация входных данных
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { date, doctorId, patientId } = req.body;

            // Проверка наличия врача
            const doctor = await Doctor.findByPk(doctorId);
            if (!doctor) {
                return res.status(404).json({ message: 'Врач не найден' });
            }

            // Проверка наличия пациента
            const patient = await Patient.findByPk(patientId);
            if (!patient) {
                return res.status(404).json({ message: 'Пациент не найден' });
            }

            // Проверка, что дата приема в будущем
            if (new Date(date) <= new Date()) {
                return res.status(400).json({ message: 'Дата приема должна быть в будущем' });
            }

            // Проверка доступности врача в указанное время
            const conflictingAppointment = await Appointment.findOne({
                where: {
                    doctorId,
                    date: date, // Здесь можно расширить проверку, учитывая длительность приема
                },
            });
            if (conflictingAppointment) {
                return res.status(400).json({ message: 'Врач уже занят в указанное время' });
            }

            // Создание нового приема
            const appointment = await Appointment.create({
                date,
                doctorId,
                patientId,
            });

            res.status(201).json({
                id: appointment.id,
                date: appointment.date,
                doctorId: appointment.doctorId,
                patientId: appointment.patientId,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при создании приема:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение приема по ID
    async findOne(req, res) {
        try {
            const appointment = await Appointment.findByPk(req.params.id, {
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
            if (!appointment) {
                return res.status(404).json({ message: 'Прием не найден' });
            }
            res.json(appointment);
        } catch (error) {
            console.error('Ошибка при получении приема:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение списка всех приемов
    async findAll(req, res) {
        try {
            const appointments = await Appointment.findAll({
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
                order: [['date', 'ASC']],
            });
            res.json(appointments);
        } catch (error) {
            console.error('Ошибка при получении списка приемов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление данных приема
    async update(req, res) {
        try {
            const { date, doctorId, patientId } = req.body;
            const appointmentId = req.params.id;

            // Валидация входных данных
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Поиск приема по ID
            const appointment = await Appointment.findByPk(appointmentId);
            if (!appointment) {
                return res.status(404).json({ message: 'Прием не найден' });
            }

            // Если меняется врач, проверяем его наличие
            if (doctorId && doctorId !== appointment.doctorId) {
                const doctor = await Doctor.findByPk(doctorId);
                if (!doctor) {
                    return res.status(404).json({ message: 'Врач не найден' });
                }
            }

            // Если меняется пациент, проверяем его наличие
            if (patientId && patientId !== appointment.patientId) {
                const patient = await Patient.findByPk(patientId);
                if (!patient) {
                    return res.status(404).json({ message: 'Пациент не найден' });
                }
            }

            // Если меняется дата, проверяем, что она в будущем и врач доступен
            if (date && new Date(date) <= new Date()) {
                return res.status(400).json({ message: 'Дата приема должна быть в будущем' });
            }

            if (date || doctorId) {
                const newDoctorId = doctorId || appointment.doctorId;
                const newDate = date || appointment.date;

                const conflictingAppointment = await Appointment.findOne({
                    where: {
                        doctorId: newDoctorId,
                        date: newDate,
                        id: { [require('sequelize').Op.ne]: appointmentId }, // Исключаем текущий прием
                    },
                });
                if (conflictingAppointment) {
                    return res.status(400).json({ message: 'Врач уже занят в указанное время' });
                }
            }

            // Обновление данных приема
            await appointment.update({
                date: date || appointment.date,
                doctorId: doctorId || appointment.doctorId,
                patientId: patientId || appointment.patientId,
            });

            res.json({
                id: appointment.id,
                date: appointment.date,
                doctorId: appointment.doctorId,
                patientId: appointment.patientId,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при обновлении приема:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление приема
    async delete(req, res) {
        try {
            const appointmentId = req.params.id;

            // Поиск приема по ID
            const appointment = await Appointment.findByPk(appointmentId);
            if (!appointment) {
                return res.status(404).json({ message: 'Прием не найден' });
            }

            // Удаление приема
            await appointment.destroy();

            res.status(200).json({ message: 'Прием успешно удален' });
        } catch (error) {
            console.error('Ошибка при удалении приема:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new AppointmentController();
