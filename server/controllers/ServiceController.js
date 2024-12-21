const { Service, Department } = require('../models/models');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

class ServiceController {
    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, price, departmentId } = req.body;
            console.log('Создание услуги с departmentId:', departmentId); 

            const existingService = await Service.findOne({ where: { name } });
            if (existingService) {
                return res.status(400).json({ message: 'Услуга с таким названием уже существует' });
            }

            const parsedDepartmentId = parseInt(departmentId, 10);
            if (isNaN(parsedDepartmentId)) {
                return res.status(400).json({ message: 'Неверный ID отделения' });
            }

            const department = await Department.findByPk(parsedDepartmentId);
            if (!department) {
                return res.status(400).json({ message: 'Отделение не найдено' });
            }

            let photoPath = null;
            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/services');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const filename = `${Date.now()}_${req.file.originalname}`;
                photoPath = `/uploads/services/${filename}`;
                fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
            }

            const service = await Service.create({
                name,
                price,
                departmentId: parsedDepartmentId, 
                photo: photoPath,
            });

            res.status(201).json({
                id: service.id,
                name: service.name,
                price: service.price,
                departmentId: service.departmentId,
                photo: service.photo,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при создании услуги:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findOne(req, res) {
        try {
            const service = await Service.findByPk(req.params.id, {
                include: [
                    {
                        model: Department,
                        attributes: ['id', 'name'],
                    },
                ],
                attributes: { exclude: ['createdAt', 'updatedAt'] }, 
            });
            if (!service) {
                return res.status(404).json({ message: 'Услуга не найдена' });
            }
            res.json(service);
        } catch (error) {
            console.error('Ошибка при получении услуги:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findAll(req, res) {
        try {
            const services = await Service.findAll({
                include: [
                    {
                        model: Department,
                        attributes: ['id', 'name'],
                    },
                ],
                attributes: { exclude: ['createdAt', 'updatedAt'] }, 
            });
            res.json(services);
        } catch (error) {
            console.error('Ошибка при получении списка услуг:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async update(req, res) {
        try {
            const { name, price, departmentId } = req.body;
            const serviceId = req.params.id;
    
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
    
            const service = await Service.findByPk(serviceId);
            if (!service) {
                return res.status(404).json({ message: 'Услуга не найдена' });
            }
    
            if (name && name !== service.name) {
                const existingService = await Service.findOne({ where: { name } });
                if (existingService) {
                    return res.status(400).json({ message: 'Услуга с таким названием уже существует' });
                }
            }

            if (departmentId) {
                const parsedDepartmentId = parseInt(departmentId, 10);
                if (isNaN(parsedDepartmentId)) {
                    return res.status(400).json({ message: 'Неверный ID отделения' });
                }
    
                const department = await Department.findByPk(parsedDepartmentId);
                if (!department) {
                    return res.status(400).json({ message: 'Отделение не найдено' });
                }
            }
    
            let updatedData = { 
                name: name || service.name, 
                price: price !== undefined ? parseFloat(price) : service.price 
            };
    
            if (departmentId) {
                updatedData.departmentId = parseInt(departmentId, 10);
            }
    
            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/services');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const filename = `${serviceId}_${Date.now()}_${req.file.originalname}`;
                const photoPath = `/uploads/services/${filename}`;
                fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
                updatedData.photo = photoPath;
    
                if (service.photo) {
                    const oldPhotoPath = path.join(__dirname, '..', service.photo);
                    if (fs.existsSync(oldPhotoPath)) {
                        fs.unlinkSync(oldPhotoPath);
                    }
                }
            }
    
            await service.update(updatedData);
    
            res.json({
                id: service.id,
                name: service.name,
                price: service.price,
                departmentId: service.departmentId,
                photo: service.photo,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при обновлении услуги:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async delete(req, res) {
        try {
            const serviceId = req.params.id;

            const service = await Service.findByPk(serviceId);
            if (!service) {
                return res.status(404).json({ message: 'Услуга не найдена' });
            }

            if (service.photo) {
                const photoPath = path.join(__dirname, '..', service.photo);
                if (fs.existsSync(photoPath)) {
                    fs.unlinkSync(photoPath);
                }
            }

            await service.destroy();

            res.status(200).json({ message: 'Услуга успешно удалена' });
        } catch (error) {
            console.error('Ошибка при удалении услуги:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new ServiceController();
