-- Provision the protected root folder for users created before root folders were introduced.
INSERT INTO "folder" ("name", "isRoot", "userId")
SELECT 'mydrive', true, u."id"
FROM "user" AS u
WHERE NOT EXISTS (
  SELECT 1
  FROM "folder" AS f
  WHERE f."userId" = u."id" AND f."name" = 'mydrive'
);

-- Preserve an existing mydrive folder as the protected root.
UPDATE "folder"
SET "isRoot" = true
WHERE lower("name") = 'mydrive';
