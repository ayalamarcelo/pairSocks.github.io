const form = document.getElementById("mediaForm");
const listaRegistros = document.getElementById("listaRegistros");
const exportarBtn = document.getElementById("exportarBtn");
const limpiarBtn = document.getElementById("limpiarBtn");
const pdfBtn = document.getElementById("pdfBtn");
const whatsappBtn = document.getElementById("whatsappBtn");
const codigoList = document.getElementById("codigo-list");
const resumenContenido = document.getElementById("resumenContenido");

const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// Formulario por pasos
const step1 = document.querySelector(".step-1");
const step2 = document.querySelector(".step-2");
const siguienteBtn = document.getElementById("siguienteBtn");
const volverBtn = document.getElementById("volverBtn");

siguienteBtn.addEventListener("click", () => {
  step1.classList.remove("active");
  step2.classList.add("active");
});

volverBtn.addEventListener("click", () => {
  step2.classList.remove("active");
  step1.classList.add("active");
});

// Tabs
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");

    if (btn.dataset.tab === "listado") mostrarRegistros();
    if (btn.dataset.tab === "resumen") mostrarResumenEnPantalla();
  });
});

function obtenerDiaSemana(fechaStr) {
  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const date = new Date(fechaStr + "T00:00:00");
  return dias[date.getDay()];
}

function guardarRegistro(registro) {
  const registros = JSON.parse(localStorage.getItem("registrosMedias")) || [];
  registros.push(registro);
  localStorage.setItem("registrosMedias", JSON.stringify(registros));
}

function cargarCodigosSugeridos(registros) {
  const codigosUnicos = [...new Set(registros.map(r => r.codigo))];
  codigoList.innerHTML = codigosUnicos.map(c => `<option value="${c}">`).join("");
}

function mostrarResumenEnPantalla() {
  const registros = JSON.parse(localStorage.getItem("registrosMedias")) || [];
  if (registros.length === 0) {
    resumenContenido.innerHTML = "<p>No hay datos para mostrar resumen.</p>";
    return;
  }

  // Agrupar por fecha y sumar datos
  const resumenDiario = {};
  registros.forEach(r => {
    if (!resumenDiario[r.fecha]) {
      resumenDiario[r.fecha] = {
        dia: r.dia,
        docenas: 0,
        sobrante: 0,
        primera: 0,
        segunda: 0,
        falladas: 0,
      };
    }
    resumenDiario[r.fecha].docenas += r.docenas;
    resumenDiario[r.fecha].sobrante += r.sobrante;
    resumenDiario[r.fecha].primera += r.primera;
    resumenDiario[r.fecha].segunda += r.segunda;
    resumenDiario[r.fecha].falladas += r.falladas;
  });

  // Totales semanales
  const totalesSemana = { docenas: 0, sobrante: 0, primera: 0, segunda: 0, falladas: 0 };

  let html = `<table class="resumen-table"><thead><tr>
    <th>Fecha</th><th>Día</th><th>Docenas</th><th>Sobrante</th><th>1°</th><th>2°</th><th>Falladas</th>
  </tr></thead><tbody>`;

  Object.keys(resumenDiario).sort().forEach(fecha => {
    const d = resumenDiario[fecha];
    html += `<tr>
      <td>${fecha}</td>
      <td>${d.dia}</td>
      <td>${d.docenas}</td>
      <td>${d.sobrante}</td>
      <td>${d.primera}</td>
      <td>${d.segunda}</td>
      <td>${d.falladas}</td>
    </tr>`;

    totalesSemana.docenas += d.docenas;
    totalesSemana.sobrante += d.sobrante;
    totalesSemana.primera += d.primera;
    totalesSemana.segunda += d.segunda;
    totalesSemana.falladas += d.falladas;
  });

  html += `</tbody><tfoot>
    <tr class="totales-row">
      <td colspan="2">Totales Semanales</td>
      <td>${totalesSemana.docenas}</td>
      <td>${totalesSemana.sobrante}</td>
      <td>${totalesSemana.primera}</td>
      <td>${totalesSemana.segunda}</td>
      <td>${totalesSemana.falladas}</td>
    </tr>
  </tfoot></table>`;

  resumenContenido.innerHTML = html;
}

function mostrarRegistros() {
  const registros = JSON.parse(localStorage.getItem("registrosMedias")) || [];
  cargarCodigosSugeridos(registros);

  if (registros.length === 0) {
    listaRegistros.innerHTML = "<p>No hay registros aún.</p>";
    return;
  }

  let html = "";
  registros.forEach((r, i) => {
    html += `
      <div class="registro-card">
        <p><strong>📅 Fecha:</strong> ${r.fecha} (${r.dia})</p>
        <p><strong>📌 Código:</strong> ${r.codigo}</p>
        <p><strong>🧦 Nombre:</strong> ${r.nombre}</p>
        <p><strong>👕 Tipo:</strong> ${r.tipo}</p>
        <p><strong>👤 Grupo:</strong> ${r.grupo}</p>
        ${r.talle ? `<p><strong>📏 Talle:</strong> ${r.talle}</p>` : ""}
        <p><strong>🎯 Docenas:</strong> ${r.docenas}</p>
        <p><strong>🧮 Sobrantes:</strong> ${r.sobrante}</p>
        <p><strong>✅ Primera:</strong> ${r.primera}</p>
        <p><strong>⚠️ Segunda:</strong> ${r.segunda}</p>
        <p><strong>❌ Falladas:</strong> ${r.falladas}</p>
      </div>
    `;
  });

  listaRegistros.innerHTML = html;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fecha = document.getElementById("fecha").value;
  if (!fecha) return alert("Ingresa una fecha.");

  const registro = {
    fecha,
    dia: obtenerDiaSemana(fecha),
    codigo: document.getElementById("codigo").value.trim(),
    nombre: document.getElementById("nombre").value.trim(),
    tipo: document.getElementById("tipo").value,
    grupo: document.getElementById("grupo").value,
    talle: document.getElementById("talle").value.trim(),
    docenas: parseInt(document.getElementById("docenas").value) || 0,
    sobrante: parseInt(document.getElementById("sobrante").value) || 0,
    primera: parseInt(document.getElementById("primera").value) || 0,
    segunda: parseInt(document.getElementById("segunda").value) || 0,
    falladas: parseInt(document.getElementById("falladas").value) || 0
  };

  guardarRegistro(registro);
  form.reset();
  alert("Registro guardado.");
});

// Excel export
exportarBtn.addEventListener("click", () => {
  const registros = JSON.parse(localStorage.getItem("registrosMedias")) || [];
  if (!registros.length) return alert("No hay datos.");
  const hoja = XLSX.utils.json_to_sheet(registros);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Medias");
  XLSX.writeFile(libro, "registro_medias.xlsx");
});

// Limpiar
limpiarBtn.addEventListener("click", () => {
  if (confirm("¿Seguro que quieres borrar todo?")) {
    localStorage.removeItem("registrosMedias");
    listaRegistros.innerHTML = "<p>No hay registros aún.</p>";
    resumenContenido.innerHTML = "<p>No hay datos.</p>";
  }
});

// Generar PDF
pdfBtn.addEventListener("click", async () => {
  const element = document.getElementById("listaRegistros");
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("listado_medias.pdf");
});

// WhatsApp
whatsappBtn.addEventListener("click", () => {
  const text = document.getElementById("listaRegistros").innerText;
  const msg = `Listado de medias:\n${text}`;
  const url = /Android|iPhone/.test(navigator.userAgent)
    ? `whatsapp://send?text=${encodeURIComponent(msg)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
});

// Fecha por defecto
document.getElementById("fecha").valueAsDate = new Date();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => console.log("Service Worker registrado correctamente"))
      .catch((err) => console.error("Error registrando Service Worker:", err));
  });
}

const resumenPdfBtn = document.getElementById("resumenPdfBtn");
if (resumenPdfBtn) {
  resumenPdfBtn.addEventListener("click", async () => {
    const element = document.getElementById("resumenContenido");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("resumen_medias.pdf");
  });
}

// Aquí la parte que activa la pestaña desde sessionStorage tras un 404
document.addEventListener("DOMContentLoaded", () => {
  const redirectPath = sessionStorage.getItem('redirect-path');
  if (redirectPath) {
    sessionStorage.removeItem('redirect-path');

    const tab = redirectPath.replace('/', '');

    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    const tabContent = document.getElementById(tab);

    if (tabBtn && tabContent) {
      // Limpiar clases active
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));

      tabBtn.classList.add('active');
      tabContent.classList.add('active');

      if (tab === "listado") mostrarRegistros();
      if (tab === "resumen") mostrarResumenEnPantalla();
    }
  }
});
