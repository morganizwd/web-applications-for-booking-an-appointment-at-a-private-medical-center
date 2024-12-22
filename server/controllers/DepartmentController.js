const { Department } = require('../models/models'); 
const { validationResult } = require('express-validator');

class DepartmentController {
    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name } = req.body;

            const existingDepartment = await Department.findOne({ where: { name } });
            if (existingDepartment) {
                return res.status(400).json({ message: 'Отдел с таким названием уже существует' });
            }

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

    async findAll(req, res) {
        try {
            const departments = await Department.findAll();
            res.json(departments);
        } catch (error) {
            console.error('Ошибка при получении списка отделов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async update(req, res) {
        try {
            const { name } = req.body;
            const departmentId = req.params.id;

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const department = await Department.findByPk(departmentId);
            if (!department) {
                return res.status(404).json({ message: 'Отдел не найден' });
            }

            if (name && name !== department.name) {
                const existingDepartment = await Department.findOne({ where: { name } });
                if (existingDepartment) {
                    return res.status(400).json({ message: 'Отдел с таким названием уже существует' });
                }
            }

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

    async delete(req, res) {
        try {
            const departmentId = req.params.id;

            const department = await Department.findByPk(departmentId);
            if (!department) {
                return res.status(404).json({ message: 'Отдел не найден' });
            }

            await department.destroy();

            res.status(200).json({ message: 'Отдел успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении отдела:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new DepartmentController();
