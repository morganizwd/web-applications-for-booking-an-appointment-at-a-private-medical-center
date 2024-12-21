const Router = require('express').Router;
const router = new Router();

router.use('/admins', require('./adminRouter'));
router.use('/appointments', require('./appointmentRouter'));
router.use('/departments', require('./departmentRouter'));
router.use('/diagnoses', require('./diagnosisRouter'));
router.use('/doctors', require('./doctorRouter'));
router.use('/doctor-schedules', require('./doctorScheduleRouter'));
router.use('/patients', require('./patientRouter'));
router.use('/services', require('./serviceRouter'));

module.exports = router;
