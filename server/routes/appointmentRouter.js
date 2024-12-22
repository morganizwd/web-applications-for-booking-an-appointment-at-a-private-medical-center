const express = require('express');
const AppointmentController = require('../controllers/AppointmentController');
const authenticateToken = require('../middleware/authenticateToken');
const { body } = require('express-validator');

const router = express.Router();

router.post(
    '/create',
    authenticateToken,
    [
        body('date').notEmpty().withMessage('Дата обязательна')
            .isISO8601().withMessage('Некорректный формат даты'),
        body('doctorId').notEmpty().withMessage('ID врача обязателен')
            .isInt().withMessage('ID врача должен быть числом'),
        body('patientId').notEmpty().withMessage('ID пациента обязателен')
            .isInt().withMessage('ID пациента должен быть числом'),
        body('serviceId').notEmpty().withMessage('ID услуги обязателен')
            .isInt().withMessage('ID услуги должен быть числом'),
    ],
    AppointmentController.create
);

router.get('/:id', authenticateToken, AppointmentController.findOne);
router.get('/', authenticateToken, AppointmentController.findAll);

router.put(
    '/:id',
    authenticateToken,
    [
        body('date').optional().isISO8601().withMessage('Некорректный формат даты'),
        body('doctorId').optional().isInt().withMessage('ID врача должен быть числом'),
        body('patientId').optional().isInt().withMessage('ID пациента должен быть числом'),
        body('serviceId').optional().isInt().withMessage('ID услуги должен быть числом'),
    ],
    AppointmentController.update
);

router.delete('/:id', authenticateToken, AppointmentController.delete);

module.exports = router;
