import { body, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

export const activateValidationRules = [
  body('token')
    .trim()
    .notEmpty().withMessage('Invitation activation token is required'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/).withMessage('Password must contain at least one special character'),

  body('confirmPassword')
    .notEmpty().withMessage('Password confirmation is required')
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  handleValidationErrors
];

export const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Please enter your work email address')
    .isEmail().withMessage('Please enter a valid email format (e.g. name@company.com)'),

  body('password')
    .notEmpty().withMessage('Please enter your password'),

  handleValidationErrors
];

export const profileUpdateValidationRules = [
  body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Full Name must be at least 2 characters'),
  body('phone').optional().trim().matches(/^[+0-9\s-()]*$/).withMessage('Invalid phone number format'),
  body('address').optional().trim().isLength({ max: 200 }).withMessage('Address is too long'),
  body('emergencyContact').optional().trim().isLength({ max: 100 }).withMessage('Emergency contact is too long'),
  body('avatar').optional().trim(),
  handleValidationErrors
];

export const leaveApplyValidationRules = [
  body('leaveType')
    .notEmpty().withMessage('Leave type is required')
    .isIn(['Paid', 'Sick', 'Unpaid', 'Casual', 'Maternity/Paternity']).withMessage('Invalid leave type selected'),

  body('fromDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Valid start date format (YYYY-MM-DD) is required'),

  body('toDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Valid end date format (YYYY-MM-DD) is required')
    .custom((toDate, { req }) => {
      if (new Date(toDate) < new Date(req.body.fromDate)) {
        throw new Error('End date cannot be earlier than start date');
      }
      return true;
    }),

  body('remarks')
    .trim()
    .notEmpty().withMessage('Remarks/reason is required')
    .isLength({ min: 5, max: 500 }).withMessage('Remarks must be between 5 and 500 characters'),

  handleValidationErrors
];

export const reviewCreateValidationRules = [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be an integer between 0 and 100'),
  body('period').notEmpty().withMessage('Review period is required'),
  body('feedback').trim().isLength({ min: 10 }).withMessage('Feedback must be at least 10 characters'),
  handleValidationErrors
];
