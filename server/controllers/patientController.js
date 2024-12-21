const { Patient } = require('../models/models'); // Убедитесь, что путь правильный
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

class PatientController {
    // Регистрация нового пациента
    async registration(req, res) {
        try {
            const { login, password, firstName, lastName, phoneNumber, address, age } = req.body;

            // Проверка наличия обязательных полей
            if (!login || !password || !firstName || !lastName || !age) {
                return res.status(400).json({ message: 'Необходимы логин, пароль, имя, фамилия и возраст' });
            }

            // Проверка на существование пациента с таким же логином
            const existingPatient = await Patient.findOne({ where: { login } });
            if (existingPatient) {
                return res.status(400).json({ message: 'Пациент с таким логином уже существует' });
            }

            // Хэширование пароля
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Обработка загрузки фото
            let photoPath = null;
            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/patients');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const filename = `${Date.now()}_${req.file.originalname}`;
                photoPath = `/uploads/patients/${filename}`;
                fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
            }

            // Создание нового пациента
            const patient = await Patient.create({
                login,
                password: hashedPassword,
                firstName,
                lastName,
                phoneNumber,
                address,
                age,
                photo: photoPath,
            });

            res.status(201).json({
                id: patient.id,
                login: patient.login,
                firstName: patient.firstName,
                lastName: patient.lastName,
                phoneNumber: patient.phoneNumber,
                address: patient.address,
                age: patient.age,
                photo: patient.photo,
                createdAt: patient.createdAt,
                updatedAt: patient.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при регистрации пациента:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Вход пациента и выдача JWT токена
    async login(req, res) {
        try {
            const { login, password } = req.body;

            // Проверка наличия обязательных полей
            if (!login || !password) {
                return res.status(400).json({ message: 'Необходимы логин и пароль' });
            }

            // Поиск пациента по логину
            const patient = await Patient.findOne({ where: { login } });
            if (!patient) {
                return res.status(404).json({ message: 'Пациент не найден' });
            }

            // Проверка пароля
            const isMatch = await bcrypt.compare(password, patient.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            // Генерация JWT токена
            const token = jwt.sign(
                { patientId: patient.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.json({ token, patientId: patient.id });
        } catch (error) {
            console.error('Ошибка при входе пациента:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Аутентификация пациента по JWT токену
    async auth(req, res) {
        try {
            const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Не авторизован' });
            }

            // Верификация токена
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            const patient = await Patient.findByPk(decoded.patientId);

            if (!patient) {
                return res.status(404).json({ message: 'Пациент не найден' });
            }

            res.json({
                id: patient.id,
                login: patient.login,
                firstName: patient.firstName,
                lastName: patient.lastName,
                phoneNumber: patient.phoneNumber,
                address: patient.address,
                age: patient.age,
                photo: patient.photo,
                createdAt: patient.createdAt,
                updatedAt: patient.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при аутентификации пациента:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение пациента по ID
    async findOne(req, res) {
        try {
            const patient = await Patient.findByPk(req.params.id, {
                attributes: { exclude: ['password'] }, // Исключаем пароль из ответа
            });
            if (!patient) {
                return res.status(404).json({ message: 'Пациент не найден' });
            }
            res.json(patient);
        } catch (error) {
            console.error('Ошибка при получении пациента:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение списка всех пациентов
    async findAll(req, res) {
        try {
            const patients = await Patient.findAll({
                attributes: { exclude: ['password'] }, // Исключаем пароли из ответа
            });
            res.json(patients);
        } catch (error) {
            console.error('Ошибка при получении списка пациентов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление данных пациента
    async update(req, res) {
        try {
            const { login, password, firstName, lastName, phoneNumber, address, age } = req.body;
            const patientId = req.params.id;

            // Проверка, что запрашивающий пациент совпадает с обновляемым
            if (req.user.patientId !== parseInt(patientId, 10)) {
                return res.status(403).json({ message: 'Нет прав для обновления этого профиля' });
            }

            const patient = await Patient.findByPk(patientId);
            if (!patient) {
                return res.status(404).json({ message: 'Пациент не найден' });
            }

            let updatedData = { login, firstName, lastName, phoneNumber, address, age };

            // Если передан новый пароль, хэшируем его
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                updatedData.password = hashedPassword;
            }

            // Обработка загрузки нового фото
            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/patients');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const filename = `${patientId}_${Date.now()}_${req.file.originalname}`;
                const photoPath = `/uploads/patients/${filename}`;
                fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
                updatedData.photo = photoPath;

                // Опционально: удаление старого фото
                if (patient.photo) {
                    const oldPhotoPath = path.join(__dirname, '..', patient.photo);
                    if (fs.existsSync(oldPhotoPath)) {
                        fs.unlinkSync(oldPhotoPath);
                    }
                }
            }

            // Обновление данных пациента
            await patient.update(updatedData);

            res.json({
                id: patient.id,
                login: patient.login,
                firstName: patient.firstName,
                lastName: patient.lastName,
                phoneNumber: patient.phoneNumber,
                address: patient.address,
                age: patient.age,
                photo: patient.photo,
                createdAt: patient.createdAt,
                updatedAt: patient.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при обновлении пациента:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление пациента
    async delete(req, res) {
        try {
            const patientId = req.params.id;

            // Проверка, что запрашивающий пациент совпадает с удаляемым
            if (req.user.patientId !== parseInt(patientId, 10)) {
                return res.status(403).json({ message: 'Нет прав для удаления этого профиля' });
            }

            const patient = await Patient.findByPk(patientId);
            if (!patient) {
                return res.status(404).json({ message: 'Пациент не найден' });
            }

            // Опционально: удаление фото пациента
            if (patient.photo) {
                const photoPath = path.join(__dirname, '..', patient.photo);
                if (fs.existsSync(photoPath)) {
                    fs.unlinkSync(photoPath);
                }
            }

            await patient.destroy();

            res.status(200).json({ message: 'Пациент успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении пациента:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new PatientController();
