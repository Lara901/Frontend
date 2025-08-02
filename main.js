const form = document.getElementById('loginForm');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const usuario = document.getElementById('usuario').value.trim();
  const clave = document.getElementById('clave').value.trim();

  fetch('https://backend-login-01tj.onrender.com/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ usuario, clave })
  })
    .then(res => {
      if (!res.ok) throw new Error('Error de red o del servidor');
      return res.json();
    })
    .then(data => {
      if (data.acceso === true) {
        localStorage.setItem('usuarioAutenticado', 'true');
        window.location.href = 'index.html'; 
      } else {
        document.getElementById('mensaje').innerText = '❌ Acceso denegado';
      }
    })
    .catch(err => {
      document.getElementById('mensaje').innerText = '⚠️ Error en el servidor';
      console.error(err);
    });
});