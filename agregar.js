const base = 'https://backend-login-01tj.onrender.com/';
const campos = {
  "BD": ["ID", "Año", "Mes", "Fecha", "Status", "Concepto", "Sub Concepto", "Detalle", "Créditos", "Débitos"],
  "Control_Pacientes": ["ID", "paciente", "edad", "diagnóstico"],
  "Gastos_por_mes": ["ID", "mes", "categoria", "monto"]
};

const tSel = document.getElementById("tabla");
const form = document.getElementById("formulario");
const msg = document.getElementById("mensaje");

// Mostrar campos del formulario según la tabla
tSel.addEventListener("change", () => {
  form.innerHTML = "";
  msg.textContent = "";
  const tabla = tSel.value;
  if (!tabla) return;

  campos[tabla].slice(1).forEach(campo => {
    form.insertAdjacentHTML('beforeend',
      `<label>${campo}</label><input name="${campo}" required><br>`);
  });

  form.insertAdjacentHTML('beforeend', `<button type="submit">Enviar</button>`);
});

// Obtener nuevo ID automático desde backend
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

// Enviar datos al backend con método POST
form.addEventListener("submit", async e => {
  e.preventDefault();
  const tabla = tSel.value;
  const data = {};
  const nuevoID = await obtenerNuevoID(tabla);
  data["ID"] = nuevoID;

  campos[tabla].slice(1).forEach(c => {
    data[c] = form.elements[c].value;
  });

  try {
    await fetch(base + tabla, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    msg.textContent = '✅ Agregado correctamente';
    form.reset();
  } catch (err) {
    msg.textContent = '❌ Error al enviar';
    console.error(err);
  }
});