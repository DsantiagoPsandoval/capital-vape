/**
 * CAPITAL VAPE — REIGN BAR PALETTE: Configurador Visual de 2 Sabores & Motor de Composición
 * Permite elegir Primer Sabor (Módulo Izquierdo) y Segundo Sabor (Módulo Derecho),
 * generando en tiempo real una composición visual unificada del dispositivo completo
 * a partir de las fotografías reales de cada módulo.
 */
const ReignPaletteConfigurator = {
  PRODUCT_ID: 'reign-bar-palette',
  flavor1: 'Blue Razz Ice',
  flavor2: 'Strawberry',
  selectedQty: 1,
  imageCache: new Map(),
  lastCompositeDataUrl: null,
  activeStepFilter1: '',
  activeStepFilter2: '',

  init() {
    const product = this.getProduct();
    if (!product || !product.sabores || product.sabores.length === 0) return;

    // Seleccionar por defecto Blue Razz Ice + Strawberry si existen
    const hasBlueRazz = product.sabores.find(s => s.nombre === 'Blue Razz Ice');
    const hasStrawberry = product.sabores.find(s => s.nombre === 'Strawberry');
    this.flavor1 = hasBlueRazz ? hasBlueRazz.nombre : product.sabores[0].nombre;
    this.flavor2 = hasStrawberry ? hasStrawberry.nombre : (product.sabores[1] ? product.sabores[1].nombre : product.sabores[0].nombre);

    this.syncSelectedVariantString();
    this.preloadInitialImages();
  },

  getProduct() {
    if (typeof PRODUCTS_DATA === 'undefined') return null;
    return PRODUCTS_DATA.find(p => p.id === this.PRODUCT_ID) || null;
  },

  getFlavors() {
    const product = this.getProduct();
    if (!product || !product.sabores) return [];
    return product.sabores.filter(s => s.visible !== false);
  },

  getFlavorObj(flavorName) {
    const flavors = this.getFlavors();
    return flavors.find(f => f.nombre === flavorName) || flavors[0] || null;
  },

  getCombinedVariantLabel(f1 = this.flavor1, f2 = this.flavor2) {
    return `${f1} + ${f2}`;
  },

  syncSelectedVariantString() {
    const combined = this.getCombinedVariantLabel();
    if (typeof CatalogController !== 'undefined' && CatalogController.selectedVariants) {
      CatalogController.selectedVariants[this.PRODUCT_ID] = combined;
    }
    if (typeof WholesaleCatalog !== 'undefined' && WholesaleCatalog.selectedVariants) {
      WholesaleCatalog.selectedVariants[this.PRODUCT_ID] = combined;
    }
  },

  preloadInitialImages() {
    const f1 = this.getFlavorObj(this.flavor1);
    const f2 = this.getFlavorObj(this.flavor2);
    if (f1 && f1.img) this.loadImage(f1.img).then(() => this.refreshAllCanvases());
    if (f2 && f2.img) this.loadImage(f2.img).then(() => this.refreshAllCanvases());
  },

  loadImage(src) {
    if (!src) return Promise.resolve(null);
    if (this.imageCache.has(src)) {
      return Promise.resolve(this.imageCache.get(src));
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = src;
    });
  },

  /**
   * Actualiza el Primer Sabor (Módulo Izquierdo) o Segundo Sabor (Módulo Derecho)
   * y regenera inmediatamente todas las vistas previas combinadas sin recargar la página.
   */
  setFlavor(slot, flavorName) {
    const flavorObj = this.getFlavorObj(flavorName);
    if (!flavorObj) return;

    if (slot === 1) {
      this.flavor1 = flavorObj.nombre;
    } else {
      this.flavor2 = flavorObj.nombre;
    }

    this.syncSelectedVariantString();
    this.updateConfiguratorDOM();

    this.loadImage(flavorObj.img).then(() => {
      this.refreshAllCanvases();
    });
  },

  swapFlavors() {
    const temp = this.flavor1;
    this.flavor1 = this.flavor2;
    this.flavor2 = temp;
    this.syncSelectedVariantString();
    this.updateConfiguratorDOM();
    this.refreshAllCanvases();
  },

  randomizeFlavors() {
    const flavors = this.getFlavors().filter(f => !f.agotado);
    if (flavors.length < 2) return;
    const idx1 = Math.floor(Math.random() * flavors.length);
    let idx2 = Math.floor(Math.random() * flavors.length);
    if (idx2 === idx1) idx2 = (idx1 + 1) % flavors.length;

    this.flavor1 = flavors[idx1].nombre;
    this.flavor2 = flavors[idx2].nombre;
    this.syncSelectedVariantString();
    this.updateConfiguratorDOM();

    Promise.all([
      this.loadImage(flavors[idx1].img),
      this.loadImage(flavors[idx2].img)
    ]).then(() => {
      this.refreshAllCanvases();
    });
  },

  setQty(qty) {
    this.selectedQty = Number(qty) === 2 ? 2 : 1;
    this.updateConfiguratorDOM();
  },

  /**
   * Traza la silueta exacta de un módulo vertical de REIGN BAR PALETTE
   * (cuerpo redondeado exterior, base inferior, cara plana magnética interior y boquilla superior).
   * En coordenadas locales donde:
   * - x = 0 es la unión magnética central (seam)
   * - x negativ (-moduleWidth) es el borde curvo exterior izquierdo
   * - y = 0 es el centro vertical del cuerpo
   */
  traceLeftHalfModulePath(ctx, seamX, centerY, scale) {
    const s = scale;
    ctx.beginPath();
    // 1. Iniciar en la junta superior de la boquilla (cerca del eje central)
    ctx.moveTo(seamX - 2 * s, centerY - 126 * s);
    // Subir por el borde interior de la boquilla translúcida
    ctx.lineTo(seamX - 3 * s, centerY - 162 * s);
    // Punta superior de la boquilla
    ctx.quadraticCurveTo(seamX - 18 * s, centerY - 169 * s, seamX - 32 * s, centerY - 165 * s);
    // Bajar por el borde exterior izquierdo de la boquilla hasta el hombro
    ctx.lineTo(seamX - 38 * s, centerY - 127 * s);
    // 2. Hombro superior izquierdo del cuerpo
    ctx.quadraticCurveTo(seamX - 72 * s, centerY - 127 * s, seamX - 88 * s, centerY - 114 * s);
    ctx.quadraticCurveTo(seamX - 103 * s, centerY - 98 * s, seamX - 103 * s, centerY - 72 * s);
    // 3. Borde exterior izquierdo recto (donde se ubica la pantalla LED negra)
    ctx.lineTo(seamX - 103 * s, centerY + 86 * s);
    // 4. Curva inferior izquierda y base del módulo
    ctx.quadraticCurveTo(seamX - 103 * s, centerY + 118 * s, seamX - 74 * s, centerY + 125 * s);
    ctx.lineTo(seamX - 2 * s, centerY + 125 * s);
    // 5. Subir por la cara magnética interior (junta central)
    ctx.lineTo(seamX, centerY + 122 * s);
    ctx.lineTo(seamX, centerY - 124 * s);
    ctx.closePath();
  },

  /**
   * Traza la silueta simétrica para el Módulo Derecho (Segundo Sabor),
   * acoplado magnéticamente en seamX.
   */
  traceRightHalfModulePath(ctx, seamX, centerY, scale) {
    const s = scale;
    ctx.beginPath();
    ctx.moveTo(seamX + 2 * s, centerY - 126 * s);
    ctx.lineTo(seamX + 3 * s, centerY - 162 * s);
    ctx.quadraticCurveTo(seamX + 18 * s, centerY - 169 * s, seamX + 32 * s, centerY - 165 * s);
    ctx.lineTo(seamX + 38 * s, centerY - 127 * s);
    ctx.quadraticCurveTo(seamX + 72 * s, centerY - 127 * s, seamX + 88 * s, centerY - 114 * s);
    ctx.quadraticCurveTo(seamX + 103 * s, centerY - 98 * s, seamX + 103 * s, centerY - 72 * s);
    ctx.lineTo(seamX + 103 * s, centerY + 86 * s);
    ctx.quadraticCurveTo(seamX + 103 * s, centerY + 118 * s, seamX + 74 * s, centerY + 125 * s);
    ctx.lineTo(seamX + 2 * s, centerY + 125 * s);
    ctx.lineTo(seamX, centerY + 122 * s);
    ctx.lineTo(seamX, centerY - 124 * s);
    ctx.closePath();
  },

  /**
   * Traza un rectángulo redondeado compatible con todos los navegadores.
   */
  roundRectPath(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  },

  /**
   * Renderiza la composición visual automática de los dos módulos de REIGN BAR PALETTE
   * ensamblados como un único dispositivo completo en el <canvas> indicado.
   */
  async renderCompositeToCanvas(canvas, f1Name = this.flavor1, f2Name = this.flavor2) {
    if (!canvas) return null;
    const f1 = this.getFlavorObj(f1Name);
    const f2 = this.getFlavorObj(f2Name);
    if (!f1 || !f2) return null;

    const [img1, img2] = await Promise.all([
      this.loadImage(f1.img),
      this.loadImage(f2.img)
    ]);

    const W = canvas.width || 520;
    const H = canvas.height || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, W, H);

    const col1 = f1.colorPrimary || '#3553F6';
    const col2 = f2.colorPrimary || '#FB5E9B';

    // 1. FONDO DE ESTUDIO DIVIDIDO Y FUSIONADO CON LAS FRUTAS DE AMBOS SABORES
    ctx.save();
    this.roundRectPath(ctx, 0, 0, W, H, 22);
    ctx.clip();

    // Base oscura profunda
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#0D0714');
    bgGrad.addColorStop(0.5, '#130A1E');
    bgGrad.addColorStop(1, '#0D0714');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Mitad izquierda: atmósfera frutal del Primer Sabor (recortando la parte superior frutal de la foto original)
    if (img1) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W * 0.52, H);
      ctx.clip();
      ctx.globalAlpha = 0.34;
      ctx.filter = 'blur(8px) saturate(1.25)';
      ctx.drawImage(img1, 0, 0, 382, 310, -20, -15, W * 0.62, H * 1.05);
      ctx.restore();
    }

    // Mitad derecha: atmósfera frutal del Segundo Sabor
    if (img2) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(W * 0.48, 0, W * 0.52, H);
      ctx.clip();
      ctx.globalAlpha = 0.34;
      ctx.filter = 'blur(8px) saturate(1.25)';
      ctx.drawImage(img2, 0, 0, 382, 310, W * 0.40, -15, W * 0.62, H * 1.05);
      ctx.restore();
    }

    // Halos de color neón de cada sabor detrás de su respectiva mitad
    const glowLeft = ctx.createRadialGradient(W * 0.32, H * 0.46, 12, W * 0.32, H * 0.46, W * 0.44);
    glowLeft.addColorStop(0, col1 + '88');
    glowLeft.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glowLeft;
    ctx.fillRect(0, 0, W, H);

    const glowRight = ctx.createRadialGradient(W * 0.68, H * 0.46, 12, W * 0.68, H * 0.46, W * 0.44);
    glowRight.addColorStop(0, col2 + '88');
    glowRight.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glowRight;
    ctx.fillRect(0, 0, W, H);

    // Viñeta de estudio para dar profundidad al dispositivo central
    const vignette = ctx.createLinearGradient(0, 0, 0, H);
    vignette.addColorStop(0, 'rgba(8, 4, 15, 0.35)');
    vignette.addColorStop(0.68, 'rgba(8, 4, 15, 0.15)');
    vignette.addColorStop(1, 'rgba(6, 3, 12, 0.88)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    // 2. PARÁMETROS GEOMÉTRICOS DEL DISPOSITIVO ENSAMBLADO
    const seamX = W * 0.5;
    const centerY = H * 0.47;
    const scale = Math.min(W / 440, H / 430) * 1.04;
    const tiltRad = 21.6 * Math.PI / 180; // Ángulo exacto para enderezar el módulo de b-*.webp
    const srcPivotX = 185;
    const srcPivotY = 209;
    const innerEdgeOffset = 48; // rx=+48 corresponde a la cara magnética interior del módulo

    // Sombra proyectada 3D unificada bajo el dispositivo ensamblado
    ctx.save();
    const shadowGrad = ctx.createRadialGradient(seamX, centerY + 138 * scale, 8, seamX, centerY + 138 * scale, 118 * scale);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.78)');
    shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.32)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(seamX, centerY + 138 * scale, 112 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. MÓDULO IZQUIERDO (PRIMER SABOR)
    if (img1) {
      ctx.save();
      this.traceLeftHalfModulePath(ctx, seamX, centerY, scale);
      ctx.clip();

      // Posicionar el pivote del módulo izquierdo para que su cara plana interior (rx = +48) coincida con seamX
      ctx.translate(seamX - innerEdgeOffset * scale, centerY);
      ctx.scale(scale, scale);
      ctx.rotate(tiltRad);
      ctx.drawImage(img1, -srcPivotX, -srcPivotY, 382, 482);

      // Sutil volumen cilíndrico en la unión central izquierda
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const leftInnerShade = ctx.createLinearGradient(seamX - 18 * scale, 0, seamX, 0);
      leftInnerShade.addColorStop(0, 'rgba(0,0,0,0)');
      leftInnerShade.addColorStop(1, 'rgba(0,0,0,0.26)');
      ctx.fillStyle = leftInnerShade;
      ctx.fillRect(seamX - 20 * scale, centerY - 170 * scale, 20 * scale, 300 * scale);
      ctx.restore();
    }

    // 4. MÓDULO DERECHO (SEGUNDO SABOR — ACOPLADO MAGNÉTICAMENTE)
    if (img2) {
      ctx.save();
      this.traceRightHalfModulePath(ctx, seamX, centerY, scale);
      ctx.clip();

      // Dibujar el cuerpo del módulo derecho reflejado simétricamente respecto al eje central seamX
      // para que ambas boquillas se unan en el centro y el borde curvo quede al exterior derecho
      ctx.save();
      ctx.translate(seamX + innerEdgeOffset * scale, centerY);
      ctx.scale(-scale, scale);
      ctx.rotate(tiltRad);
      ctx.drawImage(img2, -srcPivotX, -srcPivotY, 382, 482);
      ctx.restore();

      // PARCHE DE REALISMO: Redibujar la pantalla LED negra ('88') del módulo derecho SIN espejo
      // para que los dígitos '88' y los iconos se lean al derecho en el borde exterior derecho
      ctx.save();
      const screenCenterX = seamX + (innerEdgeOffset + 36) * scale;
      const screenCenterY = centerY + 52 * scale;
      ctx.beginPath();
      ctx.ellipse(screenCenterX, screenCenterY, 15.5 * scale, 52 * scale, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.translate(screenCenterX + 36 * scale, centerY);
      ctx.scale(scale, scale);
      ctx.rotate(tiltRad);
      ctx.drawImage(img2, -srcPivotX, -srcPivotY, 382, 482);
      ctx.restore();

      // Sutil volumen cilíndrico en la unión central derecha
      const rightInnerShade = ctx.createLinearGradient(seamX, 0, seamX + 18 * scale, 0);
      rightInnerShade.addColorStop(0, 'rgba(0,0,0,0.28)');
      rightInnerShade.addColorStop(0.35, 'rgba(255,255,255,0.12)');
      rightInnerShade.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rightInnerShade;
      ctx.fillRect(seamX, centerY - 170 * scale, 20 * scale, 300 * scale);
      ctx.restore();
    }

    // 5. JUNTA MAGNÉTICA CENTRAL Y ACABADO DE DISPOSITIVO UNIFICADO
    ctx.save();
    // Línea de ensamblaje magnético central (entre ambos módulos)
    const seamGrad = ctx.createLinearGradient(0, centerY - 162 * scale, 0, centerY + 125 * scale);
    seamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    seamGrad.addColorStop(0.2, 'rgba(15, 10, 25, 0.85)');
    seamGrad.addColorStop(0.5, 'rgba(255, 215, 100, 0.45)');
    seamGrad.addColorStop(0.85, 'rgba(15, 10, 25, 0.85)');
    seamGrad.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
    ctx.fillStyle = seamGrad;
    ctx.fillRect(seamX - 1.1 * scale, centerY - 162 * scale, 2.2 * scale, 287 * scale);

    // Anillo conector superior en la base de la boquilla dual
    const collarY = centerY - 127 * scale;
    const collarGrad = ctx.createLinearGradient(seamX - 38 * scale, collarY, seamX + 38 * scale, collarY);
    collarGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
    collarGrad.addColorStop(0.5, 'rgba(255,255,255,0.65)');
    collarGrad.addColorStop(1, 'rgba(255,255,255,0.15)');
    ctx.fillStyle = collarGrad;
    ctx.fillRect(seamX - 37 * scale, collarY - 1.2 * scale, 74 * scale, 2.4 * scale);

    // Indicador magnético central sutil ("DUAL LOCK")
    ctx.beginPath();
    ctx.arc(seamX, centerY - 12 * scale, 6.5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(12, 8, 22, 0.88)';
    ctx.fill();
    ctx.lineWidth = 1.4 * scale;
    ctx.strokeStyle = 'rgba(255, 215, 102, 0.85)';
    ctx.stroke();

    ctx.fillStyle = '#FFE066';
    ctx.font = `700 ${Math.round(7.5 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', seamX, centerY - 11.5 * scale);
    ctx.restore();

    // 6. ETIQUETAS VISUALES FLOTANTES DE CADA MITAD EN EL LIENZO
    ctx.save();
    const pillY = H - 36;
    const pillH = 26;
    const maxPillW = (W * 0.45);

    // Etiqueta Módulo 1 (Izquierda)
    this.roundRectPath(ctx, 12, pillY, maxPillW, pillH, 13);
    ctx.fillStyle = 'rgba(12, 7, 20, 0.84)';
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = col1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(24, pillY + pillH / 2, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = col1;
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`1: ${f1.nombre}`, 34, pillY + pillH / 2 + 0.5, maxPillW - 28);

    // Etiqueta Módulo 2 (Derecha)
    const rightPillX = W - 12 - maxPillW;
    this.roundRectPath(ctx, rightPillX, pillY, maxPillW, pillH, 13);
    ctx.fillStyle = 'rgba(12, 7, 20, 0.84)';
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = col2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(rightPillX + 12, pillY + pillH / 2, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = col2;
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`2: ${f2.nombre}`, rightPillX + 22, pillY + pillH / 2 + 0.5, maxPillW - 28);

    ctx.restore();
    ctx.restore(); // Fin del clip general

    try {
      this.lastCompositeDataUrl = canvas.toDataURL('image/webp', 0.86);
    } catch (e) {}

    return this.lastCompositeDataUrl;
  },

  refreshAllCanvases() {
    const canvases = document.querySelectorAll('.reign-composite-canvas');
    canvases.forEach(canvas => {
      this.renderCompositeToCanvas(canvas, this.flavor1, this.flavor2);
    });
  },

  /**
   * Actualiza los textos, estados activos de botones y resumen de configuración
   * tanto en la tarjeta principal como en el modal configurador.
   */
  updateConfiguratorDOM() {
    const f1 = this.getFlavorObj(this.flavor1);
    const f2 = this.getFlavorObj(this.flavor2);
    const product = this.getProduct();
    if (!f1 || !f2 || !product) return;

    const unitPrice = product.precio || 40000;
    const promo2Price = product.precio_promo_2 || 70000;
    const activeTotal = this.selectedQty === 2 ? promo2Price : unitPrice;

    // 1. Actualizar botones de selección de PASO 1 y PASO 2
    document.querySelectorAll('[data-reign-slot="1"]').forEach(el => {
      const isSel = el.getAttribute('data-flavor-name') === this.flavor1;
      el.classList.toggle('is-selected', isSel);
      el.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      const statusBadge = el.querySelector('.reign-opt-status');
      if (statusBadge) {
        statusBadge.textContent = isSel ? '✓ MÓDULO 1' : 'Elegir #1';
      }
    });

    document.querySelectorAll('[data-reign-slot="2"]').forEach(el => {
      const isSel = el.getAttribute('data-flavor-name') === this.flavor2;
      el.classList.toggle('is-selected', isSel);
      el.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      const statusBadge = el.querySelector('.reign-opt-status');
      if (statusBadge) {
        statusBadge.textContent = isSel ? '✓ MÓDULO 2' : 'Elegir #2';
      }
    });

    // 2. Actualizar textos de resumen en tarjeta y modal
    document.querySelectorAll('.reign-summary-f1-name').forEach(el => {
      el.textContent = f1.nombre;
    });
    document.querySelectorAll('.reign-summary-f2-name').forEach(el => {
      el.textContent = f2.nombre;
    });
    document.querySelectorAll('.reign-summary-f1-img').forEach(el => {
      el.src = f1.img;
      el.alt = f1.nombre;
    });
    document.querySelectorAll('.reign-summary-f2-img').forEach(el => {
      el.src = f2.img;
      el.alt = f2.nombre;
    });
    document.querySelectorAll('.reign-summary-combined-tag').forEach(el => {
      el.textContent = `${f1.nombre} + ${f2.nombre}`;
    });
    document.querySelectorAll('.reign-summary-price-val').forEach(el => {
      el.textContent = '$' + activeTotal.toLocaleString('es-CO') + ' COP';
    });
    document.querySelectorAll('.reign-qty-opt-btn').forEach(btn => {
      const q = Number(btn.getAttribute('data-qty'));
      btn.classList.toggle('active', q === this.selectedQty);
    });

    // Actualizar etiqueta del selector en tarjeta mayorista si existe
    const wsCard = document.getElementById('ws-card-reign-bar-palette');
    if (wsCard) {
      const tag = wsCard.querySelector('.flavor-current-tag');
      if (tag) tag.textContent = `${f1.nombre} + ${f2.nombre}`;
    }
  },

  /**
   * Genera el bloque HTML del configurador embebido en la primera tarjeta del catálogo (REIGN BAR PALETTE).
   */
  renderCardConfiguratorHTML(product) {
    const flavors = this.getFlavors();
    const f1 = this.getFlavorObj(this.flavor1) || flavors[0];
    const f2 = this.getFlavorObj(this.flavor2) || flavors[1] || flavors[0];
    const unitPrice = product.precio || 40000;
    const promo2Price = product.precio_promo_2 || 70000;
    const activeTotal = this.selectedQty === 2 ? promo2Price : unitPrice;

    return `
      <div class="reign-configurator-box" id="reignCardConfigurator">
        <div class="reign-config-header">
          <div class="reign-config-title-row">
            <span class="reign-config-badge">⚡ DUAL 2 EN 1</span>
            <button type="button" class="reign-random-btn" onclick="ReignPaletteConfigurator.randomizeFlavors()" title="Probar combinación aleatoria">
              🎲 Aleatorio
            </button>
            <button type="button" class="reign-swap-btn" onclick="ReignPaletteConfigurator.swapFlavors()" title="Invertir lados de los módulos">
              ⇄ Invertir
            </button>
          </div>
          <h4 class="reign-config-title">PERSONALIZA TU REIGN BAR</h4>
          <p class="reign-config-subtitle">Combina dos sabores y crea tu propia combinación.</p>
        </div>

        <!-- PASO 1: PRIMER SABOR -->
        <div class="reign-step-block">
          <div class="reign-step-header">
            <span class="reign-step-num">PASO 1 — PRIMER SABOR (Módulo Izq.)</span>
            <strong class="reign-step-current reign-summary-f1-name">${f1.nombre}</strong>
          </div>
          <div class="reign-flavor-strip" role="listbox" aria-label="Seleccionar primer sabor">
            ${flavors.map(flav => {
              const isSel = flav.nombre === f1.nombre;
              return `
                <button type="button"
                        class="reign-flavor-option ${isSel ? 'is-selected' : ''}"
                        data-reign-slot="1"
                        data-flavor-name="${flav.nombre}"
                        aria-pressed="${isSel ? 'true' : 'false'}"
                        onclick="ReignPaletteConfigurator.setFlavor(1, '${flav.nombre}')">
                  <div class="reign-opt-img-wrap">
                    <img src="${flav.img}" alt="${flav.nombre}" class="reign-opt-img" loading="lazy">
                  </div>
                  <span class="reign-opt-name">${flav.nombre}</span>
                  <span class="reign-opt-status">${isSel ? '✓ MÓDULO 1' : 'Elegir #1'}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- PASO 2: SEGUNDO SABOR -->
        <div class="reign-step-block">
          <div class="reign-step-header">
            <span class="reign-step-num">PASO 2 — SEGUNDO SABOR (Módulo Der.)</span>
            <strong class="reign-step-current reign-summary-f2-name">${f2.nombre}</strong>
          </div>
          <div class="reign-flavor-strip" role="listbox" aria-label="Seleccionar segundo sabor">
            ${flavors.map(flav => {
              const isSel = flav.nombre === f2.nombre;
              return `
                <button type="button"
                        class="reign-flavor-option ${isSel ? 'is-selected' : ''}"
                        data-reign-slot="2"
                        data-flavor-name="${flav.nombre}"
                        aria-pressed="${isSel ? 'true' : 'false'}"
                        onclick="ReignPaletteConfigurator.setFlavor(2, '${flav.nombre}')">
                  <div class="reign-opt-img-wrap">
                    <img src="${flav.img}" alt="${flav.nombre}" class="reign-opt-img" loading="lazy">
                  </div>
                  <span class="reign-opt-name">${flav.nombre}</span>
                  <span class="reign-opt-status">${isSel ? '✓ MÓDULO 2' : 'Elegir #2'}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 4. INFORMACIÓN DE LA CONFIGURACIÓN -->
        <div class="reign-config-summary-card">
          <div class="reign-summary-modules-row">
            <div class="reign-summary-module-pill">
              <img src="${f1.img}" alt="${f1.nombre}" class="reign-summary-f1-img" loading="lazy">
              <div class="reign-summary-pill-text">
                <span class="reign-pill-label">Primer sabor</span>
                <strong class="reign-summary-f1-name">${f1.nombre}</strong>
              </div>
            </div>
            <span class="reign-summary-plus">+</span>
            <div class="reign-summary-module-pill">
              <img src="${f2.img}" alt="${f2.nombre}" class="reign-summary-f2-img" loading="lazy">
              <div class="reign-summary-pill-text">
                <span class="reign-pill-label">Segundo sabor</span>
                <strong class="reign-summary-f2-name">${f2.nombre}</strong>
              </div>
            </div>
          </div>

          <div class="reign-summary-details-list">
            <div class="reign-summary-detail-line">
              <span>Producto:</span>
              <strong>${product.nombre}</strong>
            </div>
            <div class="reign-summary-detail-line">
              <span>Combinación:</span>
              <strong class="reign-summary-combined-tag">${f1.nombre} + ${f2.nombre}</strong>
            </div>
            <div class="reign-summary-detail-line">
              <span>Precio:</span>
              <strong class="reign-summary-price-val">$${activeTotal.toLocaleString('es-CO')} COP</strong>
            </div>
          </div>

          <div class="reign-qty-toggle-row">
            <button type="button" class="reign-qty-opt-btn ${this.selectedQty === 1 ? 'active' : ''}" data-qty="1" onclick="ReignPaletteConfigurator.setQty(1)">
              <span>1 Unidad</span>
              <strong>$40.000 COP</strong>
            </button>
            <button type="button" class="reign-qty-opt-btn is-promo ${this.selectedQty === 2 ? 'active' : ''}" data-qty="2" onclick="ReignPaletteConfigurator.setQty(2)">
              <span>🔥 Promo 2 Unidades</span>
              <strong>$70.000 COP</strong>
            </button>
          </div>
        </div>

        <button type="button" class="btn-open-full-configurator" onclick="CatalogController.openFlavorModal('reign-bar-palette')">
          <span>🔍 Abrir Configurador en Pantalla Completa (${flavors.length} Sabores)</span>
        </button>
      </div>
    `;
  },

  /**
   * Renderiza la experiencia completa de "PERSONALIZA TU REIGN BAR" dentro del modal de sabores.
   */
  renderModalConfigurator(containerEl, filterText = '', isWholesale = false) {
    if (!containerEl) return;
    const product = this.getProduct();
    if (!product) return;

    let flavors = this.getFlavors();
    if (filterText) {
      flavors = flavors.filter(f =>
        f.nombre.toLowerCase().includes(filterText) ||
        (f.desc && f.desc.toLowerCase().includes(filterText))
      );
    }

    const f1 = this.getFlavorObj(this.flavor1);
    const f2 = this.getFlavorObj(this.flavor2);
    const unitPrice = product.precio || 40000;
    const promo2Price = product.precio_promo_2 || 70000;
    const activeTotal = this.selectedQty === 2 ? promo2Price : unitPrice;

    containerEl.innerHTML = `
      <div class="reign-modal-studio">
        <!-- COLUMNA CENTRAL / SUPERIOR: VISTA PREVIA EN VIVO + RESUMEN DE CONFIGURACIÓN -->
        <div class="reign-modal-preview-panel">
          <div class="reign-modal-preview-header">
            <span class="reign-config-badge">⭐ PERSONALIZA TU REIGN BAR</span>
            <p class="reign-modal-preview-sub">Combina dos sabores y crea tu propia combinación.</p>
          </div>

          <div class="reign-modal-canvas-stage">
            <canvas id="reignModalCompositeCanvas" class="reign-composite-canvas" width="520" height="480"></canvas>
          </div>

          <div class="reign-modal-quick-controls">
            <button type="button" class="reign-random-btn" onclick="ReignPaletteConfigurator.randomizeFlavors()">
              🎲 Combinación Aleatoria
            </button>
            <button type="button" class="reign-swap-btn" onclick="ReignPaletteConfigurator.swapFlavors()">
              ⇄ Invertir Módulos
            </button>
          </div>

          <!-- INFORMACIÓN DE LA CONFIGURACIÓN DEBAJO DE LA VISTA PREVIA -->
          <div class="reign-config-summary-card is-modal-summary">
            <div class="reign-summary-modules-row">
              <div class="reign-summary-module-pill">
                <img src="${f1.img}" alt="${f1.nombre}" class="reign-summary-f1-img">
                <div class="reign-summary-pill-text">
                  <span class="reign-pill-label">Primer sabor</span>
                  <strong class="reign-summary-f1-name">${f1.nombre}</strong>
                </div>
              </div>
              <span class="reign-summary-plus">+</span>
              <div class="reign-summary-module-pill">
                <img src="${f2.img}" alt="${f2.nombre}" class="reign-summary-f2-img">
                <div class="reign-summary-pill-text">
                  <span class="reign-pill-label">Segundo sabor</span>
                  <strong class="reign-summary-f2-name">${f2.nombre}</strong>
                </div>
              </div>
            </div>

            <div class="reign-summary-details-list">
              <div class="reign-summary-detail-line">
                <span>Producto:</span>
                <strong>${product.nombre}</strong>
              </div>
              <div class="reign-summary-detail-line">
                <span>Primer sabor:</span>
                <strong class="reign-summary-f1-name">${f1.nombre}</strong>
              </div>
              <div class="reign-summary-detail-line">
                <span>Segundo sabor:</span>
                <strong class="reign-summary-f2-name">${f2.nombre}</strong>
              </div>
              <div class="reign-summary-detail-line">
                <span>Precio correspondiente:</span>
                <strong class="reign-summary-price-val">$${activeTotal.toLocaleString('es-CO')} COP</strong>
              </div>
            </div>

            ${!isWholesale ? `
              <div class="reign-qty-toggle-row">
                <button type="button" class="reign-qty-opt-btn ${this.selectedQty === 1 ? 'active' : ''}" data-qty="1" onclick="ReignPaletteConfigurator.setQty(1)">
                  <span>1 Unidad</span>
                  <strong>$40.000 COP</strong>
                </button>
                <button type="button" class="reign-qty-opt-btn is-promo ${this.selectedQty === 2 ? 'active' : ''}" data-qty="2" onclick="ReignPaletteConfigurator.setQty(2)">
                  <span>🔥 2 Unidades (Promo)</span>
                  <strong>$70.000 COP</strong>
                </button>
              </div>
              <button type="button" class="btn btn-primary btn-block reign-modal-add-btn" onclick="ReignPaletteConfigurator.addConfiguredToCart(ReignPaletteConfigurator.selectedQty, true)">
                <img src="assets/icons/carrito.png" class="btn-inline-icon" alt="Carrito">
                <span>Agregar Combinación al Carrito</span>
              </button>
            ` : `
              <button type="button" class="btn btn-primary btn-block reign-modal-add-btn" onclick="CatalogController.closeFlavorModal(); Toast.show('Combinación ' + ReignPaletteConfigurator.getCombinedVariantLabel() + ' lista para agregar por paquete mayorista', 'success');">
                <span>✓ Usar esta combinación en Mayorista</span>
              </button>
            `}
          </div>
        </div>

        <!-- SELECTORES PASO 1 Y PASO 2 CON FOTOGRAFÍAS GRANDES -->
        <div class="reign-modal-selectors-panel">
          <!-- PASO 1 -->
          <div class="reign-modal-step-section">
            <div class="reign-modal-step-title-bar">
              <div>
                <span class="reign-step-badge-pill">PASO 1 — PRIMER SABOR</span>
                <h4 class="reign-modal-step-heading">Elige el Módulo Izquierdo</h4>
              </div>
              <span class="reign-modal-selected-indicator reign-summary-f1-name">${f1.nombre}</span>
            </div>
            <div class="reign-modal-flavors-grid">
              ${flavors.map(flav => {
                const isSel = flav.nombre === f1.nombre;
                return `
                  <button type="button"
                          class="reign-modal-flavor-card ${isSel ? 'is-selected' : ''}"
                          data-reign-slot="1"
                          data-flavor-name="${flav.nombre}"
                          onclick="ReignPaletteConfigurator.setFlavor(1, '${flav.nombre}')">
                    <div class="reign-modal-card-img-box">
                      <img src="${flav.img}" alt="${flav.nombre}" loading="lazy">
                    </div>
                    <div class="reign-modal-card-Name">${flav.nombre}</div>
                    <span class="reign-opt-status">${isSel ? '✓ MÓDULO 1' : 'Elegir #1'}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- PASO 2 -->
          <div class="reign-modal-step-section">
            <div class="reign-modal-step-title-bar">
              <div>
                <span class="reign-step-badge-pill step-2">PASO 2 — SEGUNDO SABOR</span>
                <h4 class="reign-modal-step-heading">Elige el Módulo Derecho</h4>
              </div>
              <span class="reign-modal-selected-indicator reign-summary-f2-name">${f2.nombre}</span>
            </div>
            <div class="reign-modal-flavors-grid">
              ${flavors.map(flav => {
                const isSel = flav.nombre === f2.nombre;
                return `
                  <button type="button"
                          class="reign-modal-flavor-card ${isSel ? 'is-selected' : ''}"
                          data-reign-slot="2"
                          data-flavor-name="${flav.nombre}"
                          onclick="ReignPaletteConfigurator.setFlavor(2, '${flav.nombre}')">
                    <div class="reign-modal-card-img-box">
                      <img src="${flav.img}" alt="${flav.nombre}" loading="lazy">
                    </div>
                    <div class="reign-modal-card-Name">${flav.nombre}</div>
                    <span class="reign-opt-status">${isSel ? '✓ MÓDULO 2' : 'Elegir #2'}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    const modalCanvas = document.getElementById('reignModalCompositeCanvas');
    if (modalCanvas) {
      this.renderCompositeToCanvas(modalCanvas, this.flavor1, this.flavor2);
    }
  },

  /**
   * Agrega la combinación actual de REIGN BAR PALETTE al carrito conservando
   * explícitamente Primer Sabor, Segundo Sabor y la imagen compuesta generada.
   */
  async addConfiguredToCart(qty = null, closeModalAfter = false) {
    const product = this.getProduct();
    if (!product || product.agotado || product.coming_soon) return;

    const finalQty = Number(qty) || this.selectedQty || 1;
    const f1 = this.getFlavorObj(this.flavor1);
    const f2 = this.getFlavorObj(this.flavor2);
    const combinedVariant = this.getCombinedVariantLabel(f1.nombre, f2.nombre);

    // Asegurar que la imagen combinada esté actualizada
    const cardCanvas = document.getElementById('reignCardCompositeCanvas');
    if (cardCanvas) {
      await this.renderCompositeToCanvas(cardCanvas, f1.nombre, f2.nombre);
    }

    Cart.addItem(product, combinedVariant, finalQty, {
      isDualFlavor: true,
      flavor1: f1.nombre,
      flavor2: f2.nombre,
      flavor1Img: f1.img,
      flavor2Img: f2.img,
      compositeImg: this.lastCompositeDataUrl || f1.img
    });

    if (closeModalAfter && typeof CatalogController !== 'undefined') {
      CatalogController.closeFlavorModal();
    }
  }
};

window.ReignPaletteConfigurator = ReignPaletteConfigurator;
