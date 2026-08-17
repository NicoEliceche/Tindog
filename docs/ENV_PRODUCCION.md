# Variables de entorno en producción

`src/core/security/readiness.ts` exige **26 variables** para dar el
despliegue por listo. Mientras falte una sola, `/api/health` responde
`securityReady: false`.

Cargar sólo las de Upstash no alcanza: son 2 de esas 26.

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

## Grupo 1 — Secretos propios (los generás vos)

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

## Grupo 2 — Límite de peticiones (Upstash)

| Variable | Dónde sale |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Panel de Upstash → tu base → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Ídem |

Tiene plan gratuito. **Estas son las que ya cargaste.**

---

## Grupo 3 — Google

| Variable | Dónde sale |
|---|---|
| `GOOGLE_WEB_CLIENT_ID` | Google Cloud Console → Credenciales → OAuth web |
| `GOOGLE_ANDROID_CLIENT_ID` | Ídem, cliente Android |
| `GOOGLE_IOS_CLIENT_ID` | Ídem, cliente iOS |
| `GOOGLE_PLACES_API_KEY` | Ídem, clave de API con Places habilitado |

---

## Grupo 4 — Almacenamiento de archivos

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

## Grupo 5 — Servicios externos

Acá está la parte más pesada, porque son servicios que hay que contratar.

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

## Una decisión que conviene tomar

Las 26 variables corresponden a una postura de seguridad completa, pensada
para una app con usuarios reales, fotos y menores potencialmente expuestos.
Está bien que sea exigente.

Pero **para levantar un entorno de prueba**, exigir moderación de imágenes y
análisis de malware antes de que exista el primer usuario es un obstáculo
sin beneficio.

Dos caminos:

**A. Completar las 26.** Correcto para producción real. Requiere contratar
tres o cuatro servicios.

**B. Separar lo imprescindible de lo que puede esperar.** Dividir la lista
en un núcleo obligatorio (sesiones, auditoría, límite de peticiones, Google,
almacenamiento) y un grupo que sólo se exige cuando la app acepta contenido
de usuarios reales.

Para el estado actual del proyecto —sin usuarios, con datos de prueba— la
opción B destraba el trabajo antes. La A queda como requisito para el
lanzamiento público.

Si preferís la B, el cambio es en `readiness.ts` y lo puedo hacer: separar
la lista en dos y que la segunda se exija sólo cuando una variable como
`TINDOG_PUBLIC_LAUNCH` esté activa.
