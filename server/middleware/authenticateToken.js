const jwt = require('jsonwebtoken');
const { User } = require('../models/models');

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

        if (!decoded.userId) {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        // Проверка существования пользователя и его активности
        const user = await User.findByPk(decoded.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Пользователь не найден или неактивен' });
        }

        // Поддержка старого формата токена (role) и нового формата (roles, primaryRole)
        const roles = decoded.roles || (decoded.role ? [decoded.role] : []);
        const primaryRole = decoded.primaryRole || decoded.role || roles[0];

        req.user = {
            userId: decoded.userId,
            roles: roles,
            primaryRole: primaryRole,
            // Для обратной совместимости со старым форматом
            doctorId: decoded.doctorId,
            patientId: decoded.patientId,
            adminId: decoded.adminId,
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Не авторизован' });
    }
};
