const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

        if (!decoded.patientId && !decoded.doctorId && !decoded.adminId) {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Не авторизован' });
    }
};
