/*
  Warnings:

  - You are about to drop the column `userId` on the `file` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "file_userId_fkey";

-- AlterTable
ALTER TABLE "file" DROP COLUMN "userId";
