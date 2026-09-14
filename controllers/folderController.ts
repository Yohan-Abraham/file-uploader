import { prisma } from '../database/client.js';
import type { Request, Response } from 'express';

export function getFolderPage(req: Request, res: Response) {
  res.render('addFolder');
}

export async function postFolder(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).render('addFolder', { error: 'Not authenticated' });
  }

  if (!req.body.foldername?.trim()) {
    return res
      .status(400)
      .render('addFolder', { error: 'Folder name is required' });
  }

  await prisma.folder.create({
    data: {
      name: req.body.foldername.trim(),
      userId: req.user.id,
    },
    include: {
      files: true,
    },
  });

  res.redirect('/');
}

export async function deleteFolder(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).redirect('/auth/log-in');
  }

  const folderId = Number(req.params.id);
  if (!Number.isInteger(folderId)) {
    return res.status(400).send('Invalid folder id');
  }

  const result = await prisma.folder.deleteMany({
    where: {
      id: folderId,
      userId: req.user.id,
    },
  });

  if (result.count === 0) {
    return res.status(404).send('Folder not found');
  }

  res.redirect('/');
}

export async function getUpdatePage(req: Request, res: Response) {
  const folderInfo = await prisma.folder.findUnique({
    where: { id: Number(req.params.id) },
  });
  res.render('updateFolder', { folderInfo });
}

export async function updateFolder(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).redirect('/auth/log-in');
  }

  const folderId = Number(req.params.id);
  if (!Number.isInteger(folderId)) {
    return res.status(400).send('Invalid folder id');
  }

  await prisma.folder.update({
    where: { id: Number(req.params.id) },
    data: { name: req.body.foldername },
  });
  res.redirect('/');
}
