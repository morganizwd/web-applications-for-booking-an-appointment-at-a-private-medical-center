const express = require('express');
const DepartmentController = require('../controllers/DepartmentController');
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
        body('name').notEmpty().withMessage('Название отдела обязательно'),
    ],
    DepartmentController.create
);

router.get('/:id', authenticateToken, DepartmentController.findOne);

router.get('/', DepartmentController.findAll);

router.put(
    '/:id',
    authenticateToken,
    upload.single('photo'),
    [
        body('name').optional().notEmpty().withMessage('Название отдела не может быть пустым'),
    ],
    DepartmentController.update
);

router.delete('/:id', authenticateToken, DepartmentController.delete);

module.exports = router;
