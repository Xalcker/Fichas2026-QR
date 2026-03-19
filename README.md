# 📷 Escáner de Fichas QR

App web ligera que escanea códigos QR con datos de fichas codificados en Base64, muestra la información del titular con su foto de Google Drive y valida contra una hoja de Google Sheets.

## Uso

Abrir `index.html` en un navegador con HTTPS (requerido para acceso a cámara).

### Local

```bash
npx serve .
```

### Despliegue

Funciona en cualquier hosting estático con HTTPS:

- **GitHub Pages** — Settings → Pages → Deploy from branch `main`
- **Netlify Drop** — Arrastra la carpeta a app.netlify.com/drop
- **Vercel** — `npx vercel`

## Validación con Google Sheets

La app valida las fichas escaneadas contra una hoja de Google Sheets usando Apps Script. Ver `apps-script/Code.gs` para el script de referencia. Requiere reemplazar los placeholders con tus IDs reales.

## Tecnologías

- HTML/CSS/JS vanilla
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) para escaneo de cámara
- Google Drive thumbnails para fotos
- Google Apps Script para validación

## Licencia

MIT
