const express = require('express');
const DiagnosisController = require('../controllers/DiagnosisController');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Routes for diagnosis management

// Create a new diagnosis
router.post(
    '/create',
    authenticateToken, // Ensure the user is authenticated
    [
        // Validation for diagnosis creation
        body('name').notEmpty().withMessage('Название обязательно'),
        body('conclusion').notEmpty().withMessage('Заключение обязательно'),
    ],
    DiagnosisController.create
);

// Get a diagnosis by ID
router.get('/:id', authenticateToken, DiagnosisController.findOne);

// Get a list of all diagnoses
router.get('/', authenticateToken, DiagnosisController.findAll);

// Update a diagnosis
router.put(
    '/:id',
    authenticateToken,
    [
        // Validation for diagnosis update
        body('name').optional().notEmpty().withMessage('Название не может быть пустым'),
        body('conclusion').optional().notEmpty().withMessage('Заключение не может быть пустым'),
    ],
    DiagnosisController.update
);

// Delete a diagnosis
router.delete('/:id', authenticateToken, DiagnosisController.delete);

module.exports = router;
