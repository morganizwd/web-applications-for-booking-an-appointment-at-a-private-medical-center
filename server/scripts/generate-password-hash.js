const bcrypt = require('bcryptjs');

// Генерируем хеш для пароля "password123"
bcrypt.hash('password123', 10).then(hash => {
    console.log('Password hash for "password123":');
    console.log(hash);
});
