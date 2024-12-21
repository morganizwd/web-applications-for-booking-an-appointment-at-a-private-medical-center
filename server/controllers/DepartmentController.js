const { Department } = require('../models/models'); // Убедитесь, что путь правильный
const { validationResult } = require('express-validator');

class DepartmentController {
    // Создание нового отдела
    async create(req, res) {
        try {
            // Валидация входных данных
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name } = req.body;

            // Проверка на существование отдела с таким же названием
            const existingDepartment = await Department.findOne({ where: { name } });
            if (existingDepartment) {
                return res.status(400).json({ message: 'Отдел с таким названием уже существует' });
            }

            // Создание нового отдела
            const department = await Department.create({ name });

            res.status(201).json({
                id: department.id,
                name: department.name,
                createdAt: department.createdAt,
                updatedAt: department.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при создании отдела:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение отдела по ID
    async findOne(req, res) {
        try {
            const department = await Department.findByPk(req.params.id);
            if (!department) {
                return res.status(404).json({ message: 'Отдел не найден' });
            }
            res.json(department);
        } catch (error) {
            console.error('Ошибка при получении отдела:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение списка всех отделов
    async findAll(req, res) {
        try {
            const departments = await Department.findAll();
            res.json(departments);
        } catch (error) {
            console.error('Ошибка при получении списка отделов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление данных отдела
    async update(req, res) {
        try {
            const { name } = req.body;
            const departmentId = req.params.id;

            // Валидация входных данных
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Поиск отдела по ID
            const department = await Department.findByPk(departmentId);
            if (!department) {
                return res.status(404).json({ message: 'Отдел не найден' });
            }

            // Проверка на существование отдела с таким же названием (если имя меняется)
            if (name && name !== department.name) {
                const existingDepartment = await Department.findOne({ where: { name } });
                if (existingDepartment) {
                    return res.status(400).json({ message: 'Отдел с таким названием уже существует' });
                }
            }

            // Обновление данных отдела
            await department.update({ name: name || department.name });

            res.json({
                id: department.id,
                name: department.name,
                createdAt: department.createdAt,
                updatedAt: department.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при обновлении отдела:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление отдела
    async delete(req, res) {
        try {
            const departmentId = req.params.id;

            // Поиск отдела по ID
            const department = await Department.findByPk(departmentId);
            if (!department) {
                return res.status(404).json({ message: 'Отдел не найден' });
            }

            // Удаление отдела
            await department.destroy();

            res.status(200).json({ message: 'Отдел успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении отдела:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new DepartmentController();
