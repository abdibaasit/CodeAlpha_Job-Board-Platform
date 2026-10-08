const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

router.use(authenticate);
router.use(requireRole('candidate'));

router.post('/upload', upload.single('resume'), resumeController.uploadResume);
router.get('/my', resumeController.getMyResumes);
router.delete('/:resumeId', resumeController.deleteResume);

module.exports = router;
