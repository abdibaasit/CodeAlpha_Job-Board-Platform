const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidate.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { candidateProfileValidator } = require('../validators/candidate.validator');
const validate = require('../middleware/validation.middleware');

// Public route to view candidate profile (e.g. for employers/admins)
router.get('/:candidateId', candidateController.getCandidateById);

// Protected routes for candidates
router.use(authenticate);
router.post(
  '/profile',
  requireRole('candidate'),
  candidateProfileValidator,
  validate,
  candidateController.createProfile
);
router.get('/profile', requireRole('candidate'), candidateController.getMyProfile);
router.put(
  '/profile',
  requireRole('candidate'),
  candidateProfileValidator,
  validate,
  candidateController.updateProfile
);

module.exports = router;
