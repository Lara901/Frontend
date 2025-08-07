const backendURL = "https://backend-login-01tj.onrender.com"; // ← Cambia esto por tu URL real

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

function generarFormulario(datos, contenedorId, esEdicion = false) {
  const contenedor = document.getElementById(contenedorId);
  contenedor.innerHTML = "";

  const formulario = document.createElement("form");
  formulario.id = "formularioDatos";

  const encabezados = Object.keys(datos);

  encabezados.forEach((clave) => {
    // Ocultar campos definidos
    if (camposOcultos.includes(clave)) return;

    const campo = document.createElement("div");
    campo.className = "campo-formulario";

    const etiqueta = document.createElement("label");
    etiqueta.textContent = clave;
    etiqueta.setAttribute("for", clave);

    const input = document.createElement("input");
    input.name = clave;
    input.id = clave;
    input.value = datos[clave] || "";

    // Si es edición, el campo ID no se debe poder editar
    if (esEdicion && clave.toLowerCase() === "id") {
      input.readOnly = true;
    }

    campo.appendChild(etiqueta);
    campo.appendChild(input);
    formulario.appendChild(campo);
  });

  contenedor.appendChild(formulario);
}

async function buscarPorIDEditar() {
  const hoja = document.getElementById("hojaEditar").value;
  const id = document.getElementById("idEditar").value.trim();

  const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}`);
  const datos = await res.json();
  const encontrado = datos.find(item => item.ID == id);

  if (encontrado) {
    datoEditando = encontrado;
    hojaActualEditar = hoja;
    idActualEditar = id;
    generarFormularioEditar(encontrado);
    document.getElementById("respuestaEditar").textContent = "";
  } else {
    datoEditando = null;
    hojaActualEditar = null;
    document.getElementById("formularioEditar").innerHTML = "";
    document.getElementById("respuestaEditar").textContent = "ID no encontrado.";
  }
}

async function editarDato() {
  if (!datoEditando || !hojaActualEditar || !idActualEditar) {
    document.getElementById("respuestaEditar").textContent = "Debe buscar primero un ID.";
    return;
  }

  const formulario = document.getElementById("formularioEditar");
  const inputs = formulario.querySelectorAll("input");

  const datosActualizados = { ID: idActualEditar };
  inputs.forEach(input => {
    datosActualizados[input.name] = input.value;
  });

  try {
    const res = await fetch(`${backendURL}/editar/${encodeURIComponent(hojaActualEditar)}/${idActualEditar}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosActualizados)
    });

    const data = await res.json();
    if (data.success) {
      document.getElementById("respuestaEditar").textContent = "Datos actualizados correctamente.";
    } else {
      document.getElementById("respuestaEditar").textContent = "Error al actualizar los datos.";
    }
  } catch (error) {
    console.error(error);
    document.getElementById("respuestaEditar").textContent = "Error desconocido al actualizar.";
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
  const hoja = document.getElementById("hojaAgregar").value;
  const form = document.getElementById("formAgregar");
  const datos = {};

  for (const el of form.elements) {
    if (el.name) datos[el.name] = el.value;
  }

  try {
    const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (res.ok) {
      document.getElementById("respuestaAgregar").textContent = "Dato agregado exitosamente.";
      form.reset();
    } else {
      document.getElementById("respuestaAgregar").textContent = "Error al agregar.";
    }
  } catch (error) {
    document.getElementById("respuestaAgregar").textContent = "Error de red o servidor.";
  }
}