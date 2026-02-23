const Router = require('express').Router;
const router = new Router();

// Новая система авторизации
router.use('/auth', require('./authRouter'));

// RAG модуль
router.use('/rag', require('./ragRouter'));

// Система отчётности
router.use('/reports', require('./reportRouter'));

// Существующие роуты (будут обновлены для работы с новой системой)
router.use('/appointments', require('./appointmentRouter'));
router.use('/departments', require('./departmentRouter'));
router.use('/diagnoses', require('./diagnosisRouter'));
router.use('/doctors', require('./doctorRouter'));
router.use('/doctor-schedules', require('./doctorScheduleRouter'));
router.use('/patients', require('./patientRouter'));
router.use('/services', require('./serviceRouter'));

module.exports = router;
