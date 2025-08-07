// script.js (completo y corregido)

const backendURL = "https://backend-login-01tj.onrender.com";

// Campos que sí permitimos agregar/editar
const camposPermitidosSheets = [
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

// Columnas que queremos ocultar en la vista general
const columnasOcultas = [
  "Créditos",
  "Débitos",
  "Total Créditos",
  "Total Débitos",
  "Total Neto"
];

// Columnas que se mostraran en formato pesos (si tienen valor numérico)
const columnasFormatoPesos = [
  "Créditos limpios", "Débitos limpios",
  "Total Créditos", "Total Débitos", "Total Neto",
  "Créditos", "Débitos"
];

// Estados globales para edición/agregar
let hojaActualEditar = "";
let idActualEditar = "";
let hojaActualAgregar = "";

// ---------------- LOGIN (sin cambios) ----------------
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await login();
    });
  }
});

async function login() {
  const usuario = document.getElementById('usuario').value;
  const contraseña = document.getElementById('contraseña').value;

  try {
    const res = await fetch(`${backendURL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contraseña })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem('usuarioAutenticado', 'true');
      window.location.href = 'index.html';
    } else {
      alert(data.message || 'Error desconocido');
    }
  } catch (error) {
    console.error('Error en login:', error);
    alert('Error al conectar con el servidor');
  }
}

function verificarAcceso() {
  const autenticado = localStorage.getItem("usuarioAutenticado");
  if (autenticado !== "true") {
    window.location.href = "login.html";
  }
}

// ---------------- MOSTRAR DATOS ----------------
function formateaPesosSiCorresponde(col, valor) {
  if (valor === undefined || valor === null) return "";
  // Si columna está en la lista y valor es convertíble a número
  if (!columnasFormatoPesos.map(c => c.toLowerCase()).includes(col.toLowerCase())) return valor;
  // limpiar separadores de miles y coma decimal -> convertir a Number
  const clean = String(valor).replace(/\./g, '').replace(',', '.').trim();
  const num = Number(clean);
  if (isNaN(num)) return valor; // si no es número, devolver original
  return num.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });
}

async function mostrarDatos(hoja, contenedorId) {
  try {
    const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}`);
    if (!res.ok) throw new Error("Error al obtener datos");
    const datos = await res.json();

    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = "";

    if (!Array.isArray(datos) || datos.length === 0) {
      contenedor.textContent = "No hay datos.";
      return;
    }

    // tomar encabezados del primer objeto y quitar columnas ocultas
    const encabezados = Object.keys(datos[0]).filter(h => !columnasOcultas.includes(h));

    const tabla = document.createElement("table");
    tabla.className = "mi-tabla";

    const thead = tabla.createTHead();
    const trHead = thead.insertRow();
    encabezados.forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      trHead.appendChild(th);
    });
    // columna acciones
    const thAcc = document.createElement("th");
    thAcc.textContent = "Acciones";
    trHead.appendChild(thAcc);

    const tbody = tabla.createTBody();

    datos.forEach(fila => {
      const tr = tbody.insertRow();
      encabezados.forEach(col => {
        const td = tr.insertCell();
        const raw = fila[col] ?? "";
        td.textContent = formateaPesosSiCorresponde(col, raw);
      });

      const tdAcc = tr.insertCell();
      // editar
      const btnEd = document.createElement("button");
      btnEd.textContent = "Editar";
      btnEd.onclick = () => {
        // abrir formulario de edición con datos visibles
        buscarPorIDParaEditar(hoja, fila.ID);
      };
      // eliminar
      const btnDel = document.createElement("button");
      btnDel.textContent = "Eliminar";
      btnDel.onclick = () => eliminarFila(hoja, fila.ID);

      tdAcc.appendChild(btnEd);
      tdAcc.appendChild(btnDel);

    });

    contenedor.appendChild(tabla);

  } catch (err) {
    console.error("mostrarDatos error:", err);
    document.getElementById(contenedorId).textContent = "Error al obtener datos";
  }
}

function verDatos() {
  const hoja = document.getElementById("hojaSelect").value;
  mostrarDatos(hoja, "tablaDatos");
}

// ---------------- BUSCAR POR ID (genérico para mostrar) ----------------
async function buscarPorId() {
  const hoja = document.getElementById("hojaBuscar").value;
  const id = document.getElementById("idBuscar").value;
  try {
    const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}/${encodeURIComponent(id)}`);
    const datos = await res.json();
    const resultado = document.getElementById("resultadoBuscar");
    resultado.innerHTML = JSON.stringify(datos, null, 2);
  } catch (err) {
    console.error(err);
    document.getElementById("resultadoBuscar").textContent = "Error al buscar por ID";
  }
}

// ---------------- EDITAR ----------------
// helper: solicitar dato al backend y cargar formulario editable (solo camposPermitidos).
async function buscarPorIDParaEditar(hoja, id) {
  // si id es pasado desde botón, usar ese; si no, tomar del input
  const idInput = id ?? document.getElementById("idEditar").value.trim();
  if (!hoja) hoja = document.getElementById("hojaEditar").value;
  if (!hoja || !idInput) {
    alert("Selecciona hoja y escribe ID");
    return;
  }

  try {
    const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}/${encodeURIComponent(idInput)}`);
    if (!res.ok) {
      document.getElementById("datoActualEditar").textContent = "ID no encontrado.";
      return;
    }
    const datos = await res.json();
    // mostrar pre con el objeto
    document.getElementById("datoActualEditar").textContent = JSON.stringify(datos, null, 2);
    hojaActualEditar = hoja;
    idActualEditar = idInput;
    generarFormularioEditar(datos);
  } catch (err) {
    console.error("buscarPorIDParaEditar error:", err);
    document.getElementById("datoActualEditar").textContent = "Error al buscar.";
  }
}

function generarFormularioEditar(datos) {
  const form = document.getElementById("formularioEditar");
  form.innerHTML = "";

  // Mostrar ID (no editable)
  const lblId = document.createElement("label");
  lblId.textContent = "ID";
  const inputId = document.createElement("input");
  inputId.type = "text";
  inputId.name = "ID";
  inputId.value = datos.ID ?? "";
  inputId.readOnly = true;
  form.appendChild(lblId);
  form.appendChild(inputId);
  form.appendChild(document.createElement("br"));

  // Crear inputs solo para campos permitidos
  camposPermitidosSheets.forEach(campo => {
    const label = document.createElement("label");
    label.textContent = campo;
    const input = document.createElement("input");
    input.type = "text";
    input.name = campo;
    input.value = datos[campo] ?? "";
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(document.createElement("br"));
  });

  // Botón guardar
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Guardar cambios";
  btn.onclick = editarDato; // usa la función editarDato definida abajo
  form.appendChild(btn);
}

// enviar solo los campos permitidos al backend (PUT)
async function editarDato() {
  if (!hojaActualEditar || !idActualEditar) {
    document.getElementById("respuestaEditar").textContent = "Busca primero el ID a editar.";
    return;
  }

  const form = document.getElementById("formularioEditar");
  const inputs = form.querySelectorAll("input");
  const datosEnviar = {};

  camposPermitidosSheets.forEach(campo => {
    const input = Array.from(inputs).find(i => i.name === campo);
    datosEnviar[campo] = input ? input.value : "";
  });

  try {
    const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hojaActualEditar)}/${encodeURIComponent(idActualEditar)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosEnviar)
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("editar error:", res.status, txt);
      document.getElementById("respuestaEditar").textContent = "Error al actualizar.";
      return;
    }

    document.getElementById("respuestaEditar").textContent = "Datos actualizados correctamente.";
    // refrescar vista
    mostrarDatos(hojaActualEditar, "tablaDatos");
  } catch (err) {
    console.error(err);
    document.getElementById("respuestaEditar").textContent = "Error de red al actualizar.";
  }
}

// ---------------- ELIMINAR ----------------
async function buscarPorIDEliminar() {
  const hoja = document.getElementById("hojaEliminar").value;
  const id = document.getElementById("idEliminar").value.trim();
  if (!hoja || !id) {
    document.getElementById("datoActualEliminar").textContent = "Selecciona hoja e ingresa ID.";
    return;
  }
  try {
    const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}/${encodeURIComponent(id)}`);
    if (!res.ok) {
      document.getElementById("datoActualEliminar").textContent = "ID no encontrado.";
      return;
    }
    const dato = await res.json();
    document.getElementById("datoActualEliminar").textContent = JSON.stringify(dato, null, 2);
  } catch (err) {
    console.error(err);
    document.getElementById("datoActualEliminar").textContent = "Error al buscar.";
  }
}

async function eliminarFila(hoja, id) {
  // si es llamado desde botón (con params) o desde pantalla eliminar con inputs
  if (!hoja) hoja = document.getElementById("hojaEliminar").value;
  if (!id) id = document.getElementById("idEliminar").value;

  if (!confirm("¿Estás seguro de eliminar esta fila?")) return;

  try {
    const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    if (res.ok) {
      alert("Fila eliminada");
      mostrarDatos(hoja, "tablaDatos");
    } else {
      const txt = await res.text();
      console.error("delete error:", res.status, txt);
      alert("Error al eliminar");
    }
  } catch (err) {
    console.error(err);
    alert("Error de red al eliminar");
  }
}

// ---------------- AGREGAR ----------------
function generarFormularioAgregar() {
  const form = document.getElementById("formularioAgregar");
  form.innerHTML = "";

  camposPermitidosSheets.forEach(campo => {
    const label = document.createElement("label");
    label.textContent = campo;
    const input = document.createElement("input");
    input.type = "text";
    input.name = campo;
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(document.createElement("br"));
  });

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Agregar";
  btn.onclick = agregarFila;
  form.appendChild(btn);
}

// Llamada desde select onchange para preparar formulario dinámico
function cargarFormulario() {
  const hoja = document.getElementById("hojaAgregar").value;
  hojaActualAgregar = hoja;
  if (!hoja) {
    document.getElementById("formAgregar").innerHTML = "";
    return;
  }
  // generamos formulario estático con camposPermitidosSheets
  generarFormularioAgregar();
}

async function agregarFila() {
  if (!hojaActualAgregar) {
    alert("Selecciona la hoja donde agregar");
    return;
  }
  const form = document.getElementById("formularioAgregar");
  const inputs = form.querySelectorAll("input");
  const datosEnviar = {};

  camposPermitidosSheets.forEach(campo => {
    const input = Array.from(inputs).find(i => i.name === campo);
    datosEnviar[campo] = input ? input.value : "";
  });

  try {
    const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hojaActualAgregar)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosEnviar)
    });

    if (res.ok) {
      document.getElementById("respuestaAgregar").textContent = "Dato agregado correctamente.";
      mostrarDatos(hojaActualAgregar, "tablaDatos");
      form.reset();
    } else {
      const txt = await res.text();
      console.error("agregar error:", res.status, txt);
      document.getElementById("respuestaAgregar").textContent = "Error al agregar.";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("respuestaAgregar").textContent = "Error de red al agregar.";
  }
}
