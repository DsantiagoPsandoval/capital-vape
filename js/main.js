/**
 * CAPITAL VAPE - Controlador Principal
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar componentes
  if (window.Cart) Cart.init();
  if (window.CatalogController) CatalogController.init();
  if (window.CheckoutController) CheckoutController.init();
  if (window.WholesaleCart) WholesaleCart.init();

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navMenu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      mobileToggle.textContent = navMenu.classList.contains('open') ? '✕' : '☰';
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.textContent = '☰';
      });
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

  // Wholesale portal setup
  initWholesaleSection();
});

function initWholesaleSection() {
  const form = document.getElementById('wholesaleCodeForm');
  const input = document.getElementById('wholesaleCodeInput');
  const alertBox = document.getElementById('wholesaleAlert');
  const lockedView = document.getElementById('wholesaleLockedView');
  const unlockedView = document.getElementById('wholesaleUnlockedView');
  const requestBtn = document.getElementById('btnRequestWholesaleCode');
  const logoutBtn = document.getElementById('btnExitWholesale');

  if (requestBtn && window.WholesaleService) {
    requestBtn.href = WholesaleService.getWholesaleWhatsAppUrl();
  }

  const updateWholesaleView = () => {
    if (!window.WholesaleService) return;
    const isAuth = WholesaleService.isUnlocked();
    if (lockedView) lockedView.style.display = isAuth ? 'none' : 'block';
    if (unlockedView) {
      unlockedView.style.display = isAuth ? 'block' : 'none';
      if (isAuth && window.WholesaleCatalog) {
        WholesaleCatalog.init();
      }
    }
  };

  // Init initial state
  updateWholesaleView();

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = input ? input.value : '';
      
      const res = WholesaleService.verifyCode(code);
      if (alertBox) {
        alertBox.textContent = res.message;
        alertBox.style.display = 'block';
        alertBox.className = res.success ? 'wholesale-alert success' : 'wholesale-alert error';
      }

      if (res.success) {
        setTimeout(() => {
          updateWholesaleView();
          if (alertBox) {
            alertBox.style.display = 'none';
            alertBox.textContent = '';
          }
          if (input) input.value = '';
          Toast.show('✓ Acceso mayorista concedido', 'success');
        }, 300);
      } else {
        if (input) {
          input.focus();
          input.select();
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      WholesaleService.logout();
      updateWholesaleView();
      if (input) {
        input.value = '';
        input.focus();
      }
      if (alertBox) {
        alertBox.style.display = 'none';
        alertBox.textContent = '';
      }
      Toast.show('Sesión mayorista cerrada.', 'info');
    });
  }

  // Wholesale cart trigger events
  document.querySelectorAll('.open-ws-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.WholesaleCart) WholesaleCart.openDrawer();
    });
  });

  const wsOverlay = document.getElementById('wholesaleCartOverlay');
  if (wsOverlay) {
    wsOverlay.addEventListener('click', () => {
      if (window.WholesaleCart) WholesaleCart.closeDrawer();
    });
  }

  const closeWsBtn = document.getElementById('closeWholesaleCartBtn');
  if (closeWsBtn) {
    closeWsBtn.addEventListener('click', () => {
      if (window.WholesaleCart) WholesaleCart.closeDrawer();
    });
  }
}
