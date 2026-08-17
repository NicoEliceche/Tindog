# Camino a producción

Estado del proyecto y qué falta para publicar en web, Google Play y App Store.
Última revisión: 17 de agosto de 2026.

---

## Resumen

La aplicación está construida y se ve terminada, pero **funciona sobre datos
de prueba**: los perros, chats, citas y solicitudes son listas fijas en el
código. Dos personas distintas no se ven entre sí. Ese es el bloqueante
del que cuelga casi todo lo demás.

El backend, en cambio, está bastante avanzado: 28 rutas API con
autenticación, límites de uso, auditoría y verificación de origen.

| Área | Estado |
|---|---|
| Interfaz web y nativa | Terminada |
| Backend (API) | Escrito, sin desplegar del todo |
| Conexión interfaz ↔ backend | **Falta** |
| Requisitos de tienda | **Faltan varios** |
| Monetización | Sin definir (ver más abajo) |

---

## 1. Bloqueantes

### 1.1 El backend en Render devuelve 503

Faltan `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` en las variables
de entorno. Sin eso el limitador de peticiones no arranca y **el login falla
por completo**.

`src/core/security/readiness.ts` lista 26 variables obligatorias en
producción. Conviene revisarlas todas de una vez, no sólo las dos de Redis.

- [ ] Crear la base en Upstash Redis (tiene plan gratuito)
- [ ] Cargar las variables en Render
- [ ] Verificar que `/api/health` responda `securityReady: true`

### 1.2 La interfaz no está conectada al backend

Hoy los datos salen de `WebAppProvider.tsx` (web) y `AppDataProvider.tsx`
(nativo), que tienen las mascotas escritas a mano. Las 28 rutas API existen
pero nadie las llama.

Es el trabajo más grande que queda y conviene hacerlo por partes, verificando
cada una:

- [ ] Perfil y sesión
- [ ] Mascotas (alta, listado, edición)
- [ ] Descubrimiento y solicitudes de conexión
- [ ] Chat y mensajes
- [ ] Citas y lugares seguros
- [ ] Subida real de fotos a almacenamiento (hoy la imagen se guarda como
      texto embebido en el navegador)

### 1.3 Borrado de cuenta desde la aplicación

Apple lo exige desde 2022 y Google desde 2024. **Es causa de rechazo
automático.** El endpoint ya existe (`/api/account/delete`, con verificación
reforzada); falta el botón en Ajustes y la pantalla de confirmación.

- [ ] Botón en Ajustes con confirmación clara de que la acción es definitiva
- [ ] Explicar qué se borra y qué se conserva por obligación legal

### 1.4 Política de privacidad y términos publicados

`docs/PRIVACY_RETENTION.md` es documentación técnica interna. Las tiendas
piden una **dirección web pública** redactada para usuarios comunes.

- [ ] Publicar política de privacidad en una URL accesible
- [ ] Publicar términos de servicio
- [ ] Enlazarlas desde Ajustes y desde el registro

---

## 2. Requisitos de tienda

### Google Play (25 dólares, pago único)

- [ ] Cuenta de desarrollador
- [ ] **12 personas probando durante 14 días seguidos** antes de poder
      publicar en producción (obligatorio para cuentas personales nuevas).
      Conviene arrancar esto temprano: son dos semanas de calendario.
- [ ] Declaración de seguridad de datos
- [ ] Capturas: teléfono, tablet de 7 y de 10 pulgadas
- [ ] Ícono de 512×512 y gráfico destacado de 1024×500
- [ ] Descripción corta y larga
- [ ] Clasificación por edad

### App Store (99 dólares al año)

- [ ] Cuenta de Apple Developer
- [ ] Capturas para 6.7" y 6.5"
- [ ] **Cuenta de demostración que funcione.** Con Google como único acceso
      real, hay que darles una alternativa o no pueden revisar la app.
- [ ] Etiquetas de privacidad
- [ ] Justificación de cada permiso (ubicación, cámara, galería)
- [ ] Revisión: entre 1 y 3 días hábiles

### Web

Sin revisión. Es la vía más rápida para validar el producto con usuarios
reales, pero hoy el despliegue a GitHub Pages **está roto**: `output: export`
genera un sitio estático y no puede ejecutar las 28 rutas API.

- [ ] Decidir el alojamiento: Vercel (ejecuta las rutas API) o mantener
      GitHub Pages consumiendo el backend de Render
- [ ] Dominio propio
- [ ] Analítica

---

## 3. Riesgos propios de este producto

Dos cosas que un revisor va a mirar con atención:

**Encuentros presenciales entre desconocidos.** La pantalla de Seguridad
ayuda, pero falta poder reportar desde dentro del chat y bloquear desde el
perfil del otro. Apple es estricta con las apps que juntan gente en persona.

- [ ] Reportar contenido desde la conversación
- [ ] Bloquear desde el perfil
- [ ] Moderación de las fotos que suben los usuarios

**La sección de cría.** Puede interpretarse como facilitación de venta de
animales, que ambas tiendas restringen. Vale revisar cómo está presentada
antes de enviar.

- [ ] Revisar los textos de la sección de cría
- [ ] Dejar explícito que no se comercializan animales dentro de la app

---

## 4. Calidad

No hay pruebas automatizadas salvo `src/core/security/security.test.ts`.
Para publicar no son obligatorias, pero sin ellas cada cambio se verifica a
mano y el riesgo de romper algo crece con el tiempo.

- [ ] Pruebas de los flujos críticos: registro, envío de solicitud, chat
- [ ] Registro de errores en producción (Sentry o equivalente)
- [ ] Revisión de accesibilidad
- [ ] Medición de rendimiento en teléfonos de gama baja

---

## 5. Monetización

Ver [`docs/MONETIZATION.md`](docs/MONETIZATION.md) para el análisis completo
del modelo de Tinder y la propuesta para Tindog.

En resumen: conviene **no cobrar hasta tener comunidad**. Sin densidad de
usuarios en una ciudad, cobrar por más alcance es vender algo que no existe.

- [ ] Definir el modelo antes de publicar (las tiendas piden declarar si hay
      compras dentro de la app)
- [ ] Integrar pagos cuando haya masa crítica

---

## 6. Orden sugerido

1. **Arreglar el 503** — sin backend vivo no se puede probar nada
2. **Conectar la interfaz al backend** — el grueso del trabajo
3. **Borrado de cuenta** — bloqueante duro, el endpoint ya está
4. **Política de privacidad publicada**
5. **Web** — sin revisión, valida el producto en días
6. **Android** — el período de prueba de 14 días corre mientras se pule
7. **iOS** — la revisión más exigente, conviene ir con todo resuelto

El paso 2 es el más largo. Los pasos 5, 6 y 7 se solapan: mientras Android
está en período de prueba se puede preparar el envío a iOS.
