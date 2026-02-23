const Router = require('express').Router;
const router = new Router();
const ragController = require('../controllers/RAGController');
const authenticateToken = require('../middleware/authenticateToken');
const checkRole = require('../middleware/checkRole');

// Все пользователи могут задавать вопросы
router.post('/ask', authenticateToken, ragController.askQuestion);

// Получение услуг, для которых есть документы в базе знаний
router.get('/services', authenticateToken, ragController.getServicesWithDocuments);

// Только администраторы могут управлять документами
router.post('/documents', authenticateToken, checkRole('admin'), ragController.uploadMiddleware(), ragController.uploadDocument);
router.get('/documents', authenticateToken, ragController.getDocuments);
router.get('/documents/:id', authenticateToken, ragController.getDocument);
router.put('/documents/:id', authenticateToken, checkRole('admin'), ragController.updateDocument);
router.delete('/documents/:id', authenticateToken, checkRole('admin'), ragController.deleteDocument);

module.exports = router;
