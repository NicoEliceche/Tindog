-- Social connection requests gate conversations and prevent unsolicited direct messages.
ALTER TABLE "Appointment" ALTER COLUMN "agreementId" DROP NOT NULL;
ALTER TABLE "Appointment" ADD COLUMN "conversationId" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "endAt" TIMESTAMP(3);

ALTER TABLE "Location" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Location" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Location" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Location" ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "Message" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'text';
ALTER TABLE "Message" ADD COLUMN "readAt" TIMESTAMP(3);
ALTER TABLE "Message" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Message" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Message" ALTER COLUMN "updatedAt" DROP DEFAULT;

CREATE TABLE "ConnectionRequest" (
  "id" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  "petId" TEXT NOT NULL,
  "conversationId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "respondedAt" TIMESTAMP(3),
  CONSTRAINT "ConnectionRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ConnectionRequest_not_self" CHECK ("senderId" <> "receiverId"),
  CONSTRAINT "ConnectionRequest_status_check" CHECK ("status" IN ('pending', 'accepted', 'declined'))
);

CREATE TABLE "AppointmentParticipant" (
  "id" TEXT NOT NULL,
  "appointmentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "petId" TEXT,
  CONSTRAINT "AppointmentParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SafeLocationReview" (
  "id" TEXT NOT NULL,
  "locationId" TEXT NOT NULL,
  "appointmentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT NOT NULL,
  "verifiedAttendance" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SafeLocationReview_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SafeLocationReview_rating_check" CHECK ("rating" BETWEEN 1 AND 5),
  CONSTRAINT "SafeLocationReview_comment_check" CHECK (char_length("comment") BETWEEN 10 AND 1000)
);

CREATE TABLE "SafetyCheckIn" (
  "id" TEXT NOT NULL,
  "appointmentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "checkedInAt" TIMESTAMP(3),
  "checkedOutAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SafetyCheckIn_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SafetyCheckIn_status_check" CHECK ("status" IN ('pending', 'checked_in', 'completed', 'missed', 'cancelled'))
);

CREATE TABLE "UserSettings" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "themeMode" TEXT NOT NULL DEFAULT 'dark',
  "discoveryEnabled" BOOLEAN NOT NULL DEFAULT true,
  "showDistance" BOOLEAN NOT NULL DEFAULT true,
  "maxDistanceKm" INTEGER NOT NULL DEFAULT 25,
  "showOnlineStatus" BOOLEAN NOT NULL DEFAULT false,
  "readReceipts" BOOLEAN NOT NULL DEFAULT true,
  "healthVisibility" TEXT NOT NULL DEFAULT 'connections',
  "safetyCheckIns" BOOLEAN NOT NULL DEFAULT true,
  "lostPetAlerts" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserSettings_theme_check" CHECK ("themeMode" IN ('dark', 'light', 'system')),
  CONSTRAINT "UserSettings_distance_check" CHECK ("maxDistanceKm" BETWEEN 1 AND 250),
  CONSTRAINT "UserSettings_health_visibility_check" CHECK ("healthVisibility" IN ('connections', 'private'))
);

CREATE TABLE "PushDevice" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "PushDevice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PushDevice_platform_check" CHECK ("platform" IN ('web', 'android', 'ios'))
);

CREATE TABLE "UserBlock" (
  "id" TEXT NOT NULL,
  "blockerId" TEXT NOT NULL,
  "blockedId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserBlock_not_self" CHECK ("blockerId" <> "blockedId")
);

CREATE TABLE "Report" (
  "id" TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "reportedUserId" TEXT,
  "conversationId" TEXT,
  "category" TEXT NOT NULL,
  "detail" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Report_status_check" CHECK ("status" IN ('open', 'reviewing', 'resolved', 'dismissed')),
  CONSTRAINT "Report_detail_check" CHECK (char_length("detail") BETWEEN 1 AND 2000)
);

CREATE UNIQUE INDEX "ConnectionRequest_conversationId_key" ON "ConnectionRequest"("conversationId");
CREATE INDEX "ConnectionRequest_receiverId_status_createdAt_idx" ON "ConnectionRequest"("receiverId", "status", "createdAt");
CREATE INDEX "ConnectionRequest_senderId_status_createdAt_idx" ON "ConnectionRequest"("senderId", "status", "createdAt");
CREATE UNIQUE INDEX "ConnectionRequest_one_pending_idx" ON "ConnectionRequest"("senderId", "receiverId", "petId") WHERE "status" = 'pending';
CREATE UNIQUE INDEX "AppointmentParticipant_appointmentId_userId_key" ON "AppointmentParticipant"("appointmentId", "userId");
CREATE INDEX "AppointmentParticipant_userId_idx" ON "AppointmentParticipant"("userId");
CREATE UNIQUE INDEX "SafeLocationReview_appointmentId_userId_key" ON "SafeLocationReview"("appointmentId", "userId");
CREATE INDEX "SafeLocationReview_locationId_createdAt_idx" ON "SafeLocationReview"("locationId", "createdAt");
CREATE UNIQUE INDEX "SafetyCheckIn_appointmentId_userId_key" ON "SafetyCheckIn"("appointmentId", "userId");
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
CREATE UNIQUE INDEX "PushDevice_token_key" ON "PushDevice"("token");
CREATE INDEX "PushDevice_userId_platform_revokedAt_idx" ON "PushDevice"("userId", "platform", "revokedAt");
CREATE UNIQUE INDEX "UserBlock_blockerId_blockedId_key" ON "UserBlock"("blockerId", "blockedId");
CREATE INDEX "UserBlock_blockedId_idx" ON "UserBlock"("blockedId");
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
CREATE INDEX "Report_reportedUserId_createdAt_idx" ON "Report"("reportedUserId", "createdAt");
CREATE INDEX "Appointment_conversationId_status_idx" ON "Appointment"("conversationId", "status");
CREATE INDEX "Appointment_datetime_status_idx" ON "Appointment"("datetime", "status");
CREATE INDEX "Location_placeId_idx" ON "Location"("placeId");
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConnectionRequest" ADD CONSTRAINT "ConnectionRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConnectionRequest" ADD CONSTRAINT "ConnectionRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConnectionRequest" ADD CONSTRAINT "ConnectionRequest_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConnectionRequest" ADD CONSTRAINT "ConnectionRequest_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AppointmentParticipant" ADD CONSTRAINT "AppointmentParticipant_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AppointmentParticipant" ADD CONSTRAINT "AppointmentParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AppointmentParticipant" ADD CONSTRAINT "AppointmentParticipant_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SafeLocationReview" ADD CONSTRAINT "SafeLocationReview_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafeLocationReview" ADD CONSTRAINT "SafeLocationReview_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafeLocationReview" ADD CONSTRAINT "SafeLocationReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafetyCheckIn" ADD CONSTRAINT "SafetyCheckIn_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafetyCheckIn" ADD CONSTRAINT "SafetyCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PushDevice" ADD CONSTRAINT "PushDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_status_check" CHECK ("status" IN ('scheduled', 'in_progress', 'completed', 'cancelled'));
ALTER TABLE "Message" ADD CONSTRAINT "Message_kind_check" CHECK ("kind" IN ('text', 'system', 'appointment'));
ALTER TABLE "Message" ADD CONSTRAINT "Message_text_length_check" CHECK (char_length("text") BETWEEN 1 AND 1000);
