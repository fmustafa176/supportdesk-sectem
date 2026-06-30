const { body, validationResult } = require('express-validator');

// validation rules for creating a ticket
const ticketValidation = [
  body('customer_name')
    .trim()
    .notEmpty().withMessage('customer name is required'),
  body('customer_email')
    .trim()
    .notEmpty().withMessage('customer email is required')
    .isEmail().withMessage('must be a valid email'),
  body('subject')
    .trim()
    .notEmpty().withMessage('subject is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('description is required')
    .isLength({ min: 10 }).withMessage('description must be at least 10 characters'),
  body('priority')
    .trim()
    .notEmpty().withMessage('priority is required')
    .isIn(['Low', 'Medium', 'High']).withMessage('priority must be Low, Medium, or High'),
];

// validation for status updates
const statusValidation = [
  body('status')
    .trim()
    .notEmpty().withMessage('status is required')
    .isIn(['Open', 'In Progress', 'Resolved']).withMessage('status must be Open, In Progress, or Resolved'),
];

// middleware to check validation results and return errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { ticketValidation, statusValidation, validate };
