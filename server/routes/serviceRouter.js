const express = require('express');
const ServiceController = require('../controllers/ServiceController');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
    '/create',
    authenticateToken, 
    upload.single('photo'), 
    [
        body('name').notEmpty().withMessage('Название услуги обязательно'),
        body('price').isFloat({ min: 0 }).withMessage('Цена должна быть положительным числом'),
    ],
    ServiceController.create
);

router.get('/:id', authenticateToken, ServiceController.findOne);

router.get('/', authenticateToken, ServiceController.findAll);

router.put(
    '/:id',
    authenticateToken,
    upload.single('photo'),
    [
        body('name').optional().notEmpty().withMessage('Название услуги не может быть пустым'),
        body('price').optional().isFloat({ min: 0 }).withMessage('Цена должна быть положительным числом'),
    ],
    ServiceController.update
);

router.delete('/:id', authenticateToken, ServiceController.delete);

module.exports = router;
