/**
 * CAPITAL VAPE - Controlador Principal
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar componentes
  if (window.Cart) Cart.init();
  if (window.CatalogController) CatalogController.init();
  if (window.CheckoutController) CheckoutController.init();

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

  if (requestBtn) {
    requestBtn.href = WholesaleService.getWholesaleWhatsAppUrl();
  }

  const updateWholesaleView = () => {
    const isAuth = WholesaleService.isUnlocked();
    if (lockedView) lockedView.style.display = isAuth ? 'none' : 'block';
    if (unlockedView) {
      unlockedView.style.display = isAuth ? 'block' : 'none';
      if (isAuth) renderWholesaleTable();
    }
  };

  updateWholesaleView();

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = input.value;
      alertBox.textContent = 'Verificando código...';
      alertBox.className = 'wholesale-alert info';
      alertBox.style.display = 'block';

      const res = await WholesaleService.verifyCode(code);
      if (res.success) {
        alertBox.textContent = res.message;
        alertBox.className = 'wholesale-alert success';
        setTimeout(() => {
          updateWholesaleView();
          alertBox.style.display = 'none';
          input.value = '';
          Toast.show('✓ Modo Mayorista desbloqueado.', 'success');
        }, 600);
      } else {
        alertBox.textContent = res.message;
        alertBox.className = 'wholesale-alert error';
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      WholesaleService.lock();
      updateWholesaleView();
      Toast.show('Sesión mayorista cerrada.', 'info');
    });
  }
}

function renderWholesaleTable() {
  const container = document.getElementById('wholesaleTableContainer');
  if (!container) return;

  const formatCOP = (v) => '$' + Number(v || 0).toLocaleString('es-CO');

  container.innerHTML = `
    <div class="wholesale-table-wrapper">
      <table class="wholesale-data-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Puffs / Capacidad</th>
            <th>Precio Detal</th>
            <th>Escala 5+</th>
            <th>Escala 10+</th>
            <th>Escala 20+</th>
            <th>Escala 50+</th>
            <th>Escala 100+</th>
          </tr>
        </thead>
        <tbody>
          ${PRODUCTS_DATA.map(p => `
            <tr>
              <td><strong>${p.nombre}</strong></td>
              <td>${p.subtitulo}</td>
              <td><span class="price-strikethrough">${formatCOP(p.precio)}</span></td>
              <td><strong class="tier-price">${p.precios_mayoristas['5'] ? formatCOP(p.precios_mayoristas['5']) : '-'}</strong></td>
              <td><strong class="tier-price">${p.precios_mayoristas['10'] ? formatCOP(p.precios_mayoristas['10']) : '-'}</strong></td>
              <td><strong class="tier-price">${p.precios_mayoristas['20'] ? formatCOP(p.precios_mayoristas['20']) : '-'}</strong></td>
              <td><strong class="tier-price">${p.precios_mayoristas['50'] ? formatCOP(p.precios_mayoristas['50']) : '-'}</strong></td>
              <td><strong class="tier-price">${p.precios_mayoristas['100'] ? formatCOP(p.precios_mayoristas['100']) : '-'}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
