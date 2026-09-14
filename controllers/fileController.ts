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

  let folderId: number | undefined;
  if (req.body.folderId) {
    folderId = Number(req.body.folderId);
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId: req.user.id },
    });

    if (!folder) {
      return res.status(404).render('addFile', { error: 'Folder not found' });
    }
  }

  const { size, mimetype } = req.file;
  await prisma.file.create({
    data: {
      name: req.body.filename,
      size: BigInt(size),
      fileType: mimetype,
      userId: req.user.id,
      ...(folderId === undefined ? {} : { folderId }),
    },
  });

  res.redirect('/');
}
