-- AlterTable
ALTER TABLE "folder" ADD COLUMN     "parentId" INTEGER;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
