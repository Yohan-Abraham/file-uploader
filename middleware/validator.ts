import { body } from 'express-validator';

export const validateSignUp = [
  body('firstname')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastname')
    .trim()
    .optional({ values: 'falsy' })
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('username is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('username must be between 1 and 200 characters'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('passwor is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('password must be between 1 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('email must be between 1 and 200 characters'),
];

export const validateLogin = [
  body('username').trim().notEmpty().withMessage('username is required'),
  body('password').notEmpty().withMessage('password is required'),
];
