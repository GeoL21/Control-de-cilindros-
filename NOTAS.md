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
- La PWA llama al servidor por POST con código de acceso (acciones: `config`, `historial`, `registrar`,
  y las de firmas: `huellaReto`, `retoRonda`, `identificar`, `adminActivar`, `sesion`, `firmantes`, `invitar`, `reinvitar`, `baja`, `reenviarFirma`).
- La página `firmar.html` usa acciones sin código de acceso, protegidas por enlaces de un solo uso
  (`invInfo`, `invReto`, `invRegistrar`, `firmaInfo`, `firmaReto`, `firmaFirmar`, `firmaJpg`, `firmaNoCoincide`).
- El servidor tiene tres archivos: Code.gs, Firmas.gs y Huella.gs. Los códigos (CODIGO_ACCESO, CODIGO_ADMIN)
  van en las Propiedades del script, nunca en el código.
  Esa implementación debe seguir activa.
- El link viejo de Apps Script solo muestra el aviso "Esta versión ya no se usa" con un botón a esta PWA.

## Reglas que no se cambian
- Debe funcionar sin señal (hay áreas sin WiFi ni datos) y subir los registros al volver la conexión.
- El formulario se mantiene: es más informativo y dice qué pasos faltan.
  Se probó un rediseño del formulario (noviembre de 2026) y se descartó.
- Marco modernizado y aprobado (4 nov 2026), igual que Tanques e Inventario: encabezado blanco sin franja vino,
  logo en el menú lateral en PC, estado como etiqueta, barra de avance "X de N pasos" y animaciones con propósito.
- Datos del teléfono con prefijo `cil:` (las apps de geol21.github.io comparten almacenamiento); las claves viejas se migran solas.
- El reporte JPG debe quedar igual.
- Todo en español, con el logo y los colores de la clínica (vino tinto). Letra: Plus Jakarta Sans.
- Nada en Play Store; se distribuye solo por GitHub.

## Firmas con huella (nov 2026)
- Cada persona firma desde su propio celular (WebAuthn/llaves de acceso). La huella nunca sale del teléfono.
- Roles: Administrador (Jorge), Coordinador (invita en su sede; Kevin en Baranoa) y Firmante. Pestaña "Firmantes".
- Quien recibe registrado: firma después desde un enlace por WhatsApp (sirve con guantes estériles).
  No registrado u "Otra persona": firma con el dedo como siempre, y se le puede invitar.
- La huella firma un resumen SHA-256 de la ronda; si alguien cambia la ronda, deja de coincidir.
  Evidencia de cada firma en la pestaña "Firmas"; código de verificación en el JPG.
- El JPG lo dibuja `reporte.js` (lo usan la app y `firmar.html`); al firmar con huella se vuelve a generar.
- Firma al iniciar (12 nov 2026): quien tiene huella registrada toca "Iniciar ronda con huella"; su nombre
  se llena solo y al final confirma con "Estoy de acuerdo y registro" (resumen). La ronda llega firmada, sin
  pendiente. Si pasan más de 90 min, al confirmar pide la huella otra vez. Sin señal usa retos de reserva
  (acción `retoRonda`, 3 por celular, sirven 72 h). Si el servidor no acepta esa huella, la firma queda
  "Pendiente (huella)" como antes y el JPG se corrige solo. Quien no tiene huella (o no la usa al inicio)
  sigue exactamente igual que antes. Evidencia en la pestaña Firmas ("Firmada con huella al iniciar").
- Botón "Descartar ronda" (debajo de Registrar) cuando hay algo llenado: confirma y borra la ronda en curso.
  No anota nada en la hoja (decisión de Jorge, 12 nov 2026).
- Lugar de la ronda en píldoras (12 nov 2026): por sede, la de siempre (Barranquilla "Cirugía piso 2",
  Baranoa "Cirugía", en `LUGARES_BASE`) ya elegida + "Otro". Lo escrito en "Otro" queda como píldora en ese
  celular (hasta 5 por sede); si coincide con una existente (tildes, mayúsculas, espacios) usa la existente.
- Si el celular tiene huella registrada, "Quien hace la ronda" es una sola línea (sin elegir nombre ni firmar
  con el dedo). Si no inició con huella, la pide al tocar "Estoy de acuerdo". Sin huella (Kevin hoy): igual que antes.
- Quien recibe se recuerda por sede en cada celular (la jefe aparece elegida en la siguiente ronda).
- Validez: firma electrónica (Ley 527 de 1999, Decreto 2364 de 2012). Recomendado: formato aprobado por calidad
  y acuerdo firmado una vez por cada firmante.

## Cómo trabajar aquí
- Preguntar antes de cambiar algo y mostrar un bosquejo para aprobar.
- No romper la hoja ni los registros existentes.
- Al cambiar archivos, subir el número de `VERSION` en `sw.js` para que los celulares bajen la versión nueva.
- Este repo es público: no escribir aquí códigos de acceso, claves ni URLs del servidor.
