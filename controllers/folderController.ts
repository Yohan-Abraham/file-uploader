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

  if (req.body.foldername.trim().toLowerCase() === 'mydrive') {
    return res.status(400).render('addFolder', {
      error: 'The mydrive folder is reserved',
    });
  }

  const myDrive = await prisma.folder.findFirst({
    where: { userId: req.user.id, isRoot: true },
  });

  if (!myDrive) {
    return res.status(500).render('addFolder', {
      error: 'Your mydrive folder could not be found',
    });
  }

  await prisma.folder.create({
    data: {
      name: req.body.foldername.trim(),
      userId: req.user.id,
      parentId: myDrive.id,
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
      isRoot: false,
      parent: { userId: req.user.id },
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

  const result = await prisma.folder.updateMany({
    where: {
      id: folderId,
      userId: req.user.id,
      isRoot: false,
      parent: { userId: req.user.id },
    },
    data: { name: req.body.foldername.trim() },
  });

  if (result.count === 0) {
    return res.status(404).send('Folder not found or cannot be updated');
  }

  res.redirect('/');
}
