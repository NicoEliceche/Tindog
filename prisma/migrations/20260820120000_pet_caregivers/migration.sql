-- Personas a cargo de una mascota: relacion N-N entre User y Pet.
--
-- Hasta ahora una mascota tenia un unico dueno. En la practica la cuidan
-- varias personas -pareja, familia, un cuidador contratado- y todas
-- necesitan verla y saber que citas tiene, para no superponerse.
CREATE TABLE "PetCaregiver" (
    "id"        TEXT NOT NULL,
    "petId"     TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "role"      TEXT NOT NULL DEFAULT 'caregiver',
    "invitedBy" TEXT,
    "until"     TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PetCaregiver_pkey" PRIMARY KEY ("id")
);

-- Una persona aparece una sola vez por mascota.
CREATE UNIQUE INDEX "PetCaregiver_petId_userId_key" ON "PetCaregiver"("petId", "userId");
-- Listar las mascotas de alguien es la consulta de cada pantalla.
CREATE INDEX "PetCaregiver_userId_role_idx" ON "PetCaregiver"("userId", "role");
CREATE INDEX "PetCaregiver_petId_role_idx" ON "PetCaregiver"("petId", "role");

ALTER TABLE "PetCaregiver" ADD CONSTRAINT "PetCaregiver_petId_fkey"
    FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetCaregiver" ADD CONSTRAINT "PetCaregiver_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Cada dueno actual pasa a estar a cargo de su mascota con rol de titular,
-- asi nadie pierde acceso al desplegar.
INSERT INTO "PetCaregiver" ("id", "petId", "userId", "role", "createdAt", "updatedAt")
SELECT
    'pcg_' || "id",
    "id",
    "ownerId",
    'owner',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Pet"
ON CONFLICT ("petId", "userId") DO NOTHING;
