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
  const contraseña = document.getElementById('contrasena').value;

  try {
    const res = await fetch(`${backendUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contraseña })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem('usuarioAutenticado', 'true');
      window.location.href = 'index.html';
    } else {
      alert(data.message || 'Credenciales inválidas');
    }

  } catch (error) {
    console.error('Error en login:', error);
    alert('Error al conectar con el servidor');
  }
}

// ------------------ PROTECCIÓN ------------------

function verificarAcceso() {
  const token = localStorage.getItem("token");
  if (token !== "accesoPermitido") {
    window.location.href = "index.html";
  }
}

// ------------------ MOSTRAR DATOS ------------------

async function mostrarDatos(hoja, contenedorId) {
  const res = await fetch(`${backendURL}/buscar/${encodeURIComponent(hoja)}`);
  const datos = await res.json();

  const contenedor = document.getElementById(contenedorId);
  contenedor.innerHTML = "";

  if (datos.length === 0) {
    contenedor.textContent = "No hay datos.";
    return;
  }

  const tabla = document.createElement("table");
  const encabezados = Object.keys(datos[0]);
  const thead = tabla.createTHead();
  const filaEncabezado = thead.insertRow();

  encabezados.forEach(encabezado => {
    const th = document.createElement("th");
    th.textContent = encabezado;
    filaEncabezado.appendChild(th);
  });

  const tbody = tabla.createTBody();

  datos.forEach(fila => {
    const filaTabla = tbody.insertRow();
    encabezados.forEach(col => {
      const celda = filaTabla.insertCell();
      celda.textContent = fila[col];
    });
  });

  contenedor.appendChild(tabla);
}

// ------------------ BUSCAR POR ID ------------------

async function buscarPorId() {
  const hoja = document.getElementById("hojaBuscar").value;
  const id = document.getElementById("idBuscar").value;
  const res = await fetch(`${backendURL}/buscar/${encodeURIComponent(hoja)}/${id}`);
  const datos = await res.json();

  const resultado = document.getElementById("resultadoBuscar");
  resultado.innerHTML = JSON.stringify(datos, null, 2);
}

// ------------------ EDITAR ------------------

async function editarDato() {
  const hoja = document.getElementById("hojaEditar").value;
  const id = document.getElementById("idEditar").value;
  const campo = document.getElementById("campoEditar").value;
  const nuevoValor = document.getElementById("valorEditar").value;

  const res = await fetch(`${backendURL}/editar/${encodeURIComponent(hoja)}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [campo]: nuevoValor }),
  });

  const mensaje = document.getElementById("mensajeEditar");
  if (res.ok) {
    mensaje.textContent = "Dato editado correctamente.";
  } else {
    mensaje.textContent = "Error al editar.";
  }
}

// ------------------ ELIMINAR ------------------

async function eliminarDato() {
  const hoja = document.getElementById("hojaEliminar").value;
  const id = document.getElementById("idEliminar").value;

  const res = await fetch(`${backendURL}/eliminar/${encodeURIComponent(hoja)}/${id}`, {
    method: "DELETE",
  });

  const mensaje = document.getElementById("mensajeEliminar");
  if (res.ok) {
    mensaje.textContent = "Dato eliminado correctamente.";
  } else {
    mensaje.textContent = "Error al eliminar.";
  }
}

// ------------------ AGREGAR ------------------

async function cargarFormulario() {
  const hoja = document.getElementById("hojaAgregar").value;
  const form = document.getElementById("formAgregar");
  form.innerHTML = "";

  if (!hoja) return;

  try {
    const res = await fetch(`${backendURL}/buscar/${encodeURIComponent(hoja)}`);
    const datos = await res.json();

    if (datos.length === 0) {
      form.innerHTML = "<p>No hay datos en esta hoja para generar el formulario.</p>";
      return;
    }

    const columnas = Object.keys(datos[0]);

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
    const res = await fetch(`${backendURL}/agregar/${encodeURIComponent(hoja)}`, {
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