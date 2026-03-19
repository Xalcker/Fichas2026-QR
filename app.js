// URL del Apps Script desplegado — reemplaza con tu URL real
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxNfpxI-g7QupCX13nyFwZfhPmTLkxl69znRd63C_6tKA4dqoTpXfnNgimAI2TM1cKJ/exec";

const SPECIALTY_ICONS = {
  "MECÁNICA INDUSTRIAL": "⚙️",
  "MECANICA INDUSTRIAL": "⚙️",
  "LOGÍSTICA": "📦",
  "LOGISTICA": "📦",
  "LABORATORISTA CLÍNICO": "🔬",
  "LABORATORISTA CLINICO": "🔬",
  "ADMINISTRACIÓN DE RECURSOS HUMANOS": "👥",
  "ADMINISTRACION DE RECURSOS HUMANOS": "👥",
  "CONTABILIDAD": "📊"
};

function getSpecialtyIcon(specialty) {
  const key = (specialty || "").toUpperCase().trim();
  return SPECIALTY_ICONS[key] || "📋";
}

const FIELDS = [
  "NOMBRE", "CURP"
];

let html5QrCode = null;
let scanning = false;

const btnStart = document.getElementById("btn-start");
const btnStop = document.getElementById("btn-stop");
const resultDiv = document.getElementById("result");
const cardInfo = document.getElementById("card-info");

btnStart.addEventListener("click", startScanner);
btnStop.addEventListener("click", stopScanner);

function startScanner() {
  html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    onScanSuccess
  ).then(() => {
    scanning = true;
    btnStart.disabled = true;
    btnStop.disabled = false;
  }).catch(err => {
    alert("No se pudo acceder a la cámara: " + err);
  });
}

function stopScanner() {
  if (html5QrCode && scanning) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      scanning = false;
      btnStart.disabled = false;
      btnStop.disabled = true;
    });
  }
}

function onScanSuccess(decodedText) {
  stopScanner();
  processQR(decodedText);
}

function processQR(raw) {
  let decoded;
  try {
    const bytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0));
    decoded = new TextDecoder("utf-8").decode(bytes);
  } catch {
    alert("El QR no contiene una cadena Base64 válida.");
    return;
  }

  const parts = decoded.split("|");
  if (parts.length < 9) {
    alert("Formato inválido. Se esperaban 9 campos separados por '|', se encontraron " + parts.length);
    return;
  }

  const googleId = parts[7];
  const photoUrl = `https://drive.google.com/thumbnail?id=${googleId}&sz=w400`;

  const specialty = parts[2] || "—";
  const specIcon = getSpecialtyIcon(specialty);

  let html = `<h2><span style="font-size:1.4rem;">${specIcon}</span> Datos de la Ficha</h2>`;
  html += `<div style="display:flex;gap:0.6rem;align-items:center;margin-bottom:0.5rem;">
    <div style="font-size:0.8rem;flex:1;">
      <div style="color:#691C32;font-size:0.7rem;">FICHA:</div>
      <div style="font-weight:700;margin-bottom:0.3rem;">${escapeHtml(parts[0] || "—")}</div>
      <div style="color:#691C32;font-size:0.7rem;">FOLIO:</div>
      <div style="font-weight:700;margin-bottom:0.3rem;">${escapeHtml(parts[1] || "—")}</div>
      <div style="color:#691C32;font-size:0.7rem;">ESPECIALIDAD:</div>
      <div style="font-weight:700;">${escapeHtml(specialty)}</div>
    </div>
    <img src="${photoUrl}" alt="Foto del titular"
         style="width:110px;height:147px;object-fit:cover;border-radius:8px;border:2px solid #691C32;box-shadow:0 2px 8px rgba(0,0,0,0.2);flex-shrink:0;"
         onerror="this.style.display='none'" />
  </div>`;
  html += `<table style="width:100%;border-collapse:collapse;font-size:0.8rem;">`;

  const fullName = `${parts[6] || ""} ${parts[4] || ""} ${parts[5] || ""}`.trim();
  const displayParts = [fullName, parts[3]];

  for (let i = 0; i < FIELDS.length; i++) {
    const value = displayParts[i] || "—";
    html += `
      <tr>
        <td colspan="2" style="padding:0.25rem 0.4rem;">
          <div style="color:#691C32;font-size:0.7rem;">${FIELDS[i]}:</div>
          <div style="font-weight:700;word-break:break-all;">${escapeHtml(value)}</div>
        </td>
      </tr>`;
  }

  html += `</table>`;
  html += `<div id="validation-status" style="text-align:center;margin-top:0.5rem;padding:0.4rem;border-radius:6px;font-weight:600;font-size:0.85rem;background:#eee;color:#666;">Validando ficha…</div>`;
  cardInfo.innerHTML = html;
  resultDiv.style.display = "block";

  validateFicha(parts[8], parts[0], parts[3]);
}

async function validateFicha(uuid, ficha, curp) {
  const statusEl = document.getElementById("validation-status");
  try {
    const url = `${APPS_SCRIPT_URL}?uuid=${encodeURIComponent(uuid)}&ficha=${encodeURIComponent(ficha)}&curp=${encodeURIComponent(curp)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.valid) {
      statusEl.textContent = "✅ Ficha válida";
      statusEl.style.background = "#d4edda";
      statusEl.style.color = "#155724";
    } else {
      statusEl.textContent = "❌ Ficha no válida";
      statusEl.style.background = "#f8d7da";
      statusEl.style.color = "#721c24";
    }
  } catch {
    statusEl.textContent = "⚠️ Error al validar";
    statusEl.style.background = "#fff3cd";
    statusEl.style.color = "#856404";
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
