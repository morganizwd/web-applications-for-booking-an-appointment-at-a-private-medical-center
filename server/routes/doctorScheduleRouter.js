const express = require('express');
const DoctorScheduleController = require('../controllers/DoctorScheduleController');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.post(
    '/create',
    authenticateToken,
    [
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

router.get('/:id', authenticateToken, DoctorScheduleController.findOne);

router.get('/', authenticateToken, DoctorScheduleController.findAll);

router.put(
    '/:id',
    authenticateToken,
    [
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

router.delete('/:id', authenticateToken, DoctorScheduleController.delete);

module.exports = router;
