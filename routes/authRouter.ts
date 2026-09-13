import { Router } from 'express';
import {
  getLogInPage,
  getSignUpPage,
  logOut,
  postUser,
} from '../controllers/authController.js';
import { validateLogin, validateSignUp } from '../middleware/validator.js';
import passport from 'passport';
export const authRouter = Router();

authRouter.get('/sign-up', getSignUpPage);
authRouter.post('/sign-up', validateSignUp, postUser);
authRouter.get('/log-in', getLogInPage);
authRouter.post(
  '/log-in',
  validateLogin,
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/log-in',
    failureMessage: true,
  }),
);

authRouter.get('/log-out', logOut);
