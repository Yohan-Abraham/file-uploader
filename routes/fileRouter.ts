import { Router } from 'express';
import {
  deleteFile,
  getFileDetails,
  getFilePage,
  postFile,
} from '../controllers/fileController.js';
import multer from 'multer';
import { validateAddFile } from '../middleware/validator.js';
import crypto from 'crypto';
import { ensureAuthenticated } from '../config/passport.js';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
      if (err) return cb(err, '');
      const uniqueName = raw.toString('hex') + path.extname(file.originalname);
      cb(null, uniqueName);
    });
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const fileRouter = Router();

fileRouter.get('/', ensureAuthenticated, getFilePage);

fileRouter.post(
  '/',
  ensureAuthenticated,
  upload.single('fileinput'),
  validateAddFile,
  postFile,
);

fileRouter.get('/:id/details', ensureAuthenticated, getFileDetails);

fileRouter.post('/:id/delete', deleteFile);
