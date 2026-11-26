/**
 * CAPITAL VAPE — Controlador de Modalidades Comerciales (StoreMode)
 * Gestiona la experiencia de ingreso, selector de tiendas (Retail vs Mayorista),
 * acceso protegido mediante clave al catálogo mayorista, y separación de catálogos y carritos.
 */
const StoreMode = (function() {
  const STORAGE_KEY_MODE = 'cv_selected_store_mode';
  let currentMode = 'retail'; // 'retail' | 'wholesale'

  function init() {
    bindEvents();
    
    // Si la verificación de edad está superada, determinar modo inicial
    if (typeof AgeVerification !== 'undefined' && AgeVerification.isVerified()) {
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE);
      if (savedMode === 'wholesale') {
        if (typeof WholesaleService !== 'undefined' && WholesaleService.isUnlocked()) {
          setMode('wholesale', false);
        } else {
          // Si guardó mayorista pero la sesión expiró, mostrar selector
          showSelector();
        }
      } else if (savedMode === 'retail') {
        setMode('retail', false);
      } else {
        // Primera vez tras +18: mostrar selector de tienda
        showSelector();
      }
    }
  }

  function getMode() {
    return currentMode;
  }

  function showSelector() {
    const selectorOverlay = document.getElementById('storeSelectorOverlay');
    if (selectorOverlay) {
      selectorOverlay.classList.remove('is-hidden');
      document.body.classList.add('store-selector-open');
    }
    closeWholesalePasswordModal();
  }

  function hideSelector() {
    const selectorOverlay = document.getElementById('storeSelectorOverlay');
    if (selectorOverlay) {
      selectorOverlay.classList.add('is-hidden');
      document.body.classList.remove('store-selector-open');
    }
  }

  function setMode(mode, save = true) {
    currentMode = (mode === 'wholesale') ? 'wholesale' : 'retail';
    if (save) {
      try {
        localStorage.setItem(STORAGE_KEY_MODE, currentMode);
      } catch (e) {}
    }

    hideSelector();
    closeWholesalePasswordModal();

    // Actualizar visibilidad de vistas
    const retailView = document.getElementById('retailStoreView');
    const wholesaleView = document.getElementById('wholesaleStoreView');
    const sidebarBadge = document.getElementById('sidebarStoreBadge');
    const mobileHeaderBadge = document.getElementById('mobileHeaderStoreBadge');

    if (currentMode === 'retail') {
      if (retailView) retailView.style.display = 'block';
      if (wholesaleView) wholesaleView.style.display = 'none';
      document.body.classList.remove('mode-wholesale');
      document.body.classList.add('mode-retail');

      if (sidebarBadge) {
        sidebarBadge.className = 'sidebar-store-pill pill-retail';
        sidebarBadge.innerHTML = '<span>🏪</span> TIENDA RETAIL';
      }
      if (mobileHeaderBadge) {
        mobileHeaderBadge.className = 'header-store-pill pill-retail';
        mobileHeaderBadge.innerHTML = '<span>🏪</span> Retail';
      }

      // Actualizar botón ultra-destacado para invitar al modo Mayorista
      const switchTitleDesktop = document.getElementById('switchStoreBtnTitle');
      const switchSubDesktop = document.getElementById('switchStoreBtnSub');
      const switchTitleDrawer = document.getElementById('switchStoreDrawerTitle');
      const switchSubDrawer = document.getElementById('switchStoreDrawerSub');
      const navSwitchLabel = document.getElementById('navSwitchStoreLabel');

      if (switchTitleDesktop) switchTitleDesktop.textContent = 'IR A MAYORISTA';
      if (switchSubDesktop) switchSubDesktop.textContent = 'PRECIOS POR MAYOR ➔';
      if (switchTitleDrawer) switchTitleDrawer.textContent = 'IR A MAYORISTA';
      if (switchSubDrawer) switchSubDrawer.textContent = 'PRECIOS POR MAYOR ➔';
      if (navSwitchLabel) navSwitchLabel.textContent = 'Mayorista';

      // Desencadenar render de retail
      if (typeof CatalogController !== 'undefined') {
        CatalogController.renderCatalog();
      }
    } else {
      if (retailView) retailView.style.display = 'none';
      if (wholesaleView) wholesaleView.style.display = 'block';
      document.body.classList.remove('mode-retail');
      document.body.classList.add('mode-wholesale');

      if (sidebarBadge) {
        sidebarBadge.className = 'sidebar-store-pill pill-wholesale';
        sidebarBadge.innerHTML = '<span>📦</span> CATÁLOGO MAYORISTA';
      }
      if (mobileHeaderBadge) {
        mobileHeaderBadge.className = 'header-store-pill pill-wholesale';
        mobileHeaderBadge.innerHTML = '<span>📦</span> Mayorista';
      }

      // Actualizar botón ultra-destacado para invitar al modo Retail
      const switchTitleDesktop = document.getElementById('switchStoreBtnTitle');
      const switchSubDesktop = document.getElementById('switchStoreBtnSub');
      const switchTitleDrawer = document.getElementById('switchStoreDrawerTitle');
      const switchSubDrawer = document.getElementById('switchStoreDrawerSub');
      const navSwitchLabel = document.getElementById('navSwitchStoreLabel');

      if (switchTitleDesktop) switchTitleDesktop.textContent = 'IR A RETAIL';
      if (switchSubDesktop) switchSubDesktop.textContent = 'COMPRA AL DETAL ➔';
      if (switchTitleDrawer) switchTitleDrawer.textContent = 'IR A RETAIL';
      if (switchSubDrawer) switchSubDrawer.textContent = 'COMPRA AL DETAL ➔';
      if (navSwitchLabel) navSwitchLabel.textContent = 'Retail';

      // Asegurar vista desbloqueada en mayoristas
      const wsLocked = document.getElementById('wholesaleLockedView');
      const wsUnlocked = document.getElementById('wholesaleUnlockedView');
      if (wsLocked) wsLocked.style.display = 'none';
      if (wsUnlocked) wsUnlocked.style.display = 'block';

      // Desencadenar render de mayorista
      if (typeof WholesaleCatalog !== 'undefined') {
        WholesaleCatalog.renderCatalog();
      }
    }

    // Actualizar badge del carrito activo
    if (typeof Cart !== 'undefined' && typeof Cart.updateUI === 'function') {
      Cart.updateUI();
    }

    // Scroll suave al inicio del catálogo seleccionado
    window.scrollTo({ top: 0, behavior: 'smooth' });

    window.dispatchEvent(new CustomEvent('cv_store_mode_changed', { detail: { mode: currentMode } }));
  }

  function enterRetail() {
    setMode('retail', true);
    if (typeof Toast !== 'undefined') {
      Toast.show('✓ Bienvenido a la Tienda Retail de Capital Vape.', 'success');
    }
  }

  function enterWholesale() {
    if (typeof WholesaleService !== 'undefined' && WholesaleService.isUnlocked()) {
      setMode('wholesale', true);
      if (typeof Toast !== 'undefined') {
        Toast.show('✓ Acceso mayorista activo verificado.', 'success');
      }
    } else {
      openWholesalePasswordModal();
    }
  }

  function openWholesalePasswordModal() {
    const modal = document.getElementById('wholesaleAccessModal');
    if (modal) {
      modal.classList.remove('is-hidden');
      modal.style.display = 'flex';
      const input = document.getElementById('wholesalePassModalInput');
      const alertEl = document.getElementById('wholesalePassModalAlert');
      if (alertEl) alertEl.style.display = 'none';
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 150);
      }
    }
  }

  function closeWholesalePasswordModal() {
    const modal = document.getElementById('wholesaleAccessModal');
    if (modal) {
      modal.classList.add('is-hidden');
      modal.style.display = 'none';
    }
  }

  async function submitWholesalePassword(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('wholesalePassModalInput');
    const alertEl = document.getElementById('wholesalePassModalAlert');
    const submitBtn = document.getElementById('btnSubmitWholesalePass');

    const pass = input ? input.value.trim() : '';
    if (!pass) {
      if (alertEl) {
        alertEl.textContent = '❌ Por favor ingresa la clave mayorista.';
        alertEl.style.display = 'block';
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Validando acceso...';
    }

    let result = { success: false, message: '' };
    if (typeof WholesaleService !== 'undefined' && typeof WholesaleService.verifyCodeAsync === 'function') {
      result = await WholesaleService.verifyCodeAsync(pass);
    } else if (typeof WholesaleService !== 'undefined') {
      result = WholesaleService.verifyCode(pass);
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'INGRESAR';
    }

    if (result.success) {
      closeWholesalePasswordModal();
      setMode('wholesale', true);
      if (typeof Toast !== 'undefined') {
        Toast.show('✓ ¡Clave mayorista validada! Bienvenido al Catálogo Mayorista.', 'success');
      }
    } else {
      if (alertEl) {
        alertEl.textContent = result.message || '❌ Clave incorrecta. Por favor intenta de nuevo.';
        alertEl.style.display = 'block';
      }
    }
  }

  function togglePasswordVisibility() {
    const input = document.getElementById('wholesalePassModalInput');
    const eyeBtn = document.getElementById('btnToggleWholesalePass');
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (eyeBtn) eyeBtn.textContent = '🙈';
    } else {
      input.type = 'password';
      if (eyeBtn) eyeBtn.textContent = '👁️';
    }
  }

  function backToSelectorFromPassword() {
    closeWholesalePasswordModal();
    showSelector();
  }

  function onWholesaleLogout() {
    if (currentMode === 'wholesale') {
      setMode('retail', true);
      if (typeof Toast !== 'undefined') {
        Toast.show('Has cerrado la sesión mayorista. Has vuelto a la Tienda Retail.', 'info');
      }
    }
  }

  function bindEvents() {
    // Al hacer clic en "Cambiar tienda"
    document.querySelectorAll('.btn-switch-store, .nav-switch-store-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showSelector();
      });
    });

    const form = document.getElementById('wholesalePassModalForm');
    if (form) {
      form.addEventListener('submit', submitWholesalePassword);
    }
  }

  return {
    init,
    getMode,
    setMode,
    showSelector,
    hideSelector,
    enterRetail,
    enterWholesale,
    openWholesalePasswordModal,
    closeWholesalePasswordModal,
    submitWholesalePassword,
    togglePasswordVisibility,
    backToSelectorFromPassword,
    onWholesaleLogout
  };
})();

window.StoreMode = StoreMode;
