-- Zona aproximada del usuario, para el filtro por distancia.
--
-- Se guarda redondeada a dos decimales, que a la latitud de Buenos Aires es
-- una celda de unos 900 x 1100 metros: sirve para decir "esta a 8 km" y no
-- para dar con una direccion. El redondeo lo hace la aplicacion antes de
-- escribir, asi el dato fino no llega nunca a la base.
--
-- Todo opcional: quien no da permiso de ubicacion sigue usando la
-- aplicacion, sin filtro por radio.
ALTER TABLE "User" ADD COLUMN "zoneLat"       DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN "zoneLng"       DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN "zoneLabel"     TEXT;
ALTER TABLE "User" ADD COLUMN "zoneUpdatedAt" TIMESTAMP(3);

-- Buscar "quien esta cerca" recorre estas dos columnas.
CREATE INDEX "User_zoneLat_zoneLng_idx" ON "User"("zoneLat", "zoneLng");
