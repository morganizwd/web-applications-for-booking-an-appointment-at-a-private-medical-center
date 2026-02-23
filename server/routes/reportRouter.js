const Router = require('express').Router;
const router = new Router();
const reportController = require('../controllers/ReportController');
const authenticateToken = require('../middleware/authenticateToken');
const checkRole = require('../middleware/checkRole');

// Создание отчёта доступно администраторам и врачам
router.post('/create', authenticateToken, checkRole('admin', 'doctor'), reportController.createReport);

// Прямой экспорт приёмов (только для админов)
router.get('/export-appointments', authenticateToken, checkRole('admin'), reportController.exportAppointments.bind(reportController));

// Просмотр заданий
router.get('/jobs', authenticateToken, reportController.getJobs);
router.get('/jobs/:id', authenticateToken, reportController.getJob);

// Скачивание отчёта
router.get('/download/:id', authenticateToken, reportController.downloadReport);

module.exports = router;
