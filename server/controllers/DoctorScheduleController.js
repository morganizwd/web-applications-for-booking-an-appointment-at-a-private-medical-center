const { DoctorSchedule, Doctor } = require('../models/models'); // Убедитесь, что путь правильный
const { validationResult } = require('express-validator');

class DoctorScheduleController {
    // Создание нового расписания врача
    async create(req, res) {
        try {
            // Валидация входных данных
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { doctorId, dayOfWeek, startTime, endTime } = req.body;

            // Проверка наличия врача
            const doctor = await Doctor.findByPk(doctorId);
            if (!doctor) {
                return res.status(404).json({ message: 'Врач не найден' });
            }

            // Дополнительная проверка: startTime должен быть меньше endTime
            if (startTime >= endTime) {
                return res.status(400).json({ message: 'Время начала должно быть раньше времени окончания' });
            }

            // Создание нового расписания
            const schedule = await DoctorSchedule.create({
                doctorId,
                dayOfWeek,
                startTime,
                endTime,
            });

            res.status(201).json({
                id: schedule.id,
                doctorId: schedule.doctorId,
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                createdAt: schedule.createdAt,
                updatedAt: schedule.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при создании расписания врача:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение расписания по ID
    async findOne(req, res) {
        try {
            const schedule = await DoctorSchedule.findByPk(req.params.id, {
                include: [{
                    model: Doctor,
                    attributes: ['id', 'login', 'firstName', 'lastName', 'specialization'],
                }],
            });
            if (!schedule) {
                return res.status(404).json({ message: 'Расписание не найдено' });
            }
            res.json(schedule);
        } catch (error) {
            console.error('Ошибка при получении расписания врача:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение списка всех расписаний
    async findAll(req, res) {
        try {
            const schedules = await DoctorSchedule.findAll({
                include: [{
                    model: Doctor,
                    attributes: ['id', 'login', 'firstName', 'lastName', 'specialization'],
                }],
            });
            res.json(schedules);
        } catch (error) {
            console.error('Ошибка при получении списка расписаний:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление данных расписания
    async update(req, res) {
        try {
            const { doctorId, dayOfWeek, startTime, endTime } = req.body;
            const scheduleId = req.params.id;

            // Валидация входных данных
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Поиск расписания по ID
            const schedule = await DoctorSchedule.findByPk(scheduleId);
            if (!schedule) {
                return res.status(404).json({ message: 'Расписание не найдено' });
            }

            // Если обновляется doctorId, проверяем существование врача
            if (doctorId && doctorId !== schedule.doctorId) {
                const doctor = await Doctor.findByPk(doctorId);
                if (!doctor) {
                    return res.status(404).json({ message: 'Врач не найден' });
                }
            }

            // Дополнительная проверка: startTime должен быть меньше endTime
            if (startTime && endTime && startTime >= endTime) {
                return res.status(400).json({ message: 'Время начала должно быть раньше времени окончания' });
            }

            // Обновление данных расписания
            await schedule.update({
                doctorId: doctorId || schedule.doctorId,
                dayOfWeek: dayOfWeek !== undefined ? dayOfWeek : schedule.dayOfWeek,
                startTime: startTime || schedule.startTime,
                endTime: endTime || schedule.endTime,
            });

            res.json({
                id: schedule.id,
                doctorId: schedule.doctorId,
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                createdAt: schedule.createdAt,
                updatedAt: schedule.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при обновлении расписания врача:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление расписания
    async delete(req, res) {
        try {
            const scheduleId = req.params.id;

            // Поиск расписания по ID
            const schedule = await DoctorSchedule.findByPk(scheduleId);
            if (!schedule) {
                return res.status(404).json({ message: 'Расписание не найдено' });
            }

            // Удаление расписания
            await schedule.destroy();

            res.status(200).json({ message: 'Расписание успешно удалено' });
        } catch (error) {
            console.error('Ошибка при удалении расписания врача:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new DoctorScheduleController();
