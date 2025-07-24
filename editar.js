const base = 'https://api.sheetbest.com/sheets/422f9b4b-ad48-42a8-8a8f-97826f60823a/tabs/';
const campos = {
  "BD": ["ID", "Año", "Mes", "Fecha", "Status", "Concepto", "Sub Concepto", "Detalle", "Créditos", "Débitos"],
  "Control_Pacientes": ["paciente", "edad", "diagnóstico"],
  "Gastos_por mes": ["mes", "categoria", "monto"]
};

const tSel = document.getElementById("tabla");
const tablaDatos = document.getElementById("tabla"); // selector tabla
const contenedorTabla = document.createElement("table");
contenedorTabla.innerHTML = "<thead><tr><th colspan='100%'>Registros</th></tr></thead><tbody id='datos'></tbody>";
document.body.appendChild(contenedorTabla);

tablaDatos.addEventListener("change", () => {
  if (tablaDatos.value) {
    cargarDatos(tablaDatos.value);
  }
});

async function cargarDatos(tabla) {
  const res = await fetch(`${base}${encodeURIComponent(tabla)}`);
  const datos = await res.json();
  const contenedor = document.getElementById('datos');
  contenedor.innerHTML = "";

  const columnas = campos[tabla]; // columnas a mostrar

  datos.forEach((fila) => {
    const celdas = columnas.map(k =>
      `<td contenteditable="${k !== 'ID'}">${fila[k] || ''}</td>`
    ).join('');
    contenedor.insertAdjacentHTML("beforeend", `
      <tr data-id="${fila.ID}">
        ${celdas}
        <td>
          <button onclick="editarFila(this, '${tabla}')">💾</button>
          <button onclick="eliminarFila(this, '${tabla}')">🗑️</button>
        </td>
      </tr>
    `);
  });
}

async function editarFila(boton, tabla) {
  const fila = boton.closest('tr');
  const celdas = fila.querySelectorAll('td');
  const columnas = campos[tabla];
  const valores = Array.from(celdas).slice(0, columnas.length).map(td => td.innerText);

  const data = {};
  columnas.forEach((col, i) => {
    data[col] = valores[i];
  });

  const id = fila.dataset.id;
  const query = { "ID": id };

  try {
    await fetch(`${base}${encodeURIComponent(tabla)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, data })
    });
    alert("✅ Registro actualizado correctamente");
  } catch (err) {
    console.error(err);
    alert("❌ Error al actualizar");
  }
}

async function eliminarFila(boton, tabla) {
  const fila = boton.closest('tr');
  const id = fila.dataset.id;

  try {
    await fetch(`${base}${encodeURIComponent(tabla)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "ID": id })
    });
    fila.remove();
    alert("🗑️ Registro eliminado correctamente");
  } catch (err) {
    console.error(err);
    alert("❌ Error al eliminar");
  }
}
