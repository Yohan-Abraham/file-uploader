import { Router } from 'express';
import {
  deleteFile,
  downloadFile,
  getFileDetails,
  getFilePage,
  postFile,
} from '../controllers/fileController.js';
import multer from 'multer';
import { validateAddFile } from '../middleware/validator.js';
import { ensureAuthenticated } from '../config/passport.js';

const upload = multer({
  storage: multer.memoryStorage(),
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

fileRouter.post('/:id/download', ensureAuthenticated, downloadFile);
