const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const applicationController = require('../controllers/application.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { jobValidator } = require('../validators/job.validator');
const { applyJobValidator } = require('../validators/application.validator');
const validate = require('../middleware/validation.middleware');

// Public routes for viewing and searching jobs
router.get('/', jobController.getJobs);
router.get('/:jobId', jobController.getJobById);

// Protected routes for candidate job application
router.post(
  '/:jobId/apply',
  authenticate,
  requireRole('candidate'),
  applyJobValidator,
  validate,
  applicationController.applyForJob
);

// Protected route for employer to view applications for their job
router.get(
  '/:jobId/applications',
  authenticate,
  requireRole('employer', 'admin'),
  applicationController.getApplicationsForJob
);

// Protected routes for creating and editing jobs
router.post(
  '/',
  authenticate,
  requireRole('employer'),
  jobValidator,
  validate,
  jobController.createJob
);

router.put(
  '/:jobId',
  authenticate,
  requireRole('employer', 'admin'),
  jobValidator,
  validate,
  jobController.updateJob
);

router.patch(
  '/:jobId/status',
  authenticate,
  requireRole('employer', 'admin'),
  jobController.updateJobStatus
);

router.delete(
  '/:jobId',
  authenticate,
  requireRole('employer', 'admin'),
  jobController.deleteJob
);

module.exports = router;
