-- Persist the client platform for each session so web, Android, and iOS
-- sessions can be validated and revoked independently.
ALTER TABLE "AuthSession"
ADD COLUMN "platform" TEXT NOT NULL DEFAULT 'web',
ADD COLUMN "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "AuthSession_userId_platform_idx"
ON "AuthSession"("userId", "platform");
