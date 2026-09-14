import { prisma } from '../database/client.js';
import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';

export function getFilePage(req: Request, res: Response) {
  res.render('addFile');
}

export async function postFile(req: Request, res: Response) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render('addFile', { error: errors.array() });
  }

  if (!req.user) {
    return res.status(401).render('addFile', { error: 'Not authenticated' });
  }

  if (!req.file) {
    return res.status(400).render('addFile', { error: 'No file uploaded' });
  }

  const folderId = Number(req.body.folderId);
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId: req.user.id },
  });

  if (!folder) {
    return res.status(404).render('addFile', { error: 'Folder not found' });
  }

  const { size, mimetype } = req.file;
  await prisma.file.create({
    data: {
      name: req.body.filename,
      size: BigInt(size),
      fileType: mimetype,
      folderId: folder.id,
    },
  });

  res.redirect('/');
}

export async function getFileDetails(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).render('addFile', { error: 'Not authenticated' });
  }

  const id = Number(req.params.id);

  const details = await prisma.file.findFirst({
    where: {
      id,
      folder: { userId: req.user.id },
    },
  });
  res.render('fileDetails', { details });
}

export async function deleteFile(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).redirect('/auth/log-in');
  }

  const fileId = Number(req.params.id);
  if (!Number.isInteger(fileId)) {
    return res.status(400).send('Invalid file id');
  }

  const result = await prisma.file.deleteMany({
    where: {
      id: fileId,
      folder: { userId: req.user.id },
    },
  });

  if (result.count === 0) {
    return res.status(404).send('Folder not found');
  }

  res.redirect('/');
}
