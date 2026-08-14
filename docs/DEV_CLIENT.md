# Revisar cambios mobile

1. Instalar una development build de Tindog una vez (`cd apps/mobile` y `npm run build:android:dev`; descargar/instalar el APK resultante).
2. Ejecutar `restart.bat` desde la raíz. Abre Next en `localhost:3000` y Metro Dev Client en el puerto `8083` con sus logs.
3. Abrir la app **Tindog** instalada, no Expo Go. Elegir el servidor detectado o, desde el launcher del development client, ingresar `http://IP_DE_TU_PC:8083` si el QR no conecta.
4. Editar TypeScript, estilos o pantallas: Fast Refresh muestra los cambios automáticamente. No se reinstala la app.
5. Recompilar/reinstalar sólo cuando cambia una dependencia nativa, `app.json`/`app.config.js`, permisos, íconos/splash o la versión de Expo/React Native.

El teléfono y la PC deben estar en la misma red; el firewall debe permitir Node/puerto 8083. Para recargar manualmente, agitá el teléfono y elegí Reload.
