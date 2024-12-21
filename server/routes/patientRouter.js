const express = require('express');
const PatientController = require('../controllers/patientController');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes for patient management

// Register a new patient
router.post(
    '/registration',
    upload.single('photo'), // Handle photo upload
    [
        // Validation for patient registration
        body('login').notEmpty().withMessage('Логин обязателен'),
        body('password').notEmpty().withMessage('Пароль обязателен'),
        body('firstName').notEmpty().withMessage('Имя обязательно'),
        body('lastName').notEmpty().withMessage('Фамилия обязательна'),
        body('age').isInt({ min: 0 }).withMessage('Возраст должен быть положительным числом'),
    ],
    PatientController.registration
);

// Login patient
router.post(
    '/login',
    [
        body('login').notEmpty().withMessage('Логин обязателен'),
        body('password').notEmpty().withMessage('Пароль обязателен'),
    ],
    PatientController.login
);

// Authenticate patient
router.get('/auth', authenticateToken, PatientController.auth);

// Get a specific patient by ID
router.get('/:id', authenticateToken, PatientController.findOne);

// Get all patients
router.get('/', authenticateToken, PatientController.findAll);

// Update patient data
router.put(
    '/:id',
    authenticateToken,
    upload.single('photo'), // Handle photo upload
    [
        // Validation for updating patient
        body('login').optional().notEmpty().withMessage('Логин не может быть пустым'),
        body('password').optional().notEmpty().withMessage('Пароль не может быть пустым'),
        body('firstName').optional().notEmpty().withMessage('Имя не может быть пустым'),
        body('lastName').optional().notEmpty().withMessage('Фамилия не может быть пустой'),
        body('age').optional().isInt({ min: 0 }).withMessage('Возраст должен быть положительным числом'),
    ],
    PatientController.update
);

// Delete a patient
router.delete('/:id', authenticateToken, PatientController.delete);

module.exports = router;
