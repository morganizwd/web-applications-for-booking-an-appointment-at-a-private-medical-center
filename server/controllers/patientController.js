const { Patient } = require('../models/models'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

class PatientController {
    async registration(req, res) {
        try {
            console.log('req.body:', req.body);
            console.log('req.file:', req.file);

            const { login, password, firstName, lastName, phoneNumber, address, age } = req.body;

            if (!login || !password || !firstName || !lastName || !age) {
                return res.status(400).json({ message: 'Необходимы логин, пароль, имя, фамилия и возраст' });
            }

            const existingPatient = await Patient.findOne({ where: { login } });
            if (existingPatient) {
                return res.status(400).json({ message: 'Пациент с таким логином уже существует' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

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

            return res.status(201).json({
                patient: {
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
                },
            });
        } catch (error) {
            console.error('Ошибка при регистрации пациента:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async login(req, res) {
        try {
            const { login, password } = req.body;

            if (!login || !password) {
                return res.status(400).json({ message: 'Необходимы логин и пароль' });
            }

            const patient = await Patient.findOne({ where: { login } });
            if (!patient) {
                return res.status(404).json({ message: 'Пациент не найден' });
            }

            const isMatch = await bcrypt.compare(password, patient.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            const token = jwt.sign(
                { patientId: patient.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            return res.json({
                token,
                patient: {
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
                },
            });
        } catch (error) {
            console.error('Ошибка при входе пациента:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async auth(req, res) {
        try {
            const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Не авторизован' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            const patient = await Patient.findByPk(decoded.patientId);

            if (!patient) {
                return res.status(404).json({ message: 'Пациент не найден' });
            }

            return res.json({
                patient: {
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
                },
            });
        } catch (error) {
            console.error('Ошибка при аутентификации пациента:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findOne(req, res) {
        try {
            const patient = await Patient.findByPk(req.params.id, {
                attributes: { exclude: ['password'] },
            });
            if (!patient) {
                return res.status(404).json({ message: 'Пациент не найден' });
            }
            return res.json(patient);
        } catch (error) {
            console.error('Ошибка при получении пациента:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findAll(req, res) {
        try {
            const patients = await Patient.findAll({
                attributes: { exclude: ['password'] },
            });
            return res.json(patients);
        } catch (error) {
            console.error('Ошибка при получении списка пациентов:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async update(req, res) {
        try {
            const { login, password, firstName, lastName, phoneNumber, address, age } = req.body;
            const patientId = req.params.id;

            if (req.user.patientId !== parseInt(patientId, 10)) {
                return res.status(403).json({ message: 'Нет прав для обновления этого профиля' });
            }

            const patient = await Patient.findByPk(patientId);
            if (!patient) {
                return res.status(404).json({ message: 'Пациент не найден' });
            }

            let updatedData = { login, firstName, lastName, phoneNumber, address, age };

            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                updatedData.password = hashedPassword;
            }

            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/patients');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const filename = `${patientId}_${Date.now()}_${req.file.originalname}`;
                const photoPath = `/uploads/patients/${filename}`;
                fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
                updatedData.photo = photoPath;

                if (patient.photo) {
                    const oldPhotoPath = path.join(__dirname, '..', patient.photo);
                    if (fs.existsSync(oldPhotoPath)) {
                        fs.unlinkSync(oldPhotoPath);
                    }
                }
            }

            await patient.update(updatedData);

            return res.json({
                patient: {
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
                },
            });
        } catch (error) {
            console.error('Ошибка при обновлении пациента:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async delete(req, res) {
        try {
            const patientId = req.params.id;

            if (req.user.patientId !== parseInt(patientId, 10)) {
                return res.status(403).json({ message: 'Нет прав для удаления этого профиля' });
            }

            const patient = await Patient.findByPk(patientId);
            if (!patient) {
                return res.status(404).json({ message: 'Пациент не найден' });
            }

            if (patient.photo) {
                const photoPath = path.join(__dirname, '..', patient.photo);
                if (fs.existsSync(photoPath)) {
                    fs.unlinkSync(photoPath);
                }
            }

            await patient.destroy();

            return res.status(200).json({ message: 'Пациент успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении пациента:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new PatientController();
