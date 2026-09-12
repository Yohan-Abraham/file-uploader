import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { prisma } from '../database/client.js';
import type { Request, Response, NextFunction } from 'express';

// ---- Local strategy: authenticate by username + password ----
passport.use(
  new LocalStrategy(
    { usernameField: 'username', passwordField: 'password' },
    async (username, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
          return done(null, false, {
            message: 'Incorrect username or password',
          });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return done(null, false, {
            message: 'Incorrect username or password',
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

// ---- Persist user id into the session ----
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// ---- Pull full user back out of the session on each request ----
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/log-in');
}

export default passport;
