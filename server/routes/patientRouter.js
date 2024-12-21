const express = require('express');
const PatientController = require('../controllers/patientController');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
    '/registration',
    upload.single('photo'),
    [
        body('login').notEmpty().withMessage('Логин обязателен'),
        body('password').notEmpty().withMessage('Пароль обязателен'),
        body('firstName').notEmpty().withMessage('Имя обязательно'),
        body('lastName').notEmpty().withMessage('Фамилия обязательна'),
        body('age').isInt({ min: 0 }).withMessage('Возраст должен быть положительным числом'),
    ],
    PatientController.registration
);

router.post(
    '/login',
    [
        body('login').notEmpty().withMessage('Логин обязателен'),
        body('password').notEmpty().withMessage('Пароль обязателен'),
    ],
    PatientController.login
);

router.get('/auth', authenticateToken, PatientController.auth);

router.get('/:id', authenticateToken, PatientController.findOne);

router.get('/', authenticateToken, PatientController.findAll);

router.put(
    '/:id',
    authenticateToken,
    upload.single('photo'), 
    [
        body('login').optional().notEmpty().withMessage('Логин не может быть пустым'),
        body('password').optional().notEmpty().withMessage('Пароль не может быть пустым'),
        body('firstName').optional().notEmpty().withMessage('Имя не может быть пустым'),
        body('lastName').optional().notEmpty().withMessage('Фамилия не может быть пустой'),
        body('age').optional().isInt({ min: 0 }).withMessage('Возраст должен быть положительным числом'),
    ],
    PatientController.update
);

router.delete('/:id', authenticateToken, PatientController.delete);

module.exports = router;
