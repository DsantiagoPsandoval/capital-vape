/**
 * CAPITAL VAPE - Configuración Oficial
 */
const CONFIG = {
  APP_NAME: 'CAPITAL VAPE',
  TAGLINE: 'Vapes Premium & Distribución Mayorista en Colombia',
  WHATSAPP_PRIMARY: '573248012914',
  WHATSAPP_SECONDARY: '573132612344',
  LOCATION: 'Bogotá D.C., Colombia',
  HOURS: 'Lunes a Sábado: 9:00 AM - 8:00 PM',
  SHIPPING: {
    BOGOTA_FREE_THRESHOLD: 150000,
    BOGOTA_STANDARD_COST: 10000,
    NACIONAL_FREE_THRESHOLD: 220000,
    NACIONAL_STANDARD_COST: 18000
  },
  STORAGE_KEYS: {
    CART: 'cv_cart_items_v2',
    SHIPPING_DEST: 'cv_shipping_dest_v2',
    WHOLESALE_AUTH: 'wholesaleAuthenticated',
    THEME: 'cv_theme'
  },
  SOCIAL: {
    INSTAGRAM: 'https://www.instagram.com/capitalvap/',
    TIKTOK: 'https://www.tiktok.com/@capital..vape'
  }
};

window.CONFIG = CONFIG;
