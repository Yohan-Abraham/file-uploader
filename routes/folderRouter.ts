import { Router } from 'express';
import {
  deleteFolder,
  getFolderPage,
  getUpdatePage,
  postFolder,
  updateFolder,
} from '../controllers/folderController.js';
import { ensureAuthenticated } from '../config/passport.js';

export const folderRouter = Router();

folderRouter.get('/', ensureAuthenticated, getFolderPage);
folderRouter.post('/', ensureAuthenticated, postFolder);

folderRouter.get('/:id/update', getUpdatePage);
folderRouter.post('/:id/update', updateFolder);

folderRouter.post('/:id/delete', ensureAuthenticated, deleteFolder);
