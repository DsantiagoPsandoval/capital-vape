/**
 * CAPITAL VAPE - Controlador de Catálogo con Modal de Sabores y Cambio Dinámico
 */
const CatalogController = {
  selectedVariants: {},
  activeCategory: 'todos',
  searchQuery: '',
  sortBy: 'relevancia',
  activeModalProductId: null,
  activeModalIsWholesale: false,

  init() {
    this.renderCatalog();
    this.bindEvents();
  },

  formatCOP(val) {
    return '$' + Number(val || 0).toLocaleString('es-CO');
  },

  selectVariant(productId, variantName) {
    this.selectedVariants[productId] = variantName;

    // 1. Update standard card
    const card = document.getElementById('card-' + productId);
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

    // 2. Update wholesale card if exists
    const wsCard = document.getElementById('ws-card-' + productId);
    if (wsCard) {
      const tag = wsCard.querySelector('.flavor-current-tag');
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
          const imgEl = wsCard.querySelector('.product-img-real');
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

    // Update modal items active state if open
    const modal = document.getElementById('flavorModal');
    if (modal && modal.style.display !== 'none') {
      modal.querySelectorAll('.flavor-card-item').forEach(item => {
        const isMatch = item.dataset.variantName === variantName;
        item.classList.toggle('is-selected', isMatch);
        const selBtn = item.querySelector('.btn-flavor-select');
        if (selBtn) {
          selBtn.textContent = isMatch ? '✓ Seleccionado' : 'Seleccionar este sabor';
        }
      });
    }
  },

  openFlavorModal(productId, isWholesale = false) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    this.activeModalProductId = productId;
    this.activeModalIsWholesale = isWholesale;

    const modal = document.getElementById('flavorModal');
    if (!modal) return;

    const nameEl = document.getElementById('flavorModalProductName');
    const subEl = document.getElementById('flavorModalSubtitle');
    const puffsEl = document.getElementById('flavorModalPuffs');
    const catEl = document.getElementById('flavorModalCategory');
    const searchInput = document.getElementById('flavorSearchInput');

    if (nameEl) nameEl.textContent = product.nombre;
    if (subEl) subEl.textContent = product.subtitulo || 'Selecciona tu sabor o variante';

    const descEl = document.getElementById('flavorModalProductDesc');
    if (descEl) {
      if (product.descripcion) {
        descEl.textContent = product.descripcion;
        descEl.style.display = 'block';
      } else {
        descEl.style.display = 'none';
      }
    }
    if (puffsEl) {
      if (product.puffs) {
        puffsEl.textContent = `${Number(product.puffs).toLocaleString('es-CO')} Puffs`;
        puffsEl.style.display = 'inline-block';
      } else {
        puffsEl.style.display = 'none';
      }
    }
    if (catEl) catEl.textContent = product.categoria.toUpperCase();
    if (searchInput) searchInput.value = '';

    this.renderModalFlavors('');

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  },

  closeFlavorModal() {
    const modal = document.getElementById('flavorModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
    this.activeModalProductId = null;
  },

  filterModalFlavors(query) {
    this.renderModalFlavors(query.trim().toLowerCase());
  },

  renderModalFlavors(filterText = '') {
    const grid = document.getElementById('flavorModalGrid');
    if (!grid || !this.activeModalProductId) return;

    const product = PRODUCTS_DATA.find(p => p.id === this.activeModalProductId);
    if (!product) return;

    const currentSelected = this.selectedVariants[product.id] || (
      product.sabores && product.sabores.length > 0 ? product.sabores[0].nombre :
      (product.colores && product.colores.length > 0 ? product.colores[0].nombre : '')
    );

    let items = [];
    if (product.sabores && product.sabores.length > 0) {
      items = product.sabores.filter(s => s.visible !== false).map(s => ({
        name: s.nombre,
        desc: s.desc || '',
        img: s.img || product.imagen,
        type: 'sabor'
      }));
    } else if (product.colores && product.colores.length > 0) {
      items = product.colores.map(c => ({
        name: c.nombre,
        desc: c.sabores ? `Incluye: ${c.sabores.join(', ')}` : '',
        img: c.img || product.imagen,
        type: 'color'
      }));
    }

    if (filterText) {
      items = items.filter(i => 
        i.name.toLowerCase().includes(filterText) || 
        i.desc.toLowerCase().includes(filterText)
      );
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--text-muted);">
          🔍 No se encontraron sabores que coincidan con "${filterText}".
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(item => {
      const isSelected = item.name === currentSelected;
      return `
        <div class="flavor-card-item ${product.id === 'bugatti' ? 'is-bugatti-flavor' : ''} ${isSelected ? 'is-selected' : ''}" data-variant-name="${item.name}">
          <div class="flavor-card-img-wrap" onclick="CatalogController.selectAndApplyVariant('${product.id}', '${item.name}')">
            <img src="${item.img || 'assets/logo/logo.png'}" 
                 alt="${item.name}" 
                 class="flavor-card-img"
                 loading="lazy"
                 onerror="this.src='assets/logo/logo.png';">
          </div>
          <div class="flavor-card-name">${item.name}</div>
          <div class="flavor-card-desc">${item.desc || 'Sabor premium exclusivo de Capital Vape.'}</div>
          <div class="flavor-card-actions">
            <button type="button" 
                    class="btn-flavor-select" 
                    onclick="CatalogController.selectAndApplyVariant('${product.id}', '${item.name}')">
              ${isSelected ? '✓ Seleccionado' : 'Seleccionar sabor'}
            </button>
            ${!this.activeModalIsWholesale && !product.agotado ? `
              <button type="button" 
                      class="btn-flavor-add-cart" 
                      onclick="CatalogController.addFlavorDirectToCart('${product.id}', '${item.name}')">
                🛒 Agregar al Carrito
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  selectAndApplyVariant(productId, variantName) {
    this.selectVariant(productId, variantName);
    Toast.show(`Sabor "${variantName}" seleccionado`, 'success');
  },

  addFlavorDirectToCart(productId, variantName) {
    this.selectVariant(productId, variantName);
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product || product.agotado) return;

    Cart.addItem(product, variantName, 1);
    this.closeFlavorModal();
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

      // Count variants
      const totalVariants = product.sabores ? product.sabores.filter(s => s.visible !== false).length :
                            (product.colores ? product.colores.length : 0);
      const isColor = product.tipo_variante === 'color';

      const hasDuoPromo = product.precio_promo_2 && product.precio_promo_2 < (product.precio * 2);
      const ahorroDuo = hasDuoPromo ? (product.ahorro_2 || ((product.precio * 2) - product.precio_promo_2)) : 0;

      return `
        <article class="product-card ${product.id === 'bugatti' ? 'is-bugatti' : ''} ${product.agotado ? 'is-out' : ''}" id="card-${product.id}" data-category="${product.categoria}" data-product-id="${product.id}">
          <!-- 1. INDEPENDENT ENLARGED IMAGE -->
          <div class="card-image-wrapper" onclick="CatalogController.openFlavorModal('${product.id}')" title="Ver sabores y detalles">
            <img src="${currentImage || 'assets/logo/logo.png'}" 
                 alt="${product.nombre}" 
                 class="product-img-real" 
                 loading="lazy" 
                 onerror="this.src='assets/logo/logo.png';">
            ${product.subtitulo ? `<span class="card-puffs-badge">${product.subtitulo}</span>` : ''}
            
          </div>

          <!-- 2. CARD BODY -->
          <div class="card-body">
            <div class="card-meta-row">
              <span class="card-rating-badge">
                <span class="star-icon">★</span> ${(product.rating || 4.9).toFixed(1)}
              </span>
              ${(product.ventas && product.ventas > 3000) ? `<span class="card-top-seller-pill">🔥 Top Ventas</span>` : ''}
              ${product.agotado 
                ? `<span class="card-stock-badge out">🔴 Agotado</span>` 
                : `<span class="card-stock-badge in">🟢 Disponible</span>`}
            </div>

            <div class="card-header-info">
              <h3 class="card-title">${product.nombre}</h3>
            </div>

            <!-- FLAVOR PICKER BUTTON -->
            ${totalVariants > 0 ? `
              <div class="card-flavor-picker-block">
                <button type="button" 
                        class="btn-open-flavor-modal" 
                        onclick="CatalogController.openFlavorModal('${product.id}')">
                  <span class="flavor-picker-label">
                    <span>${isColor ? '🎨' : '⚡'} ${isColor ? 'Colores' : 'Sabores'} (${totalVariants})</span>
                  </span>
                  <span class="flavor-current-tag">${currentSelected}</span>
                </button>
              </div>
            ` : ''}

            <!-- Organized Pricing -->
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
    document.querySelectorAll('.cat-pill-btn:not(.ws-cat-pill-btn)').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-pill-btn:not(.ws-cat-pill-btn)').forEach(b => b.classList.remove('active'));
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

    // Close modal on overlay click
    const modal = document.getElementById('flavorModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeFlavorModal();
        }
      });
    }
  }
};

window.CatalogController = CatalogController;
