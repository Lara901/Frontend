const Form = document.getElementById('loginForm');
Form.addEventListener('submit', function (e) {
    e.preventDefault();
const usuario = document.getElementById('usuario').value;
    const clave = document.getElementById('clave').value;
  fetch('https://backend-login-mfsm.onrender.com/login', {
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
}); 