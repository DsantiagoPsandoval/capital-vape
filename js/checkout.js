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
        ? 'Finalizar Pedido (Mayorista) — Capital Vape' 
        : 'Finalizar Pedido al Detal — Capital Vape';
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
      itemsHtml += detalItems.map(item => `
        <div class="checkout-item-line">
          <div>
            <strong>${item.nombre}</strong> (x${item.qty})
            ${item.variant ? `<br><small class="text-secondary">Sabor: ${item.variant}</small>` : ''}
          </div>
          <div>${Cart.formatCOP(item.precio * item.qty)}</div>
        </div>
      `).join('');
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
          <div class="checkout-ref-group" style="margin-bottom: 10px; padding: 8px; background: rgba(255,255,255,0.03); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; font-weight: 700; color: #fff; margin-bottom: 4px;">
              <span>• ${group.nombre} (${group.refTotalQty} uds • Tarifa +${group.activeTier})</span>
              <span style="color: var(--accent-yellow);">${Cart.formatCOP(group.refSubtotal)}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 6px;">
              Tarifa mayorista aplicada: ${Cart.formatCOP(group.unitPrice)} c/u
            </div>
            <div style="padding-left: 10px; border-left: 2px solid rgba(255,255,255,0.1);">
              ${group.items.map(i => `
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary); padding: 2px 0;">
                  <span>- ${i.variant}: <strong>${i.qty} uds</strong></span>
                  <span>${Cart.formatCOP(i.subtotal)}</span>
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
        let lineSub = item.precio * item.qty;
        if (item.precio_promo_2 && item.qty >= 2) {
          const pairs = Math.floor(item.qty / 2);
          const rem = item.qty % 2;
          lineSub = (pairs * item.precio_promo_2) + (rem * item.precio);
        }
        msg += `${idx + 1}. *${item.nombre}* x${item.qty}\n`;
        if (item.variant) msg += `   - Sabor/Color: ${item.variant}\n`;
        msg += `   - Subtotal: ${Cart.formatCOP(lineSub)}\n`;
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
          msg += `   • ${i.variant} ×${i.qty} uds (${Cart.formatCOP(i.subtotal)})\n`;
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
