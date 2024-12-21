const express = require('express');
const DepartmentController = require('../controllers/DepartmentController');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Routes for department management

// Create a new department
router.post(
    '/create',
    authenticateToken, // Ensure the user is authenticated
    [
        // Validation for department creation
        body('name').notEmpty().withMessage('Название отдела обязательно'),
    ],
    DepartmentController.create
);

// Get a department by ID
router.get('/:id', authenticateToken, DepartmentController.findOne);

// Get a list of all departments
router.get('/', authenticateToken, DepartmentController.findAll);

// Update a department
router.put(
    '/:id',
    authenticateToken,
    [
        // Validation for department update
        body('name').optional().notEmpty().withMessage('Название отдела не может быть пустым'),
    ],
    DepartmentController.update
);

// Delete a department
router.delete('/:id', authenticateToken, DepartmentController.delete);

module.exports = router;
