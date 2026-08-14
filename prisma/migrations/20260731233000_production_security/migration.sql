-- Production security controls: step-up auth, immutable audit, secure media,
-- moderation, push queue, data exports, account deletion, and retention.

ALTER TABLE "User"
  ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user',
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN "deletionScheduledAt" TIMESTAMP(3),
  ADD COLUMN "deletedAt" TIMESTAMP(3);

ALTER TABLE "AuthSession" ADD COLUMN "stepUpVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Message" ADD COLUMN "moderationStatus" TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE "UserSettings"
  ADD COLUMN "pushMessages" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "pushRequests" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "pushAppointments" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "notificationPreview" TEXT NOT NULL DEFAULT 'generic';
ALTER TABLE "Report"
  ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'normal',
  ADD COLUMN "legalHoldUntil" TIMESTAMP(3);

CREATE TABLE "MediaAsset" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "petId" TEXT,
  "purpose" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'awaiting_upload',
  "quarantineKey" TEXT NOT NULL,
  "processedKey" TEXT,
  "publicUrl" TEXT,
  "declaredMime" TEXT NOT NULL,
  "detectedMime" TEXT,
  "declaredSize" INTEGER NOT NULL,
  "observedSize" INTEGER,
  "checksumSha256" TEXT NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "moderationLabels" TEXT[] NOT NULL,
  "rejectionReason" TEXT,
  "retentionUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ModerationCase" (
  "id" TEXT NOT NULL,
  "subjectUserId" TEXT,
  "reportId" TEXT,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT,
  "source" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "severity" TEXT NOT NULL DEFAULT 'medium',
  "categories" TEXT[] NOT NULL,
  "evidence" JSONB,
  "provider" TEXT,
  "providerVersion" TEXT,
  "automatedDecision" TEXT,
  "legalHoldUntil" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ModerationCase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ModerationAppeal" (
  "id" TEXT NOT NULL,
  "moderationCaseId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ModerationAppeal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PushJob" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "notBefore" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PushJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DataExportJob" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "objectKey" TEXT,
  "expiresAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DataExportJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccountDeletionRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "cancelledAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "reason" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AccountDeletionRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SecurityAuditEvent" (
  "id" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actorUserId" TEXT,
  "sessionId" TEXT,
  "action" TEXT NOT NULL,
  "outcome" TEXT NOT NULL,
  "targetType" TEXT,
  "targetId" TEXT,
  "requestId" TEXT,
  "ipHash" TEXT,
  "userAgentHash" TEXT,
  "metadata" JSONB,
  "eventHash" TEXT NOT NULL,
  CONSTRAINT "SecurityAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MediaAsset_quarantineKey_key" ON "MediaAsset"("quarantineKey");
CREATE UNIQUE INDEX "MediaAsset_processedKey_key" ON "MediaAsset"("processedKey");
CREATE INDEX "MediaAsset_ownerId_status_createdAt_idx" ON "MediaAsset"("ownerId", "status", "createdAt");
CREATE INDEX "MediaAsset_retentionUntil_status_idx" ON "MediaAsset"("retentionUntil", "status");
CREATE UNIQUE INDEX "ModerationCase_reportId_key" ON "ModerationCase"("reportId");
CREATE INDEX "ModerationCase_status_severity_createdAt_idx" ON "ModerationCase"("status", "severity", "createdAt");
CREATE INDEX "ModerationCase_subjectUserId_createdAt_idx" ON "ModerationCase"("subjectUserId", "createdAt");
CREATE INDEX "ModerationCase_targetType_targetId_idx" ON "ModerationCase"("targetType", "targetId");
CREATE UNIQUE INDEX "ModerationAppeal_moderationCaseId_userId_key" ON "ModerationAppeal"("moderationCaseId", "userId");
CREATE INDEX "ModerationAppeal_status_createdAt_idx" ON "ModerationAppeal"("status", "createdAt");
CREATE INDEX "PushJob_status_notBefore_createdAt_idx" ON "PushJob"("status", "notBefore", "createdAt");
CREATE INDEX "PushJob_userId_status_idx" ON "PushJob"("userId", "status");
CREATE UNIQUE INDEX "DataExportJob_objectKey_key" ON "DataExportJob"("objectKey");
CREATE INDEX "DataExportJob_userId_status_createdAt_idx" ON "DataExportJob"("userId", "status", "createdAt");
CREATE INDEX "DataExportJob_expiresAt_status_idx" ON "DataExportJob"("expiresAt", "status");
CREATE UNIQUE INDEX "AccountDeletionRequest_userId_key" ON "AccountDeletionRequest"("userId");
CREATE INDEX "AccountDeletionRequest_status_scheduledAt_idx" ON "AccountDeletionRequest"("status", "scheduledAt");
CREATE UNIQUE INDEX "SecurityAuditEvent_eventHash_key" ON "SecurityAuditEvent"("eventHash");
CREATE INDEX "SecurityAuditEvent_occurredAt_idx" ON "SecurityAuditEvent"("occurredAt");
CREATE INDEX "SecurityAuditEvent_actorUserId_occurredAt_idx" ON "SecurityAuditEvent"("actorUserId", "occurredAt");
CREATE INDEX "SecurityAuditEvent_action_outcome_occurredAt_idx" ON "SecurityAuditEvent"("action", "outcome", "occurredAt");

ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_moderationCaseId_fkey" FOREIGN KEY ("moderationCaseId") REFERENCES "ModerationCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PushJob" ADD CONSTRAINT "PushJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataExportJob" ADD CONSTRAINT "DataExportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountDeletionRequest" ADD CONSTRAINT "AccountDeletionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "User" ADD CONSTRAINT "User_role_check" CHECK ("role" IN ('user', 'moderator', 'admin'));
ALTER TABLE "User" ADD CONSTRAINT "User_status_check" CHECK ("status" IN ('active', 'pending_deletion', 'suspended', 'deleted'));
ALTER TABLE "Message" ADD CONSTRAINT "Message_moderationStatus_check" CHECK ("moderationStatus" IN ('approved', 'flagged', 'blocked', 'deleted'));
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_notificationPreview_check" CHECK ("notificationPreview" IN ('generic', 'hidden'));
ALTER TABLE "Report" ADD CONSTRAINT "Report_priority_check" CHECK ("priority" IN ('normal', 'urgent'));
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_purpose_check" CHECK ("purpose" IN ('profile_avatar', 'pet_photo'));
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_status_check" CHECK ("status" IN ('awaiting_upload', 'scanning', 'processing_failed', 'rejected', 'ready'));
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_size_check" CHECK ("declaredSize" > 0 AND "declaredSize" <= 6291456 AND ("observedSize" IS NULL OR "observedSize" <= 6291456));
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_status_check" CHECK ("status" IN ('open', 'appealed', 'actioned', 'dismissed'));
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_severity_check" CHECK ("severity" IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE "ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_status_check" CHECK ("status" IN ('pending', 'accepted', 'rejected'));
ALTER TABLE "PushJob" ADD CONSTRAINT "PushJob_status_check" CHECK ("status" IN ('pending', 'processing', 'sent', 'skipped', 'failed'));
ALTER TABLE "DataExportJob" ADD CONSTRAINT "DataExportJob_status_check" CHECK ("status" IN ('pending', 'processing', 'ready', 'failed'));
ALTER TABLE "AccountDeletionRequest" ADD CONSTRAINT "AccountDeletionRequest_status_check" CHECK ("status" IN ('scheduled', 'cancelled', 'completed'));
ALTER TABLE "SecurityAuditEvent" ADD CONSTRAINT "SecurityAuditEvent_outcome_check" CHECK ("outcome" IN ('success', 'denied', 'failure'));

CREATE OR REPLACE FUNCTION tindog_protect_security_audit_event()
RETURNS trigger AS $$
BEGIN
  IF current_setting('tindog.retention_worker', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'SecurityAuditEvent is append-only';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "SecurityAuditEvent_append_only"
BEFORE UPDATE OR DELETE ON "SecurityAuditEvent"
FOR EACH ROW EXECUTE FUNCTION tindog_protect_security_audit_event();
