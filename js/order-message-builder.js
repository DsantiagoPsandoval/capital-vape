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
     * Construye el texto del pedido con la plantilla oficial unificada y compacta.
     */
    build(orderData) {
      const customer = orderData.customer || {};
      const detalItems = Array.isArray(orderData.detalItems) ? orderData.detalItems : [];
      const wsItems = Array.isArray(orderData.wsItems) ? orderData.wsItems : [];
      const total = Number(orderData.total) || 0;
      const shipping = orderData.shipping || {};
      const promoDetails = orderData.promoDetails;

      const nombre = this.cleanText(customer.nombre || '');
      const telefono = this.cleanText(customer.telefono || '');
      const direccion = this.cleanText(customer.direccion || '');
      const ciudad = this.cleanText(customer.ciudad || '');
      const depto = this.cleanText(customer.depto || '');
      const destino = customer.destino || 'bogota';
      const notas = this.cleanText(customer.notas || '');

      let ciudadStr = ciudad;
      if (destino === 'soacha' && !ciudadStr.toLowerCase().includes('soacha')) {
        ciudadStr = ciudadStr ? `${ciudadStr} (Soacha)` : 'Soacha';
      } else if (depto && !ciudadStr.toLowerCase().includes(depto.toLowerCase())) {
        ciudadStr = ciudadStr ? `${ciudadStr}, ${depto}` : depto;
      }

      const lines = [];

      // 1. ENCABEZADO
      lines.push(`${EMOJI.CART} NUEVO PEDIDO - CAPITAL VAPE`);
      lines.push('');

      // 2. DATOS DEL CLIENTE (compacto, sin saltos de línea innecesarios entre campos)
      if (nombre) lines.push(`${EMOJI.USER} Cliente: ${nombre}`);
      if (telefono) lines.push(`${EMOJI.PHONE} Teléfono: ${telefono}`);
      if (direccion) {
        if (ciudadStr) {
          lines.push(`${EMOJI.PIN} Dirección: ${direccion} (${ciudadStr})`);
        } else {
          lines.push(`${EMOJI.PIN} Dirección: ${direccion}`);
        }
      } else if (ciudadStr) {
        lines.push(`${EMOJI.CITY} Ciudad: ${ciudadStr}`);
      }
      if (notas) lines.push(`${EMOJI.NOTE} Notas: ${notas}`);

      lines.push('');

      // 3. PRODUCTOS
      lines.push(`${EMOJI.PACKAGE} PRODUCTOS:`);

      // Agrupar items por referencia de producto
      const processItems = (items) => {
        const groups = {};
        items.forEach(item => {
          const pId = item.productId || item.nombre;
          if (!groups[pId]) {
            groups[pId] = {
              nombre: this.cleanText(item.nombre),
              items: []
            };
          }
          groups[pId].items.push(item);
        });
        return Object.values(groups);
      };

      const allProductGroups = [...processItems(detalItems), ...processItems(wsItems)];

      allProductGroups.forEach(group => {
        lines.push(`*${group.nombre}*`);
        group.items.forEach(item => {
          const qty = Number(item.qty) || 1;
          const unitPrice = Number(item.unitPrice || item.precio) || 0;
          const isDual = item.isDualFlavor === true || (item.productId === 'reign-bar-palette' && item.isDualFlavor !== false && item.variant && item.variant.includes(' + '));
          
          let flavorLabel = '';
          if (isDual) {
            const f1 = this.cleanText(item.flavor1 || (item.variant && item.variant.includes(' + ') ? item.variant.split(' + ')[0].trim() : item.variant || ''));
            const f2 = this.cleanText(item.flavor2 || (item.variant && item.variant.includes(' + ') ? item.variant.split(' + ')[1].trim() : f1));
            flavorLabel = `${f1} + ${f2}`;
          } else {
            flavorLabel = this.cleanText(item.variant || '');
          }

          if (!flavorLabel || flavorLabel.toLowerCase() === group.nombre.toLowerCase()) {
            flavorLabel = 'Estándar';
          }

          // Formato solicitado: • [cantidad]x [sabor] - [precio unitario] c/u
          lines.push(`• ${qty}x ${flavorLabel} - ${this.formatCOP(unitPrice)} c/u`);
        });
      });

      // Descuento promocional si aplica
      if (promoDetails && promoDetails.hasPromo && promoDetails.discount > 0) {
        lines.push('');
        lines.push(`${EMOJI.FIRE} Descuento Promo: -${this.formatCOP(promoDetails.discount)}`);
      }

      // Costo de envío si aplica
      if (shipping && shipping.cost > 0) {
        lines.push(`${EMOJI.TRUCK} Envío: ${this.formatCOP(shipping.cost)}`);
      }

      lines.push('');

      // 4. TOTAL GENERAL
      lines.push(`${EMOJI.MONEY} TOTAL: ${this.formatCOP(total)}`);

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
        errors.push('Se detectó carácter corrupto de reemplazo Unicode.');
      }
      if (/&#[0-9a-fx]+;/i.test(msg) || /&[a-z]{2,8};/i.test(msg)) {
        errors.push('Se detectaron entidades HTML residuales en el mensaje.');
      }
      if (/\\+\*/.test(msg)) {
        errors.push('Se detectaron barras invertidas escapando asteriscos.');
      }
      if (!msg.includes('NUEVO PEDIDO - CAPITAL VAPE')) {
        errors.push('Falta el encabezado principal del pedido.');
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
