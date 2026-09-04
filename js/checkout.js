/**
 * CAPITAL VAPE - Controlador de Checkout & Pedido Unificado a WhatsApp
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

  renderOrderSummary() {
    const container = document.getElementById('checkoutOrderItems');
    const summaryContainer = document.getElementById('checkoutTotals');
    if (!container || !summaryContainer) return;

    const detalItems = Cart.getDetalItems();
    const wsItems = Cart.getWholesaleItems();
    const detalSubtotal = Cart.getDetalSubtotal();
    const wsSubtotal = Cart.getWholesaleSubtotal();
    const totalSubtotal = Cart.getSubtotal();
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
      itemsHtml += `
        <div class="checkout-sec-divider ws-divider">📦 PAQUETES MAYORISTAS</div>
      `;
      itemsHtml += wsItems.map(item => `
        <div class="checkout-item-line ws-checkout-line">
          <div>
            <strong>${item.nombre}</strong> (+${item.packQty} uds)
            ${item.variant ? `<br><small class="text-secondary">Sabor: ${item.variant} • ${Cart.formatCOP(item.unitPrice)} c/u</small>` : ''}
          </div>
          <div>${Cart.formatCOP(item.subtotal)}</div>
        </div>
      `).join('');
    }

    container.innerHTML = itemsHtml;

    summaryContainer.innerHTML = `
      ${detalItems.length > 0 ? `
        <div class="summary-line">
          <span>Subtotal Detal:</span>
          <span>${Cart.formatCOP(detalSubtotal)}</span>
        </div>
      ` : ''}
      ${wsItems.length > 0 ? `
        <div class="summary-line">
          <span>Subtotal Mayorista:</span>
          <span>${Cart.formatCOP(wsSubtotal)}</span>
        </div>
      ` : ''}
      <div class="summary-line">
        <span>Envío (${shipping.isBogota ? 'Bogotá' : 'Nacional'}):</span>
        <span>${shipping.isFree ? '<strong class="text-green">GRATIS</strong>' : Cart.formatCOP(shipping.cost)}</span>
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
    const shipping = Cart.getShippingInfo();
    const total = Cart.getTotal();

    let msg = `⚡ *NUEVO PEDIDO - CAPITAL VAPE* ⚡\n\n`;
    msg += `👤 *Cliente:* ${nombre}\n`;
    msg += `📱 *Teléfono:* ${telefono}\n`;
    if (correo) msg += `✉️ *Correo:* ${correo}\n`;
    msg += `📍 *Dirección:* ${direccion}\n`;
    msg += `🏙️ *Ciudad:* ${ciudad} (${destino === 'bogota' ? 'Bogotá' : (depto || 'Nacional')})\n`;
    if (notas) msg += `📝 *Notas de Entrega:* ${notas}\n`;
    msg += `\n`;

    if (detalItems.length > 0) {
      msg += `🛒 *PRODUCTOS AL DETAL:*\n`;
      detalItems.forEach((item, idx) => {
        msg += `${idx + 1}. *${item.nombre}* x${item.qty}\n`;
        if (item.variant) msg += `   - Sabor/Color: ${item.variant}\n`;
        msg += `   - Subtotal: ${Cart.formatCOP(item.precio * item.qty)}\n`;
      });
      msg += `*Subtotal Detal: ${Cart.formatCOP(detalSubtotal)}*\n\n`;
    }

    if (wsItems.length > 0) {
      msg += `📦 *PAQUETES MAYORISTAS:*\n`;
      wsItems.forEach((item, idx) => {
        msg += `${idx + 1}. *${item.nombre}* (+${item.packQty} uds)\n`;
        if (item.variant) msg += `   - Sabor/Color: ${item.variant}\n`;
        msg += `   - Tarifa: ${Cart.formatCOP(item.unitPrice)} c/u\n`;
        msg += `   - Subtotal Paquete: ${Cart.formatCOP(item.subtotal)}\n`;
      });
      msg += `*Subtotal Mayorista: ${Cart.formatCOP(wsSubtotal)}*\n\n`;
    }

    msg += `💰 *RESUMEN DE PAGO:*\n`;
    if (detalItems.length > 0 && wsItems.length > 0) {
      msg += `• Subtotal Detal: ${Cart.formatCOP(detalSubtotal)}\n`;
      msg += `• Subtotal Mayorista: ${Cart.formatCOP(wsSubtotal)}\n`;
    }
    msg += `• Envío: ${shipping.isFree ? 'GRATIS 🎉' : Cart.formatCOP(shipping.cost)}\n`;
    msg += `• *TOTAL FINAL A PAGAR: ${Cart.formatCOP(total)}*\n\n`;
    msg += `Deseo coordinar el despacho y acordar medio de pago (Transferencia / Contra entrega).`;

    const waUrl = `https://wa.me/${(typeof CONFIG !== 'undefined' && CONFIG.WHATSAPP_PRIMARY) || '573248012914'}?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
    Toast.show('¡Pedido preparado! Te hemos redirigido a WhatsApp para confirmarlo.', 'success');
    this.closeModal();
  }
};

window.CheckoutController = CheckoutController;
