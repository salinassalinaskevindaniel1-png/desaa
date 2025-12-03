let datosUsuario = JSON.parse(localStorage.getItem('usuario')) || null;
let intentosFallidos = parseInt(localStorage.getItem('intentos')) || 0;
let cuentaBloqueada = localStorage.getItem('bloqueada') === 'true';

const MAX_INTENTOS = 3;
/** 

  @param {string} mensaje 
  @param {string} tipo 
 */
function mostrarMensaje(mensaje, tipo) {
    const msgElement = document.getElementById('mensaje-global');
    msgElement.textContent = mensaje;
    msgElement.className = `mensaje ${tipo}`;
    setTimeout(() => {
        msgElement.textContent = '';
        msgElement.className = 'mensaje';
    }, 5000); // El mensaje desaparece después de 5 segundos
}

/** 
  @param {string} idSeccion 
  */
function mostrarSeccion(idSeccion) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    
    });
    document.getElementById(idSeccion).classList.add('active');
    document.getElementById('mensaje-global').textContent = ''; // Limpiar mensaje al cambiar
}

/**
 * Activa la funcionalidad de mostrar/ocultar contraseña.
 */
document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
    });
});

//  MÓDULO DE REGISTRO 

document.getElementById('form-registro').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!this.checkValidity()) {
        mostrarMensaje('Por favor, rellena todos los campos correctamente. Verifica las reglas de cada campo.', 'error');
        return;
    }

    const nombre = document.getElementById('reg-nombre').value.trim();
    const usuario = document.getElementById('reg-usuario').value.trim();
    const movil = document.getElementById('reg-movil').value.trim();
    const contrasena = document.getElementById('reg-pass').value;

    if (datosUsuario && datosUsuario.usuario === usuario) {
        mostrarMensaje('⚠️ El correo electrónico ya está registrado.', 'warning');
        return;
    }

    datosUsuario = {
        nombre: nombre,
        usuario: usuario,
        movil: movil,
        contrasena: contrasena 
    };
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));

    
    intentosFallidos = 0;
    cuentaBloqueada = false;
    localStorage.removeItem('intentos');
    localStorage.removeItem('bloqueada');

    mostrarMensaje('¡✅ Cuenta registrada con éxito! Ahora puedes iniciar sesión.', 'success');
    document.getElementById('form-registro').reset();
    mostrarSeccion('seccion-login');
});


document.getElementById('form-login').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('login-usuario').value.trim();
    const contrasena = document.getElementById('login-pass').value;
    const linkRecuperar = document.getElementById('link-recuperar');


    if (!datosUsuario) {
        mostrarMensaje('❌ Usuario o contraseña incorrectos.', 'error');
        return;
    }

    // Verificar estado de bloqueo
    if (cuentaBloqueada) {
        linkRecuperar.style.display = 'block';
        mostrarMensaje('⚠️ Cuenta bloqueada por intentos fallidos. Use el enlace para recuperar su contraseña.', 'warning');
        return;
    }

    //  Verificar credenciales
    if (usuario === datosUsuario.usuario && contrasena === datosUsuario.contrasena) {
        // Credenciales correctas
        intentosFallidos = 0;
        localStorage.removeItem('intentos');
        linkRecuperar.style.display = 'none';

        mostrarMensaje(`🎉 Bienvenido al sistema, ${datosUsuario.nombre} 🎉`, 'success');
        document.getElementById('form-login').reset();
        
        document.getElementById('auth-forms').style.display = 'none';

    } else {
        // Credenciales incorrectas
        intentosFallidos++;
        localStorage.setItem('intentos', intentosFallidos);

        if (intentosFallidos >= MAX_INTENTOS) {
            // Bloqueo de cuenta
            cuentaBloqueada = true;
            localStorage.setItem('bloqueada', 'true');
            linkRecuperar.style.display = 'block';
            mostrarMensaje('❌ Cuenta bloqueada por intentos fallidos. Intente recuperar su contraseña.', 'error');
        } else {
            // Intento fallido
            const intentosRestantes = MAX_INTENTOS - intentosFallidos;
            mostrarMensaje(`❌ Usuario o contraseña incorrectos. Te quedan ${intentosRestantes} intentos.`, 'error');
        }
    }
});

//   RECUPERACIÓN DE CONTRASEÑA 

document.getElementById('form-recuperacion').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!this.checkValidity()) {
        mostrarMensaje('La nueva contraseña no cumple con los requisitos de seguridad (Mayús, Minús, Número, Símbolo, 6+ caracteres).', 'error');
        return;
    }

    const nuevaContrasena = document.getElementById('rec-pass').value;

    if (!datosUsuario) {
        mostrarMensaje('❌ No hay una cuenta registrada para actualizar.', 'error');
        return;
    }

    // Actualizar contraseña
    datosUsuario.contrasena = nuevaContrasena;
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));

    //Desbloquear y reiniciar intentos
    intentosFallidos = 0;
    cuentaBloqueada = false;
    localStorage.removeItem('intentos');
    localStorage.removeItem('bloqueada');
    document.getElementById('link-recuperar').style.display = 'none';
    document.getElementById('auth-forms').style.display = 'block'; 


    mostrarMensaje('✅ Contraseña actualizada. Ahora puede iniciar sesión.', 'success');
    document.getElementById('form-recuperacion').reset();
    mostrarSeccion('seccion-login');
});


window.onload = () => {
    mostrarSeccion('seccion-registro');
    
    if (cuentaBloqueada) {
        document.getElementById('link-recuperar').style.display = 'block';
        mostrarMensaje('⚠️ Su cuenta está bloqueada. Recupere su contraseña para continuar.', 'warning');
    }
};