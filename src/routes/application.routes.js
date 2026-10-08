const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { updateApplicationStatusValidator } = require('../validators/application.validator');
const validate = require('../middleware/validation.middleware');

router.use(authenticate);

// Candidate routes
router.get('/my', requireRole('candidate'), applicationController.getMyApplications);
router.patch('/:applicationId/withdraw', requireRole('candidate'), applicationController.withdrawApplication);

// General view application route (Candidate own app, Employer job app, Admin any app)
router.get('/:applicationId', applicationController.getApplicationById);

// Employer / Admin update application status
router.patch(
  '/:applicationId/status',
  requireRole('employer', 'admin'),
  updateApplicationStatusValidator,
  validate,
  applicationController.updateApplicationStatus
);

module.exports = router;
