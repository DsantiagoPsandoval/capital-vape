/**
 * CAPITAL VAPE - Módulo Oficial de Venta Mayorista
 * Acceso seguro con clave CV-MAYORISTA-2026, sesión persistente y catálogo independiente.
 */
const WHOLESALE_PASSWORD = "CV-MAYORISTA-2026";

const WholesaleService = {
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
    return localStorage.getItem("cv_wholesale_auth") === "true" || localStorage.getItem("wholesaleAuthenticated") === "true";
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
      localStorage.setItem("cv_wholesale_auth", "true");
      localStorage.setItem("wholesaleAuthenticated", "true");
      return {
        success: true,
        message: "✓ ¡Acceso mayorista concedido con éxito!"
      };
    }

    return {
      success: false,
      message: "❌ Clave incorrecta. Solicítala vía WhatsApp o verifica e inténtalo nuevamente."
    };
  },

  logout() {
    localStorage.removeItem("cv_wholesale_auth");
    localStorage.removeItem("wholesaleAuthenticated");
    localStorage.removeItem("cv_wholesale_auth_session");
  },

  formatCOP(val) {
    return '$' + Number(val || 0).toLocaleString('es-CO');
  },

  getWholesaleWhatsAppUrl() {
    const text = encodeURIComponent('Hola Capital Vape, soy comerciante/distribuidor y solicito la clave para acceder al portal mayorista.');
    return `https://wa.me/573248012914?text=${text}`;
  }
};

/**
 * Proxy para compatibilidad total con llamadas a WholesaleCart
 */
const WholesaleCart = {
  addPack(productId, packQty) {
    Cart.addWholesalePack(productId, packQty);
  },
  openDrawer() {
    Cart.openDrawer();
  },
  closeDrawer() {
    Cart.closeDrawer();
  },
  init() {
    // Uses global Cart
  }
};

/**
 * CATÁLOGO INDEPENDIENTE MAYORISTA
 */
const WholesaleCatalog = {
  selectedVariants: {},
  activeCategory: 'todos',
  searchQuery: '',
  sortBy: 'relevancia',

  init() {
    this.renderCatalog();
    this.bindEvents();
  },

  selectVariant(productId, variantName) {
    this.selectedVariants[productId] = variantName;
    const card = document.getElementById('ws-card-' + productId);
    if (card) {
      const tag = card.querySelector('.flavor-current-tag');
      if (tag) tag.textContent = variantName;

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
          (p.subtitulo || '') + ' ' + 
          (p.sabores ? p.sabores.map(s => s.nombre).join(' ') : '') + ' ' +
          (p.colores ? p.colores.map(c => c.nombre).join(' ') : '')
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

      let currentImage = product.imagen;
      if (product.sabores) {
        const found = product.sabores.find(s => s.nombre === currentSelected);
        if (found && found.img) currentImage = found.img;
      } else if (product.colores) {
        const found = product.colores.find(c => c.nombre === currentSelected);
        if (found && found.img) currentImage = found.img;
      }

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
          </div>

          <div class="card-body">
            <div class="card-meta-row">
              <span class="card-rating-badge"><span class="star-icon">★</span> ${(product.rating || 4.9).toFixed(1)}</span>
              ${savingPerUnit > 0 ? `<span class="ws-save-pill">Ahorro ${WholesaleService.formatCOP(savingPerUnit)}/u</span>` : ''}
              <span class="card-stock-badge in">🟢 Mayorista</span>
            </div>

            <div class="card-header-info">
              <h3 class="card-title">${product.nombre}</h3>
              <div class="card-puffs-tag">⚡ ${puffsBadgeText}</div>
            </div>

            ${variantsHtml}

            <!-- Specific Tier Quantity Buttons with Pack Subtotals -->
            <div class="ws-tier-buttons-grid">
              ${tierKeys.map(tier => {
                const pUnit = prices[String(tier)];
                const packSubtotal = pUnit * tier;
                const isBest = (tier === maxTier && savingPerUnit > 0);
                return `
                  <button type="button" 
                    class="btn-ws-tier ${isBest ? 'best-tier' : ''}" 
                    onclick="Cart.addWholesalePack('${product.id}', ${tier})"
                    title="Agregar paquete de ${tier} unidades de ${product.nombre} (Total: ${WholesaleService.formatCOP(packSubtotal)})">
                    <span class="tier-qty-tag">+${tier} UDS</span>
                    <span class="tier-unit-price">${WholesaleService.formatCOP(pUnit)} c/u</span>
                    <span class="tier-pack-subtotal">Subtotal: ${WholesaleService.formatCOP(packSubtotal)}</span>
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
    document.querySelectorAll('.ws-cat-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ws-cat-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.dataset.category || 'todos';
        this.renderCatalog();
      });
    });

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
