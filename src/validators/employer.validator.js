const { body } = require('express-validator');

const employerProfileValidator = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),

  body('industry')
    .trim()
    .notEmpty()
    .withMessage('Industry is required'),

  body('website')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Website must be a valid URL'),

  body('phone')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Phone must be a valid string')
];

module.exports = {
  employerProfileValidator
};
