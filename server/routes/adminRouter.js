const express = require('express');
const AdminController = require('../controllers/AdminController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Admin routes
router.post('/registration', AdminController.registration); // Public
router.post('/login', AdminController.login); // Public
router.get('/auth', authenticateToken, AdminController.auth); // Requires authentication
router.get('/', authenticateToken, AdminController.findAll); // Requires authentication
router.get('/:id', authenticateToken, AdminController.findOne); // Requires authentication
router.put('/:id', authenticateToken, AdminController.update); // Requires authentication
router.delete('/:id', authenticateToken, AdminController.delete); // Requires authentication

module.exports = router;
