/*
  Warnings:

  - Made the column `url` on table `file` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "file" ALTER COLUMN "url" SET NOT NULL;
