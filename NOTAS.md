# Control de cilindros de gas — Notas para Claude

## Qué es
PWA de rondas diarias de cilindros de gas en Clínica Reina Catalina
(antes se llamaba "Ronda de Cirugía"). En uso real desde octubre de 2026.
Sedes: Barranquilla y Baranoa.

## Dónde vive cada parte
- Código de la PWA: este repo, publicado en GitHub Pages.
- Datos: hoja de Google en la cuenta cilindrocrc@gmail.com.
- Servidor: implementación de Apps Script de esa hoja. Su código NO está en este repo.
- La URL del servidor está en `config.js` (`window.API_URL`).
- La PWA llama al servidor por POST con código de acceso (acciones: `config`, `historial`, `registrar`).
  Esa implementación debe seguir activa.
- El link viejo de Apps Script solo muestra el aviso "Esta versión ya no se usa" con un botón a esta PWA.

## Reglas que no se cambian
- Debe funcionar sin señal (hay áreas sin WiFi ni datos) y subir los registros al volver la conexión.
- La pantalla actual se mantiene: es más informativa y dice qué pasos faltan.
  Se probó un rediseño (noviembre de 2026) y se descartó.
- El reporte JPG debe quedar igual.
- Todo en español, con el logo y los colores de la clínica (vino tinto). Letra: Plus Jakarta Sans.
- Nada en Play Store; se distribuye solo por GitHub.

## Pendiente
- Firmas seguras con huella (WebAuthn), de quien hace la ronda y de quien recibe, cada uno desde su teléfono.

## Cómo trabajar aquí
- Preguntar antes de cambiar algo y mostrar un bosquejo para aprobar.
- No romper la hoja ni los registros existentes.
- Al cambiar archivos, subir el número de `VERSION` en `sw.js` para que los celulares bajen la versión nueva.
- Este repo es público: no escribir aquí códigos de acceso, claves ni URLs del servidor.
