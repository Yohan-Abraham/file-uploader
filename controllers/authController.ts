import { prisma } from '../database/client.js';
import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';

export function getSignUpPage(req: Request, res: Response) {
  res.render('sign-up');
}

export async function postUser(req: Request, res: Response) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(400).render('sign-up', {
      error: errors.array(),
    });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  await prisma.user.create({
    data: {
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email.toLowerCase(),
    },
  });
  res.redirect('/');
}

export function getLogInPage(req: Request, res: Response) {
  res.render('log-in');
}

export function logOut(req: Request, res: Response, next: NextFunction) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
}
