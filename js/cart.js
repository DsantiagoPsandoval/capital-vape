/**
 * CAPITAL VAPE - Carrito de Compras & Barra de Envío Gratis
 */
const Cart = {
  items: [],
  destination: 'bogota', // 'bogota' | 'nacional'

  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.updateUI();
  },

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.CART);
      this.items = saved ? JSON.parse(saved) : [];
      const savedDest = localStorage.getItem(CONFIG.STORAGE_KEYS.SHIPPING_DEST);
      if (savedDest) this.destination = savedDest;
    } catch (e) {
      this.items = [];
    }
  },

  saveToStorage() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(this.items));
    localStorage.setItem(CONFIG.STORAGE_KEYS.SHIPPING_DEST, this.destination);
  },

  setDestination(dest) {
    this.destination = dest;
    this.saveToStorage();
    this.updateUI();
  },

  addItem(product, variant, qty = 1) {
    const itemKey = `${product.id}__${variant || 'default'}`;
    const existing = this.items.find(i => i.key === itemKey);

    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push({
        key: itemKey,
        productId: product.id,
        nombre: product.nombre,
        subtitulo: product.subtitulo,
        precio: product.precio,
        precio_promo_2: product.precio_promo_2,
        variant: variant || '',
        qty: qty
      });
    }

    this.saveToStorage();
    this.updateUI();
    this.openDrawer();
    Toast.show(`✓ ¡"${product.nombre} ${variant ? '(' + variant + ')' : ''}" agregado al carrito!`, 'success');
  },

  updateQty(itemKey, delta) {
    const item = this.items.find(i => i.key === itemKey);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      this.removeItem(itemKey);
      return;
    }

    this.saveToStorage();
    this.updateUI();
  },

  removeItem(itemKey) {
    const item = this.items.find(i => i.key === itemKey);
    this.items = this.items.filter(i => i.key !== itemKey);
    this.saveToStorage();
    this.updateUI();
    if (item) {
      Toast.show(`Producto eliminado del carrito.`, 'info');
    }
  },

  clearCart() {
    if (this.items.length === 0) return;
    if (confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
      this.items = [];
      this.saveToStorage();
      this.updateUI();
      Toast.show('Carrito vaciado.', 'info');
    }
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => {
      // Calculate dual promos if applicable
      let itemTotal = 0;
      if (item.precio_promo_2 && item.qty >= 2) {
        const pairs = Math.floor(item.qty / 2);
        const remainder = item.qty % 2;
        itemTotal = (pairs * item.precio_promo_2) + (remainder * item.precio);
      } else {
        itemTotal = item.qty * item.precio;
      }
      return sum + itemTotal;
    }, 0);
  },

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  },

  getShippingInfo() {
    const subtotal = this.getSubtotal();
    const isBogota = this.destination === 'bogota';
    const threshold = isBogota ? CONFIG.SHIPPING.BOGOTA_FREE_THRESHOLD : CONFIG.SHIPPING.NACIONAL_FREE_THRESHOLD;
    const standardCost = isBogota ? CONFIG.SHIPPING.BOGOTA_STANDARD_COST : CONFIG.SHIPPING.NACIONAL_STANDARD_COST;

    const isFree = subtotal >= threshold;
    const remaining = isFree ? 0 : threshold - subtotal;
    const cost = (this.items.length === 0 || isFree) ? 0 : standardCost;
    const percent = Math.min(100, Math.round((subtotal / threshold) * 100));

    return {
      isBogota,
      threshold,
      standardCost,
      isFree,
      remaining,
      cost,
      percent
    };
  },

  getTotal() {
    if (this.items.length === 0) return 0;
    const subtotal = this.getSubtotal();
    const shipping = this.getShippingInfo();
    return subtotal + shipping.cost;
  },

  formatCOP(val) {
    return '$' + Number(val || 0).toLocaleString('es-CO');
  },

  openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },

  closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  updateUI() {
    // 1. Update badges
    const totalCount = this.getTotalCount();
    document.querySelectorAll('.cart-count-badge').forEach(badge => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
    });

    // 2. Render Drawer
    const itemsContainer = document.getElementById('cartDrawerItems');
    const meterContainer = document.getElementById('cartShippingMeter');
    const footerContainer = document.getElementById('cartDrawerFooter');

    const subtotal = this.getSubtotal();
    const shipping = this.getShippingInfo();
    const total = this.getTotal();

    // Free Shipping Progress Meter
    if (meterContainer) {
      meterContainer.innerHTML = `
        <div class="shipping-meter-box">
          <div class="dest-toggle-group">
            <button type="button" class="dest-btn ${shipping.isBogota ? 'active' : ''}" onclick="Cart.setDestination('bogota')">
              📍 Bogotá (Gratis > ${this.formatCOP(CONFIG.SHIPPING.BOGOTA_FREE_THRESHOLD)})
            </button>
            <button type="button" class="dest-btn ${!shipping.isBogota ? 'active' : ''}" onclick="Cart.setDestination('nacional')">
              🇨🇴 Nacional (Gratis > ${this.formatCOP(CONFIG.SHIPPING.NACIONAL_FREE_THRESHOLD)})
            </button>
          </div>
          <div class="meter-status">
            ${shipping.isFree 
              ? `<span class="free-badge">🎉 ¡Felicitaciones! Tienes <strong>ENVÍO GRATIS</strong>.</span>` 
              : `<span>🛍️ Te faltan <strong>${this.formatCOP(shipping.remaining)}</strong> para obtener <strong>ENVÍO GRATIS</strong></span>`}
          </div>
          <div class="meter-bar-track">
            <div class="meter-bar-fill ${shipping.isFree ? 'complete' : ''}" style="width: ${shipping.percent}%;"></div>
          </div>
        </div>
      `;
    }

    // Items list
    if (itemsContainer) {
      if (this.items.length === 0) {
        itemsContainer.innerHTML = `
          <div class="cart-empty-state">
            <span class="empty-icon">🛒</span>
            <h3>Tu carrito está vacío</h3>
            <p>Descubre nuestro catálogo de vapes premium y combos de ahorro.</p>
            <button type="button" class="btn btn-primary" onclick="Cart.closeDrawer()">
              Explorar Productos
            </button>
          </div>
        `;
      } else {
        itemsContainer.innerHTML = this.items.map(item => {
          let linePrice = item.precio * item.qty;
          let promoNote = '';
          if (item.precio_promo_2 && item.qty >= 2) {
            const pairs = Math.floor(item.qty / 2);
            const rem = item.qty % 2;
            linePrice = (pairs * item.precio_promo_2) + (rem * item.precio);
            promoNote = '<span class="item-promo-tag">🔥 Promo 2x aplicada</span>';
          }

          return `
            <div class="cart-item-row" id="cart-row-${item.key}">
              <div class="item-info">
                <h4 class="item-title">${item.nombre}</h4>
                ${item.variant ? `<span class="item-variant">Sabor/Color: <strong>${item.variant}</strong></span>` : ''}
                <div class="item-unit-price">${this.formatCOP(item.precio)} c/u ${promoNote}</div>
              </div>
              <div class="item-actions-col">
                <div class="item-qty-selector">
                  <button type="button" class="btn-qty-mini" onclick="Cart.updateQty('${item.key}', -1)">−</button>
                  <span class="qty-num">${item.qty}</span>
                  <button type="button" class="btn-qty-mini" onclick="Cart.updateQty('${item.key}', 1)">+</button>
                </div>
                <div class="item-total-price">${this.formatCOP(linePrice)}</div>
                <button type="button" class="btn-remove-item" onclick="Cart.removeItem('${item.key}')" title="Eliminar">🗑️</button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Drawer Footer
    if (footerContainer) {
      if (this.items.length === 0) {
        footerContainer.innerHTML = '';
      } else {
        footerContainer.innerHTML = `
          <div class="cart-summary-box">
            <div class="summary-line">
              <span>Subtotal (${totalCount} prod.):</span>
              <span>${this.formatCOP(subtotal)}</span>
            </div>
            <div class="summary-line">
              <span>Envío (${shipping.isBogota ? 'Bogotá' : 'Nacional'}):</span>
              <span>${shipping.isFree ? '<strong class="text-green">GRATIS</strong>' : this.formatCOP(shipping.cost)}</span>
            </div>
            <div class="summary-line total-line">
              <span>Total a Pagar:</span>
              <span class="total-amount">${this.formatCOP(total)}</span>
            </div>
          </div>
          <div class="cart-footer-btns">
            <button type="button" class="btn btn-primary btn-block btn-checkout" onclick="CheckoutController.openModal()">
              <span>Proceder al Checkout ➔</span>
            </button>
            <div class="cart-secondary-actions">
              <button type="button" class="btn-link" onclick="Cart.closeDrawer()">Continuar Comprando</button>
              <button type="button" class="btn-link text-muted" onclick="Cart.clearCart()">Vaciar Carrito</button>
            </div>
          </div>
        `;
      }
    }
  },

  bindEvents() {
    document.querySelectorAll('.open-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openDrawer());
    });

    const overlay = document.getElementById('cartOverlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.closeDrawer());
    }

    const closeBtn = document.getElementById('closeCartBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDrawer());
    }
  }
};

window.Cart = Cart;
