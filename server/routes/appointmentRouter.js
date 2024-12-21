const express = require('express');
const AppointmentController = require('../controllers/AppointmentController');
const authenticateToken = require('../middleware/authenticateToken');
const { body } = require('express-validator');

const router = express.Router();

// Routes for appointment management

// Create a new appointment
router.post(
    '/create',
    authenticateToken, // Authentication middleware
    [
        // Validation middlewares
        body('date').notEmpty().withMessage('Дата обязательна').isISO8601().withMessage('Некорректный формат даты'),
        body('doctorId').notEmpty().withMessage('ID врача обязателен').isInt().withMessage('ID врача должен быть числом'),
        body('patientId').notEmpty().withMessage('ID пациента обязателен').isInt().withMessage('ID пациента должен быть числом'),
    ],
    AppointmentController.create
);

// Get an appointment by ID
router.get('/:id', authenticateToken, AppointmentController.findOne);

// Get a list of all appointments
router.get('/', authenticateToken, AppointmentController.findAll);

// Update an appointment
router.put(
    '/:id',
    authenticateToken,
    [
        // Validation middlewares
        body('date').optional().isISO8601().withMessage('Некорректный формат даты'),
        body('doctorId').optional().isInt().withMessage('ID врача должен быть числом'),
        body('patientId').optional().isInt().withMessage('ID пациента должен быть числом'),
    ],
    AppointmentController.update
);

// Delete an appointment
router.delete('/:id', authenticateToken, AppointmentController.delete);

module.exports = router;
