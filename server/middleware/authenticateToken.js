const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

        // Если ваш middleware раньше делал проверку только для patientId или doctorId:
        // if (!decoded.patientId && !decoded.doctorId) {
        //     return res.status(401).json({ message: 'Не авторизован' });
        // }

        // Теперь нужно учесть, что может быть adminId:
        if (!decoded.patientId && !decoded.doctorId && !decoded.adminId) {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        // Записываем в req.user все, что нужно, в зависимости от роли:
        // Можно хранить всё вместе, например:
        req.user = decoded;
        // Или более точно: req.user = { adminId: decoded.adminId }, если вы точно знаете, что это админ

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Не авторизован' });
    }
};
