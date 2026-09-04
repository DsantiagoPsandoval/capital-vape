/**
 * CAPITAL VAPE - Módulo Oficial de Venta Mayorista
 * Acceso con clave CV-MAYORISTA-2026, paquetes +5, +10, +20, +50, +100 y Carrito Mayorista específico.
 */
const WHOLESALE_PASSWORD = "CV-MAYORISTA-2026";

const WholesaleService = {
  // Lista oficial de precios mayoristas por unidad en COP
  PRICES: {
    "bang-leader": { "5": 35000, "10": 26000, "20": 25000, "50": 24000, "100": 23000 },
    "humo-azul": { "5": 35000, "10": 27000, "20": 25500, "50": 24000, "100": 23000 },
    "donut": { "5": 30000, "10": 21000, "20": 20000, "50": 19000, "100": 18000 },
    "solobar-kit": { "5": 29000, "10": 24000, "20": 23000, "50": 22000, "100": 21000 },
    "solobar-pod": { "5": 21000, "10": 17000, "20": 16000, "50": 15000, "100": 14000 },
    "yocco": { "5": 9000, "10": 6500, "20": 6000, "50": 5600, "100": 5000 },
    "death-row": { "5": 9500, "10": 7500, "20": 7000, "50": 6500, "100": 6000 },
    "ease": { "5": 11000, "10": 8000, "20": 7400, "50": 6800, "100": 6200 },
    "dummy": { "5": 11500, "10": 8500, "20": 7300, "50": 6800, "100": 6300 },
    "lost-mary-os": { "5": 11500, "10": 9200, "20": 8700, "50": 8200, "100": 7500 },
    "lost-mary-mo": { "5": 11500, "10": 9200, "20": 8700, "50": 8200, "100": 7500 },
    "beyond": { "5": 15000, "10": 12500, "20": 12000, "50": 11500, "100": 10500 },
    "bugatti": { "5": 17000, "10": 13500, "20": 12500, "50": 11500, "100": 10500 },
    "nicky-jam": { "5": 17000, "10": 13500, "20": 12600, "50": 11800, "100": 11000 },
    "baddie-bar": { "5": 17000, "10": 13500, "20": 12600, "50": 11800, "100": 11000 },
    "nimbox-kit": { "5": 21000, "10": 16000, "20": 15000, "50": 14000, "100": 13000 },
    "nimbox-pod": { "5": 16000, "10": 12000, "20": 11000, "50": 10000, "100": 8500 },
    "vera": { "5": 19000, "10": 16000, "20": 15000, "50": 14000, "100": 13000 },
    "katchmi": { "5": 21000, "10": 17000, "20": 16200, "50": 15400, "100": 14500 },
    "hookalit": { "5": 23000, "10": 18000, "20": 17000, "50": 16000, "100": 15300 },
    "fifty-cent": { "5": 22000, "10": 22000, "20": 21000, "50": 19500, "100": 18500 },
    "spaceman": { "5": 27000, "10": 20500, "20": 19500, "50": 18500, "100": 18000 },
    "dinner-lady": { "5": 27000, "10": 20700, "20": 19700, "50": 18700, "100": 18200 },
    "waka-creator-bateria": { "5": 32000, "10": 22500, "20": 22000, "50": 21500, "100": 20000 },
    "sami-2-bateria": { "5": 32000, "10": 25000, "20": 24000, "50": 23000, "100": 22000 },
    "waka-creator-pod": { "5": 41000, "10": 34000, "20": 33000, "50": 32000, "100": 31000 },
    "sami-pod-2": { "5": 42000, "10": 34000, "20": 33000, "50": 31500, "100": 30000 },
    "waka-solo-2": { "5": 38000, "10": 33000, "20": 32000, "50": 31000, "100": 30500 },
    "brass-type-c": { "5": 20000, "10": 16000, "20": 15000, "50": 14000, "100": 13000 },
    "anv-digital": { "5": 25000, "10": 20000, "20": 19000, "50": 18500, "100": 17500 },
    "high-pro": { "5": 45000, "10": 40000, "20": 39000, "50": 38000, "100": 37000 },
    "secret-pro": { "5": 47000, "10": 42000, "20": 41000, "50": 40000, "100": 39000 },
    "airpods-4-anc": { "5": 45000, "10": 40000 }
  },

  isUnlocked() {
    return localStorage.getItem("wholesaleAuthenticated") === "true" || localStorage.getItem("cv_wholesale_auth_session") === "true";
  },

  verifyCode(inputCode) {
    const clean = (inputCode || '').trim();
    if (!clean) {
      return { 
        success: false, 
        message: "❌ Por favor ingresa la clave mayorista." 
      };
    }

    if (clean.toUpperCase() === WHOLESALE_PASSWORD) {
      localStorage.setItem("wholesaleAuthenticated", "true");
      return {
        success: true,
        message: "✓ Acceso mayorista concedido"
      };
    }

    return {
      success: false,
      message: "❌ Clave incorrecta. Verifica la clave e inténtalo nuevamente."
    };
  },

  logout() {
    localStorage.removeItem("wholesaleAuthenticated");
    localStorage.removeItem("cv_wholesale_auth_session");
  },

  formatCOP(val) {
    return '$' + Number(val || 0).toLocaleString('es-CO');
  },

  getWholesaleWhatsAppUrl() {
    const text = encodeURIComponent('Hola Capital Vape, soy comerciante/distribuidor y solicito la clave para acceder a la sección de pedidos mayoristas.');
    return `https://wa.me/573248012914?text=${text}`;
  }
};

/**
 * CARRITO EXCLUSIVO MAYORISTA
 */
const WholesaleCart = {
  items: [], // Array of packs: { id, productId, nombre, imagen, flavor, packQty, unitPrice, subtotal }
  selectedPhone: '573248012914', // '573248012914' | '573132612344'

  init() {
    try {
      const saved = localStorage.getItem('wholesaleCartItems') || localStorage.getItem('cv_wholesale_cart_items');
      this.items = saved ? JSON.parse(saved) : [];
    } catch (e) {
      this.items = [];
    }
    this.updateUI();
  },

  save() {
    localStorage.setItem('wholesaleCartItems', JSON.stringify(this.items));
    localStorage.setItem('cv_wholesale_cart_items', JSON.stringify(this.items));
    this.updateUI();
  },

  addPack(productId, packQty) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    const prices = WholesaleService.PRICES[productId] || product.precios_mayoristas;
    if (!prices || !prices[String(packQty)]) {
      Toast.show(`No hay precio configurado para +${packQty} uds de este producto.`, 'error');
      return;
    }

    const unitPrice = prices[String(packQty)];
    const subtotal = unitPrice * packQty;
    const flavor = WholesaleCatalog.selectedVariants[productId] || 'Surtido / A convenir';

    // Image for flavor if available
    let img = product.imagen;
    if (product.sabores) {
      const f = product.sabores.find(s => s.nombre === flavor);
      if (f && f.img) img = f.img;
    } else if (product.colores) {
      const c = product.colores.find(c => c.nombre === flavor);
      if (c && c.img) img = c.img;
    }

    const packItem = {
      packId: `${productId}__${Date.now()}__${Math.random().toString(36).substr(2, 4)}`,
      productId: product.id,
      nombre: product.nombre,
      subtitulo: product.subtitulo,
      imagen: img,
      flavor: flavor,
      packQty: packQty,
      unitPrice: unitPrice,
      subtotal: subtotal
    };

    this.items.push(packItem);
    this.save();

    Toast.show(`✓ ¡Agregado paquete de +${packQty} uds de ${product.nombre}!`, 'success');
    this.openDrawer();
  },

  removePack(packId) {
    this.items = this.items.filter(i => i.packId !== packId);
    this.save();
    Toast.show('Paquete eliminado del pedido mayorista.', 'info');
  },

  removeProduct(productId) {
    this.items = this.items.filter(i => i.productId !== productId);
    this.save();
    Toast.show('Producto eliminado del pedido.', 'info');
  },

  clearCart() {
    if (this.items.length === 0) return;
    if (confirm('¿Deseas vaciar todos los productos del pedido mayorista?')) {
      this.items = [];
      this.save();
      Toast.show('Pedido mayorista vaciado.', 'info');
    }
  },

  getTotalUnits() {
    return this.items.reduce((sum, item) => sum + item.packQty, 0);
  },

  getTotalAmount() {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  },

  openDrawer() {
    const drawer = document.getElementById('wholesaleCartDrawer');
    const overlay = document.getElementById('wholesaleCartOverlay');
    if (drawer && overlay) {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },

  closeDrawer() {
    const drawer = document.getElementById('wholesaleCartDrawer');
    const overlay = document.getElementById('wholesaleCartOverlay');
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  updateUI() {
    const countBadge = document.querySelectorAll('.wholesale-cart-count-badge');
    const totalUnits = this.getTotalUnits();
    const totalAmount = this.getTotalAmount();

    countBadge.forEach(b => {
      b.textContent = totalUnits;
      b.style.display = totalUnits > 0 ? 'inline-flex' : 'none';
    });

    const itemsContainer = document.getElementById('wholesaleCartItems');
    const footerContainer = document.getElementById('wholesaleCartFooter');

    if (itemsContainer) {
      if (this.items.length === 0) {
        itemsContainer.innerHTML = `
          <div class="cart-empty-state">
            <span class="empty-icon">📦</span>
            <h3>Tu pedido mayorista está vacío</h3>
            <p>Selecciona paquetes de +5, +10, +20, +50 o +100 unidades en el catálogo mayorista.</p>
            <button type="button" class="btn btn-primary" onclick="WholesaleCart.closeDrawer()">
              Ver Productos Mayoristas
            </button>
          </div>
        `;
      } else {
        // Group by product to show clearly
        const grouped = {};
        this.items.forEach(item => {
          if (!grouped[item.productId]) {
            grouped[item.productId] = {
              productId: item.productId,
              nombre: item.nombre,
              imagen: item.imagen,
              totalUnits: 0,
              totalSubtotal: 0,
              packs: []
            };
          }
          grouped[item.productId].totalUnits += item.packQty;
          grouped[item.productId].totalSubtotal += item.subtotal;
          grouped[item.productId].packs.push(item);
        });

        itemsContainer.innerHTML = Object.values(grouped).map(g => `
          <div class="ws-cart-product-group">
            <div class="ws-cart-prod-header">
              <img src="${g.imagen || 'assets/logo/logo.png'}" alt="${g.nombre}" class="ws-cart-prod-img">
              <div class="ws-cart-prod-meta">
                <h4 class="ws-cart-prod-title">${g.nombre}</h4>
                <span class="ws-cart-total-badge">${g.totalUnits} unidades en total</span>
              </div>
              <button type="button" class="btn-remove-all" onclick="WholesaleCart.removeProduct('${g.productId}')" title="Eliminar todo">✕</button>
            </div>

            <div class="ws-cart-packs-list">
              ${g.packs.map(p => `
                <div class="ws-pack-item-row">
                  <div class="ws-pack-info">
                    <span class="ws-pack-tag">Paquete +${p.packQty} uds</span>
                    <span class="ws-pack-flavor">Sabor: ${p.flavor}</span>
                    <span class="ws-pack-unit-rate">${WholesaleService.formatCOP(p.unitPrice)} c/u</span>
                  </div>
                  <div class="ws-pack-price-col">
                    <strong class="ws-pack-subtotal">${WholesaleService.formatCOP(p.subtotal)}</strong>
                    <button type="button" class="btn-remove-pack" onclick="WholesaleCart.removePack('${p.packId}')" title="Eliminar paquete">🗑️</button>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="ws-prod-group-total">
              <span>Subtotal ${g.nombre}:</span>
              <strong>${WholesaleService.formatCOP(g.totalSubtotal)}</strong>
            </div>
          </div>
        `).join('');
      }
    }

    if (footerContainer) {
      if (this.items.length === 0) {
        footerContainer.innerHTML = '';
      } else {
        footerContainer.innerHTML = `
          <div class="ws-cart-summary">
            <div class="summary-line">
              <span>Total Unidades:</span>
              <strong>${totalUnits} uds</strong>
            </div>
            <div class="summary-line total-line">
              <span>TOTAL GENERAL:</span>
              <strong class="total-amount">${WholesaleService.formatCOP(totalAmount)}</strong>
            </div>

            <!-- Phone Selector -->
            <div class="ws-phone-selector-box">
              <label for="wsPhoneSelect" class="ws-phone-label">📲 Enviar pedido mayorista a:</label>
              <select id="wsPhoneSelect" class="form-select ws-phone-select" onchange="WholesaleCart.selectedPhone = this.value">
                <option value="573248012914" ${this.selectedPhone === '573248012914' ? 'selected' : ''}>WhatsApp Principal: +57 324 801 2914</option>
                <option value="573132612344" ${this.selectedPhone === '573132612344' ? 'selected' : ''}>WhatsApp Secundario: +57 313 261 2344</option>
              </select>
            </div>
          </div>

          <div class="cart-footer-btns">
            <button type="button" class="btn btn-whatsapp btn-block btn-ws-send" onclick="WholesaleCart.sendOrderWhatsApp()">
              <span>💬 Enviar Pedido por WhatsApp</span>
            </button>
            <div class="cart-secondary-actions">
              <button type="button" class="btn-link" onclick="WholesaleCart.closeDrawer()">Continuar Comprando</button>
              <button type="button" class="btn-link text-muted" onclick="WholesaleCart.clearCart()">Vaciar Pedido</button>
            </div>
          </div>
        `;
      }
    }
  },

  sendOrderWhatsApp() {
    if (this.items.length === 0) {
      Toast.show('No tienes productos en el pedido mayorista.', 'error');
      return;
    }

    const totalAmount = this.getTotalAmount();
    const phone = this.selectedPhone || '573248012914';

    // Group items
    const grouped = {};
    this.items.forEach(item => {
      const key = `${item.nombre}__${item.flavor}__${item.unitPrice}`;
      if (!grouped[key]) {
        grouped[key] = {
          nombre: item.nombre,
          flavor: item.flavor,
          qty: 0,
          unitPrice: item.unitPrice,
          subtotal: 0
        };
      }
      grouped[key].qty += item.packQty;
      grouped[key].subtotal += item.subtotal;
    });

    let msg = `Hola, quiero realizar un pedido mayorista en Capital Vape.

`;
    msg += `📦 *PRODUCTOS:*
`;

    Object.values(grouped).forEach(g => {
      msg += `- *${g.nombre}* x${g.qty}`;
      if (g.flavor && g.flavor !== 'Surtido / A convenir') {
        msg += ` (${g.flavor})`;
      }
      msg += ` — ${WholesaleService.formatCOP(g.unitPrice)} c/u — ${WholesaleService.formatCOP(g.subtotal)}
`;
    });

    msg += `
💰 *TOTAL MAYORISTA: ${WholesaleService.formatCOP(totalAmount)}*

`;
    msg += `Quedo atento para coordinar despacho y medio de pago.`;

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    Toast.show('¡Redirigiendo a WhatsApp para enviar tu pedido mayorista!', 'success');
  }
};

/**
 * CONTROLADOR DE CATÁLOGO MAYORISTA
 */
const WholesaleCatalog = {
  selectedVariants: {},
  eventsBound: false,
  activeCategory: 'todos',
  searchQuery: '',
  sortBy: 'relevancia',

  init() {
    this.renderCatalog();
    if (!this.eventsBound) {
      this.bindEvents();
      this.eventsBound = true;
    }
  },

  selectVariant(productId, variantName) {
    this.selectedVariants[productId] = variantName;
    const card = document.getElementById('ws-card-' + productId);
    if (!card) return;

    card.querySelectorAll('.flavor-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.variant === variantName);
    });

    const label = card.querySelector('.selected-flavor-name');
    if (label) label.textContent = variantName;

    // Update real flavor image
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (product) {
      let flavorImg = null;
      if (product.sabores) {
        const found = product.sabores.find(s => s.nombre === variantName);
        if (found && found.img) flavorImg = found.img;
      } else if (product.colores) {
        const found = product.colores.find(c => c.nombre === variantName);
        if (found && found.img) flavorImg = found.img;
      }

      if (flavorImg) {
        const imgEl = card.querySelector('.product-img-real');
        if (imgEl) {
          imgEl.style.opacity = '0.3';
          setTimeout(() => {
            imgEl.src = flavorImg;
            imgEl.style.opacity = '1';
          }, 120);
        }
      }
    }
  },

  getProducts() {
    let list = [...PRODUCTS_DATA];

    if (this.activeCategory !== 'todos') {
      list = list.filter(p => p.categoria === this.activeCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => {
        const text = (
          p.nombre + ' ' + 
          p.subtitulo + ' ' + 
          (p.sabores ? p.sabores.map(s => s.nombre).join(' ') : '')
        ).toLowerCase();
        return text.includes(q);
      });
    }

    switch (this.sortBy) {
      case 'precio_asc':
        list.sort((a, b) => {
          const pa = (WholesaleService.PRICES[a.id] && WholesaleService.PRICES[a.id]['5']) || a.precio;
          const pb = (WholesaleService.PRICES[b.id] && WholesaleService.PRICES[b.id]['5']) || b.precio;
          return pa - pb;
        });
        break;
      case 'precio_desc':
        list.sort((a, b) => {
          const pa = (WholesaleService.PRICES[a.id] && WholesaleService.PRICES[a.id]['5']) || a.precio;
          const pb = (WholesaleService.PRICES[b.id] && WholesaleService.PRICES[b.id]['5']) || b.precio;
          return pb - pa;
        });
        break;
      case 'nombre_az':
        list.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nombre_za':
        list.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'mas_vendidos':
        list.sort((a, b) => (b.ventas || 0) - (a.ventas || 0));
        break;
      default:
        break;
    }

    return list;
  },

  renderCatalog() {
    const container = document.getElementById('wholesaleCatalogGrid');
    if (!container) return;

    const products = this.getProducts();

    if (products.length === 0) {
      container.innerHTML = `
        <div class="catalog-no-results">
          <span class="no-results-icon">🔍</span>
          <h3>No encontramos productos mayoristas con ese criterio</h3>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(product => {
      const prices = WholesaleService.PRICES[product.id] || product.precios_mayoristas;
      if (!prices) return '';

      const tierKeys = Object.keys(prices).map(Number).sort((a, b) => a - b);
      const minTier = tierKeys[0];
      const maxTier = tierKeys[tierKeys.length - 1];
      const priceAtMin = prices[String(minTier)];
      const priceAtMax = prices[String(maxTier)];
      const savingPerUnit = priceAtMin - priceAtMax;

      const defaultVariant = product.sabores && product.sabores.length > 0 
        ? product.sabores[0].nombre 
        : (product.colores && product.colores.length > 0 ? product.colores[0].nombre : null);

      if (!this.selectedVariants[product.id] && defaultVariant) {
        this.selectedVariants[product.id] = defaultVariant;
      }

      const currentSelected = this.selectedVariants[product.id] || defaultVariant || '';

      // Image for default variant
      let currentImage = product.imagen;
      if (product.sabores) {
        const found = product.sabores.find(s => s.nombre === currentSelected);
        if (found && found.img) currentImage = found.img;
      } else if (product.colores) {
        const found = product.colores.find(c => c.nombre === currentSelected);
        if (found && found.img) currentImage = found.img;
      }

      // Variants / Flavors Button for Modal
      const totalVariants = product.sabores ? product.sabores.filter(s => s.visible !== false).length :
                            (product.colores ? product.colores.length : 0);
      const isColor = product.tipo_variante === 'color';
      let variantsHtml = '';
      if (totalVariants > 0) {
        variantsHtml = `
          <div class="card-flavor-picker-block">
            <button type="button" 
                    class="btn-open-flavor-modal" 
                    onclick="CatalogController.openFlavorModal('${product.id}', true)"
                    title="Ver sabores y detalles">
              <span class="flavor-picker-label">
                <span>${isColor ? '🎨' : '⚡'} ${isColor ? 'Colores' : 'Sabores'} (${totalVariants})</span>
              </span>
              <span class="flavor-current-tag">${currentSelected}</span>
            </button>
          </div>
        `;
      }

      const puffsBadgeText = product.puffs 
        ? `${Number(product.puffs).toLocaleString('es-CO')} Puffs` 
        : (product.categoria === 'accesorios' ? 'Original' : 'Batería 510');

      return `
        <article class="product-card ws-product-card ${product.id === 'bugatti' ? 'is-bugatti' : ''}" id="ws-card-${product.id}" data-product-id="${product.id}">
          <div class="card-image-wrapper" onclick="CatalogController.openFlavorModal('${product.id}', true)" title="Ver sabores y detalles">
            <img src="${currentImage || 'assets/logo/logo.png'}" alt="${product.nombre}" class="product-img-real" loading="lazy">
            <span class="card-puffs-badge">${puffsBadgeText}</span>
          </div>

          <div class="card-body">
            <div class="card-meta-row">
              <span class="card-rating-badge"><span class="star-icon">★</span> ${(product.rating || 4.9).toFixed(1)}</span>
              ${savingPerUnit > 0 ? `<span class="ws-save-pill">Ahorro ${WholesaleService.formatCOP(savingPerUnit)}/u</span>` : ''}
              <span class="card-stock-badge in">🟢 Mayorista</span>
            </div>

            <div class="card-header-info">
              <h3 class="card-title">${product.nombre}</h3>
            </div>

            ${variantsHtml}

            <!-- Specific Tier Quantity Buttons -->
            <div class="ws-tier-buttons-grid">
              ${tierKeys.map(tier => {
                const pUnit = prices[String(tier)];
                const isBest = (tier === maxTier && savingPerUnit > 0);
                return `
                  <button type="button" 
                    class="btn-ws-tier ${isBest ? 'best-tier' : ''}" 
                    onclick="WholesaleCart.addPack('${product.id}', ${tier})"
                    title="Agregar paquete de ${tier} unidades de ${product.nombre}">
                    <span class="tier-qty-tag">+${tier}</span>
                    <span class="tier-unit-price">${WholesaleService.formatCOP(pUnit)}</span>
                  </button>
                `;
              }).join('')}
            </div>

          </div>
        </article>
      `;
    }).join('');
  },

  bindEvents() {
    // Categories
    document.querySelectorAll('.ws-cat-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ws-cat-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.dataset.category || 'todos';
        this.renderCatalog();
      });
    });

    // Search
    const searchInput = document.getElementById('wsCatalogSearch');
    if (searchInput) {
      let debounce;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this.renderCatalog();
        }, 200);
      });
    }

    // Sort
    const sortSelect = document.getElementById('wsCatalogSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderCatalog();
      });
    }
  }
};

window.WHOLESALE_PASSWORD = WHOLESALE_PASSWORD;
window.WholesaleService = WholesaleService;
window.WholesaleCart = WholesaleCart;
window.WholesaleCatalog = WholesaleCatalog;
