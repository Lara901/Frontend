const backendURL = "https://backend-login-01tj.onrender.com"; // ← Cambia esto por tu URL real
const camposPermitidos = [
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

// ------------------ LOGIN ------------------

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que el formulario recargue la página
    await login();      // Llama a la función login
  });
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

    if (res.ok && data.success){
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

// ------------------ PROTECCIÓN ------------------

function verificarAcceso() {
  const autenticado = localStorage.getItem("usuarioAutenticado");
  if (autenticado !== "true") {
    window.location.href = "login.html";
  }
}

// ------------------ MOSTRAR DATOS ------------------

async function mostrarDatos(hoja, contenedorId) {
  const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}`);
  const datos = await res.json();

  const contenedor = document.getElementById(contenedorId);
  contenedor.innerHTML = "";

  if (datos.length === 0) {
    contenedor.textContent = "No hay datos.";
    return;
  }

  const columnasOcultas = [
    "Créditos", "Débitos", "Total Créditos", "Total Débitos", "Total Neto"
  ];

  const columnasConFormatoPesos = [
  "Créditos limpios", "Débitos limpios", "Total créditos", "Total débitos", "Total neto",
  "Tarifa", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto",
  "Septiembre", "Octubre", "Noviembre", "Diciembre",
  "INGRESOS", "GASTOS", "DIFERENCIA",
  "Alimentos", "Bancos", "Gastos Adminitativos", "Gastos de Infraestructura",
  "Gastos de Operación", "Nomina", "Servicios Publicos", "Suma total"
];

 const todasColumnas = Object.keys(datos[0]).filter(col => !columnasOcultas.includes(col.trim()));

  const tabla = document.createElement("table");
  const thead = tabla.createTHead();
  const filaEncabezado = thead.insertRow();

  todasColumnas.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    filaEncabezado.appendChild(th);
  });

  const tbody = tabla.createTBody();

  datos.forEach(fila => {
    const filaTabla = tbody.insertRow();
    todasColumnas.forEach(col => {
      const celda = filaTabla.insertCell();
      let valor = fila[col];

      if (columnasConFormatoPesos.includes(col.trim()) && typeof valor === "string" && valor.trim() !== "") {
  const valorNumerico = Number(valor.replace(/\./g, "").replace(",", "."));
  if (!isNaN(valorNumerico)) {
    valor = valorNumerico.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    });
  }
}

      celda.textContent = valor;
    });
  });

  contenedor.appendChild(tabla);
}

function verDatos() {
  const hoja = document.getElementById("hojaSelect").value;
  mostrarDatos(hoja, "tablaDatos");
}

// ------------------ BUSCAR POR ID ------------------

async function buscarPorId() {
  const hoja = document.getElementById("hojaBuscar").value;
  const id = document.getElementById("idBuscar").value;
  const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}/${id}`);
  const datos = await res.json();

  const resultado = document.getElementById("resultadoBuscar");
  resultado.innerHTML = JSON.stringify(datos, null, 2);
}

// ------------------ EDITAR ------------------
let datoEditando = null;
let hojaActualEditar = null;
let idActualEditar = null;
const camposOcultos = [
  "Créditos limpios",
  "Débitos limpios",
  "Total Créditos",
  "Total Débitos",
  "Total Neto"
];

async function buscarPorIDEditar() {
  const hoja = document.getElementById("hojaEditar").value;
  const id = document.getElementById("idEditar").value.trim();

  if (!hoja || !id) {
    alert("Selecciona una hoja y escribe un ID");
    return;
  }

  try {
    const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}/${id}`);
    const datos = await res.json();

    const pre = document.getElementById("datoActualEditar");

    if (!datos || Object.keys(datos).length === 0) {
      pre.textContent = "ID no encontrado.";
      return;
    }

    pre.textContent = JSON.stringify(datos, null, 2);
    hojaActualEditar = hoja;
    idActualEditar = id;

    // Mostrar formulario solo con campos permitidos
    generarFormularioEditar(datos);

  } catch (error) {
    console.error(error);
    document.getElementById("datoActualEditar").textContent = "Error al buscar el ID.";
  }
}

function generarFormularioEditar(datos) {
  const form = document.getElementById("formularioEditar");
  form.innerHTML = "";

  camposPermitidos.forEach(campo => {
    const label = document.createElement("label");
    label.textContent = campo;
    const input = document.createElement("input");
    input.type = "text";
    input.name = campo;
    input.value = datos[campo] || "";
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(document.createElement("br"));
  });
}

async function guardarEdicion() {
  const form = document.getElementById("formularioEditar");
  const inputs = form.querySelectorAll("input, select, textarea");

  let datosEnviar = {};
  camposPermitidos.forEach(campo => {
    const input = Array.from(inputs).find(inp => inp.name === campo);
    if (input) datosEnviar[campo] = input.value;
  });

  try {
    const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hojaActualEditar)}/${idActualEditar}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosEnviar)
    });

    const respuesta = document.getElementById("respuestaEditar");

    if (res.ok) {
      respuesta.textContent = "Cambios guardados correctamente.";
    } else {
      respuesta.textContent = "Error al guardar cambios.";
    }
  } catch (error) {
    document.getElementById("respuestaEditar").textContent = "Error al conectar con el servidor.";
  }
}
// ------------------ ELIMINAR ------------------

async function buscarPorIDEliminar() {
  const hoja = document.getElementById("hojaEliminar").value;
  const id = document.getElementById("idEliminar").value.trim();
  const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}`);
  const datos = await res.json();
  const encontrado = datos.find(item => item.ID == id);

  const pre = document.getElementById("datoActualEliminar");
  if (encontrado) {
    pre.textContent = JSON.stringify(encontrado, null, 2);
  } else {
    pre.textContent = "ID no encontrado.";
  }
}


async function eliminarDato() {
  const hoja = document.getElementById("hojaEliminar").value;
  const id = document.getElementById("idEliminar").value;

   try {
    // Buscar el dato antes de eliminar
    const resBusqueda = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}/${id}`);
    const dato = await resBusqueda.json();

    if (!dato || Object.keys(dato).length === 0) {
      document.getElementById("datoActualEliminar").textContent = "Dato no encontrado.";
      return;
    }

    document.getElementById("datoActualEliminar").textContent = JSON.stringify(dato, null, 2);

     if (!confirm("¿Estás seguro de eliminar este dato?")) return;

  const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}/${id}`, {
    method: "DELETE",
  });

  const mensaje = document.getElementById("mensajeEliminar");
  if (res.ok) {
    mensaje.textContent = "Dato eliminado correctamente.";
  } else {
    mensaje.textContent = "Error al eliminar.";
  }
}catch (error) {
    document.getElementById("mensajeEliminar").textContent = "Error al buscar o eliminar.";
  }
}


// ------------------ AGREGAR ------------------

function generarFormularioAgregar() {
  const form = document.getElementById("formularioAgregar");
  form.innerHTML = "";

  camposPermitidos.forEach(campo => {
    const label = document.createElement("label");
    label.textContent = campo;
    const input = document.createElement("input");
    input.type = "text";
    input.name = campo;
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(document.createElement("br"));
  });
}

async function cargarFormulario() {
  const hoja = document.getElementById("hojaAgregar").value;
  const form = document.getElementById("formAgregar");
  form.innerHTML = "";

  if (!hoja) return;

  try {
    const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}`);
    const datos = await res.json();

    if (datos.length === 0) {
      form.innerHTML = "<p>No hay datos en esta hoja para generar el formulario.</p>";
      return;
    }

const columnasOcultas = ["Créditos limpios", "Débitos limpios",
  "Total Créditos", "Total Débitos", "Total Neto"];

    const columnas = Object.keys(datos[0]).filter(columnas => !columnasOcultas.includes(columnas));

    columnas.forEach(col => {
      const label = document.createElement("label");
      label.textContent = col;
      const input = document.createElement("input");
      input.name = col;
      input.required = true;
      form.appendChild(label);
      form.appendChild(input);
      form.appendChild(document.createElement("br"));
    });

  } catch (error) {
    form.innerHTML = "<p>Error al cargar los campos de la hoja.</p>";
  }
}

async function enviarFormulario() {
  const form = document.getElementById("formAgregar");
  const inputs = form.querySelectorAll("input, select, textarea");

  let datosEnviar = {};
  camposPermitidos.forEach(campo => {
    const input = Array.from(inputs).find(inp => inp.name === campo);
    if (input) datosEnviar[campo] = input.value;
  });

  try {
    const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(document.getElementById("hojaAgregar").value)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosEnviar)
    });

    const respuesta = document.getElementById("respuestaAgregar");

    if (res.ok) {
      respuesta.textContent = "Datos agregados correctamente.";
    } else {
      respuesta.textContent = "Error al agregar datos.";
    }
  } catch (error) {
    document.getElementById("respuestaAgregar").textContent = "Error al conectar con el servidor.";
  }
}