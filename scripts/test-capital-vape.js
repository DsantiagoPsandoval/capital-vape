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
['config.js', 'products-data.js', 'cloud-sync.js', 'promotions.js', 'wholesale.js', 'admin.js', 'order-message-builder.js', 'reign-palette-configurator.js', 'cart.js', 'catalog.js'].forEach(file => {
  const code = fs.readFileSync(path.join(__dirname, '../js/' + file), 'utf8')
    .replace(/^const /gm, 'var ')
    .replace(/^let /gm, 'var ');
  vm.runInThisContext(code);
});

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

console.log('\n=============================================');
console.log(`RESULTADOS: ${testsPassed} Pasadas, ${testsFailed} Fallidas`);
console.log('=============================================\n');

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('¡TODAS LAS PRUEBAS SE COMPLETARON CON ÉXITO!');
}
