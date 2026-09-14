-- Attach existing non-root folders to each user's mydrive root.
UPDATE "folder" AS child
SET "parentId" = root."id"
FROM "folder" AS root
WHERE root."userId" = child."userId"
  AND root."isRoot" = true
  AND child."isRoot" = false
  AND child."parentId" IS NULL;
