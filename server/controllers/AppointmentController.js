

const { Appointment, Doctor, Patient, Service, User, Patient: PatientModel } = require('../models/models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class AppointmentController {
    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { date, doctorId, patientId, serviceId, notes } = req.body;
            const userId = req.user.userId;
            const userRole = req.user.primaryRole;

            const doctor = await Doctor.findByPk(doctorId);
            if (!doctor) {
                return res.status(404).json({ message: 'Врач не найден' });
            }

            // Определение patientId в зависимости от роли
            let finalPatientId = patientId;
            if (userRole === 'patient') {
                // Пациент может создавать запись только для себя
                const patient = await PatientModel.findOne({ where: { userId } });
                if (!patient) {
                    return res.status(404).json({ message: 'Профиль пациента не найден' });
                }
                finalPatientId = patient.id;
            } else {
                const patient = await Patient.findByPk(patientId);
                if (!patient) {
                    return res.status(404).json({ message: 'Пациент не найден' });
                }
            }

            
            const service = await Service.findByPk(serviceId);
            if (!service) {
                return res.status(404).json({ message: 'Услуга не найдена' });
            }

            if (new Date(date) <= new Date()) {
                return res
                    .status(400)
                    .json({ message: 'Дата приема должна быть в будущем' });
            }

            const conflictingAppointment = await Appointment.findOne({
                where: {
                    doctorId,
                    date,
                },
            });
            if (conflictingAppointment) {
                return res
                    .status(400)
                    .json({ message: 'Врач уже занят в указанное время' });
            }

            // Проверка расписания врача и длительности услуги
            const appointmentDate = new Date(date);
            const dayOfWeek = appointmentDate.getDay();
            const appointmentTime = appointmentDate.toTimeString().slice(0, 5);

            const schedule = await DoctorSchedule.findOne({
                where: {
                    doctorId,
                    dayOfWeek,
                },
            });

            if (!schedule) {
                return res.status(400).json({ message: 'Врач не работает в этот день' });
            }

            if (appointmentTime < schedule.startTime || appointmentTime >= schedule.endTime) {
                return res.status(400).json({ message: 'Время записи вне рабочего времени врача' });
            }

            // Проверка длительности услуги
            const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);
            const endTimeStr = endTime.toTimeString().slice(0, 5);
            if (endTimeStr > schedule.endTime) {
                return res.status(400).json({ message: 'Услуга не помещается в рабочее время врача' });
            }

            const appointment = await Appointment.create({
                date: appointmentDate,
                doctorId,
                patientId: finalPatientId,
                serviceId,
                status: 'scheduled',
                notes: notes || null,
            });

            const createdAppointment = await Appointment.findByPk(appointment.id, {
                include: [
                    { model: Doctor, attributes: ['id', 'firstName', 'lastName', 'specialization'] },
                    { model: Patient, attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] },
                    { model: Service, attributes: ['id', 'name', 'price', 'duration'] },
                ],
            });

            return res.status(201).json(createdAppointment);
        } catch (error) {
            console.error('Ошибка при создании приема:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

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

    async findAll(req, res) {
        try {
            const { doctorId, patientId, date, status, excludeId } = req.query;
            const whereClause = {};
            const userId = req.user.userId;
            const userRole = req.user.primaryRole;

            // Ограничение доступа в зависимости от роли
            if (userRole === 'patient') {
                const patient = await PatientModel.findOne({ where: { userId } });
                if (patient) {
                    whereClause.patientId = patient.id;
                } else {
                    return res.json([]);
                }
            } else if (userRole === 'doctor') {
                const doctor = await Doctor.findOne({ where: { userId } });
                if (doctor) {
                    whereClause.doctorId = doctor.id;
                } else {
                    return res.json([]);
                }
            }

            if (doctorId && userRole === 'admin') {
                whereClause.doctorId = doctorId;
            }

            if (patientId && userRole === 'admin') {
                whereClause.patientId = patientId;
            }

            if (date) {
                whereClause.date = { [Op.gte]: new Date(date) };
            }

            if (status) {
                whereClause.status = status;
            }

            if (excludeId) {
                whereClause.id = { [Op.ne]: excludeId };
            }

            const appointments = await Appointment.findAll({
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
                        model: Service,
                        attributes: ['id', 'name', 'price', 'duration'],
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

    async update(req, res) {
        try {
            const { date, doctorId, patientId, status, notes } = req.body;
            const appointmentId = req.params.id;
            const userId = req.user.userId;
            const userRole = req.user.primaryRole;

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const appointment = await Appointment.findByPk(appointmentId);
            if (!appointment) {
                return res.status(404).json({ message: 'Прием не найден' });
            }

            // Проверка прав доступа
            if (userRole === 'patient') {
                const patient = await PatientModel.findOne({ where: { userId } });
                if (!patient || appointment.patientId !== patient.id) {
                    return res.status(403).json({ message: 'Доступ запрещён' });
                }
                // Пациент может только отменять записи
                if (status && status !== 'cancelled') {
                    return res.status(403).json({ message: 'Пациент может только отменять записи' });
                }
            } else if (userRole === 'doctor') {
                const doctor = await Doctor.findOne({ where: { userId } });
                if (!doctor || appointment.doctorId !== doctor.id) {
                    return res.status(403).json({ message: 'Доступ запрещён' });
                }
            }

            if (doctorId && doctorId !== appointment.doctorId) {
                const doctor = await Doctor.findByPk(doctorId);
                if (!doctor) {
                    return res.status(404).json({ message: 'Врач не найден' });
                }
            }

            if (patientId && patientId !== appointment.patientId) {
                const patient = await Patient.findByPk(patientId);
                if (!patient) {
                    return res.status(404).json({ message: 'Пациент не найден' });
                }
            }

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
                        id: { [require('sequelize').Op.ne]: appointmentId },
                    },
                });
                if (conflictingAppointment) {
                    return res.status(400).json({ message: 'Врач уже занят в указанное время' });
                }
            }

            const updateData = {};
            if (date) updateData.date = new Date(date);
            if (doctorId && userRole === 'admin') updateData.doctorId = doctorId;
            if (patientId && userRole === 'admin') updateData.patientId = patientId;
            if (status) updateData.status = status;
            if (notes !== undefined) updateData.notes = notes;

            await appointment.update(updateData);

            const updatedAppointment = await Appointment.findByPk(appointment.id, {
                include: [
                    { model: Doctor, attributes: ['id', 'firstName', 'lastName', 'specialization'] },
                    { model: Patient, attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] },
                    { model: Service, attributes: ['id', 'name', 'price', 'duration'] },
                ],
            });

            res.json(updatedAppointment);
        } catch (error) {
            console.error('Ошибка при обновлении приема:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async delete(req, res) {
        try {
            const appointmentId = req.params.id;

            const appointment = await Appointment.findByPk(appointmentId);
            if (!appointment) {
                return res.status(404).json({ message: 'Прием не найден' });
            }

            await appointment.destroy();

            res.status(200).json({ message: 'Прием успешно удален' });
        } catch (error) {
            console.error('Ошибка при удалении приема:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new AppointmentController();
