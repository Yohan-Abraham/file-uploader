import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { prisma } from './database/client.js';

// Route imports (create these files as you build each feature)
import { authRouter } from './routes/authRouter.js';
import { folderRouter } from './routes/folderRouter.js';
import { fileRouter } from './routes/fileRouter.js';

// Passport strategy config (LocalStrategy, serializeUser/deserializeUser, etc.)
import './config/passport.js';

const app = express();

// ---- View engine (swap for your templating choice, or remove if API-only) ----
app.set('view engine', 'ejs');
app.set('views', 'views');

// ---- Core middleware ----
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// ---- Session (backed by Prisma so sessions persist in the DB) ----
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // clean up expired sessions every 2 min
      dbRecordIdIsSessionId: true,
    }),
  }),
);

// ---- Passport ----
app.use(passport.initialize());
app.use(passport.session());

// ---- Make current user available in all views ----
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// ---- Routes ----
app.get('/', (req, res) => {
  res.render('index');
});

app.use('/auth', authRouter); // /login, /signup, /logout
app.use('/folders', folderRouter); // folder CRUD
app.use('/files', fileRouter); // upload, download, file details

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).render('404');
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`),
);

// ---- Graceful shutdown ----
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
