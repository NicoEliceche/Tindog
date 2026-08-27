-- Responder, editar y adjuntar en el chat.
--
-- Todo opcional: los mensajes que ya existen quedan como estan, sin cita,
-- sin marca de edicion y sin adjunto.

-- Cuando se edito por ultima vez. Se muestra como "editado" al lado de la
-- hora; borrar ya se resolvia con deletedAt, que ya existia.
ALTER TABLE "Message" ADD COLUMN "editedAt" TIMESTAMP(3);

-- El mensaje citado. En SetNull para que la respuesta sobreviva si el
-- citado se elimina de verdad.
ALTER TABLE "Message" ADD COLUMN "replyToId" TEXT;
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyToId_fkey"
    FOREIGN KEY ("replyToId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Message_replyToId_idx" ON "Message"("replyToId");

-- El adjunto ya publicado. Apunta al MediaAsset que paso la cuarentena; la
-- direccion publica se copia para no recorrer la relacion en cada lectura.
ALTER TABLE "Message" ADD COLUMN "attachmentId"   TEXT;
ALTER TABLE "Message" ADD COLUMN "attachmentKind" TEXT;
ALTER TABLE "Message" ADD COLUMN "attachmentName" TEXT;
ALTER TABLE "Message" ADD COLUMN "attachmentSize" INTEGER;
ALTER TABLE "Message" ADD COLUMN "attachmentUrl"  TEXT;

-- Un archivo pertenece a un solo mensaje.
CREATE UNIQUE INDEX "Message_attachmentId_key" ON "Message"("attachmentId");
ALTER TABLE "Message" ADD CONSTRAINT "Message_attachmentId_fkey"
    FOREIGN KEY ("attachmentId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
