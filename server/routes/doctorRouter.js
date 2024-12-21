const express = require('express');
const DoctorController = require('../controllers/DoctorController');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes for doctor management

// Registration
router.post(
    '/registration',
    upload.single('photo'), // Handle photo upload
    [
        // Validation for doctor registration
        body('login').notEmpty().withMessage('Логин обязателен'),
        body('password').notEmpty().withMessage('Пароль обязателен'),
        body('firstName').notEmpty().withMessage('Имя обязательно'),
        body('lastName').notEmpty().withMessage('Фамилия обязательна'),
        body('specialization').notEmpty().withMessage('Специализация обязательна'),
    ],
    DoctorController.registration
);

// Login
router.post(
    '/login',
    [
        body('login').notEmpty().withMessage('Логин обязателен'),
        body('password').notEmpty().withMessage('Пароль обязателен'),
    ],
    DoctorController.login
);

// Authenticate
router.get('/auth', authenticateToken, DoctorController.auth);

// Get a specific doctor by ID
router.get('/:id', authenticateToken, DoctorController.findOne);

// Get all doctors
router.get('/', authenticateToken, DoctorController.findAll);

// Update doctor data
router.put(
    '/:id',
    authenticateToken,
    upload.single('photo'), // Handle photo upload
    [
        // Validation for updating doctor
        body('login').optional().notEmpty().withMessage('Логин не может быть пустым'),
        body('password').optional().notEmpty().withMessage('Пароль не может быть пустым'),
        body('firstName').optional().notEmpty().withMessage('Имя не может быть пустым'),
        body('lastName').optional().notEmpty().withMessage('Фамилия не может быть пустой'),
        body('specialization').optional().notEmpty().withMessage('Специализация не может быть пустой'),
    ],
    DoctorController.update
);

// Delete a doctor
router.delete('/:id', authenticateToken, DoctorController.delete);

module.exports = router;
