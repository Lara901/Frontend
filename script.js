const backendURL = "https://backend-login-01tj.onrender.com"; // ← Cambia esto por tu URL real
let hojaActualEditar = null;
const camposPermitidos = [
  "Año",
  "Mes",
  "Fecha",
  "Status",
  "Concepto",
  "Sub Concepto",
  "Detalle",
  "Créditos",
  "Débitos",
  "STATUS", "Fecha de pago", "Tarifa", "Paciente", "Acudiente", "Cedula", "Contacto", "Fecha De Ingreso", "Fecha de Egreso", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto",
  "Septiembre", "Octubre", "Noviembre", "Diciembre", "MES", "INGRESOS", "GASTOS", "DIFERENCIA", "Alimentos", "Bancos", "Gastos Adminitativos", "Gastos de Infraestructura",
  "Gastos de Operación", "Nomina", "Servicios Publicos", "Suma total", "Carnes", "Huevos", "Mercado de Plaza", "Pollo", "Quesos", "Supermercado", "Suma total", "Acueducto", "Claro", "Codensa", "Gas Natural", "Suma total", "Intereses Cesantias", "Nomina Empleados", "Nomina Socios", "Parafiscales", "Suma total", "Participacion Costos", "Concepto", "Porcentaje"];

  const columnasConFormatoPesos = [
  "Créditos limpios", "Débitos limpios", "Total créditos", "Total débitos", "Total neto",
  "Tarifa", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto",
  "Septiembre", "Octubre", "Noviembre", "Diciembre",
  "INGRESOS", "GASTOS", "DIFERENCIA",
  "Alimentos", "Bancos", "Gastos Adminitativos", "Gastos de Infraestructura",
  "Gastos de Operación", "Nomina", "Servicios Publicos", "Suma total", "Carnes", "Huevos", "Mercado de Plaza", "Pollo", "Quesos", "Supermercado", "Suma total", "Acueducto", "Claro", "Codensa", "Gas Natural", "Suma total","Intereses Cesantias", "Nomina Empleados", "Nomina Socios", "Parafiscales", "Suma total", "Participacion Costos"];
function limpiarValorPeso(valor) {
  if (typeof valor === "number") return valor; // Si ya es número, no procesar
  if (typeof valor !== "string") return 0;     // Si no es string o número, devolver 0
  
  // Elimina cualquier símbolo, espacio, puntos o comas que no sean parte de un decimal válido
  valor = valor.replace(/[^0-9,.-]/g, ""); // Deja solo números, comas, puntos y signo
  valor = valor.replace(/\./g, "");        // Quita separadores de miles
  valor = valor.replace(",", ".");         // Convierte coma a punto decimal

  const numero = parseFloat(valor);
  return isNaN(numero) ? 0 : numero;
}
  // ------------------ LOGIN ------------------

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) { // Solo si existe
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

  const columnasOculta = [];

  const columnasConFormatoPesos = [
  "Créditos limpios", "Débitos limpios", "Total créditos", "Total débitos", "Total neto",
  "Tarifa", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto",
  "Septiembre", "Octubre", "Noviembre", "Diciembre",
  "INGRESOS", "GASTOS", "DIFERENCIA",
  "Alimentos", "Bancos", "Gastos Adminitativos", "Gastos de Infraestructura",
  "Gastos de Operación", "Nomina", "Servicios Publicos", "Suma total"
];

 const todasColumnas = Object.keys(datos[0]).filter(col => !columnasOculta.includes(col.trim()));

  const tabla = document.createElement("table");
tabla.classList.add("tabla-datos");
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

      if (columnasConFormatoPesos.includes(campo.trim()) && valor !== "") {
      const valorNumerico = limpiarValorPeso(valor);
      if (!isNaN(valorNumerico) && valorNumerico !== 0) {
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
const contenedorTabla = document.getElementById('contenedorTabla');

document.addEventListener("DOMContentLoaded", () => {
  const selectTabla = document.getElementById("hojaEditar"); // debe coincidir con tu HTML
  if (selectTabla) {
    selectTabla.addEventListener('change', () => {
      const tablaSeleccionada = selectTabla.value;
      if (tablaSeleccionada) {
        cargarTabla(tablaSeleccionada);
      }
    });
  } else {
    console.warn("No se encontró el select con id 'hojaEditar'");
  }
});

function cargarTabla(hoja) {
  mostrarDatos(hoja, "tablaDatos");
}

function generarTabla(encabezados, datos) {
  const tabla = document.getElementById("tablaDatos");
  tabla.innerHTML = ""; // Limpia tabla previa

  // Crear encabezados
  const thead = tabla.createTHead();
  const filaEncabezados = thead.insertRow();
  encabezados.forEach(encabezado => {
    const th = document.createElement("th");
    th.textContent = encabezado;
    filaEncabezados.appendChild(th);
  });

  // Crear cuerpo de tabla
  const tbody = tabla.createTBody();
  datos.forEach(fila => {
    const tr = tbody.insertRow();
    encabezados.forEach(columna => {
      const td = tr.insertCell();
      let valor = fila[columna] ?? ""; // Previene undefined

      // Si la columna está en la lista, formatear a pesos
      if (columnasConFormatoPesos.includes(columna)) {
        valor = formatearPesos(valor);
      }

      td.textContent = valor;
    });
  });
}


function renderizarTabla(encabezados, datos) {
    // Limpiar tabla anterior
    contenedorTabla.innerHTML = '';

    // Crear tabla y encabezado
    const table = document.createElement('table');
    table.classList.add('tabla-dinamica');

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    encabezados.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // Crear cuerpo de la tabla
    const tbody = document.createElement('tbody');
    datos.forEach(fila => {
        const tr = document.createElement('tr');
        encabezados.forEach(col => {
            const td = document.createElement('td');
            td.textContent = fila[col] !== undefined ? fila[col] : '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    contenedorTabla.appendChild(table);
}


// ------------------ BUSCAR POR ID ------------------

async function buscarPorId() {
  const hoja = document.getElementById("hojaBuscar").value;
  const id = document.getElementById("idBuscar").value;
  const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}/${id}`);
  const datos = await res.json();

  const resultado = document.getElementById("resultadoBuscar");
  resultado.innerHTML = "";

  if (!datos || Object.keys(datos).length === 0) {
    resultado.textContent = "No se encontró el ID.";
    return;
  }

  const tabla = document.createElement("table");
  tabla.classList.add("tabla-datos");

  const thead = tabla.createTHead();
  const filaEncabezado = thead.insertRow();

  Object.keys(datos).forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    filaEncabezado.appendChild(th);
  });

  const tbody = tabla.createTBody();
  const filaTabla = tbody.insertRow();
  Object.keys(datos).forEach(col => {
    const celda = filaTabla.insertCell();
    let valor = datos[col];

    if (columnasConFormatoPesos.includes(campo.trim()) && valor !== "") {
      const valorNumerico = limpiarValorPeso(valor);
      if (!isNaN(valorNumerico) && valorNumerico !== 0) {
        valor = valorNumerico.toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0
        });
      }
    }

    celda.textContent = valor;
  });

  resultado.appendChild(tabla);
}

// ------------------ EDITAR ------------------
let datoEditando = null;
let idActualEditar = null;

const camposOcultos = ["Créditos limpios", "Débitos limpios", "Total Créditos", "Total Débitos", "Total Neto"];

async function buscarPorIDEditar() {
  const hoja = document.getElementById("hojaEditar").value;
  const id = document.getElementById("idEditar").value.trim();

  if (!hoja || !id) {
    alert("Selecciona una hoja y escribe un ID");
    return;
  }

  try {
    // 1️⃣ Obtener encabezados de la hoja
    const resEnc = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}/columnas`);
    let encabezados = await resEnc.json();

    // Si el backend devuelve { columnas: [...] }
    if (encabezados && encabezados.columnas) {
      encabezados = encabezados.columnas;
    }

    if (!Array.isArray(encabezados)) {
      throw new Error("Encabezados inválidos recibidos del servidor");
    }

    // 2️⃣ Buscar datos del ID
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

    generarFormularioEditar(datos, encabezados);

  } catch (error) {
    console.error("Error en buscarPorIDEditar:", error);
    document.getElementById("datoActualEditar").textContent = "Error al buscar el ID.";
  }
}

function generarFormularioEditar(datos, encabezados) {
  const form = document.getElementById("formularioEditar");
  form.innerHTML = "";

  encabezados.forEach(campo => {
    if (camposOcultos.includes(campo)) return; // Ocultar columnas específicas

    const label = document.createElement("label");
    label.textContent = campo;

    const input = document.createElement("input");
    input.type = "text";
    input.name = campo;

    let valor = datos[campo] || "";

    // Formatear en pesos si está en la lista
   if (columnasConFormatoPesos.includes(campo.trim()) && valor !== "") {
      const valorNumerico = limpiarValorPeso(valor);
      if (!isNaN(valorNumerico) && valorNumerico !== 0) {
        valor = valorNumerico.toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0
        });
      }
    }

    input.value = valor;
    if (campo === "ID") input.readOnly = true;

    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(document.createElement("br"));
  });
}



async function guardarEdicion() {
  const form = document.getElementById("formularioEditar");
  const inputs = form.querySelectorAll("input, select, textarea");

  let datosEnviar = {};
  
  
  // Obtener ID desde el formulario
  const idValor = Array.from(inputs).find(inp => inp.name === "ID")?.value;
  
  // Construir objeto con campos permitidos
  camposPermitidos.forEach(campo => {
    const input = Array.from(inputs).find(inp => inp.name === campo);
    if (input) {
      let valor = input.value.trim();
datosEnviar[campo] = valor;
    }
  });


  columnasConFormatoPesos.forEach(col => {
  if (datosEnviar[col]) {
    datosEnviar[col] = limpiarValorPeso(datosEnviar[col]);
  }
});
  // Incluir ID en el envío
  datosEnviar["ID"] = idValor;

  try {
    const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hojaActualEditar)}/${idValor}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosEnviar)
    });

    const respuesta = document.getElementById("respuestaEditar");
    if (res.ok) {
      respuesta.textContent = `Cambios guardados correctamente. ID: ${idValor}`;
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

    const columnasOcultas = ["ID"]; // 👈 Ocultamos el ID, será autogenerado
    const columnas = Object.keys(datos[0]).filter(col => !columnasOcultas.includes(col));

    columnas.forEach(col => {
      const label = document.createElement("label");
      label.textContent = col;
      const input = document.createElement("input");
      input.name = col;
      input.required = true;

      // Si es una columna de formato pesos
     if (columnasConFormatoPesos.includes(campo.trim()) && valor !== "") {
      const valorNumerico = limpiarValorPeso(valor);
      if (!isNaN(valorNumerico) && valorNumerico !== 0) {
        valor = valorNumerico.toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0
        });
      }
    }

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

  // 1️⃣ Calcular ID automáticamente
  let nuevoID = 1;
  try {
    const resDatos = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}`);
    const datosExistentes = await resDatos.json();
    if (datosExistentes.length > 0) {
      const ids = datosExistentes.map(d => parseInt(d.ID, 10)).filter(n => !isNaN(n));
      if (ids.length > 0) nuevoID = Math.max(...ids) + 1;
    }
  } catch (error) {
    console.error("Error obteniendo ID máximo:", error);
  }

  // 2️⃣ Construir objeto a enviar
  const form = document.getElementById("formAgregar");
  const inputs = form.querySelectorAll("input, select, textarea");
  let datosEnviar = { ID: nuevoID }; // 👈 Siempre incluir el nuevo ID

  inputs.forEach(input => {
    datosEnviar[input.name] = input.value;
  });

  // 3️⃣ Convertir campos de formato pesos a número
  columnasConFormatoPesos.forEach(col => {
    if (datosEnviar[col]) {
      datosEnviar[col] = Number(datosEnviar[col].toString().replace(/[^0-9,-]/g, "").replace(",", "."));
    }
  });

  // 4️⃣ Enviar datos al backend
  try {
    const res = await fetch(`${backendURL}/hoja/${encodeURIComponent(hoja)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosEnviar)
    });

    const respuesta = document.getElementById("respuestaAgregar");
    if (res.ok) {
      respuesta.textContent = `Datos agregados correctamente. Nuevo ID: ${nuevoID}`;
      // Recargar tabla para mostrar el nuevo ID
      if (typeof cargarTabla === "function") {
        cargarTabla(); 
      }
    } else {
      respuesta.textContent = "Error al agregar datos.";
    }
  } catch (error) {
    document.getElementById("respuestaAgregar").textContent = "Error al conectar con el servidor.";
  }
}