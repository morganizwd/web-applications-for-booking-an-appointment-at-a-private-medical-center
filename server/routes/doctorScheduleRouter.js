const express = require('express');
const DoctorScheduleController = require('../controllers/DoctorScheduleController');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Routes for doctor schedule management

// Create a new schedule
router.post(
    '/create',
    authenticateToken, // Ensure the user is authenticated
    [
        // Validation for schedule creation
        body('doctorId').notEmpty().withMessage('ID врача обязательно').isInt().withMessage('ID врача должен быть числом'),
        body('dayOfWeek')
            .notEmpty()
            .withMessage('День недели обязателен')
            .isInt({ min: 0, max: 6 })
            .withMessage('День недели должен быть от 0 (Воскресенье) до 6 (Суббота)'),
        body('startTime').notEmpty().withMessage('Время начала обязательно').isString().withMessage('Время начала должно быть строкой'),
        body('endTime').notEmpty().withMessage('Время окончания обязательно').isString().withMessage('Время окончания должно быть строкой'),
    ],
    DoctorScheduleController.create
);

// Get a specific schedule by ID
router.get('/:id', authenticateToken, DoctorScheduleController.findOne);

// Get all schedules
router.get('/', authenticateToken, DoctorScheduleController.findAll);

// Update a schedule
router.put(
    '/:id',
    authenticateToken,
    [
        // Validation for schedule update
        body('doctorId').optional().isInt().withMessage('ID врача должен быть числом'),
        body('dayOfWeek')
            .optional()
            .isInt({ min: 0, max: 6 })
            .withMessage('День недели должен быть от 0 (Воскресенье) до 6 (Суббота)'),
        body('startTime').optional().isString().withMessage('Время начала должно быть строкой'),
        body('endTime').optional().isString().withMessage('Время окончания должно быть строкой'),
    ],
    DoctorScheduleController.update
);

// Delete a schedule
router.delete('/:id', authenticateToken, DoctorScheduleController.delete);

module.exports = router;
