/**
 * CAPITAL VAPE - Constructor Unificado y Validador de Mensajes para WhatsApp
 *
 * Elimina cualquier corrupción de caracteres, entities HTML o caracteres de reemplazo (\uFFFD ).
 * Utiliza secuencias de escape Unicode puras (\u{...}) para máxima resiliencia en cualquier navegador.
 */
(function(root) {
  'use strict';

  const EMOJI = {
    PARTY: '\u{1F389}',       // 🎉
    USER: '\u{1F464}',        // 👤
    PHONE: '\u{1F4F1}',       // 📱
    PIN: '\u{1F4CD}',         // 📍
    CITY: '\u{1F3D9}\uFE0F',  // 🏙️
    NOTE: '\u{1F4DD}',        // 📝
    CART: '\u{1F6D2}',        // 🛒
    PACKAGE: '\u{1F4E6}',     // 📦
    TRUCK: '\u{1F69A}',       // 🚚
    SCOOTER: '\u{1F6F5}',     // 🛵
    MONEY: '\u{1F4B0}',       // 💰
    CARD: '\u{1F4B3}',        // 💳
    CHECK: '\u{2705}',        // ✅
    HANDSHAKE: '\u{1F91D}',   // 🤝
    FIRE: '\u{1F525}'         // 🔥
  };

  const OrderMessageBuilder = {
    EMOJI,

    /**
     * Limpia entidades HTML, escapes de markdown no deseados y caracteres corruptos.
     */
    cleanText(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&nbsp;/gi, ' ')
        .replace(/&#x20;/gi, ' ')
        .replace(/&#32;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/<[^>]+>/g, '')           // Eliminar tags HTML si existieran
        .replace(/\\+(\*+)/g, '$1')        // Eliminar barras que escapan asteriscos (\* -> *)
        .replace(/\\+/g, '')               // Eliminar backslashes sueltos
        .replace(/\uFFFD/g, '')            // Eliminar caracter corrupto  si vino de inputs
        .trim();
    },

    /**
     * Formatea moneda colombiana ($18.500)
     */
    formatCOP(val) {
      const num = Math.round(Number(val) || 0);
      return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },

    /**
     * Construye el texto del pedido con la plantilla oficial unificada.
     */
    build(orderData) {
      const customer = orderData.customer || {};
      const detalItems = Array.isArray(orderData.detalItems) ? orderData.detalItems : [];
      const wsItems = Array.isArray(orderData.wsItems) ? orderData.wsItems : [];
      const detalSubtotal = Number(orderData.detalSubtotal) || 0;
      const wsSubtotal = Number(orderData.wsSubtotal) || 0;
      const totalWsQty = Number(orderData.totalWsQty) || 0;
      const shipping = orderData.shipping || {};
      const total = Number(orderData.total) || 0;

      const nombre = this.cleanText(customer.nombre || '');
      const telefono = this.cleanText(customer.telefono || '');
      const direccion = this.cleanText(customer.direccion || '');
      const ciudad = this.cleanText(customer.ciudad || '');
      const depto = this.cleanText(customer.depto || '');
      const destino = customer.destino || 'bogota';
      const notas = this.cleanText(customer.notas || '');

      let destDesc = 'Bogotá D.C.';
      if (destino === 'soacha') {
        destDesc = 'Soacha';
      } else if (destino === 'nacional') {
        destDesc = depto ? `${depto}` : 'Nacional';
      } else {
        destDesc = 'Bogotá D.C.';
      }

      const lines = [];

      // 1. ENCABEZADO
      lines.push(`${EMOJI.PARTY} *NUEVO PEDIDO - CAPITAL VAPE* ${EMOJI.PARTY}`);
      lines.push('');
      lines.push(`${EMOJI.USER} *Cliente:* ${nombre}`);
      lines.push('');
      lines.push(`${EMOJI.PHONE} *Teléfono:* ${telefono}`);
      lines.push('');
      lines.push(`${EMOJI.PIN} *Dirección:* ${direccion}`);
      lines.push('');
      lines.push(`${EMOJI.CITY} *Ciudad / Destino:* ${ciudad} (${destDesc})`);
      if (notas) {
        lines.push('');
        lines.push(`${EMOJI.NOTE} *Notas de Entrega:* ${notas}`);
      }
      lines.push('');

      // 2. PRODUCTOS AL DETAL
      if (detalItems.length > 0) {
        const totalDetalQty = detalItems.reduce((acc, i) => acc + (Number(i.qty) || 0), 0);
        lines.push(`${EMOJI.CART} *PRODUCTOS AL DETAL (${totalDetalQty} ${totalDetalQty === 1 ? 'unidad' : 'unidades'})*`);
        lines.push('');

        detalItems.forEach((item, idx) => {
          const unitPrice = Number(item.precio) || 0;
          const lineSub = unitPrice * item.qty;
          const isDual = item.isDualFlavor === true || (item.productId === 'reign-bar-palette' && item.isDualFlavor !== false && item.variant && item.variant.includes(' + '));
          const f1 = this.cleanText(item.flavor1 || (item.variant && item.variant.includes(' + ') ? item.variant.split(' + ')[0].trim() : item.variant || ''));
          const f2 = this.cleanText(item.flavor2 || (item.variant && item.variant.includes(' + ') ? item.variant.split(' + ')[1].trim() : f1));
          const cleanNombre = this.cleanText(item.nombre);

          lines.push(`${idx + 1}. *${cleanNombre}*`);
          lines.push(`   - Cantidad: ${item.qty} ${item.qty === 1 ? 'unidad' : 'unidades'}.`);
          lines.push(`   - Precio unitario: ${this.formatCOP(unitPrice)}.`);
          if (isDual) {
            lines.push(`   - Primer sabor: ${f1}.`);
            lines.push(`   - Segundo sabor: ${f2}.`);
          } else if (item.variant) {
            const vLabel = (item.tipo_variante === 'color') ? 'Color' : 'Sabor';
            lines.push(`   - ${vLabel}: ${this.cleanText(item.variant)}.`);
          }
          lines.push(`   - Subtotal: ${this.formatCOP(lineSub)}.`);
          lines.push('');
        });

        const promoDetails = orderData.promoDetails;
        if (promoDetails && promoDetails.hasPromo && promoDetails.discount > 0) {
          lines.push(`*SUBTOTAL NORMAL: ${this.formatCOP(promoDetails.normalSubtotal)}*`);
          lines.push(`${EMOJI.FIRE} *DESCUENTO GLOBAL (PROMOCIÓN COMBINADA):* -${this.formatCOP(promoDetails.discount)}`);
          lines.push(`   *(Menor ahorro promocional entre referencias elegibles: ${promoDetails.selectedRef.nombre})*`);
          lines.push(`*SUBTOTAL DETAL CON DESCUENTO: ${this.formatCOP(promoDetails.finalSubtotal)}*`);
          lines.push('');
        } else {
          lines.push(`*SUBTOTAL DETAL: ${this.formatCOP(detalSubtotal)}*`);
          lines.push('');
        }
      }

      // 3. PRODUCTOS MAYORISTAS
      if (wsItems.length > 0) {
        // Agrupación por referencia
        const wsGroups = {};
        wsItems.forEach(item => {
          if (!wsGroups[item.productId]) {
            wsGroups[item.productId] = {
              nombre: this.cleanText(item.nombre),
              refTotalQty: 0,
              activeTier: item.activeTier || 5,
              unitPrice: item.unitPrice || item.precio || 0,
              refSubtotal: 0,
              items: []
            };
          }
          wsGroups[item.productId].items.push(item);
          wsGroups[item.productId].refTotalQty += item.qty;
          const sub = (typeof item.subtotal === 'number') ? item.subtotal : (item.unitPrice || item.precio) * item.qty;
          wsGroups[item.productId].refSubtotal += sub;
        });

        lines.push(`${EMOJI.PACKAGE} *PRODUCTOS MAYORISTAS (${totalWsQty} ${totalWsQty === 1 ? 'unidad' : 'unidades'})*`);
        lines.push('');

        let gIdx = 1;
        Object.values(wsGroups).forEach(group => {
          lines.push(`${gIdx}. *${group.nombre}*`);
          lines.push(`   - Cantidad: ${group.refTotalQty} ${group.refTotalQty === 1 ? 'unidad' : 'unidades'}.`);
          lines.push(`   - Precio unitario: ${this.formatCOP(group.unitPrice)}.`);
          
          group.items.forEach(i => {
            const isDual = i.isDualFlavor === true || (i.productId === 'reign-bar-palette' && i.isDualFlavor !== false && i.variant && i.variant.includes(' + '));
            if (isDual) {
              const f1 = this.cleanText(i.flavor1 || (i.variant && i.variant.includes(' + ') ? i.variant.split(' + ')[0].trim() : i.variant));
              const f2 = this.cleanText(i.flavor2 || (i.variant && i.variant.includes(' + ') ? i.variant.split(' + ')[1].trim() : f1));
              lines.push(`   - Primer sabor: ${f1}.`);
              lines.push(`   - Segundo sabor: ${f2}.`);
            } else if (i.variant) {
              lines.push(`   - Sabor: ${this.cleanText(i.variant)} (${i.qty} uds).`);
            }
          });

          lines.push(`   - Subtotal: ${this.formatCOP(group.refSubtotal)}.`);
          lines.push('');
          gIdx++;
        });

        lines.push(`*SUBTOTAL MAYORISTA: ${this.formatCOP(wsSubtotal)}*`);
        lines.push('');
      }

      // 4. ENVÍO
      if (shipping.isSoacha) {
        lines.push(`${EMOJI.SCOOTER} *Envío:* Soacha (${this.formatCOP(shipping.cost)}).`);
      } else if (shipping.isWholesaleOnly) {
        lines.push(`${EMOJI.TRUCK} *Envío:* A coordinar por WhatsApp al 3133572726.`);
      } else if (shipping.isFree) {
        lines.push(`${EMOJI.PARTY} *Envío:* ¡GRATIS! (${destDesc}).`);
      } else if (shipping.cost > 0) {
        lines.push(`${EMOJI.TRUCK} *Envío:* ${destDesc} (${this.formatCOP(shipping.cost)}).`);
      } else {
        lines.push(`${EMOJI.TRUCK} *Envío:* A coordinar por WhatsApp.`);
      }
      lines.push('');

      // 5. TOTAL FINAL
      lines.push(`${EMOJI.MONEY} *TOTAL FINAL: ${this.formatCOP(total)}*`);
      lines.push('');

      // 6. MENSAJE DE CIERRE
      if (wsItems.length > 0) {
        lines.push(`*Deseo coordinar el despacho del pedido mayorista y acordar el medio de pago.*`);
      } else {
        lines.push(`*Deseo confirmar mi pedido y acordar el medio de pago (Transferencia Nequi/Daviplata o Contra entrega).*`);
      }

      return lines.join('\n');
    },

    /**
     * Valida la integridad del mensaje generado antes del envío.
     */
    validate(msg) {
      const errors = [];
      if (!msg || typeof msg !== 'string') {
        errors.push('El mensaje está vacío o no es una cadena válida.');
        return { valid: false, errors };
      }
      if (msg.includes('\uFFFD')) {
        errors.push('Se detectó carácter corrupto de reemplazo Unicode ().');
      }
      if (/&#[0-9a-fx]+;/i.test(msg) || /&[a-z]{2,8};/i.test(msg)) {
        errors.push('Se detectaron entidades HTML residuales en el mensaje.');
      }
      if (/\\+\*/.test(msg)) {
        errors.push('Se detectaron barras invertidas escapando asteriscos.');
      }
      if (!msg.includes(EMOJI.PARTY)) {
        errors.push('Faltan emojis principales en el encabezado del mensaje.');
      }
      return {
        valid: errors.length === 0,
        errors
      };
    },

    /**
     * Construye la URL final de WhatsApp aplicando encodeURIComponent exactamente una vez.
     */
    buildWhatsAppUrl(phone, msg) {
      const cleanPhone = String(phone).replace(/\D/g, '');
      const encodedText = encodeURIComponent(msg);
      return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    }
  };

  root.OrderMessageBuilder = OrderMessageBuilder;

})(typeof window !== 'undefined' ? window : globalThis);
