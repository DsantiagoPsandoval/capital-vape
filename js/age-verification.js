/**
 * CAPITAL VAPE - MÓDULO DE VERIFICACIÓN DE MAYORÍA DE EDAD (+18)
 * Cumplimiento de Ley 124 de 1994, Ley 1335 de 2009 y Código de Infancia y Adolescencia.
 */

const AgeVerification = (function() {
  const STORAGE_KEY = 'capital_vape_age_verified';
  let canvasAnimId = null;

  /**
   * Comprueba si el usuario ya verificó mayoría de edad previamente
   */
  function isVerified() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
      console.warn('[AgeVerification] localStorage no disponible:', e);
      return false;
    }
  }

  /**
   * Guarda la confirmación en localStorage
   */
  function saveVerification() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('[AgeVerification] No se pudo guardar verificación en localStorage:', e);
    }
  }

  /**
   * Bloquea el scroll del documento
   */
  function lockScroll() {
    document.documentElement.classList.add('age-gate-locked');
    if (document.body) {
      document.body.classList.add('age-gate-locked');
    }
  }

  /**
   * Desbloquea el scroll del documento
   */
  function unlockScroll() {
    document.documentElement.classList.remove('age-gate-locked');
    if (document.body) {
      document.body.classList.remove('age-gate-locked');
    }
  }

  /**
   * Inicializa el lienzo de partículas y luces sutiles de fondo
   */
  function initAmbientCanvas() {
    const canvas = document.getElementById('ageGateCanvas');
    if (!canvas) return;

    // Respetar preferencia de reducción de movimiento del sistema
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    function onResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', onResize);

    // Cantidad adaptativa de partículas (muy ligera para no consumir batería ni CPU)
    const count = width < 600 ? 16 : 28;
    const particles = [];
    const colors = ['#FF007F', '#D4AF37', '#FF1A8C', '#E5B700'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35 - 0.1, // leve deriva ascendente
        alpha: Math.random() * 0.45 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Rebote / teletransporte suave en bordes
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        p.alpha += Math.sin(Date.now() * p.pulseSpeed * 0.05) * 0.005;
        const currentAlpha = Math.max(0.08, Math.min(0.65, p.alpha));

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      // Conectar partículas cercanas con líneas luminosas hiper sutiles
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 95;

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = '#FF007F';
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      canvasAnimId = requestAnimationFrame(render);
    }

    canvasAnimId = requestAnimationFrame(render);
  }

  /**
   * Detiene el canvas para ahorrar recursos
   */
  function stopAmbientCanvas() {
    if (canvasAnimId) {
      cancelAnimationFrame(canvasAnimId);
      canvasAnimId = null;
    }
  }

  /**
   * Confirma la mayoría de edad y da acceso al sitio
   */
  function confirm() {
    saveVerification();

    const overlay = document.getElementById('ageVerificationOverlay');
    if (overlay) {
      overlay.classList.add('age-gate-closing');
      setTimeout(() => {
        overlay.classList.add('age-gate-hidden');
        overlay.classList.remove('age-gate-closing');
        unlockScroll();
        stopAmbientCanvas();

        // Si el usuario intentó acceder a una sección con hash (#catalogo, #mayoristas, etc.)
        if (window.location.hash) {
          try {
            const target = document.querySelector(window.location.hash);
            if (target) {
              const headerOffset = 76;
              const elementPosition = target.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          } catch (e) {
            // Ignorar hash no válido
          }
        }
      }, 400);
    } else {
      unlockScroll();
    }
  }

  /**
   * Rechaza el acceso (usuario menor de edad)
   */
  function reject() {
    const mainView = document.getElementById('ageGateMainView');
    const deniedView = document.getElementById('ageGateDeniedView');

    if (mainView && deniedView) {
      mainView.style.display = 'none';
      deniedView.style.display = 'block';
      deniedView.style.animation = 'ageCardEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    }
    // Asegurar que el scroll se mantenga totalmente bloqueado
    lockScroll();
  }

  /**
   * Vuelve a la pantalla de verificación desde la pantalla de rechazo
   */
  function retry() {
    const mainView = document.getElementById('ageGateMainView');
    const deniedView = document.getElementById('ageGateDeniedView');

    if (mainView && deniedView) {
      deniedView.style.display = 'none';
      mainView.style.display = 'block';
      mainView.style.animation = 'ageCardEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    }
  }

  /**
   * Salir del sitio hacia una página segura externa
   */
  function exitSite() {
    window.location.href = 'https://www.google.com';
  }

  /**
   * Restablece la verificación para pruebas (disponible vía consola: AgeVerification.reset())
   */
  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}

    const overlay = document.getElementById('ageVerificationOverlay');
    const mainView = document.getElementById('ageGateMainView');
    const deniedView = document.getElementById('ageGateDeniedView');

    if (mainView) mainView.style.display = 'block';
    if (deniedView) deniedView.style.display = 'none';

    if (overlay) {
      overlay.classList.remove('age-gate-hidden', 'age-gate-closing');
    }
    lockScroll();
    stopAmbientCanvas();
    initAmbientCanvas();

    console.log('[AgeVerification] Estado restablecido a no verificado. Pantalla mostrada.');
  }

  let listenersAttached = false;

  function attachListeners() {
    if (listenersAttached) return;
    listenersAttached = true;

    const btnConfirm = document.getElementById('btnAgeConfirm');
    const btnReject = document.getElementById('btnAgeReject');
    const btnRetry = document.getElementById('btnAgeRetry');
    const btnExit = document.getElementById('btnAgeExitSite');

    if (btnConfirm) {
      btnConfirm.addEventListener('click', (e) => {
        e.preventDefault();
        confirm();
      });
    }

    if (btnReject) {
      btnReject.addEventListener('click', (e) => {
        e.preventDefault();
        reject();
      });
    }

    if (btnRetry) {
      btnRetry.addEventListener('click', (e) => {
        e.preventDefault();
        retry();
      });
    }

    if (btnExit) {
      btnExit.addEventListener('click', (e) => {
        exitSite();
      });
    }

    // Prevenir que el usuario cierre el modal con la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (!isVerified() && e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  /**
   * Inicialización del componente
   */
  function init() {
    const overlay = document.getElementById('ageVerificationOverlay');
    if (!overlay) return;

    attachListeners();

    if (isVerified()) {
      // Usuario ya confirmado: ocultar modal inmediatamente y desbloquear scroll
      overlay.classList.add('age-gate-hidden');
      unlockScroll();
      return;
    }

    // Usuario NO confirmado: bloquear scroll y mostrar pantalla de verificación
    lockScroll();
    overlay.classList.remove('age-gate-hidden');
    initAmbientCanvas();
  }

  return {
    init,
    confirm,
    reject,
    retry,
    reset,
    exitSite,
    isVerified
  };
})();

// Auto-inicialización inmediata al cargar el DOM o si ya está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', AgeVerification.init);
} else {
  AgeVerification.init();
}

// Exportar globalmente
window.AgeVerification = AgeVerification;
