/**
 * CAPITAL VAPE - Comprehensive Test Suite for Improvements
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 1. Mock Browser Environment
const localStorageData = {};
const mockLocalStorage = {
  getItem: (k) => localStorageData[k] !== undefined ? localStorageData[k] : null,
  setItem: (k, v) => { localStorageData[k] = String(v); },
  removeItem: (k) => { delete localStorageData[k]; },
  clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }
};

const domElements = {};
function createMockElement(id = '', tag = 'div') {
  const el = {
    id,
    tagName: tag.toUpperCase(),
    style: { display: 'none' },
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this._classes.has(c)) this._classes.delete(c);
          else this._classes.add(c);
        } else if (force) {
          this._classes.add(c);
        } else {
          this._classes.delete(c);
        }
      },
      contains(c) { return this._classes.has(c); }
    },
    dataset: {},
    innerHTML: '',
    textContent: '',
    children: [],
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k]; },
    querySelector(sel) {
      if (sel.includes('.flavor-current-tag')) return createMockElement('flavor-tag', 'span');
      if (sel.includes('.product-img-real')) return createMockElement('prod-img', 'img');
      if (sel.includes('.admin-stock-toggle-btn')) return createMockElement('stock-btn', 'button');
      if (sel.includes('.admin-flavor-name')) return { textContent: this.dataset.flavorName || '' };
      if (sel.includes('.admin-flavor-toggle-btn')) return createMockElement('fl-btn', 'button');
      return createMockElement('mock-sub', 'div');
    },
    querySelectorAll(sel) {
      return this.children || [];
    }
  };
  if (id) domElements[id] = el;
  return el;
}

const mockDocument = {
  getElementById: (id) => domElements[id] || createMockElement(id),
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {},
  dispatchEvent: () => {},
  body: { style: {}, classList: { add() {}, remove() {} } }
};

global.window = {
  addEventListener: () => {},
  location: { hash: '' },
  localStorage: mockLocalStorage,
  document: mockDocument
};
global.document = mockDocument;
global.localStorage = mockLocalStorage;
global.CustomEvent = class CustomEvent { constructor(type, detail) { this.type = type; this.detail = detail; } };
global.fetch = async () => ({ ok: false, status: 404, json: async () => ({}) });
global.Toast = { show: (msg, type) => { /* console.log(`[Toast ${type}] ${msg}`); */ } };
global.Image = class { constructor() { setTimeout(() => { if (this.onload) this.onload(); }, 10); } };

// Load application scripts in correct order
['config.js', 'products-data.js', 'db-service.js', 'cloud-sync.js', 'promotions.js', 'wholesale.js', 'admin.js', 'order-message-builder.js', 'reign-palette-configurator.js', 'cart.js', 'catalog.js'].forEach(file => {
  const code = fs.readFileSync(path.join(__dirname, '../js/' + file), 'utf8')
    .replace(/^const /gm, 'var ')
    .replace(/^let /gm, 'var ');
  vm.runInThisContext(code);
});

const DBService = window.DBService || global.DBService;

const OrderMessageBuilder = window.OrderMessageBuilder;
const CloudSyncService = window.CloudSyncService || global.CloudSyncService;
const AdminService = window.AdminService || global.AdminService;
const CatalogController = window.CatalogController || global.CatalogController;
const WholesaleCatalog = window.WholesaleCatalog || global.WholesaleCatalog;
const ReignPaletteConfigurator = window.ReignPaletteConfigurator || global.ReignPaletteConfigurator;
const Cart = window.Cart || global.Cart;
const PRODUCTS_DATA = window.PRODUCTS_DATA || global.PRODUCTS_DATA;

let testsPassed = 0;
let testsFailed = 0;

function assert(cond, desc) {
  if (cond) {
    console.log(`  ✓ PASS: ${desc}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    testsFailed++;
  }
}

console.log('\n=============================================');
console.log('CAPITAL VAPE - SUITE DE PRUEBAS DE VALIDACIÓN');
console.log('=============================================\n');

// ----------------------------------------------------
// TEST SUITE 1: Formato Compacto WhatsApp
// ----------------------------------------------------
console.log('--- TEST SUITE 1: Mensaje Compacto de WhatsApp ---');
const orderSample = {
  customer: {
    nombre: 'Juan Pérez',
    telefono: '3001234567',
    direccion: 'Calle 10 #20-30',
    ciudad: 'Bogotá D.C.',
    destino: 'bogota',
    notas: ''
  },
  detalItems: [
    { productId: 'sample-vape', nombre: 'SAMPLE VAPE', variant: 'Uva', qty: 5, precio: 40000 },
    { productId: 'sample-vape', nombre: 'SAMPLE VAPE', variant: 'Manzana', qty: 2, precio: 40000 },
    { productId: 'sample-vape', nombre: 'SAMPLE VAPE', variant: 'Cereza', qty: 1, precio: 40000 }
  ],
  wsItems: [],
  shipping: { cost: 0, isFree: true },
  total: 320000
};

const msg = OrderMessageBuilder.build(orderSample);
console.log('Mensaje generado:\n' + msg + '\n');

assert(msg.includes('🛒 NUEVO PEDIDO - CAPITAL VAPE'), 'Encabezado con carrito y texto correcto');
assert(msg.includes('👤 Cliente: Juan Pérez'), 'Nombre de cliente sin exceso de saltos');
assert(msg.includes('📱 Teléfono: 3001234567'), 'Teléfono correcto');
assert(msg.includes('📍 Dirección: Calle 10 #20-30 (Bogotá D.C.)'), 'Dirección compacta con ciudad');
assert(msg.includes('• 5x Uva - $40.000 c/u'), 'Cantidad antes del sabor y precio unitario correcto (5x Uva)');
assert(msg.includes('• 2x Manzana - $40.000 c/u'), 'Cantidad antes del sabor y precio unitario correcto (2x Manzana)');
assert(msg.includes('• 1x Cereza - $40.000 c/u'), 'Cantidad antes del sabor y precio unitario correcto (1x Cereza)');
assert(msg.includes('💰 TOTAL: $320.000'), 'Total general exacto $320.000');
assert(!msg.includes('Subtotal:'), 'No incluye subtotales individuales repetidos');
assert(!msg.includes('Cantidad: 5 unidades'), 'No utiliza formato antiguo verboso');

const validation = OrderMessageBuilder.validate(msg);
assert(validation.valid, 'El mensaje pasa la validación sin errores residuales');

// ----------------------------------------------------
// TEST SUITE 2: Ocultar Sabores Desactivados en la Tienda
// ----------------------------------------------------
console.log('\n--- TEST SUITE 2: Ocultar Sabores Desactivados ---');
const reignProd = PRODUCTS_DATA.find(p => p.id === 'reign-bar-palette');
assert(!!reignProd, 'Producto REIGN BAR PALETTE existe en PRODUCTS_DATA');

const initialFlavorsCount = reignProd.sabores.length;
console.log(`Sabores iniciales de REIGN BAR PALETTE: ${initialFlavorsCount}`);

// Administrador desactiva sabor "Strawberry Banana"
AdminService.toggleFlavorStock('reign-bar-palette', 'Strawberry Banana');
assert(AdminService.isFlavorOutOfStock('reign-bar-palette', 'Strawberry Banana') === true, 'Admin detecta sabor como agotado');
assert(reignProd.sabores.find(s => s.nombre === 'Strawberry Banana').agotado === true, 'PRODUCTS_DATA refleja agotado');

// Verificar que en modal y catálogo el sabor NO aparece
CatalogController.activeModalProductId = 'reign-bar-palette';
const modalGrid = createMockElement('flavorModalGrid');
domElements['flavorModalGrid'] = modalGrid;
CatalogController.renderModalFlavors();

assert(!modalGrid.innerHTML.includes('Strawberry Banana'), 'Sabor desactivado no aparece en el modal de sabores');
assert(!modalGrid.innerHTML.includes('❌ AGOTADO'), 'No se muestra etiqueta de agotado porque el sabor está totalmente oculto');

// Verificar ReignPaletteConfigurator
const reignFlavors = ReignPaletteConfigurator.getFlavors();
assert(!reignFlavors.some(f => f.nombre === 'Strawberry Banana'), 'Configurador Reign no incluye sabor desactivado');

// ----------------------------------------------------
// TEST SUITE 3: Persistencia tras Recarga y Reactivación
// ----------------------------------------------------
console.log('\n--- TEST SUITE 3: Persistencia y Sincronización ---');
const cached = localStorage.getItem(CloudSyncService.STORAGE_KEY);
assert(!!cached, 'Datos guardados en localStorage (cv_cloud_catalog_overrides_v2)');
const parsedCache = JSON.parse(cached);
assert(parsedCache.products['reign-bar-palette'].sabores['Strawberry Banana'].agotado === true, 'Override de sabor guardado en caché');

// Simular recarga de página: re-ejecutar init de CloudSync
CloudSyncService.loadFromCache();
CloudSyncService.applyOverridesToMemory();
assert(reignProd.sabores.find(s => s.nombre === 'Strawberry Banana').agotado === true, 'Sabor sigue desactivado tras recargar desde caché');

// Reactivar sabor
AdminService.toggleFlavorStock('reign-bar-palette', 'Strawberry Banana');
assert(AdminService.isFlavorOutOfStock('reign-bar-palette', 'Strawberry Banana') === false, 'Admin detecta sabor como reactivado');
assert(reignProd.sabores.find(s => s.nombre === 'Strawberry Banana').agotado === false, 'PRODUCTS_DATA refleja reactivado');

CatalogController.renderModalFlavors();
assert(modalGrid.innerHTML.includes('Strawberry Banana'), 'Sabor reactivado vuelve a aparecer automáticamente en la tienda');

// ----------------------------------------------------
// TEST SUITE 4: Panel Admin Mantiene Acordeón Abierto
// ----------------------------------------------------
console.log('\n--- TEST SUITE 4: Admin Mantiene Sección de Sabores Abierta ---');
const flavorsBoxId = 'flavorsBox_reign-bar-palette';
const flavorsBoxEl = createMockElement(flavorsBoxId);
flavorsBoxEl.style.display = 'none';
domElements[flavorsBoxId] = flavorsBoxEl;

// Simular que el admin abre el acordeón
AdminService.toggleAccordion(flavorsBoxId);
assert(flavorsBoxEl.style.display === 'block', 'Acordeón de sabores se abre');
assert(AdminService.openAccordions.has(flavorsBoxId), 'AdminService registra acordeón abierto');

// Crear items de sabor dentro de flavorsBox
const flItem1 = createMockElement('item1');
flItem1.classList.add('admin-flavor-item');
const flName1 = createMockElement('name1', 'span');
flName1.classList.add('admin-flavor-name');
flName1.textContent = 'Miami Mint';
const flBtn1 = createMockElement('btn1', 'button');
flBtn1.classList.add('admin-flavor-toggle-btn');
flBtn1.classList.add('state-disponible');
flBtn1.textContent = 'Disponible';
flItem1.children = [flName1, flBtn1];
flItem1.querySelector = (sel) => {
  if (sel.includes('.admin-flavor-name')) return flName1;
  if (sel.includes('.admin-flavor-toggle-btn')) return flBtn1;
  return null;
};

const flItem2 = createMockElement('item2');
flItem2.classList.add('admin-flavor-item');
const flName2 = createMockElement('name2', 'span');
flName2.classList.add('admin-flavor-name');
flName2.textContent = 'Raspberry Lemonade';
const flBtn2 = createMockElement('btn2', 'button');
flBtn2.classList.add('admin-flavor-toggle-btn');
flBtn2.classList.add('state-disponible');
flBtn2.textContent = 'Disponible';
flItem2.children = [flName2, flBtn2];
flItem2.querySelector = (sel) => {
  if (sel.includes('.admin-flavor-name')) return flName2;
  if (sel.includes('.admin-flavor-toggle-btn')) return flBtn2;
  return null;
};

flavorsBoxEl.querySelectorAll = (sel) => {
  if (sel.includes('.admin-flavor-item')) return [flItem1, flItem2];
  return [];
};

// Desactivar Miami Mint
AdminService.toggleFlavorStock('reign-bar-palette', 'Miami Mint');
assert(flavorsBoxEl.style.display === 'block', 'El acordeón de sabores sigue ABIERTO tras desactivar sabor 1');
assert(flBtn1.textContent === 'Agotado', 'Botón de Miami Mint cambia a Agotado');
assert(flItem1.classList.contains('is-out'), 'Item de Miami Mint tiene clase is-out');

// Desactivar Raspberry Lemonade de inmediato sin interrupción
AdminService.toggleFlavorStock('reign-bar-palette', 'Raspberry Lemonade');
assert(flavorsBoxEl.style.display === 'block', 'El acordeón de sabores sigue ABIERTO tras desactivar sabor 2');
assert(flBtn2.textContent === 'Agotado', 'Botón de Raspberry Lemonade cambia a Agotado');
assert(flItem2.classList.contains('is-out'), 'Item de Raspberry Lemonade tiene clase is-out');

// Reactivar ambos
AdminService.toggleFlavorStock('reign-bar-palette', 'Miami Mint');
AdminService.toggleFlavorStock('reign-bar-palette', 'Raspberry Lemonade');
assert(flBtn1.textContent === 'Disponible', 'Botón de Miami Mint restaurado a Disponible');
assert(flBtn2.textContent === 'Disponible', 'Botón de Raspberry Lemonade restaurado a Disponible');

// ----------------------------------------------------
// TEST SUITE 5: Prevención de Compra de Sabores Agotados
// ----------------------------------------------------
console.log('\n--- TEST SUITE 5: Prevención en Carrito ---');
Cart.items = [];
AdminService.toggleFlavorStock('reign-bar-palette', 'Miami Mint'); // Desactivar

Cart.addItem('reign-bar-palette', 'Miami Mint', 1);
assert(Cart.items.length === 0, 'No permite agregar al carrito un sabor desactivado/agotado');

AdminService.toggleFlavorStock('reign-bar-palette', 'Miami Mint'); // Reactivar
Cart.addItem('reign-bar-palette', 'Miami Mint', 1);
assert(Cart.items.length === 1, 'Permite agregar al carrito sabor disponible');

// ----------------------------------------------------
// TEST SUITE 6: Nuevas Referencias DOJO X y AiRMEZ 10000
// ----------------------------------------------------
console.log('\n--- TEST SUITE 6: Nuevas Referencias DOJO X y AiRMEZ 10000 ---');
const dojoXProduct = PRODUCTS_DATA.find(p => p.id === 'dojo-x');
assert(!!dojoXProduct, 'DOJO X existe en PRODUCTS_DATA');
assert(dojoXProduct.precio === 33000, 'DOJO X precio individual es $33.000');
assert(dojoXProduct.precio_promo_2 === 55000, 'DOJO X promo 2x es $55.000');
assert(dojoXProduct.bateria === '1300 mAh', 'DOJO X batería es 1300 mAh');
assert(dojoXProduct.puffs === 20000, 'DOJO X puffs es 20000');
assert(dojoXProduct.sabores.length === 15, 'DOJO X tiene 15 sabores cargados');
for (const s of dojoXProduct.sabores) {
  assert(fs.existsSync(s.img), `DOJO X imagen existe para sabor: ${s.nombre}`);
}

const airmezProduct = PRODUCTS_DATA.find(p => p.id === 'airmez-10000');
assert(!!airmezProduct, 'AiRMEZ 10000 existe en PRODUCTS_DATA');
assert(airmezProduct.precio === 20000, 'AiRMEZ 10000 precio individual es $20.000');
assert(airmezProduct.precio_promo_2 === 32000, 'AiRMEZ 10000 promo 2x es $32.000');
assert(airmezProduct.puffs === 10000, 'AiRMEZ 10000 puffs es 10000');
assert(airmezProduct.sabores.length === 12, 'AiRMEZ 10000 tiene 12 sabores cargados');
for (const s of airmezProduct.sabores) {
  assert(fs.existsSync(s.img), `AiRMEZ 10000 imagen existe para sabor: ${s.nombre}`);
}

// Probar mensaje de WhatsApp con compra combinada de DOJO X y AiRMEZ
const multiOrder = {
  customer: {
    nombre: 'Carlos Gómez',
    telefono: '3159876543',
    direccion: 'Carrera 15 #85-12',
    ciudad: 'Bogotá'
  },
  detalItems: [
    {
      productId: 'dojo-x',
      nombre: 'DOJO X',
      variant: 'Baja Smash',
      qty: 2,
      precio: 27500 // 2x55000 promo
    },
    {
      productId: 'airmez-10000',
      nombre: 'AiRMEZ 10000',
      variant: 'Blue Razz Ice',
      qty: 2,
      precio: 16000 // 2x32000 promo
    }
  ],
  wsItems: [],
  shipping: { cost: 0, isFree: true },
  total: 87000
};

const multiMsg = OrderMessageBuilder.build(multiOrder);
assert(multiMsg.includes('• 2x Baja Smash - $27.500 c/u'), 'Mensaje incluye DOJO X con formato correcto');
assert(multiMsg.includes('• 2x Blue Razz Ice - $16.000 c/u'), 'Mensaje incluye AiRMEZ con formato correcto');
assert(multiMsg.includes('💰 TOTAL: $87.000'), 'Mensaje incluye total combinado exacto');

// ============================================================================
// TEST SUITE 7: Base de Datos de Productos (products & DBService)
// ============================================================================
console.log('\n--- TEST SUITE 7: Base de Datos de Productos ---');
DBService.init();

assert(Array.isArray(DBService.products), 'DBService.products es un arreglo');
assert(DBService.products.length === 40, `DBService contiene los 40 productos migrados (encontrados: ${DBService.products.length})`);

const sampleProd = DBService.getProductById('reign-bar-palette');
assert(sampleProd !== null, 'Producto reign-bar-palette existe en DBService');
assert(sampleProd.name === 'REIGN BAR PALETTE', 'Campo name correcto');
assert(sampleProd.brand === 'REIGN', 'Campo brand detectado y asignado correctamente');
assert(sampleProd.category === 'desechables', 'Campo category correcto');
assert(typeof sampleProd.price === 'number' && sampleProd.price === 40000, 'Campo price es numérico y exacto (40000)');
assert(sampleProd.price_two_units === 70000, 'Campo price_two_units promocional correcto (70000)');
assert(typeof sampleProd.wholesale_prices === 'object', 'Campo wholesale_prices es un objeto con tarifas');
assert(sampleProd.wholesale_prices['5'] === 25000, 'Tarifa mayorista 5 uds correcta (25000)');
assert(sampleProd.wholesale_prices['10'] === 19500, 'Tarifa mayorista 10 uds correcta (19500)');
assert(sampleProd.wholesale_prices['100'] === 17500, 'Tarifa mayorista 100 uds correcta (17500)');
assert(typeof sampleProd.stock === 'number', 'Campo stock es numérico');
assert(typeof sampleProd.status === 'string' && sampleProd.status === 'disponible', 'Campo status es "disponible"');
assert(sampleProd.is_available === true, 'Columna generada is_available es true');
assert(typeof sampleProd.created_at === 'string' && typeof sampleProd.updated_at === 'string', 'Timestamps created_at y updated_at presentes');

// Creación de nuevo producto
const newProdData = {
  name: 'VAPOR MAX 30K TEST',
  brand: 'VAPOR MAX',
  category: 'desechables',
  price: 45000,
  price_two_units: 80000,
  stock: 25,
  status: 'disponible',
  wholesale_prices: { '5': 30000, '10': 25000, '20': 23000, '50': 21000, '100': 19000 },
  description: 'Producto creado en pruebas de base de datos'
};

const created = DBService.createProduct(newProdData, 'AdminTester');
assert(created && created.id === 'vapor-max-30k-test', 'Nuevo producto creado con ID único slug');
assert(DBService.getProductById('vapor-max-30k-test') !== null, 'Nuevo producto recuperable mediante getProductById');
assert(DBService.products.length === 41, 'Conteo total de productos incrementado a 41');

// ============================================================================
// TEST SUITE 8: Historial de Cambios de Precios e Inmutabilidad (price_history)
// ============================================================================
console.log('\n--- TEST SUITE 8: Historial de Cambios de Precios e Inmutabilidad ---');
const initialHistoryCount = DBService.getPriceHistory('vapor-max-30k-test').length;
assert(initialHistoryCount >= 1, 'Registro inicial en price_history creado al dar de alta el producto');

// Modificar precio individual
DBService.updatePrice('vapor-max-30k-test', 40000, 75000, 'AdminTester', 'Descuento promocional fin de mes');
const updatedProd = DBService.getProductById('vapor-max-30k-test');
assert(updatedProd.price === 40000, 'Precio individual actualizado a 40000');
assert(updatedProd.price_two_units === 75000, 'Precio promo 2 unidades actualizado a 75000');

const historyAfterPrice = DBService.getPriceHistory('vapor-max-30k-test');
assert(historyAfterPrice.length === initialHistoryCount + 1, 'Se generó un NUEVO registro de historial sin sobrescribir el anterior');
const latestPriceHist = historyAfterPrice[0];
assert(latestPriceHist.old_price === 45000, 'Precio anterior guardado correctamente (45000)');
assert(latestPriceHist.new_price === 40000, 'Precio nuevo guardado correctamente (40000)');
assert(latestPriceHist.diffPrice === -5000, 'Diferencial de precio calculado con exactitud (-5000)');
assert(latestPriceHist.diffPriceFormatted === '-$5.000', 'Diferencial de precio formateado (-$5.000)');
assert(latestPriceHist.admin_user === 'AdminTester', 'Administrador que realizó el cambio registrado (AdminTester)');
assert(latestPriceHist.change_reason.includes('Descuento promocional'), 'Motivo del cambio almacenado');

// Modificar precios mayoristas
DBService.updateWholesalePrices('vapor-max-30k-test', { '5': 28000, '10': 23000 }, 'AdminTester', 'Reajuste mayorista');
const historyAfterWs = DBService.getPriceHistory('vapor-max-30k-test');
assert(historyAfterWs.length === initialHistoryCount + 2, 'Historial registra ajuste de tarifas mayoristas como un nuevo registro inmutable');
assert(historyAfterWs[0].new_wholesale_prices['5'] === 28000, 'Nuevas tarifas mayoristas almacenadas en el historial');

// ============================================================================
// TEST SUITE 9: Control de Disponibilidad (4 Estados)
// ============================================================================
console.log('\n--- TEST SUITE 9: Control de Disponibilidad (4 Estados) ---');

// 1. Estado Agotado
DBService.updateStatus('vapor-max-30k-test', 'agotado', 'AdminTester', 'Sin existencias en bodega');
const prodAgotado = DBService.getProductById('vapor-max-30k-test');
assert(prodAgotado.status === 'agotado', 'Estado cambiado a "agotado"');
assert(prodAgotado.is_available === false, 'is_available es false cuando status es agotado');

// Debe seguir apareciendo en el catálogo pero no permitir agregar al carrito
const catalogVisibleProds = DBService.getProducts({ includeDeleted: false });
assert(catalogVisibleProds.some(p => p.id === 'vapor-max-30k-test'), 'Producto agotado sigue presente en el catálogo');

let addedToCart = false;
try {
  Cart.addItem(prodAgotado, 'Default', 1);
} catch (e) {}
assert(!Cart.items.some(i => i.productId === 'vapor-max-30k-test'), 'Carrito bloquea agregar producto agotado');

// 2. Estado Descontinuado (Eliminación lógica)
DBService.softDeleteProduct('vapor-max-30k-test', 'AdminTester', 'Referencia descontinuada por el fabricante');
const prodDeleted = DBService.getProductById('vapor-max-30k-test');
assert(prodDeleted.is_deleted === true, 'Eliminación lógica activada (is_deleted = true)');
assert(prodDeleted.status === 'descontinuado', 'Estado cambiado a "descontinuado"');

const publicCatalog = DBService.getProducts({ includeDeleted: false });
assert(!publicCatalog.some(p => p.id === 'vapor-max-30k-test'), 'Producto descontinuado NO aparece en catálogo público');

const adminCatalog = DBService.getProducts({ includeDeleted: true });
assert(adminCatalog.some(p => p.id === 'vapor-max-30k-test'), 'Producto descontinuado sigue presente en consulta administrativa');

// Historial completo sigue existiendo
const histAfterDelete = DBService.getPriceHistory('vapor-max-30k-test');
assert(histAfterDelete.length >= 4, 'Todo el historial de precios se conserva intacto tras descontinuar el producto');

// 3. Reactivación sin volver a crear el producto
DBService.restoreProduct('vapor-max-30k-test', 'AdminTester', 'Llegó nuevo contenedor');
const prodRestored = DBService.getProductById('vapor-max-30k-test');
assert(prodRestored.is_deleted === false, 'Producto reactivado exitosamente (is_deleted = false)');
assert(prodRestored.status === 'disponible', 'Estado restaurado a "disponible"');
assert(DBService.getProducts({ includeDeleted: false }).some(p => p.id === 'vapor-max-30k-test'), 'Producto reactivado vuelve a aparecer en el catálogo público');

// 4. Estado Oculto Temporalmente
DBService.updateStatus('vapor-max-30k-test', 'oculto_temporalmente', 'AdminTester', 'Oculto por sesión fotográfica');
assert(DBService.getProductById('vapor-max-30k-test').status === 'oculto_temporalmente', 'Estado oculto_temporalmente asignado');

// ============================================================================
// TEST SUITE 10: Gestión de Precios Mayoristas Dinámicos por Cantidad
// ============================================================================
console.log('\n--- TEST SUITE 10: Precios Mayoristas Dinámicos ---');
// Limpiar producto de prueba para dejar el catálogo limpio
DBService.products = DBService.products.filter(p => p.id !== 'vapor-max-30k-test');
DBService.saveToStorage();

// Probar lectura dinámica de mayoristas desde DB
const reignDbProd = DBService.getProductById('reign-bar-palette');
assert(reignDbProd.wholesale_prices['5'] === 25000, 'Tarifa mayorista 5 uds en DB es $25.000');
assert(reignDbProd.wholesale_prices['10'] === 19500, 'Tarifa mayorista 10 uds en DB es $19.500');
assert(reignDbProd.wholesale_prices['20'] === 18500, 'Tarifa mayorista 20 uds en DB es $18.500');
assert(reignDbProd.wholesale_prices['50'] === 18000, 'Tarifa mayorista 50 uds en DB es $18.000');
assert(reignDbProd.wholesale_prices['100'] === 17500, 'Tarifa mayorista 100 uds en DB es $17.500');

const unitP5 = WholesaleService.getProductWholesaleUnitPrice('reign-bar-palette', 7);
assert(unitP5 === 25000, 'WholesaleService devuelve tarifa de rango 5 para 7 unidades');
const unitP10 = WholesaleService.getProductWholesaleUnitPrice('reign-bar-palette', 12);
assert(unitP10 === 19500, 'WholesaleService devuelve tarifa de rango 10 para 12 unidades');
const unitP100 = WholesaleService.getProductWholesaleUnitPrice('reign-bar-palette', 150);
assert(unitP100 === 17500, 'WholesaleService devuelve tarifa de rango 100 para 150 unidades');

// ============================================================================
// TEST SUITE 11: Seguridad y Validación Frontend/Backend
// ============================================================================
console.log('\n--- TEST SUITE 11: Seguridad y Validación contra Manipulación ---');

// Simular un ataque en el navegador donde un usuario altera el precio a $1
const tamperedCartItems = [
  {
    productId: 'dojo-x',
    nombre: 'DOJO X',
    precio: 1, // Intentó modificarlo en devtools
    unitPrice: 1,
    qty: 2,
    type: 'detal'
  }
];

const validationResult = DBService.validateCartItems(tamperedCartItems);
assert(validationResult.valid === false, 'El sistema detecta precio adulterado en el carrito');
assert(validationResult.correctedItems[0].unitPrice === 33000, 'El sistema corrige el precio al valor oficial de la base de datos ($33.000)');
assert(validationResult.correctedItems[0].subtotal === 66000, 'El subtotal se recalcula al valor oficial seguro ($66.000)');

// ============================================================================
// TEST SUITE 12: Preservación del Orden Curado Oficial (No Alfabético)
// ============================================================================
console.log('\n--- TEST SUITE 12: Orden Curado Oficial de Referencias ---');

const catalogList = CatalogController.getFilteredAndSortedProducts();
assert(catalogList[0].id === 'reign-bar-palette', 'Primer producto del catálogo es REIGN BAR PALETTE');
assert(catalogList[1].id === 'u-pends-up9', 'Segundo producto del catálogo es U-PENDS UP9');
assert(catalogList[2].id === 'dojo-x', 'Tercer producto del catálogo es DOJO X');
assert(catalogList[3].id === 'airmez-10000', 'Cuarto producto del catálogo es AiRMEZ 10000');
assert(catalogList[4].id === 'nimmbox-flvx', 'Quinto producto del catálogo es Nimmbox FLVX');
assert(catalogList[5].id === 'bang-leader', 'Sexto producto del catálogo es BANG LEADER');
assert(catalogList[6].id === 'dojo', 'Séptimo producto del catálogo es DOJO SPHERE S 40K');

const wholesaleList = WholesaleCatalog.getProducts();
assert(wholesaleList[0].id === 'reign-bar-palette', 'Primer producto mayorista es REIGN BAR PALETTE');
assert(wholesaleList[1].id === 'u-pends-up9', 'Segundo producto mayorista es U-PENDS UP9');
assert(wholesaleList[2].id === 'dojo-x', 'Tercer producto mayorista es DOJO X');

// Probar reordenamiento de lista desordenada/alfabética
const jumbled = [...DBService.products].sort((a, b) => a.name.localeCompare(b.name));
const reordered = DBService.sortProductsByCuratedOrder(jumbled);
assert(reordered[0].id === 'reign-bar-palette', 'sortProductsByCuratedOrder restaura REIGN BAR PALETTE a la posición 1');
assert(reordered[1].id === 'u-pends-up9', 'sortProductsByCuratedOrder restaura U-PENDS UP9 a la posición 2');
assert(reordered[2].id === 'dojo-x', 'sortProductsByCuratedOrder restaura DOJO X a la posición 3');


console.log('\n=============================================');
console.log(`RESULTADOS: ${testsPassed} Pasadas, ${testsFailed} Fallidas`);
console.log('=============================================\n');

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('¡TODAS LAS PRUEBAS SE COMPLETARON CON ÉXITO!');
}
