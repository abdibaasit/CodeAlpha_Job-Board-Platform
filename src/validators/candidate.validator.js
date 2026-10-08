const { body } = require('express-validator');

const candidateProfileValidator = [
  body('phone')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Phone must be a string'),

  body('location')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Location must be a string'),

  body('bio')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Bio must be a string'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array of strings'),

  body('education')
    .optional()
    .isArray()
    .withMessage('Education must be an array of objects'),

  body('experience')
    .optional()
    .isArray()
    .withMessage('Experience must be an array of objects')
];

module.exports = {
  candidateProfileValidator
};
