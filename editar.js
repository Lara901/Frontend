const base = 'https://api.sheetbest.com/sheets/422f9b4b-ad48-42a8-8a8f-97826f60823a/tabs/';
const campos = {
  "BD": ["ID", "Año", "Mes", "Fecha", "Status", "Concepto", "Sub Concepto", "Detalle", "Créditos", "Débitos"],
  "Control_Pacientes": ["paciente", "edad", "diagnóstico"],
  "Gastos_por_mes": ["mes", "categoria", "monto"]
};

const tSel = document.getElementById("tabla");
const form = document.getElementById("formulario");
const msg = document.getElementById("mensaje");

function formatearCOP(valor) {
  if (!valor || isNaN(valor)) return '';
  return Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}

tSel.addEventListener("change", () => {
    tablaActual = tablaSelect.value;
document.getElementById("busquedaID").style.display = "block";
cargarDatos(tablaActual);
  form.innerHTML = "";
  msg.textContent = "";
  const t = tSel.value;
  if (!t) return;
  campos[t].slice(1).forEach(c => {
    form.insertAdjacentHTML('beforeend',
      `<label>${c}</label><input name="${c}" required><br>`);
  });
  form.insertAdjacentHTML('beforeend', `<button type="submit">Enviar</button>`);
});
async function obtenerNuevoID(tabla) {
  try {
    const res = await fetch(base + encodeURIComponent(tabla));
    const data = await res.json();
    const ids = data.map(row => parseInt(row.ID)).filter(n => !isNaN(n));
    return Math.max(...ids, 0) + 1;
  } catch (err) {
    console.error("Error obteniendo IDs:", err);
    return 1; 
  }
}

const tablaDatos = document.getElementById("tabla");

tablaDatos.addEventListener("change", () => {
  if (tablaDatos.value) {
    cargarDatos(tablaDatos.value);
  }
});

const columnasOcultas = ['Créditos', 'Débitos'];

async function cargarDatos(tabla) {
  const res = await fetch(`${base}${encodeURIComponent(tabla)}`);
  const datos = await res.json();
  const columnas = campos[tabla];
  const contenedor = document.getElementById('datos');
  contenedor.innerHTML = `
    <tr>
      ${columnas.filter(c => !columnasOcultas.includes(c)).map(c => `<th>${c}</th>`).join('')}
      <th>Acciones</th>
    </tr>
  `;

  datos.forEach((fila) => {
    const celdas = columnas
      .filter(k => !columnasOcultas.includes(k))
      .map(k => {
        let valor = fila[k] || '';
        if (['Débitos', 'Créditos', 'Débitos limpios', 'Créditos limpios'].includes(k)) {
          valor = formatearCOP(valor);
        }
        return `<td contenteditable="${k !== 'ID'}">${valor}</td>`;
      }).join('');

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

async function buscarPorID() {
  const id = document.getElementById("buscarID").value.trim();
  if (!id) return;

  const res = await fetch(`${base}${encodeURIComponent(tablaActual)}`);
  const datos = await res.json();
  const contenedor = document.getElementById('datos');
  const encabezado = document.getElementById('encabezado');
  const columnas = campos[tablaActual];

  const resultado = datos.find(f => f.ID?.toString() === id);
  if (!resultado) {
    contenedor.innerHTML = `<tr><td colspan="100%">No se encontró el ID ${id}</td></tr>`;
    return;
  }


  encabezado.innerHTML = "<tr>" + columnas
    .filter(c => !columnasOcultas.includes(c))
    .map(c => `<th>${c}</th>`).join('') + "<th>Acciones</th></tr>";

  const celdas = columnas
    .filter(k => !columnasOcultas.includes(k))
    .map(k => {
      let valor = resultado[k] || '';
      if (['Valor', 'Débitos', 'Créditos', 'Total', 'Subtotal'].includes(k)) {
        valor = formatearCOP(valor);
      }
      return `<td contenteditable="${k !== 'ID'}">${valor}</td>`;
    }).join('');

  contenedor.innerHTML = `
    <tr data-id="${resultado.ID}">
      ${celdas}
      <td>
        <button onclick="editarFila(this, '${tablaActual}')">💾</button>
        <button onclick="eliminarFila(this, '${tablaActual}')">🗑️</button>
      </td>
    </tr>
  `;
}
let tablaActual = '';