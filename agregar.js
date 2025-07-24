const base = 'https://api.sheetbest.com/sheets/422f9b4b-ad48-42a8-8a8f-97826f60823a/tabs/';
const campos = {
  "BD": ["ID", "Año", "Mes", "Fecha", "Status", "Concepto", "Sub Concepto", "Detalle", "Créditos", "Débitos"],
  "Control_Pacientes": ["paciente", "edad", "diagnóstico"],
  "Gastos_por mes": ["mes", "categoria", "monto"]
};
const tSel = document.getElementById("tabla");
const form = document.getElementById("formulario");
const msg = document.getElementById("mensaje");

tSel.addEventListener("change", () => {
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

form.addEventListener("submit", async e => {
  e.preventDefault();
  const t = tSel.value;
  const data = {};
  const nuevoID = await obtenerNuevoID(t);
  data["ID"] = nuevoID;
   campos[t].slice(1).forEach(c => {
    data[c] = form.elements[c].value;
  });
  try {
    await fetch(base + encodeURIComponent(t), {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    msg.textContent = '✅ Agregado correctamente';
    form.reset();
  } catch(err) {
    msg.textContent = '❌ Error al enviar';
    console.error(err);
  }
});