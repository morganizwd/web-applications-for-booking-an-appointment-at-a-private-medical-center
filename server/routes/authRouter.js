const Router = require('express').Router;
const router = new Router();
const authController = require('../controllers/AuthController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/auth', authenticateToken, authController.auth);
router.get('/roles', authController.getRoles);

module.exports = router;
