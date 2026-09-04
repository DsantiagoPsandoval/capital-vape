/**
 * CAPITAL VAPE - Controlador de Checkout & Pedido a WhatsApp
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

    const subtotal = Cart.getSubtotal();
    const shipping = Cart.getShippingInfo();
    const total = Cart.getTotal();

    container.innerHTML = Cart.items.map(item => `
      <div class="checkout-item-line">
        <div>
          <strong>${item.nombre}</strong> (x${item.qty})
          ${item.variant ? `<br><small class="text-secondary">Sabor: ${item.variant}</small>` : ''}
        </div>
        <div>${Cart.formatCOP(item.precio * item.qty)}</div>
      </div>
    `).join('');

    summaryContainer.innerHTML = `
      <div class="summary-line">
        <span>Subtotal:</span>
        <span>${Cart.formatCOP(subtotal)}</span>
      </div>
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

    const subtotal = Cart.getSubtotal();
    const shipping = Cart.getShippingInfo();
    const total = Cart.getTotal();

    // Build structured WhatsApp message
    let msg = `⚡ *NUEVO PEDIDO - CAPITAL VAPE* ⚡

`;
    msg += `👤 *Cliente:* ${nombre}
`;
    msg += `📱 *Teléfono:* ${telefono}
`;
    if (correo) msg += `✉️ *Correo:* ${correo}
`;
    msg += `📍 *Dirección:* ${direccion}
`;
    msg += `🏙️ *Ciudad:* ${ciudad} (${destino === 'bogota' ? 'Bogotá' : (depto || 'Nacional')})
`;
    if (notas) msg += `📝 *Notas de Entrega:* ${notas}

`;

    msg += `🛒 *DETALLE DEL PEDIDO:*
`;
    Cart.items.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.nombre}* x${item.qty}
`;
      if (item.variant) msg += `   - Sabor/Color: ${item.variant}
`;
      msg += `   - Subtotal: ${Cart.formatCOP(item.precio * item.qty)}
`;
    });

    msg += `
💰 *RESUMEN DE PAGO:*
`;
    msg += `• Subtotal: ${Cart.formatCOP(subtotal)}
`;
    msg += `• Envío: ${shipping.isFree ? 'GRATIS 🎉' : Cart.formatCOP(shipping.cost)}
`;
    msg += `• *TOTAL A PAGAR: ${Cart.formatCOP(total)}*

`;
    msg += `Quiero confirmar la disponibilidad y método de pago (Nequi / Daviplata / Contra Entrega).`;

    const waUrl = `https://wa.me/${CONFIG.WHATSAPP_PRIMARY}?text=${encodeURIComponent(msg)}`;

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank');

    Toast.show('¡Pedido preparado! Te hemos redirigido a WhatsApp para confirmarlo.', 'success');
    this.closeModal();
  }
};

window.CheckoutController = CheckoutController;
