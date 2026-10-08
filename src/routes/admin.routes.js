const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/users', adminController.getAllUsers);
router.get('/jobs', adminController.getAllJobs);
router.get('/applications', adminController.getAllApplications);
router.get('/statistics', adminController.getStatistics);

module.exports = router;
