const columnasPermitidas = [
  "Año",
  "Mes",
  "Fecha",
  "Status",
  "Concepto",
  "Sub Concepto",
  "Detalle",
  "Créditos",
  "Débitos"
];

const columnasOcultas = [
  "Total Créditos",
  "Total Débitos",
  "Total Neto"
];

// Cambia esta URL por la de tu backend en Render
const baseURL = "https://backend-login-01tj.onrender.com";

// ===============================
// AGREGAR DATOS
// ===============================
function cargarFormulario() {
  const form = document.getElementById("formAgregar");
  form.innerHTML = "";

  columnasPermitidas.forEach(header => {
    const input = document.createElement("input");
    input.name = header;
    input.placeholder = header;
    form.appendChild(input);
    form.appendChild(document.createElement("br"));
  });
}

function enviarFormulario() {
  const hoja = document.getElementById("hojaAgregar").value;
  if (!hoja) return alert("Seleccione una hoja");

  const formData = new FormData(document.getElementById("formAgregar"));
  const jsonData = {};

  columnasPermitidas.forEach(header => {
    jsonData[header] = formData.get(header) || "";
  });

  fetch(`${baseURL}/api/${hoja}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jsonData)
  })
    .then(res => res.json())
    .then(() => {
      document.getElementById("respuestaAgregar").innerText = "Registro agregado correctamente";
      document.getElementById("formAgregar").reset();
    })
    .catch(err => console.error("Error al agregar:", err));
}

// ===============================
// EDITAR DATOS
// ===============================
function buscarPorIDEditar() {
  const hoja = document.getElementById("hojaEditar").value;
  const id = document.getElementById("idEditar").value.trim();
  if (!hoja || !id) return alert("Seleccione hoja y escriba un ID");

  fetch(`${baseURL}/api/${hoja}/${id}`)
    .then(res => res.json())
    .then(data => {
      if (!data) return alert("ID no encontrado");

      document.getElementById("datoActualEditar").textContent = JSON.stringify(data, null, 2);

      const form = document.getElementById("formularioEditar");
      form.innerHTML = "";

      columnasPermitidas.forEach(header => {
        const input = document.createElement("input");
        input.name = header;
        input.placeholder = header;
        input.value = data[header] || "";
        form.appendChild(input);
        form.appendChild(document.createElement("br"));
      });
    })
    .catch(err => console.error("Error al buscar ID:", err));
}

function editarDato() {
  const hoja = document.getElementById("hojaEditar").value;
  const id = document.getElementById("idEditar").value.trim();
  if (!hoja || !id) return alert("Seleccione hoja y escriba un ID");

  const formData = new FormData(document.getElementById("formularioEditar"));
  const jsonData = {};

  columnasPermitidas.forEach(header => {
    jsonData[header] = formData.get(header) || "";
  });

  fetch(`${baseURL}/api/${hoja}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jsonData)
  })
    .then(res => res.json())
    .then(() => {
      document.getElementById("respuestaEditar").innerText = "Registro editado correctamente";
    })
    .catch(err => console.error("Error al editar:", err));
}

// ===============================
// MOSTRAR DATOS Y OCULTAR COLUMNAS
// ===============================
function mostrarDatos() {
  const hoja = document.getElementById("hojaMostrar").value;
  if (!hoja) return;

  fetch(`${baseURL}/api/${hoja}`)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) return;

      const table = document.getElementById("tablaDatos");
      table.innerHTML = "";

      // Encabezados
      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");

      Object.keys(data[0]).forEach(header => {
        const th = document.createElement("th");
        th.innerText = header;
        if (columnasOcultas.includes(header)) {
          th.style.display = "none";
        }
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      table.appendChild(thead);

      // Cuerpo
      const tbody = document.createElement("tbody");
      data.forEach(row => {
        const tr = document.createElement("tr");
        Object.keys(row).forEach(header => {
          const td = document.createElement("td");
          td.innerText = row[header];
          if (columnasOcultas.includes(header)) {
            td.style.display = "none";
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
    })
    .catch(err => console.error("Error al mostrar datos:", err));
}