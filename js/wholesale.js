/**
 * CAPITAL VAPE - Módulo de Seguridad y Precios Mayoristas
 * Protección criptográfica por SHA-256 (sin exponer claves en claro).
 */
const WholesaleService = {
  // Hashes SHA-256 autorizados para acceso distribuidor
  AUTHORIZED_HASHES: [
    'fad24d05c1a2a7f7e216838eaae08badbf21d51d9d7852644eeb0064dee58b38',
    'f9e5781a7b1b369c3a218d6e32bc1f609e3bb8e792cce5c24e0b57ea329598ee',
    'd0aa4ef2df077a83d47d4e3cb3c2ca0c4ec3e69f88d227f29bb46faec992ecbe'
  ],

  isUnlocked() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.WHOLESALE_AUTH) === 'true';
  },

  async verifyCode(inputCode) {
    const clean = (inputCode || '').trim().toUpperCase();
    if (!clean) return { success: false, message: 'Por favor ingresa un código de distribuidor.' };

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(clean);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (this.AUTHORIZED_HASHES.includes(hashHex)) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.WHOLESALE_AUTH, 'true');
        return {
          success: true,
          message: '✓ Código verificado con éxito. Bienvenido al portal mayorista de Capital Vape.'
        };
      }
    } catch (e) {
      console.error(e);
    }

    return {
      success: false,
      message: 'El código ingresado no es válido o no está activo.'
    };
  },

  lock() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.WHOLESALE_AUTH);
  },

  getWholesaleWhatsAppUrl() {
    const text = encodeURIComponent('Hola Capital Vape, soy comerciante/distribuidor y deseo solicitar un código de acceso para consultar y comprar con precios mayoristas.');
    return `https://wa.me/${CONFIG.WHATSAPP_PRIMARY}?text=${text}`;
  }
};

window.WholesaleService = WholesaleService;
