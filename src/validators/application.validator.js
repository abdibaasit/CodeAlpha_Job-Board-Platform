const { body } = require('express-validator');

const applyJobValidator = [
  body('resumeId')
    .notEmpty()
    .withMessage('Resume ID is required')
    .isMongoId()
    .withMessage('Resume ID must be a valid MongoDB ObjectId'),

  body('coverLetter')
    .optional()
    .isString()
    .withMessage('Cover letter must be text')
];

const updateApplicationStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['applied', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected', 'withdrawn'])
    .withMessage('Invalid status value')
];

module.exports = {
  applyJobValidator,
  updateApplicationStatusValidator
};
