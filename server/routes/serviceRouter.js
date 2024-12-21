const express = require('express');
const ServiceController = require('../controllers/ServiceController');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes for managing services

// Create a new service
router.post(
    '/create',
    authenticateToken, // Ensure the user is authenticated
    upload.single('photo'), // Handle photo upload
    [
        // Validation for service creation
        body('name').notEmpty().withMessage('Название услуги обязательно'),
        body('price').isFloat({ min: 0 }).withMessage('Цена должна быть положительным числом'),
    ],
    ServiceController.create
);

// Get a specific service by ID
router.get('/:id', authenticateToken, ServiceController.findOne);

// Get all services
router.get('/', authenticateToken, ServiceController.findAll);

// Update a service
router.put(
    '/:id',
    authenticateToken,
    upload.single('photo'), // Handle photo upload
    [
        // Validation for service updates
        body('name').optional().notEmpty().withMessage('Название услуги не может быть пустым'),
        body('price').optional().isFloat({ min: 0 }).withMessage('Цена должна быть положительным числом'),
    ],
    ServiceController.update
);

// Delete a service
router.delete('/:id', authenticateToken, ServiceController.delete);

module.exports = router;
