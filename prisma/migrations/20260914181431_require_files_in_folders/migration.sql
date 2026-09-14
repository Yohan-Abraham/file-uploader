/*
  Warnings:

  - Made the column `folderId` on table `file` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "file_folderId_fkey";

-- AlterTable
ALTER TABLE "file" ALTER COLUMN "folderId" SET NOT NULL;

-- AlterTable
ALTER TABLE "folder" ADD COLUMN     "isRoot" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
