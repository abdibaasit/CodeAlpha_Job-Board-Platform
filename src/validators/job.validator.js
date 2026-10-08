const { body } = require('express-validator');

const jobValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),

  body('employmentType')
    .notEmpty()
    .withMessage('Employment type is required')
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'remote'])
    .withMessage('Invalid employment type'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),

  body('salaryMin')
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage('Salary Min must be a number'),

  body('salaryMax')
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage('Salary Max must be a number'),

  body('deadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Deadline must be a valid date')
];

module.exports = {
  jobValidator
};
