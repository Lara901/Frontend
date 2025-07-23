const Form = document.getElementById('loginForm');
Form.addEventListener('submit', function (e) {
    e.preventDefault();
const usuario = document.getElementById('usuario').value;
    const clave = document.getElementById('clave').value;
  fetch('https://backend-login-01tj.onrender.com/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },

    body: JSON.stringify({ usuario, clave })
  }) .then(res => res.json())
      .then(data => {
        if (data.acceso === true) {
         localStorage.setItem('usuarioAutenticado', 'true');
  window.location.href = 'index.html';
        }else {
            document.getElementById('mensaje').innerText = '❌ Acceso denegado';
        }
      }) .catch (err => {
    document.getElementById('mensaje').innerText = '⚠️ Error en el servidor';
        console.error(err);
});

  fetch('https://api.sheetbest.com/sheets/422f9b4b-ad48-42a8-8a8f-97826f60823a')
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById('Facturas');
      data.forEach(usuario => {
        const item = document.createElement('li');
        item.textContent = `${fila.Fecha} (${fila.status} - SubConcepto: ${fila["Sub Concepto"]} - Concepto: ${fila.Concepto} - Detalle: ${fila.Detalle} - Créditos: ${fila.Créditos} - Débitos ${fila.Débitos})`;
        lista.appendChild(item);
      });
    });

}); 