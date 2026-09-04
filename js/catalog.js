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
              <span class="variants-title">Sabores disponibles (${visibleFlavors.length}):</span>
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
              <span class="variants-title">Colores disponibles (${product.colores.length}):</span>
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

      // 2 Units saving badge
      let promoHtml = '';
      if (product.precio_promo_2 && product.precio_promo_2 < (product.precio * 2)) {
        promoHtml = `
          <div class="card-promo-duo">
            <span>🔥 <strong>2 Unidades:</strong> ${this.formatCOP(product.precio_promo_2)}</span>
            <span class="save-tag">Ahorras ${this.formatCOP(product.ahorro_2)}</span>
          </div>
        `;
      }

      return `
        <article class="product-card ${product.agotado ? 'is-out' : ''}" id="card-${product.id}" data-category="${product.categoria}">
          <div class="card-image-wrapper">
            <img src="${currentImage || 'assets/logo/logo.png'}" 
                 alt="${product.nombre}" 
                 class="product-img-real" 
                 loading="lazy" 
                 onerror="this.style.opacity='0.4';">
            ${product.rating ? `<span class="card-rating-badge">★ ${product.rating.toFixed(1)}</span>` : ''}
            ${product.puffs ? `<span class="card-puffs-badge">${product.puffs}</span>` : ''}
            ${product.agotado ? `<span class="card-stock-badge out">Agotado</span>` : `<span class="card-stock-badge in">Disponible</span>`}
          </div>

          <div class="card-body">
            <div class="card-header-info">
              <h3 class="card-title">${product.nombre}</h3>
              <p class="card-subtitle">${product.subtitulo}</p>
            </div>

            <p class="card-desc">${product.descripcion}</p>

            ${variantsHtml}

            <div class="card-price-section">
              <div class="price-row">
                <span class="price-label">1 Unidad:</span>
                <span class="price-val">${this.formatCOP(product.precio)}</span>
              </div>
              ${promoHtml}
            </div>

            <div class="card-actions-grid">
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
