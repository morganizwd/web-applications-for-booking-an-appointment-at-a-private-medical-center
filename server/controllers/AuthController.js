const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, UserRole, Patient, Doctor } = require('../models/models');

class AuthController {
    async register(req, res) {
        try {
            const { login, password, email, role, profileData } = req.body;

            // Проверка существования пользователя
            const existingUser = await User.findOne({ where: { login } });
            if (existingUser) {
                return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
            }

            // Хеширование пароля
            const hashedPassword = await bcrypt.hash(password, 10);

            // Создание пользователя
            const user = await User.create({
                login,
                password: hashedPassword,
                email: email || null,
                isActive: true,
            });

            // Назначение роли
            const userRole = await Role.findOne({ where: { name: role } });
            if (!userRole) {
                await user.destroy();
                return res.status(400).json({ message: 'Роль не найдена' });
            }

            await UserRole.create({
                userId: user.id,
                roleId: userRole.id,
            });

            // Создание профиля в зависимости от роли
            if (role === 'patient' && profileData) {
                await Patient.create({
                    userId: user.id,
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    phoneNumber: profileData.phoneNumber || null,
                    address: profileData.address || null,
                    age: profileData.age,
                    photo: profileData.photo || null,
                });
            } else if (role === 'doctor' && profileData) {
                await Doctor.create({
                    userId: user.id,
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    specialization: profileData.specialization,
                    departmentId: profileData.departmentId,
                    photo: profileData.photo || null,
                });
            }

            // Генерация JWT токена
            const token = jwt.sign(
                { userId: user.id, role },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'Пользователь успешно зарегистрирован',
                token,
                user: {
                    id: user.id,
                    login: user.login,
                    email: user.email,
                    role,
                },
            });
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async login(req, res) {
        try {
            const { login, password } = req.body;

            // Поиск пользователя
            const user = await User.findOne({
                where: { login, isActive: true },
                include: [
                    {
                        model: Role,
                        through: { attributes: [] },
                    },
                ],
            });

            if (!user) {
                return res.status(401).json({ message: 'Неверный логин или пароль' });
            }

            // Проверка пароля
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Неверный логин или пароль' });
            }

            // Получение ролей пользователя
            const roles = user.Roles.map(r => r.name);
            const primaryRole = roles[0] || 'patient';

            // Получение профиля
            let profile = null;
            if (primaryRole === 'patient') {
                profile = await Patient.findOne({ where: { userId: user.id } });
            } else if (primaryRole === 'doctor') {
                profile = await Doctor.findOne({ 
                    where: { userId: user.id },
                    include: ['Department']
                });
            }

            // Генерация JWT токена
            const token = jwt.sign(
                { userId: user.id, roles, primaryRole },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    login: user.login,
                    email: user.email,
                    roles,
                    primaryRole,
                    profile,
                },
            });
        } catch (error) {
            console.error('Ошибка при входе:', error);
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
            const user = await User.findByPk(decoded.userId, {
                include: [
                    {
                        model: Role,
                        through: { attributes: [] },
                    },
                ],
            });

            if (!user || !user.isActive) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            const roles = user.Roles.map(r => r.name);
            const primaryRole = decoded.primaryRole || roles[0] || 'patient';

            // Получение профиля
            let profile = null;
            if (primaryRole === 'patient') {
                profile = await Patient.findOne({ where: { userId: user.id } });
            } else if (primaryRole === 'doctor') {
                profile = await Doctor.findOne({ 
                    where: { userId: user.id },
                    include: ['Department']
                });
            }

            res.json({
                id: user.id,
                login: user.login,
                email: user.email,
                roles,
                primaryRole,
                profile,
            });
        } catch (error) {
            console.error('Ошибка при аутентификации:', error);
            res.status(401).json({ message: 'Не авторизован' });
        }
    }

    async getRoles(req, res) {
        try {
            const roles = await Role.findAll({
                attributes: ['id', 'name', 'description'],
            });
            res.json(roles);
        } catch (error) {
            console.error('Ошибка при получении ролей:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new AuthController();
