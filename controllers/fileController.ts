import { prisma } from '../database/client.js';
import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import path from 'node:path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

  const file = req.file;
  const safeOriginalName = path
    .basename(file.originalname)
    .replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${req.user.id}/${folder.id}/${crypto.randomUUID()}-${safeOriginalName}`;

  const { data, error } = await supabase.storage
    .from('files')
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    return res.status(500).render('addFile', { error: error.message });
  }

  const { size, mimetype } = req.file;
  try {
    await prisma.file.create({
      data: {
        name: req.body.filename,
        size: BigInt(size),
        fileType: mimetype,
        folderId: folder.id,
        url: data.path,
      },
    });
  } catch (databaseError) {
    await supabase.storage.from('files').remove([storagePath]);
    throw databaseError;
  }

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

  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      folder: { userId: req.user.id },
    },
    select: { url: true },
  });

  if (!file) {
    return res.status(404).send('File not found');
  }

  await prisma.file.delete({ where: { id: fileId } });

  if (file.url) {
    const { error } = await supabase.storage.from('files').remove([file.url]);
    if (error) {
      console.error('Supabase file deletion failed:', error.message);
    }
  }

  res.redirect('/');
}

export async function downloadFile(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).render('addFile', { error: 'Not authenticated' });
  }

  const id = Number(req.params.id);

  const file = await prisma.file.findFirst({
    where: {
      id,
      folder: { userId: req.user.id },
    },
  });

  if (!file) {
    return res.status(404).send('File not found');
  }

  const { data, error } = await supabase.storage
    .from('files')
    .createSignedUrl(file.url, 60, {
      download: file.name,
    });

  if (error || !data) {
    return res.status(500).send('Could not generate download link');
  }

  res.redirect(data.signedUrl);
}
