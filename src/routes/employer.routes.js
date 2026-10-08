const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employer.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { employerProfileValidator } = require('../validators/employer.validator');
const validate = require('../middleware/validation.middleware');

// Public route to view employer details
router.get('/:employerId', employerController.getEmployerById);

// Protected routes for employers
router.use(authenticate);
router.post(
  '/profile',
  requireRole('employer'),
  employerProfileValidator,
  validate,
  employerController.createProfile
);
router.get('/profile', requireRole('employer'), employerController.getMyProfile);
router.put(
  '/profile',
  requireRole('employer'),
  employerProfileValidator,
  validate,
  employerController.updateProfile
);

module.exports = router;
