const { Doctor, Department  } = require('../models/models'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

class DoctorController {
    async registration(req, res) {
        try {
            console.log('req.body:', req.body);
            console.log('req.file:', req.file);

            const { login, password, firstName, lastName, specialization, departmentId } = req.body;

            if (!login || !password || !firstName || !lastName || !specialization) {
                return res.status(400).json({ message: 'Необходимы логин, пароль, имя, фамилия и специализация' });
            }

            if (!departmentId) {
                return res.status(400).json({ message: 'Необходимо указать departmentId' });
            }

            const existingDoctor = await Doctor.findOne({ where: { login } });
            if (existingDoctor) {
                return res.status(400).json({ message: 'Врач с таким логином уже существует' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            let photoPath = null;
            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/doctors');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const filename = `${Date.now()}_${req.file.originalname}`;
                photoPath = `/uploads/doctors/${filename}`;
                fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
            }

            const doctor = await Doctor.create({
                login,
                password: hashedPassword,
                firstName,
                lastName,
                specialization,
                photo: photoPath,
                departmentId: parseInt(departmentId, 10),
            });

            res.status(201).json({
                id: doctor.id,
                login: doctor.login,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                specialization: doctor.specialization,
                photo: doctor.photo,
                createdAt: doctor.createdAt,
                updatedAt: doctor.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при регистрации врача:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async login(req, res) {
        try {
            const { login, password } = req.body;

            if (!login || !password) {
                return res.status(400).json({ message: 'Необходимы логин и пароль' });
            }

            const doctor = await Doctor.findOne({ where: { login } });
            if (!doctor) {
                return res.status(404).json({ message: 'Врач не найден' });
            }

            const isMatch = await bcrypt.compare(password, doctor.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            const token = jwt.sign(
                { doctorId: doctor.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.json({ token, doctorId: doctor.id });
        } catch (error) {
            console.error('Ошибка при входе врача:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async auth(req, res) {
        try {
            const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Не авторизован' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            const doctor = await Doctor.findByPk(decoded.doctorId);

            if (!doctor) {
                return res.status(404).json({ message: 'Врач не найден' });
            }

            res.json({
                id: doctor.id,
                login: doctor.login,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                specialization: doctor.specialization,
                photo: doctor.photo,
                createdAt: doctor.createdAt,
                updatedAt: doctor.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при аутентификации врача:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findOne(req, res) {
        try {
            const doctor = await Doctor.findByPk(req.params.id, {
                attributes: { exclude: ['password'] }, 
                include: {
                    model: Department,
                    attributes: ['id', 'name'], 
                },
            });
            if (!doctor) {
                return res.status(404).json({ message: 'Врач не найден' });
            }
            res.json(doctor);
        } catch (error) {
            console.error('Ошибка при получении врача:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async findAll(req, res) {
        try {
            const doctors = await Doctor.findAll({
                attributes: { exclude: ['password'] }, 
                include: {
                    model: Department,
                    attributes: ['id', 'name'],
                },
            });
            res.json(doctors);
        } catch (error) {
            console.error('Ошибка при получении списка врачей:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }


    async update(req, res) {
        try {
            const { login, password, firstName, lastName, specialization, departmentId } = req.body;
            const doctorId = req.params.id;

            // Проверка прав: только сам врач или админ может обновлять профиль
            // Проверяем админа через primaryRole или через массив roles
            const isAdmin = req.user.primaryRole === 'admin' || 
                          (Array.isArray(req.user.roles) && req.user.roles.includes('admin')) ||
                          (typeof req.user.roles === 'string' && req.user.roles === 'admin');
            
            // Проверяем, является ли пользователь врачом и обновляет ли свой профиль
            let isOwnProfile = false;
            if (req.user.doctorId) {
                isOwnProfile = req.user.doctorId === parseInt(doctorId, 10);
            } else if (!isAdmin) {
                // Если не админ и нет doctorId, проверяем через User -> Doctor связь
                const doctor = await Doctor.findOne({ where: { userId: req.user.userId } });
                if (doctor) {
                    isOwnProfile = doctor.id === parseInt(doctorId, 10);
                }
            }
            
            if (!isAdmin && !isOwnProfile) {
                console.log('Access denied:', { 
                    primaryRole: req.user.primaryRole, 
                    roles: req.user.roles, 
                    isAdmin, 
                    isOwnProfile,
                    doctorId: req.user.doctorId,
                    userId: req.user.userId
                });
                return res.status(403).json({ message: 'Нет прав для обновления этого профиля' });
            }

            const doctor = await Doctor.findByPk(doctorId);
            if (!doctor) {
                return res.status(404).json({ message: 'Врач не найден' });
            }

            let updatedData = {};
            if (login) updatedData.login = login;
            if (firstName) updatedData.firstName = firstName;
            if (lastName) updatedData.lastName = lastName;
            if (specialization) updatedData.specialization = specialization;
            if (departmentId) updatedData.departmentId = parseInt(departmentId, 10);

            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                updatedData.password = hashedPassword;
            }

            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/doctors');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const filename = `${doctorId}_${Date.now()}_${req.file.originalname}`;
                const photoPath = `/uploads/doctors/${filename}`;
                fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
                updatedData.photo = photoPath;

                // Удаляем старое фото, если оно существует
                if (doctor.photo) {
                    const oldPhotoPath = path.join(__dirname, '..', doctor.photo);
                    if (fs.existsSync(oldPhotoPath)) {
                        fs.unlinkSync(oldPhotoPath);
                    }
                }
            }

            await doctor.update(updatedData);

            // Загружаем обновленного врача с отделением
            const updatedDoctor = await Doctor.findByPk(doctorId, {
                include: [{ model: Department, attributes: ['id', 'name'] }]
            });

            res.json({
                id: updatedDoctor.id,
                login: updatedDoctor.login,
                firstName: updatedDoctor.firstName,
                lastName: updatedDoctor.lastName,
                specialization: updatedDoctor.specialization,
                photo: updatedDoctor.photo,
                departmentId: updatedDoctor.departmentId,
                Department: updatedDoctor.Department,
                createdAt: updatedDoctor.createdAt,
                updatedAt: updatedDoctor.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при обновлении врача:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async delete(req, res) {
        try {
            const doctorId = req.params.id;

            if (req.user.doctorId !== parseInt(doctorId, 10)) {
                return res.status(403).json({ message: 'Нет прав для удаления этого профиля' });
            }

            const doctor = await Doctor.findByPk(doctorId);
            if (!doctor) {
                return res.status(404).json({ message: 'Врач не найден' });
            }

            if (doctor.photo) {
                const photoPath = path.join(__dirname, '..', doctor.photo);
                if (fs.existsSync(photoPath)) {
                    fs.unlinkSync(photoPath);
                }
            }

            await doctor.destroy();

            res.status(200).json({ message: 'Врач успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении врача:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new DoctorController();