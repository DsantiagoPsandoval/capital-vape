/**
 * CAPITAL VAPE - Controlador de Catálogo con Cambio Dinámico de Imágenes por Sabor
 */
const CatalogController = {
  selectedVariants: {},
  activeCategory: 'todos',
  searchQuery: '',
  sortBy: 'relevancia',

  init() {
    this.renderCatalog();
    this.bindEvents();
  },

  formatCOP(val) {
    return '$' + Number(val || 0).toLocaleString('es-CO');
  },

  selectVariant(productId, variantName) {
    this.selectedVariants[productId] = variantName;
    const card = document.getElementById('card-' + productId);
    if (!card) return;

    // Toggle active pill
    card.querySelectorAll('.flavor-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.variant === variantName);
    });

    // Update active label indicator
    const label = card.querySelector('.selected-flavor-name');
    if (label) label.textContent = variantName;

    // Change image to selected flavor / color image
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

  addProductToCart(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product || product.agotado) return;

    const variant = this.selectedVariants[productId] || (
      product.sabores && product.sabores.length > 0 ? product.sabores[0].nombre :
      (product.colores && product.colores.length > 0 ? product.colores[0].nombre : '')
    );

    Cart.addItem(product, variant, 1);
  },

  getFilteredAndSortedProducts() {
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
          p.descripcion + ' ' + 
          (p.sabores ? p.sabores.map(s => s.nombre + ' ' + (s.desc || '')).join(' ') : '') + ' ' +
          (p.colores ? p.colores.map(c => c.nombre + ' ' + (c.sabores || []).join(' ')).join(' ') : '')
        ).toLowerCase();
        return text.includes(q);
      });
    }

    switch (this.sortBy) {
      case 'precio_asc':
        list.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio_desc':
        list.sort((a, b) => b.precio - a.precio);
        break;
      case 'mas_vendidos':
        list.sort((a, b) => (b.ventas || 0) - (a.ventas || 0));
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'ofertas':
        list.sort((a, b) => (b.ahorro_2 || 0) - (a.ahorro_2 || 0));
        break;
      default:
        break;
    }

    return list;
  },

  renderCatalog() {
    const container = document.getElementById('catalogGrid');
    const countDisplay = document.getElementById('productsCountDisplay');
    if (!container) return;

    const products = this.getFilteredAndSortedProducts();

    if (countDisplay) {
      countDisplay.textContent = `${products.length} producto${products.length === 1 ? '' : 's'}`;
    }

    if (products.length === 0) {
      container.innerHTML = `
        <div class="catalog-no-results">
          <span class="no-results-icon">🔍</span>
          <h3>No encontramos productos que coincidan con tu búsqueda</h3>
          <p>Prueba con otros términos o restablece los filtros.</p>
          <button type="button" class="btn btn-secondary btn-sm" onclick="CatalogController.resetFilters()">
            Restablecer Filtros
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(product => {
      const defaultVariant = product.sabores && product.sabores.length > 0 
        ? product.sabores[0].nombre 
        : (product.colores && product.colores.length > 0 ? product.colores[0].nombre : null);

      if (!this.selectedVariants[product.id] && defaultVariant) {
        this.selectedVariants[product.id] = defaultVariant;
      }

      const currentSelected = this.selectedVariants[product.id] || defaultVariant || '';

      // Determine initial image for flavor
      let currentImage = product.imagen;
      if (product.sabores) {
        const found = product.sabores.find(s => s.nombre === currentSelected);
        if (found && found.img) currentImage = found.img;
      } else if (product.colores) {
        const found = product.colores.find(c => c.nombre === currentSelected);
        if (found && found.img) currentImage = found.img;
      }

      // Variants / Flavors list
      let variantsHtml = '';
      if (product.tipo_variante === 'sabor' && product.sabores) {
        const visibleFlavors = product.sabores.filter(s => s.visible !== false);
        variantsHtml = `
          <div class="card-variants-section">
            <div class="variants-header-row">
              <span class="variants-title">Sabores (${visibleFlavors.length}):</span>
              <span class="selected-flavor-name">${currentSelected}</span>
            </div>
            <div class="variants-pills-list">
              ${visibleFlavors.map(s => `
                <button type="button" 
                  class="flavor-pill ${s.nombre === currentSelected ? 'active' : ''}" 
                  data-variant="${s.nombre}"
                  onclick="CatalogController.selectVariant('${product.id}', '${s.nombre}')"
                  title="${s.desc || s.nombre}">
                  ${s.nombre}
                </button>
              `).join('')}
            </div>
          </div>
        `;
      } else if (product.tipo_variante === 'color' && product.colores) {
        variantsHtml = `
          <div class="card-variants-section">
            <div class="variants-header-row">
              <span class="variants-title">Colores (${product.colores.length}):</span>
              <span class="selected-flavor-name">${currentSelected}</span>
            </div>
            <div class="variants-pills-list">
              ${product.colores.map(c => `
                <button type="button" 
                  class="flavor-pill ${c.nombre === currentSelected ? 'active' : ''}" 
                  data-variant="${c.nombre}"
                  onclick="CatalogController.selectVariant('${product.id}', '${c.nombre}')">
                  ${c.nombre}
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }

      const hasDuoPromo = product.precio_promo_2 && product.precio_promo_2 < (product.precio * 2);
      const ahorroDuo = hasDuoPromo ? (product.ahorro_2 || ((product.precio * 2) - product.precio_promo_2)) : 0;

      return `
        <article class="product-card ${product.agotado ? 'is-out' : ''}" id="card-${product.id}" data-category="${product.categoria}">
          <!-- 1. INDEPENDENT IMAGE CONTAINER -->
          <div class="card-image-wrapper">
            <img src="${currentImage || 'assets/logo/logo.png'}" 
                 alt="${product.nombre}" 
                 class="product-img-real" 
                 loading="lazy" 
                 onerror="this.src='assets/logo/logo.png'; this.style.opacity='0.4';">
            ${product.subtitulo ? `<span class="card-puffs-badge">${product.subtitulo}</span>` : ''}
            ${(product.ventas && product.ventas > 3000) ? `<span class="card-top-seller-tag">🔥 Más Vendido</span>` : ''}
          </div>

          <!-- 2. INDEPENDENT CARD BODY CONTAINER (TEXT & DATA) -->
          <div class="card-body">
            <!-- Meta row: Rating and Stock Status (Clear and fully visible) -->
            <div class="card-meta-row">
              <span class="card-rating-badge">
                <span class="star-icon">★</span> ${(product.rating || 4.9).toFixed(1)}
              </span>
              ${product.agotado 
                ? `<span class="card-stock-badge out">🔴 Agotado</span>` 
                : `<span class="card-stock-badge in">🟢 Disponible</span>`}
            </div>

            <div class="card-header-info">
              <h3 class="card-title">${product.nombre}</h3>
              <p class="card-desc">${product.descripcion || ''}</p>
            </div>

            ${variantsHtml}

            <!-- Organized Pricing: 1 Unit & 2 Units Promo Duo -->
            <div class="card-pricing-block">
              <div class="pricing-tier-row">
                <div class="tier-label-group">
                  <span class="tier-badge-tag">1 UNIDAD</span>
                  <span class="tier-name">Precio Regular</span>
                </div>
                <div class="tier-price-val">${this.formatCOP(product.precio)}</div>
              </div>

              ${hasDuoPromo ? `
                <div class="pricing-tier-row promo-tier">
                  <div class="tier-label-group">
                    <span class="tier-badge-tag duo">2 UNIDADES</span>
                    <span class="tier-save-tag">Ahorras ${this.formatCOP(ahorroDuo)}</span>
                  </div>
                  <div class="tier-price-val promo">${this.formatCOP(product.precio_promo_2)}</div>
                </div>
              ` : ''}
            </div>

            <!-- Action Button -->
            <div class="card-actions-wrapper">
              ${product.agotado ? `
                <button type="button" class="btn btn-secondary btn-block" disabled>
                  ⚠️ Agotado
                </button>
              ` : `
                <button type="button" class="btn btn-primary btn-add-cart" onclick="CatalogController.addProductToCart('${product.id}')">
                  <span>🛒 Agregar al Carrito</span>
                </button>
              `}
            </div>
          </div>
        </article>
      `;
    }).join('');
  },

  resetFilters() {
    this.activeCategory = 'todos';
    this.searchQuery = '';
    this.sortBy = 'relevancia';

    const searchInput = document.getElementById('catalogSearch');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('catalogSortSelect');
    if (sortSelect) sortSelect.value = 'relevancia';

    document.querySelectorAll('.cat-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === 'todos');
    });

    this.renderCatalog();
  },

  bindEvents() {
    document.querySelectorAll('.cat-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.dataset.category || 'todos';
        this.renderCatalog();
      });
    });

    const searchInput = document.getElementById('catalogSearch');
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

    const sortSelect = document.getElementById('catalogSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderCatalog();
      });
    }
  }
};

window.CatalogController = CatalogController;
