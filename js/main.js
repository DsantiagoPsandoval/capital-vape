/**
 * CAPITAL VAPE - Controlador Principal
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar tema
  initThemeManager();

  // 2. Inicializar Carrito y Catálogos
  if (window.Cart) Cart.init();
  if (window.CatalogController) CatalogController.init();
  if (window.CheckoutController) CheckoutController.init();

  // 3. Inicializar Portal Mayorista con sesión persistente
  initWholesaleSection();

  // 4. Mobile Menu Drawer Toggle
  const mobileToggle = document.getElementById('mobileMenuToggle') || document.getElementById('mobileMenuBtn');
  const mobileClose = document.getElementById('mobileMenuClose');
  const navMenu = document.getElementById('navMenu');

  function openMenu() {
    if (navMenu) {
      navMenu.classList.add('open');
      document.body.classList.add('menu-open-scroll-lock');
    }
  }

  function closeMenu() {
    if (navMenu) {
      navMenu.classList.remove('open');
      document.body.classList.remove('menu-open-scroll-lock');
    }
  }

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (mobileClose) {
      mobileClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMenu();
      });
    }

    navMenu.querySelectorAll('a, button.open-cart-btn').forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMenu();
      }
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

/**
 * GESTOR DE TEMA (CLARO / OSCURO)
 */
function initThemeManager() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeToggleIcon');
  const themeMobileBtn = document.getElementById('themeToggleMobileBtn');
  const themeMobileIcon = document.getElementById('themeToggleMobileIcon');
  const themeMobileText = document.getElementById('themeToggleMobileText');

  const getSavedTheme = () => {
    return localStorage.getItem('cv_theme') || 'dark';
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('cv_theme', theme);
    
    const isLight = (theme === 'light');
    if (themeIcon) {
      themeIcon.textContent = isLight ? '🌙' : '☀️';
    }
    if (themeMobileIcon) {
      themeMobileIcon.textContent = isLight ? '🌙' : '☀️';
    }
    if (themeMobileText) {
      themeMobileText.textContent = isLight ? 'Cambiar a Modo Oscuro 🌙' : 'Cambiar a Modo Claro ☀️';
    }
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('title', isLight ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro');
    }
  };

  applyTheme(getSavedTheme());

  const toggleAction = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    if (window.Toast) {
      Toast.show(`Modo ${nextTheme === 'light' ? 'Claro ☀️' : 'Oscuro 🌙'} activado`, 'info');
    }
  };

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleAction);
  }
  if (themeMobileBtn) {
    themeMobileBtn.addEventListener('click', toggleAction);
  }
}

/**
 * SECCIÓN DE MAYORISTAS (SESIÓN INDEPENDIENTE Y PERSISTENTE)
 */
function initWholesaleSection() {
  const form = document.getElementById('wholesaleCodeForm');
  const input = document.getElementById('wholesaleCodeInput');
  const alertBox = document.getElementById('wholesaleAlert');
  const lockedView = document.getElementById('wholesaleLockedView');
  const unlockedView = document.getElementById('wholesaleUnlockedView');
  const logoutBtn = document.getElementById('btnExitWholesale') || document.getElementById('wholesaleLogoutBtn');
  const openCartBtn = document.getElementById('openWholesaleCartBtn') || document.querySelector('.open-ws-cart-btn');

  function updateWholesaleView() {
    const isUnlocked = WholesaleService.isUnlocked();
    if (lockedView && unlockedView) {
      if (isUnlocked) {
        lockedView.style.display = 'none';
        unlockedView.style.display = 'block';
        if (window.WholesaleCatalog) {
          WholesaleCatalog.init();
        }
      } else {
        lockedView.style.display = 'block';
        unlockedView.style.display = 'none';
      }
    }
  }

  // Check persistent session on load
  updateWholesaleView();

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = WholesaleService.verifyCode(input.value);
      if (res.success) {
        if (alertBox) alertBox.style.display = 'none';
        input.value = '';
        Toast.show(res.message, 'success');
        updateWholesaleView();
      } else {
        if (alertBox) {
          alertBox.textContent = res.message;
          alertBox.style.display = 'block';
        }
        Toast.show(res.message, 'error');
      }
    });
  }

  // SOLO CERRAR SESIÓN CON BOTÓN EXPLÍCITO "CERRAR SESIÓN MAYORISTA"
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      WholesaleService.logout();
      updateWholesaleView();
      Toast.show('Sesión mayorista cerrada con éxito. El carrito se mantiene intacto.', 'info');
    });
  }

  if (openCartBtn) {
    openCartBtn.addEventListener('click', () => {
      Cart.openDrawer();
    });
  }
}
