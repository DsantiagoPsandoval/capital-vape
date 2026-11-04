/**
 * CAPITAL VAPE - Controlador de Checkout & Pedido Unificado a WhatsApp
 * Manejo de WhatsApp exclusivo mayorista (3133572726) y selector al detal (3133572726 ó 3248012914),
 * agrupación mayorista por referencia con desglose de sabores, y tarifa Soacha $15.000 COP.
 */
const CheckoutController = {
  init() {
    this.bindForm();
  },

  openModal() {
    if (Cart.items.length === 0) {
      Toast.show('Tu carrito está vacío.', 'error');
      return;
    }
    Cart.closeDrawer();
    const modal = document.getElementById('checkoutModal');
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      const destSelect = document.getElementById('checkoutDestino');
      if (destSelect && Cart.destination) {
        destSelect.value = Cart.destination;
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
    const correo = document.getElementById('checkoutCorreo').value.trim();
    const direccion = document.getElementById('checkoutDireccion').value.trim();
    const ciudad = document.getElementById('checkoutCiudad').value.trim();
    const depto = document.getElementById('checkoutDepto').value.trim();
    const notas = document.getElementById('checkoutNotas').value.trim();
    const destino = document.getElementById('checkoutDestino').value;

    if (!nombre || !telefono || !direccion || !ciudad) {
      Toast.show('Por favor completa todos los campos requeridos (*)', 'error');
      return;
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
    if (correo) msg += `✉️ *Correo:* ${correo}\n`;
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
          msg += `${idx + 1}. *${item.nombre}*\n`;
          msg += `   - Primer sabor: ${f1}\n`;
          msg += `   - Segundo sabor: ${f2}\n`;
          msg += `   - Cantidad: ${item.qty}\n`;
          msg += `   - Precio unitario: ${Cart.formatCOP(unitEff)} COP\n`;
          msg += `   - Total: ${Cart.formatCOP(lineSub)} COP\n`;
        } else {
          msg += `${idx + 1}. *${item.nombre}* x${item.qty}\n`;
          if (item.variant) msg += `   - Sabor/Color: ${item.variant}\n`;
          msg += `   - Precio unitario: ${Cart.formatCOP(unitEff)} COP\n`;
          msg += `   - Subtotal: ${Cart.formatCOP(lineSub)} COP\n`;
        }
      });
      msg += `*Subtotal Detal: ${Cart.formatCOP(detalSubtotal)}*\n\n`;
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
        msg += `${gIdx}. *${group.nombre}* — ${group.refTotalQty} unidades (Rango +${group.activeTier} • ${Cart.formatCOP(group.unitPrice)} c/u):\n`;
        group.items.forEach(i => {
          const isDual = i.isDualFlavor === true || (i.productId === 'reign-bar-palette' && i.isDualFlavor !== false && i.variant && i.variant.includes(' + '));
          if (isDual) {
            const f1 = i.flavor1 || (i.variant && i.variant.includes(' + ') ? i.variant.split(' + ')[0].trim() : i.variant);
            const f2 = i.flavor2 || (i.variant && i.variant.includes(' + ') ? i.variant.split(' + ')[1].trim() : f1);
            msg += `   • Combinación: Primer sabor: ${f1} | Segundo sabor: ${f2} — Cantidad: ${i.qty} uds (${Cart.formatCOP(i.subtotal)})\n`;
          } else {
            msg += `   • ${i.variant} ×${i.qty} uds (${Cart.formatCOP(i.subtotal)})\n`;
          }
        });
        msg += `   Subtotal ${group.nombre}: ${Cart.formatCOP(group.refSubtotal)}\n\n`;
        gIdx++;
      });

      msg += `*Subtotal Mayorista: ${Cart.formatCOP(wsSubtotal)}*\n\n`;
    }

    // 4. RESUMEN DE PAGO Y ENVÍO
    msg += `💰 *RESUMEN DE PAGO:*\n`;
    if (detalItems.length > 0 && wsItems.length > 0) {
      msg += `• Subtotal Detal: ${Cart.formatCOP(detalSubtotal)}\n`;
      msg += `• Subtotal Mayorista: ${Cart.formatCOP(wsSubtotal)}\n`;
    }
    
    if (shipping.isSoacha) {
      msg += `• Envío Soacha: ${Cart.formatCOP(shipping.cost)}\n`;
    } else if (shipping.isWholesaleOnly) {
      msg += `• Envío Mayorista: A coordinar por WhatsApp al 3133572726\n`;
    } else if (shipping.isFree) {
      msg += `• Envío (${destDesc}): GRATIS 🎉\n`;
    } else {
      msg += `• Envío (${destDesc}): ${Cart.formatCOP(shipping.cost)}\n`;
    }

    msg += `• *TOTAL FINAL A PAGAR: ${Cart.formatCOP(total)}*\n\n`;
    if (wsItems.length > 0) {
      msg += `Deseo coordinar el despacho del pedido mayorista y acordar medio de pago.`;
    } else {
      msg += `Deseo confirmar mi pedido y acordar medio de pago (Transferencia Nequi/Daviplata o Contra entrega).`;
    }

    const waUrl = `https://wa.me/${targetWa}?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
    Toast.show('¡Pedido preparado! Te hemos redirigido a WhatsApp para confirmarlo.', 'success');
    this.closeModal();
  }
};

window.CheckoutController = CheckoutController;
