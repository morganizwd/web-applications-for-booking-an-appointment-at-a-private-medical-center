module.exports = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        const userRoles = req.user.roles || [];
        const primaryRole = req.user.primaryRole;

        // Проверка наличия хотя бы одной из разрешённых ролей
        const hasRole = allowedRoles.some(role => 
            userRoles.includes(role) || primaryRole === role
        );

        if (!hasRole) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }

        next();
    };
};
