# Variables de entorno en producción

`src/core/security/readiness.ts` divide las variables en dos grupos.

**Núcleo — 16 variables.** Lo que hace falta para que el servidor funcione
de forma segura, aun sin usuarios reales. Mientras falte una,
`/api/health` responde `securityReady: false`.

**Lanzamiento público — 10 variables más.** Análisis de archivos, moderación
y circuito de incidentes. Se exigen recién cuando `TINDOG_PUBLIC_LAUNCH`
vale `true`, porque antes de que haya gente subiendo contenido pedirlas
traba el despliegue sin proteger a nadie.

Cargar sólo las de Upstash no alcanza: son 2 de las 16 del núcleo.

## Ver qué falta exactamente

```bash
curl -H "x-admin-access-key: TU_CLAVE" https://tindog-api-1d18.onrender.com/api/admin/readiness
```

Devuelve la lista concreta de lo que falta. Requiere `ADMIN_API_ACCESS_KEY`
cargada (ver más abajo). Si todavía no la tenés, empezá por ese grupo.

El endpoint público `/api/health` sólo dice **cuántas** faltan, no cuáles:
esa lista es un mapa de la configuración del servidor y no conviene
exponerla.

---

## Generarlos de una vez

```bash
npm run secretos
```

Crea los cinco secretos propios con el formato correcto, en tu máquina. No
guarda nada en disco: copiá el resultado a tu `.env` y al panel de Render.

El atajo de npm funciona desde cualquier carpeta del repositorio. Para
pegarlos directo en un archivo:

```bash
npm run secretos -- --env
```

---

## Grupo 1 — Secretos propios (los generás vos) · NÚCLEO

Cuatro claves que inventás vos. **Mínimo 32 bytes**, o la verificación las
rechaza aunque estén presentes.

| Variable | Para qué |
|---|---|
| `JWT_SECRET` | Firma de las sesiones |
| `AUDIT_HASH_SECRET` | Encadenado del registro de auditoría |
| `WORKER_SECRET` | Autenticación de los procesos internos |
| `ADMIN_API_ACCESS_KEY` | Acceso a las rutas de administración |

Generar cada una:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Y una más, con formato distinto — tiene que ser **exactamente 32 bytes en
base64**:

| Variable | Para qué |
|---|---|
| `MODERATION_EVIDENCE_KEY` | Cifrado de la evidencia de moderación |

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Si esta última no mide exactamente 32 bytes al decodificar, la verificación
la marca como `MODERATION_EVIDENCE_KEY_INVALID`.

---

## Grupo 2 — Límite de peticiones (Upstash) · NÚCLEO

| Variable | Dónde sale |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Panel de Upstash → tu base → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Ídem |

Tiene plan gratuito. **Estas son las que ya cargaste.**

---

## Grupo 3 — Google · NÚCLEO

| Variable | Dónde sale |
|---|---|
| `GOOGLE_WEB_CLIENT_ID` | Google Cloud Console → Credenciales → OAuth web |
| `GOOGLE_ANDROID_CLIENT_ID` | Ídem, cliente Android |
| `GOOGLE_IOS_CLIENT_ID` | Ídem, cliente iOS |

`GOOGLE_PLACES_API_KEY` pasó al grupo de lanzamiento público: exige una
cuenta de facturación en Google Cloud y sólo la usa la búsqueda de lugares
seguros.

---

## Grupo 4 — Almacenamiento de archivos · NÚCLEO

Para las fotos de las mascotas. Sirve cualquier servicio compatible con S3:
Cloudflare R2 (tiene capa gratuita), Backblaze B2 o AWS S3.

| Variable | Qué es |
|---|---|
| `OBJECT_STORAGE_REGION` | Región del bucket |
| `OBJECT_STORAGE_ACCESS_KEY_ID` | Credencial de acceso |
| `OBJECT_STORAGE_SECRET_ACCESS_KEY` | Credencial secreta |
| `OBJECT_STORAGE_QUARANTINE_BUCKET` | Donde caen los archivos recién subidos |
| `OBJECT_STORAGE_PROCESSED_BUCKET` | Donde van una vez revisados |
| `OBJECT_STORAGE_EXPORT_BUCKET` | Exportaciones de datos personales |
| `MEDIA_PUBLIC_BASE_URL` | Dirección pública desde donde se sirven |

Son tres buckets distintos a propósito: un archivo recién subido no debería
ser accesible hasta que pase el análisis.

---

## Grupo 5 — Servicios externos · SÓLO AL ABRIR AL PÚBLICO

Incluye también `GOOGLE_PLACES_API_KEY`. Google eliminó el crédito universal
de 200 USD en marzo de 2025; ahora cada API trae su propia cuota gratuita
mensual (unas 10.000 peticiones para Places) pero **exige tarjeta asociada**
igual. El cargo que aparece al habilitar facturación es una verificación que
se reversa, no un cobro.

**No hacen falta todavía.** Se exigen cuando cargues
`TINDOG_PUBLIC_LAUNCH=true`, que es lo que marca que la app acepta usuarios
reales. Dejarlas para después no es un atajo: con la variable activa vuelven
a ser obligatorias, así que no se puede abrir al público sin ellas por
descuido.

| Variable | Qué necesita |
|---|---|
| `MALWARE_SCANNER_URL` | Análisis de archivos subidos |
| `MALWARE_SCANNER_TOKEN` | |
| `MODERATION_API_URL` | Moderación de imágenes y texto |
| `MODERATION_API_TOKEN` | |
| `SECURITY_LOG_SINK_URL` | Destino de los registros de seguridad |
| `SECURITY_LOG_SINK_TOKEN` | |
| `SECURITY_ALERT_WEBHOOK_URL` | Aviso ante incidentes |
| `SECURITY_ALERT_WEBHOOK_TOKEN` | |

**Opciones para arrancar:**

- Análisis de archivos: ClamAV en un contenedor propio, o VirusTotal
- Moderación: Google Cloud Vision SafeSearch, AWS Rekognition, o Hive
- Registros: Better Stack, Axiom o Datadog (todos con capa gratuita)
- Alertas: un webhook de Slack o Discord alcanza

---

## Antes de abrir al público

Cuando la app vaya a recibir usuarios reales, cargá las diez del grupo 5 y
poné `TINDOG_PUBLIC_LAUNCH=true`. A partir de ahí el servidor vuelve a
exigirlas todas.

Ese interruptor existe para que la decisión sea explícita: la moderación de
contenido y el análisis de archivos no son opcionales cuando hay gente
subiendo fotos, y conviene que abrir al público falle ruidosamente si
faltan, en vez de pasar inadvertido.
