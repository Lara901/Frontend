let tablaActual = '';
const base = 'https://backend-login-01tj.onrender.com/';
const campos = {
  "BD": ["ID", "Año", "Mes", "Fecha", "Status", "Concepto", "Sub Concepto", "Detalle", "Créditos limpios", "Débitos limpios"],
  "Control_Pacientes": ["ID", "paciente", "edad", "diagnóstico"],
  "Gastos_por_mes": ["ID", "mes", "categoria", "monto"]
};

const tSel = document.getElementById("tabla");
const form = document.getElementById("formulario");
const msg = document.getElementById("mensaje");

function formatearCOP(valor) {
  if (!valor || isNaN(valor)) return '';
  return Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}

function limpiarValor(valor) {
  return valor.replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.').trim();
}

tSel.addEventListener("change", () => {
  document.getElementById("busquedaID").style.display = "block";
  tablaActual = tSel.value;
  cargarDatos(tablaActual);
  form.innerHTML = "";
  msg.textContent = "";
  if (!tablaActual) return;

  campos[tablaActual].slice(1).forEach(c => {
    form.insertAdjacentHTML('beforeend', `<label>${c}</label><input name="${c}" required><br>`);
  });
  form.insertAdjacentHTML('beforeend', `<button type="submit">Enviar</button>`);
});

async function obtenerNuevoID(tabla) {
  try {
    const res = await fetch(base + tabla);
    const data = await res.json();
    const ids = data.map(row => parseInt(row.ID)).filter(n => !isNaN(n));
    return Math.max(...ids, 0) + 1;
  } catch (err) {
    console.error("Error obteniendo IDs:", err);
    return 1;
  }
}

async function cargarDatos(tabla) {
  try {
    const res = await fetch(`${base}${tabla}`);
    const datos = await res.json();
    const columnas = campos[tabla];
    const contenedor = document.getElementById('datos');
    const encabezado = document.getElementById("encabezado");

    encabezado.innerHTML = `<tr>${columnas.map(c => `<th>${c}</th>`).join('')}<th>Acciones</th></tr>`;
    contenedor.innerHTML = "";

    datos.forEach((fila) => {
      const celdas = columnas.map(k => {
        let valor = fila[k] || '';
        if (['Débitos', 'Créditos', 'Débitos limpios', 'Créditos limpios', 'monto'].includes(k)) {
          valor = formatearCOP(valor);
        }
        const editable = k === 'ID' ? 'false' : 'true';
        return `<td contenteditable="${editable}">${valor}</td>`;
      }).join('');

      contenedor.insertAdjacentHTML("beforeend", `
        <tr data-id="${fila.ID}">
          ${celdas}
          <td>
            <button onclick="editarFila(this, '${tabla}')">💾</button>
            <button onclick="eliminarFila(this, '${tabla}')">🗑️</button>
          </td>
        </tr>`);
    });
  } catch (error) {
    console.error("Error cargando datos:", error);
  }
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {};
  const tabla = tablaActual;
  const nuevoID = await obtenerNuevoID(tabla);
  data["ID"] = nuevoID;

  campos[tabla].slice(1).forEach(c => {
    data[c] = form.elements[c].value;
  });

  try {
    await fetch(`${base}${tabla}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    msg.textContent = '✅ Agregado correctamente';
    form.reset();
    cargarDatos(tabla);
  } catch (err) {
    console.error(err);
    msg.textContent = '❌ Error al enviar';
  }
});

async function editarFila(boton, tabla) {
  const fila = boton.closest('tr');
  const celdas = fila.querySelectorAll('td');
  const columnas = campos[tabla];

  const valores = Array.from(celdas).slice(0, columnas.length).map(td => td.innerText.trim());
  const data = {};

  columnas.forEach((col, i) => {
    let val = valores[i];
    if (['Débitos', 'Créditos', 'Débitos limpios', 'Créditos limpios', 'monto'].includes(col)) {
      val = limpiarValor(val);
    }
    data[col] = val;
  });

  const id = fila.dataset.id;

  try {
    const res = await fetch(`${base}${tabla}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ID: id, data })
    });
    const text = await res.text();
    console.log("Editado:", text);
    alert("✅ Registro actualizado");
  } catch (err) {
    console.error(err);
    alert("❌ Error al actualizar");
  }
}

async function eliminarFila(boton, tabla) {
  const fila = boton.closest('tr');
  const id = fila.dataset.id;

  try {
    await fetch(`${base}${tabla}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ID: id })
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
  if (!id || !tablaActual) return;

  const res = await fetch(`${base}${tablaActual}`);
  const datos = await res.json();
  const columnas = campos[tablaActual];
  const contenedor = document.getElementById('datos');
  const encabezado = document.getElementById('encabezado');

  const resultado = datos.find(f => f.ID?.toString() === id);
  if (!resultado) {
    contenedor.innerHTML = `<tr><td colspan="100%">❌ No se encontró el ID ${id}</td></tr>`;
    return;
  }

  encabezado.innerHTML = `<tr>${columnas.map(c => `<th>${c}</th>`).join('')}<th>Acciones</th></tr>`;

  const celdas = columnas.map(k => {
    let valor = resultado[k] || '';
    if (['Débitos', 'Créditos', 'Débitos limpios', 'Créditos limpios', 'monto'].includes(k)) {
      valor = formatearCOP(valor);
    }
    const editable = k === 'ID' ? 'false' : 'true';
    return `<td contenteditable="${editable}">${valor}</td>`;
  }).join('');

  contenedor.innerHTML = `
    <tr data-id="${resultado.ID}">
      ${celdas}
      <td>
        <button onclick="editarFila(this, '${tablaActual}')">💾</button>
        <button onclick="eliminarFila(this, '${tablaActual}')">🗑️</button>
      </td>
    </tr>`;
}

document.getElementById("buscarID").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    buscarPorID();
  }
});