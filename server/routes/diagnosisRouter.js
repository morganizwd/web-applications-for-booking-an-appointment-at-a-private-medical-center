const express = require('express');
const DiagnosisController = require('../controllers/DiagnosisController');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.post(
    '/',
    authenticateToken,
    [
        body('name').notEmpty().withMessage('Название обязательно'),
        body('conclusion').notEmpty().withMessage('Заключение обязательно'),
        body('patientId').notEmpty().withMessage('ID пациента обязателен')
            .isInt().withMessage('ID пациента должен быть числом'),
    ],
    DiagnosisController.create
);

router.get('/:id', authenticateToken, DiagnosisController.findOne);

router.get('/', authenticateToken, DiagnosisController.findAll);

router.put(
    '/:id',
    authenticateToken,
    [
        body('name').optional().notEmpty().withMessage('Название не может быть пустым'),
        body('conclusion').optional().notEmpty().withMessage('Заключение не может быть пустым'),
    ],
    DiagnosisController.update
);

router.delete('/:id', authenticateToken, DiagnosisController.delete);

module.exports = router;