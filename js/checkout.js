/**
 * CAPITAL VAPE - Controlador de Checkout & Pedido Unificado a WhatsApp
 * Manejo de WhatsApp exclusivo mayorista (3133572726) y selector al detal (3133572726 ó 3248012914),
 * agrupación mayorista por referencia con desglose de sabores, y tarifa Soacha $15.000 COP.
 */
const CheckoutController = {
  init() {
    this.initQuickSelector();
    this.bindForm();
  },

  initQuickSelector() {
    const prodSelect = document.getElementById('checkoutQuickProduct');
    if (!prodSelect || typeof PRODUCTS_DATA === 'undefined') return;

    const availableProducts = PRODUCTS_DATA.filter(p => !p.agotado && !p.coming_soon);
    prodSelect.innerHTML = availableProducts.map(p => {
      const promoTxt = p.precio_promo_2 ? ` • Promo 2x ${Cart.formatCOP(p.precio_promo_2)}` : '';
      return `<option value="${p.id}">${p.nombre} — ${Cart.formatCOP(p.precio)}${promoTxt}</option>`;
    }).join('');

    prodSelect.addEventListener('change', () => {
      this.populateQuickFlavors(prodSelect.value);
      if (Cart.items.length === 0) this.renderOrderSummary();
    });

    const f1Select = document.getElementById('checkoutQuickFlavor1');
    const f2Select = document.getElementById('checkoutQuickFlavor2');
    const qtySelect = document.getElementById('checkoutQuickQty');
    [f1Select, f2Select, qtySelect].forEach(sel => {
      if (sel) {
        sel.addEventListener('change', () => {
          if (Cart.items.length === 0) this.renderOrderSummary();
        });
      }
    });

    if (availableProducts.length > 0) {
      this.populateQuickFlavors(availableProducts[0].id);
    }
  },

  populateQuickFlavors(productId) {
    const prod = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === productId) : null;
    const f1Select = document.getElementById('checkoutQuickFlavor1');
    const f2Select = document.getElementById('checkoutQuickFlavor2');
    const f2Group = document.getElementById('checkoutQuickFlavor2Group');
    const f1Label = document.getElementById('checkoutQuickFlavor1Label');
    if (!prod || !f1Select) return;

    const isReign = prod.id === 'reign-bar-palette';
    let variants = [];
    if (Array.isArray(prod.sabores) && prod.sabores.length > 0) {
      variants = prod.sabores.filter(s => s && s.visible !== false && !s.agotado).map(s => s.nombre);
    } else if (Array.isArray(prod.colores) && prod.colores.length > 0) {
      variants = prod.colores.filter(c => c && !c.agotado).map(c => c.nombre);
    }

    if (variants.length === 0) {
      variants = ['Estándar / Original'];
    }

    f1Select.innerHTML = variants.map(v => `<option value="${v}">${v}</option>`).join('');

    if (isReign && f2Select && f2Group) {
      if (f1Label) f1Label.textContent = '1° Sabor (Módulo Izq.) *';
      f2Group.style.display = 'flex';
      f2Select.innerHTML = [
        `<option value="__SINGLE__">Ninguno (Un solo sabor)</option>`,
        ...variants.map(v => `<option value="${v}">${v}</option>`)
      ].join('');
      if (typeof ReignPaletteConfigurator !== 'undefined') {
        if (variants.includes(ReignPaletteConfigurator.flavor1)) f1Select.value = ReignPaletteConfigurator.flavor1;
        if (ReignPaletteConfigurator.mode === 'single') {
          f2Select.value = '__SINGLE__';
        } else if (variants.includes(ReignPaletteConfigurator.flavor2)) {
          f2Select.value = ReignPaletteConfigurator.flavor2;
        }
      } else if (variants.length > 1) {
        f2Select.value = variants[1];
      }
    } else {
      if (f1Label) f1Label.textContent = (prod.tipo_variante === 'color' ? 'Color *' : 'Sabor *');
      if (f2Group) f2Group.style.display = 'none';
      const preselected = (typeof CatalogController !== 'undefined' && CatalogController.selectedVariants[prod.id]);
      if (preselected && variants.includes(preselected)) {
        f1Select.value = preselected;
      }
    }
  },

  addQuickSelectedVape(silent = false) {
    const prodSelect = document.getElementById('checkoutQuickProduct');
    const f1Select = document.getElementById('checkoutQuickFlavor1');
    const f2Select = document.getElementById('checkoutQuickFlavor2');
    const qtySelect = document.getElementById('checkoutQuickQty');
    if (!prodSelect) return false;

    const prod = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === prodSelect.value) : null;
    if (!prod) return false;

    const qty = Math.max(1, Number(qtySelect ? qtySelect.value : 1) || 1);
    const f1 = f1Select ? f1Select.value : '';
    const f2 = f2Select ? f2Select.value : '__SINGLE__';

    if (prod.id === 'reign-bar-palette') {
      if (f2 && f2 !== '__SINGLE__' && f2 !== f1) {
        const f1Obj = prod.sabores ? prod.sabores.find(s => s.nombre === f1) : null;
        const f2Obj = prod.sabores ? prod.sabores.find(s => s.nombre === f2) : null;
        Cart.addItem(prod, `${f1} + ${f2}`, qty, {
          isDualFlavor: true,
          flavor1: f1,
          flavor2: f2,
          flavor1Img: f1Obj ? f1Obj.img : prod.imagen,
          flavor2Img: f2Obj ? f2Obj.img : prod.imagen,
          compositeImg: (f1Obj && f1Obj.img) || prod.imagen
        });
      } else {
        const fSingleObj = prod.sabores ? prod.sabores.find(s => s.nombre === f1) : null;
        Cart.addItem(prod, f1, qty, {
          isDualFlavor: false,
          singleImg: fSingleObj ? fSingleObj.img : prod.imagen
        });
      }
    } else {
      Cart.addItem(prod, f1, qty);
    }

    this.configureWhatsAppRouting();
    this.renderOrderSummary();
    return true;
  },

  openModal() {
    Cart.closeDrawer();
    const modal = document.getElementById('checkoutModal');
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      const destSelect = document.getElementById('checkoutDestino');
      if (destSelect && Cart.destination) {
        destSelect.value = Cart.destination;
      }
      const prodSelect = document.getElementById('checkoutQuickProduct');
      if (prodSelect && prodSelect.options.length === 0) {
        this.initQuickSelector();
      }
      this.configureWhatsAppRouting();
      this.renderOrderSummary();
    }
  },

  closeModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  /**
   * Configura las opciones de WhatsApp:
   * - Si hay productos mayoristas: EXCLUSIVAMENTE 3133572726.
   * - Si es solo al detal: el cliente elige entre 3133572726 o 3248012914.
   */
  configureWhatsAppRouting() {
    const hasWholesale = Cart.getWholesaleItems().length > 0;
    const option2 = document.getElementById('checkoutWaOption2');
    const notice = document.getElementById('checkoutWaWholesaleNotice');
    const radio1 = document.querySelector('input[name="checkoutWaNumber"][value="573133572726"]');
    const title = document.getElementById('checkoutModalTitle');

    if (title) {
      title.textContent = hasWholesale 
        ? 'Finalizar Pedido Mayorista' 
        : 'Finalizar Pedido — Capital Vape';
    }

    if (hasWholesale) {
      if (radio1) radio1.checked = true;
      if (option2) option2.style.display = 'none';
      if (notice) notice.style.display = 'block';
    } else {
      if (option2) option2.style.display = 'flex';
      if (notice) notice.style.display = 'none';
    }
  },

  renderOrderSummary() {
    const container = document.getElementById('checkoutOrderItems');
    const summaryContainer = document.getElementById('checkoutTotals');
    if (!container || !summaryContainer) return;

    const detalItems = Cart.getDetalItems();
    const wsItems = Cart.getWholesaleItems();
    const detalSubtotal = Cart.getDetalSubtotal();
    const wsSubtotal = Cart.getWholesaleSubtotal();
    const shipping = Cart.getShippingInfo();
    const total = Cart.getTotal();

    let itemsHtml = '';

    if (detalItems.length === 0 && wsItems.length === 0) {
      const prodSelect = document.getElementById('checkoutQuickProduct');
      const f1Select = document.getElementById('checkoutQuickFlavor1');
      const f2Select = document.getElementById('checkoutQuickFlavor2');
      const qtySelect = document.getElementById('checkoutQuickQty');
      const prod = (prodSelect && typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === prodSelect.value) : null;
      const qty = Math.max(1, Number(qtySelect ? qtySelect.value : 1) || 1);
      const f1 = f1Select ? f1Select.value : '';
      const f2 = (f2Select && prod && prod.id === 'reign-bar-palette' && f2Select.value !== '__SINGLE__' && f2Select.value !== f1) ? f2Select.value : '';
      const flavorText = f2 ? `${f1} + ${f2}` : f1;
      const lineTotal = prod ? (qty === 2 && prod.precio_promo_2 ? prod.precio_promo_2 : prod.precio * qty) : 0;

      if (prod) {
        itemsHtml = `
          <div class="checkout-sec-divider">⚡ VAPE SELECCIONADO EN EL FORMULARIO</div>
          <div class="checkout-item-card">
            <div class="checkout-item-thumb-box">
              <img src="${prod.imagen || 'assets/logo/logo.png'}" alt="${prod.nombre}" class="checkout-item-thumb-img" loading="lazy">
            </div>
            <div class="checkout-item-info">
              <div class="checkout-item-top">
                <strong class="checkout-item-name">${prod.nombre}</strong>
                <span class="checkout-item-qty-pill">x${qty}</span>
              </div>
              <div class="checkout-item-flavor-text">Sabor: <strong>${flavorText}</strong></div>
              <div class="checkout-item-price-row">
                <span class="checkout-item-unit">Se incluirá al enviar</span>
                <strong class="checkout-item-total">${Cart.formatCOP(lineTotal)}</strong>
              </div>
            </div>
          </div>
        `;
      }
    }

    if (detalItems.length > 0) {
      itemsHtml += `
        <div class="checkout-sec-divider">🛒 PRODUCTOS AL DETAL</div>
      `;
      itemsHtml += detalItems.map(item => {
        const lineTotal = (typeof item.calculatedLinePrice === 'number') ? item.calculatedLinePrice : (item.precio * item.qty);
        const isDual = item.isDualFlavor === true || (item.productId === 'reign-bar-palette' && item.isDualFlavor !== false && item.variant && item.variant.includes(' + '));
        const f1 = item.flavor1 || (item.variant && item.variant.includes(' + ') ? item.variant.split(' + ')[0].trim() : item.variant);
        const f2 = item.flavor2 || (item.variant && item.variant.includes(' + ') ? item.variant.split(' + ')[1].trim() : f1);
        const prodObj = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === item.productId) : null;
        const thumbSrc = item.flavor1Img || item.imagen || (prodObj && prodObj.imagen) || 'assets/logo/logo.png';

        return `
        <div class="checkout-item-card">
          <div class="checkout-item-thumb-box">
            <img src="${thumbSrc}" alt="${item.nombre}" class="checkout-item-thumb-img" loading="lazy">
          </div>
          <div class="checkout-item-info">
            <div class="checkout-item-top">
              <strong class="checkout-item-name">${item.nombre}</strong>
              <span class="checkout-item-qty-pill">x${item.qty}</span>
            </div>
            ${isDual ? `
              <div class="checkout-item-flavor-text">
                <span>1° Sabor: <strong>${f1}</strong></span>
                <span>2° Sabor: <strong>${f2}</strong></span>
              </div>
            ` : (item.variant ? `<div class="checkout-item-flavor-text">Sabor: <strong>${item.variant}</strong></div>` : '')}
            <div class="checkout-item-price-row">
              <span class="checkout-item-unit">${Cart.formatCOP(item.effectiveUnitPrice || item.precio)} c/u</span>
              <strong class="checkout-item-total">${Cart.formatCOP(lineTotal)}</strong>
            </div>
          </div>
        </div>
      `;
      }).join('');
    }

    if (wsItems.length > 0) {
      const totalWsQty = Cart.getWholesaleTotalQty();
      itemsHtml += `
        <div class="checkout-sec-divider ws-divider">📦 PRODUCTOS MAYORISTAS (${totalWsQty} uds en total)</div>
      `;

      // Agrupar por referencia de producto
      const wsGroups = {};
      wsItems.forEach(item => {
        if (!wsGroups[item.productId]) {
          wsGroups[item.productId] = {
            nombre: item.nombre,
            refTotalQty: 0,
            activeTier: item.activeTier || 5,
            unitPrice: item.unitPrice || 0,
            refSubtotal: 0,
            items: []
          };
        }
        wsGroups[item.productId].items.push(item);
        wsGroups[item.productId].refTotalQty += item.qty;
        wsGroups[item.productId].refSubtotal += item.subtotal;
      });

      Object.values(wsGroups).forEach(group => {
        itemsHtml += `
          <div class="checkout-ref-group">
            <div class="checkout-ref-head">
              <span class="checkout-ref-title">• ${group.nombre} (${group.refTotalQty} uds • Tarifa +${group.activeTier})</span>
              <span class="checkout-ref-sub">${Cart.formatCOP(group.refSubtotal)}</span>
            </div>
            <div class="checkout-ref-rate">
              Tarifa mayorista aplicada: <strong>${Cart.formatCOP(group.unitPrice)} c/u</strong>
            </div>
            <div class="checkout-ref-flavors">
              ${group.items.map(i => `
                <div class="checkout-ref-flavor-line">
                  <span>- ${i.variant}: <strong>${i.qty} uds</strong></span>
                  <strong>${Cart.formatCOP(i.subtotal)}</strong>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = itemsHtml;

    const totalWsQty = Cart.getWholesaleTotalQty();
    const destName = shipping.isSoacha ? 'Soacha' : (shipping.isBogota ? 'Bogotá' : 'Nacional');

    let shippingLineHtml = '';
    if (shipping.isSoacha) {
      shippingLineHtml = `<span>${Cart.formatCOP(shipping.cost)}</span>`;
    } else if (shipping.isWholesaleOnly) {
      shippingLineHtml = `<span style="color: #F59E0B; font-size: 0.82rem;">WhatsApp 3133572726 (A coordinar)</span>`;
    } else if (shipping.isFree) {
      shippingLineHtml = `<strong class="text-green">GRATIS 🎉</strong>`;
    } else {
      shippingLineHtml = `<span>${Cart.formatCOP(shipping.cost)}</span>`;
    }

    summaryContainer.innerHTML = `
      ${detalItems.length > 0 ? `
        <div class="summary-line">
          <span>Subtotal Detal:</span>
          <span>${Cart.formatCOP(detalSubtotal)}</span>
        </div>
      ` : ''}
      ${wsItems.length > 0 ? `
        <div class="summary-line">
          <span>Subtotal Mayorista (${totalWsQty} uds):</span>
          <span>${Cart.formatCOP(wsSubtotal)}</span>
        </div>
      ` : ''}
      <div class="summary-line">
        <span>Envío (${destName}):</span>
        ${shippingLineHtml}
      </div>
      <div class="summary-line total-line">
        <span>Total Final:</span>
        <span class="total-amount">${Cart.formatCOP(total)}</span>
      </div>
    `;
  },

  bindForm() {
    const form = document.getElementById('checkoutForm');
    const destSelect = document.getElementById('checkoutDestino');

    if (destSelect) {
      destSelect.value = Cart.destination;
      destSelect.addEventListener('change', (e) => {
        Cart.setDestination(e.target.value);
        this.renderOrderSummary();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitOrder();
      });
    }
  },

  submitOrder() {
    const nombre = document.getElementById('checkoutNombre').value.trim();
    const telefono = document.getElementById('checkoutTelefono').value.trim();
    const direccion = document.getElementById('checkoutDireccion').value.trim();
    const ciudad = document.getElementById('checkoutCiudad').value.trim();
    const depto = document.getElementById('checkoutDepto').value.trim();
    const notas = document.getElementById('checkoutNotas').value.trim();
    const destino = document.getElementById('checkoutDestino').value;

    if (!nombre || !telefono || !direccion || !ciudad) {
      Toast.show('Por favor completa todos los campos requeridos (*)', 'error');
      return;
    }

    // Si el carrito estaba vacío y el cliente eligió su vape directamente en "Agendar Pedido", agregarlo automáticamente
    if (Cart.items.length === 0) {
      this.addQuickSelectedVape(true);
    }

    const detalItems = Cart.getDetalItems();
    const wsItems = Cart.getWholesaleItems();
    const detalSubtotal = Cart.getDetalSubtotal();
    const wsSubtotal = Cart.getWholesaleSubtotal();
    const totalWsQty = Cart.getWholesaleTotalQty();
    const shipping = Cart.getShippingInfo();
    const total = Cart.getTotal();

    // 1. Determinar número de WhatsApp destino:
    // REGLA OBLIGATORIA: En pedidos con productos mayoristas va EXCLUSIVAMENTE al 3133572726.
    // En pedidos al detal, toma la opción seleccionada por el usuario (3133572726 o 3248012914).
    let targetWa = '573133572726';
    if (wsItems.length > 0) {
      targetWa = '573133572726';
    } else {
      const selectedRadio = document.querySelector('input[name="checkoutWaNumber"]:checked');
      if (selectedRadio && selectedRadio.value) {
        targetWa = selectedRadio.value;
      } else {
        targetWa = (typeof CONFIG !== 'undefined' && CONFIG.WHATSAPP_PRIMARY) || '573133572726';
      }
    }

    let destDesc = 'Bogotá D.C.';
    if (destino === 'soacha') destDesc = 'Soacha';
    else if (destino === 'nacional') destDesc = (depto ? `${ciudad}, ${depto}` : 'Nacional');

    let msg = `⚡ *NUEVO PEDIDO - CAPITAL VAPE* ⚡\n\n`;
    msg += `👤 *Cliente:* ${nombre}\n`;
    msg += `📱 *Teléfono:* ${telefono}\n`;
    msg += `📍 *Dirección:* ${direccion}\n`;
    msg += `🏙️ *Ciudad / Destino:* ${ciudad} (${destDesc})\n`;
    if (notas) msg += `📝 *Notas de Entrega:* ${notas}\n`;
    msg += `\n`;

    // 2. PRODUCTOS AL DETAL
    if (detalItems.length > 0) {
      msg += `🛒 *PRODUCTOS AL DETAL:*\n`;
      detalItems.forEach((item, idx) => {
        const lineSub = (typeof item.calculatedLinePrice === 'number') ? item.calculatedLinePrice : (item.precio * item.qty);
        const unitEff = item.effectiveUnitPrice || (item.qty > 0 ? Math.round(lineSub / item.qty) : item.precio);
        const isDual = item.isDualFlavor === true || (item.productId === 'reign-bar-palette' && item.isDualFlavor !== false && item.variant && item.variant.includes(' + '));
        const f1 = item.flavor1 || (item.variant && item.variant.includes(' + ') ? item.variant.split(' + ')[0].trim() : item.variant);
        const f2 = item.flavor2 || (item.variant && item.variant.includes(' + ') ? item.variant.split(' + ')[1].trim() : f1);

        if (isDual) {
          msg += `🔹 *${idx + 1}. ${item.nombre}* ×${item.qty}\n`;
          msg += `   🍓 *Módulo 1 (Sabor):* ${f1}\n`;
          msg += `   🍇 *Módulo 2 (Sabor):* ${f2}\n`;
          msg += `   📦 *Cantidad:* ${item.qty} ${item.qty === 1 ? 'unidad' : 'unidades'}\n`;
          msg += `   💵 *Precio Unitario:* ${Cart.formatCOP(unitEff)} COP\n`;
          msg += `   ✨ *Subtotal:* ${Cart.formatCOP(lineSub)} COP\n\n`;
        } else {
          msg += `🔹 *${idx + 1}. ${item.nombre}* ×${item.qty}\n`;
          if (item.variant) msg += `   💨 *Sabor/Color:* ${item.variant}\n`;
          msg += `   📦 *Cantidad:* ${item.qty} ${item.qty === 1 ? 'unidad' : 'unidades'}\n`;
          msg += `   💵 *Precio Unitario:* ${Cart.formatCOP(unitEff)} COP\n`;
          msg += `   ✨ *Subtotal:* ${Cart.formatCOP(lineSub)} COP\n\n`;
        }
      });
      msg += `🛍️ *Subtotal Detal: ${Cart.formatCOP(detalSubtotal)} COP*\n\n`;
    }

    // 3. PRODUCTOS MAYORISTAS (AGRUPADOS POR REFERENCIA CON DETALLE DE SABORES)
    if (wsItems.length > 0) {
      msg += `📦 *PRODUCTOS MAYORISTAS (${totalWsQty} unidades totales):*\n`;

      const wsGroups = {};
      wsItems.forEach(item => {
        if (!wsGroups[item.productId]) {
          wsGroups[item.productId] = {
            nombre: item.nombre,
            refTotalQty: 0,
            activeTier: item.activeTier || 5,
            unitPrice: item.unitPrice || 0,
            refSubtotal: 0,
            items: []
          };
        }
        wsGroups[item.productId].items.push(item);
        wsGroups[item.productId].refTotalQty += item.qty;
        wsGroups[item.productId].refSubtotal += item.subtotal;
      });

      let gIdx = 1;
      Object.values(wsGroups).forEach(group => {
        msg += `🏷️ *${gIdx}. ${group.nombre}* — ${group.refTotalQty} unidades (Rango +${group.activeTier} • ${Cart.formatCOP(group.unitPrice)} c/u):\n`;
        group.items.forEach(i => {
          const isDual = i.isDualFlavor === true || (i.productId === 'reign-bar-palette' && i.isDualFlavor !== false && i.variant && i.variant.includes(' + '));
          if (isDual) {
            const f1 = i.flavor1 || (i.variant && i.variant.includes(' + ') ? i.variant.split(' + ')[0].trim() : i.variant);
            const f2 = i.flavor2 || (i.variant && i.variant.includes(' + ') ? i.variant.split(' + ')[1].trim() : f1);
            msg += `   🔸 *Doble Sabor:* ${f1} + ${f2} ➔ 📦 ${i.qty} uds (${Cart.formatCOP(i.subtotal)} COP)\n`;
          } else {
            msg += `   🔸 *Sabor:* ${i.variant} ➔ 📦 ${i.qty} uds (${Cart.formatCOP(i.subtotal)} COP)\n`;
          }
        });
        msg += `   ✨ *Subtotal ${group.nombre}:* ${Cart.formatCOP(group.refSubtotal)} COP\n\n`;
        gIdx++;
      });

      msg += `📦 *Subtotal Mayorista: ${Cart.formatCOP(wsSubtotal)} COP*\n\n`;
    }

    // 4. RESUMEN DE PAGO Y ENVÍO
    msg += `💰 *RESUMEN DE PAGO:*\n`;
    if (detalItems.length > 0 && wsItems.length > 0) {
      msg += `💵 *Subtotal Detal:* ${Cart.formatCOP(detalSubtotal)} COP\n`;
      msg += `📦 *Subtotal Mayorista:* ${Cart.formatCOP(wsSubtotal)} COP\n`;
    }
    
    if (shipping.isSoacha) {
      msg += `🛵 *Envío (Soacha):* ${Cart.formatCOP(shipping.cost)} COP\n`;
    } else if (shipping.isWholesaleOnly) {
      msg += `🚚 *Envío Mayorista:* A coordinar por WhatsApp al 3133572726 📦\n`;
    } else if (shipping.isFree) {
      msg += `🎉 *Envío (${destDesc}):* ¡GRATIS! 🎉\n`;
    } else {
      msg += `🛵 *Envío (${destDesc}):* ${Cart.formatCOP(shipping.cost)} COP\n`;
    }

    msg += `💳 *TOTAL FINAL A PAGAR: ${Cart.formatCOP(total)} COP*\n\n`;
    if (wsItems.length > 0) {
      msg += `🤝 Deseo coordinar el despacho de mi pedido mayorista y acordar el medio de pago. 💼`;
    } else {
      msg += `✅ Deseo confirmar mi pedido y acordar el medio de pago (Transferencia Nequi / Daviplata o Contra entrega). 🚀`;
    }

    const encodedText = encodeURIComponent(msg);
    const waUrl = `https://api.whatsapp.com/send?phone=${targetWa}&text=${encodedText}`;

    // Intentar abrir WhatsApp; si el navegador bloquea el popup, navegar en la misma ventana
    const win = window.open(waUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = waUrl;
    }
    Toast.show('¡Pedido preparado! Te hemos redirigido a WhatsApp para confirmarlo.', 'success');
    this.closeModal();
  }
};

window.CheckoutController = CheckoutController;
