const { Admin } = require('../models/models'); // Убедитесь, что путь правильный
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AdminController {
    // Регистрация нового администратора
    async registration(req, res) {
        try {
            const { login, password } = req.body;

            // Проверка наличия обязательных полей
            if (!login || !password) {
                return res.status(400).json({ message: 'Необходимы логин и пароль' });
            }

            // Проверка на существование администратора с таким же логином
            const existingAdmin = await Admin.findOne({ where: { login } });
            if (existingAdmin) {
                return res.status(400).json({ message: 'Администратор с таким логином уже существует' });
            }

            // Хэширование пароля
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Создание нового администратора
            const admin = await Admin.create({
                login,
                password: hashedPassword,
            });

            res.status(201).json({
                id: admin.id,
                login: admin.login,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при регистрации администратора:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Вход администратора и выдача JWT токена
    async login(req, res) {
        try {
            const { login, password } = req.body;

            // Проверка наличия обязательных полей
            if (!login || !password) {
                return res.status(400).json({ message: 'Необходимы логин и пароль' });
            }

            // Поиск администратора по логину
            const admin = await Admin.findOne({ where: { login } });
            if (!admin) {
                return res.status(404).json({ message: 'Администратор не найден' });
            }

            // Проверка пароля
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            // Генерация JWT токена
            const token = jwt.sign(
                { adminId: admin.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                adminId: admin.id,
                admin: {
                  id: admin.id,
                  login: admin.login,
                  role: 'admin', // <-- добавляем роль
                }
            });
        } catch (error) {
            console.error('Ошибка при входе администратора:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Аутентификация администратора по JWT токену
    async auth(req, res) {
        try {
            const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Не авторизован' });
            }
    
            // Проверка
            const decoded = jwt.verify(token, process.env.JWT_SECRET || '...');
            const admin = await Admin.findByPk(decoded.adminId);
            if (!admin) {
                return res.status(404).json({ message: 'Администратор не найден' });
            }
    
            // Возвращаем нужные поля
            res.json({
                // лучше вернуть точно так же, как при логине
                admin: {
                  id: admin.id,
                  login: admin.login,
                  role: 'admin', // <-- чтобы Redux знал, что это админ
                },
            });
        } catch (error) {
            console.error('Ошибка при аутентификации администратора:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение администратора по ID
    async findOne(req, res) {
        try {
            const admin = await Admin.findByPk(req.params.id);
            if (!admin) {
                return res.status(404).json({ message: 'Администратор не найден' });
            }
            res.json({
                id: admin.id,
                login: admin.login,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при получении администратора:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение списка всех администраторов
    async findAll(req, res) {
        try {
            const admins = await Admin.findAll({
                attributes: ['id', 'login', 'createdAt', 'updatedAt'],
            });
            res.json(admins);
        } catch (error) {
            console.error('Ошибка при получении списка администраторов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление данных администратора
    async update(req, res) {
        try {
            const { login, password } = req.body;
            const adminId = req.params.id;

            // Проверка, что запрашивающий администратор совпадает с обновляемым
            if (req.user.adminId !== parseInt(adminId, 10)) {
                return res.status(403).json({ message: 'Нет прав для обновления этого профиля' });
            }

            const admin = await Admin.findByPk(adminId);
            if (!admin) {
                return res.status(404).json({ message: 'Администратор не найден' });
            }

            let updatedData = { login };

            // Если передан новый пароль, хэшируем его
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                updatedData.password = hashedPassword;
            }

            // Обновление данных администратора
            await admin.update(updatedData);

            res.json({
                id: admin.id,
                login: admin.login,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при обновлении администратора:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление администратора
    async delete(req, res) {
        try {
            const adminId = req.params.id;

            // Проверка, что запрашивающий администратор совпадает с удаляемым
            if (req.user.adminId !== parseInt(adminId, 10)) {
                return res.status(403).json({ message: 'Нет прав для удаления этого профиля' });
            }

            const admin = await Admin.findByPk(adminId);
            if (!admin) {
                return res.status(404).json({ message: 'Администратор не найден' });
            }

            await admin.destroy();

            res.status(200).json({ message: 'Администратор успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении администратора:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new AdminController();