/**
 * CAPITAL VAPE - Motor Oficial de Promociones Globales por Menor Ahorro
 *
 * REGLA INNEGOCIABLE:
 * El descuento NO se aplica individualmente a cada producto ni se suman los ahorros.
 * El descuento se calcula globalmente al final del pedido al detal.
 * Si el cliente compra 2 o más unidades de referencias elegibles (pueden ser iguales o diferentes),
 * se identifica el ahorro de referencia de cada una (2 * precio - precio_promo_2)
 * y se aplica UNA SOLA VEZ el menor ahorro positivo al subtotal general.
 */
(function(root) {
  'use strict';

  const PromotionEngine = {
    /**
     * Obtiene el producto desde PRODUCTS_DATA si está disponible
     */
    getProductData(productId) {
      if (typeof PRODUCTS_DATA === 'undefined' || !Array.isArray(PRODUCTS_DATA)) return null;
      return PRODUCTS_DATA.find(p => p && p.id === productId) || null;
    },

    /**
     * Calcula el ahorro promocional de referencia de un producto (2 * precio regular - precio_promo_2).
     * Retorna 0 si el producto no tiene promoción de 2 unidades o no genera ahorro positivo.
     */
    calculateReferenceSavings(productOrId) {
      const prod = (typeof productOrId === 'string') ? this.getProductData(productOrId) : productOrId;
      if (!prod) return 0;

      const regularPrice = Number(prod.precio) || 0;
      const promo2Price = Number(prod.precio_promo_2) || 0;

      if (regularPrice > 0 && promo2Price > 0 && promo2Price < regularPrice * 2) {
        return (regularPrice * 2) - promo2Price;
      }
      return 0;
    },

    /**
     * Comprueba si una referencia es elegible para la promoción combinada
     */
    isProductEligible(productOrId) {
      return this.calculateReferenceSavings(productOrId) > 0;
    },

    /**
     * Filtra los productos elegibles dentro de un arreglo de items
     */
    getEligibleProducts(items) {
      if (!Array.isArray(items)) return [];
      return items.filter(item => {
        if (!item || item.type === 'mayorista' || item.wholesale === true) return false;
        return this.isProductEligible(item.productId || item);
      });
    },

    /**
     * Calcula el descuento global por menor ahorro para una lista de productos al detal.
     */
    calculateGlobalDiscount(detalItems) {
      const items = Array.isArray(detalItems) ? detalItems : [];
      let normalSubtotal = 0;
      let totalEligibleQty = 0;
      const refMap = {};

      items.forEach(item => {
        if (!item) return;
        const prod = this.getProductData(item.productId) || item;
        const unitPrice = Number(item.precio || (prod && prod.precio) || 0);
        const qty = Number(item.qty) || 0;
        normalSubtotal += unitPrice * qty;

        const savings = this.calculateReferenceSavings(prod);
        if (savings > 0 && qty > 0) {
          totalEligibleQty += qty;
          const refId = prod.id || item.productId || item.nombre;
          if (!refMap[refId]) {
            refMap[refId] = {
              id: refId,
              nombre: (prod && prod.nombre) || item.nombre || refId,
              precio: unitPrice,
              precio_promo_2: (prod && prod.precio_promo_2) || 0,
              savings: savings,
              qty: 0
            };
          }
          refMap[refId].qty += qty;
        }
      });

      const eligibleReferences = Object.values(refMap);

      // Condición: Se requieren al menos 2 unidades en total entre referencias elegibles
      const isEligible = totalEligibleQty >= 2 && eligibleReferences.length > 0;

      let minSavings = 0;
      let selectedRef = null;

      if (isEligible) {
        // Ordenar de menor a mayor ahorro de referencia
        eligibleReferences.sort((a, b) => a.savings - b.savings);
        minSavings = eligibleReferences[0].savings;
        selectedRef = eligibleReferences[0];
      }

      const discount = isEligible ? minSavings : 0;
      const finalSubtotal = Math.max(0, normalSubtotal - discount);

      return {
        hasPromo: isEligible,
        isEligible: isEligible,
        normalSubtotal: normalSubtotal,
        totalEligibleQty: totalEligibleQty,
        eligibleReferences: eligibleReferences,
        selectedRef: selectedRef,
        discount: discount,
        finalSubtotal: finalSubtotal
      };
    }
  };

  root.PromotionEngine = PromotionEngine;

})(typeof window !== 'undefined' ? window : globalThis);
