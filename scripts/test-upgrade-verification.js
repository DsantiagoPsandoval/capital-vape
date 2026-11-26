/**
 * CAPITAL VAPE — SUITE DE PRUEBAS DE VERIFICACIÓN DE LA ACTUALIZACIÓN INTEGRAL
 * Valida:
 * 1. Verificación +18 (Age Verification)
 * 2. Selector de Tiendas (Store Selector: Retail vs Mayorista)
 * 3. Acceso Mayorista por Contraseña (CV-MAYORISTA-2026)
 * 4. Menú Lateral Izquierdo (5 opciones, redes sociales, sin 'Mi Cuenta')
 * 5. Separación estricta de Catálogos (Retail vs Mayorista)
 * 6. Carritos 100% Independientes (cv_cart_retail_v3 vs cv_cart_wholesale_v3)
 * 7. Conservación Absoluta de la Calculadora Mayorista Existente
 * 8. Panel de Administración con 8 Pestañas, Subida de Imágenes y Duplicación
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('\n============================================================');
console.log('CAPITAL VAPE — PRUEBAS DE ACTUALIZACIÓN INTEGRAL 2026');
console.log('============================================================\n');

let passCount = 0;
let failCount = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
    failCount++;
  }
}

// Cargar archivos clave para inspección y simulación
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const storeModeJs = fs.readFileSync(path.join(__dirname, '../js/store-mode.js'), 'utf8');
const cartJs = fs.readFileSync(path.join(__dirname, '../js/cart.js'), 'utf8');
const wholesaleJs = fs.readFileSync(path.join(__dirname, '../js/wholesale.js'), 'utf8');
const adminJs = fs.readFileSync(path.join(__dirname, '../js/admin.js'), 'utf8');
const dbServiceJs = fs.readFileSync(path.join(__dirname, '../js/db-service.js'), 'utf8');

// --- 1. VERIFICACIÓN DE MAYORÍA DE EDAD (+18) ---
console.log('--- 1. Pantalla 1: Verificación de Mayoría de Edad (+18) ---');
it('Contiene overlay de age-gate con botones de confirmación y rechazo', () => {
  assert(indexHtml.includes('id="ageVerificationOverlay"'), 'Falta ageVerificationOverlay');
  assert(indexHtml.includes('id="btnAgeConfirm"'), 'Falta btnAgeConfirm');
  assert(indexHtml.includes('id="btnAgeReject"'), 'Falta btnAgeReject');
  assert(indexHtml.includes('SÍ, SOY MAYOR DE 18 AÑOS'), 'Texto confirmación incorrecto');
  assert(indexHtml.includes('NO, SOY MENOR DE 18 AÑOS'), 'Texto rechazo incorrecto');
});

it('Cita la legislación oficial colombiana de protección a menores (+18)', () => {
  assert(indexHtml.includes('Ley 124 de 1994') || indexHtml.includes('Ley 2354 de 2024'), 'Falta legislación colombiana');
});

// --- 2. SELECTOR DE TIENDAS ---
console.log('\n--- 2. Pantalla 2: Selector de Tiendas (Retail vs Mayorista) ---');
it('Contiene el selector modal con tarjeta Retail y tarjeta Mayorista', () => {
  assert(indexHtml.includes('id="storeSelectorOverlay"'), 'Falta storeSelectorOverlay');
  assert(indexHtml.includes('TIENDA RETAIL'), 'Falta tarjeta TIENDA RETAIL');
  assert(indexHtml.includes('CATÁLOGO MAYORISTA'), 'Falta tarjeta CATÁLOGO MAYORISTA');
  assert(indexHtml.includes('StoreMode.enterRetail()'), 'Falta acción enterRetail');
  assert(indexHtml.includes('StoreMode.enterWholesale()'), 'Falta acción enterWholesale');
});

// --- 3. ACCESO MAYORISTA MEDIANTE CONTRASEÑA ---
console.log('\n--- 3. Pantalla 3: Acceso Mayorista por Contraseña ---');
it('Contiene modal de contraseña mayorista con campo, botón ver/ocultar y volver', () => {
  assert(indexHtml.includes('id="wholesaleAccessModal"'), 'Falta wholesaleAccessModal');
  assert(indexHtml.includes('id="wholesalePassModalInput"'), 'Falta wholesalePassModalInput');
  assert(indexHtml.includes('StoreMode.togglePasswordVisibility()'), 'Falta togglePasswordVisibility');
  assert(indexHtml.includes('StoreMode.backToSelectorFromPassword()'), 'Falta backToSelectorFromPassword');
});

it('Valida la contraseña oficial mayorista CV-MAYORISTA-2026', () => {
  assert(wholesaleJs.includes('CV-MAYORISTA-2026'), 'Wholesale no incluye clave oficial');
  assert(dbServiceJs.includes('CV-MAYORISTA-2026'), 'DBService no incluye clave oficial');
});

// --- 4. MENÚ LATERAL IZQUIERDO ---
console.log('\n--- 4. Menú Lateral Izquierdo ---');
it('Contiene las 5 opciones requeridas: Inicio, Categorías, Promociones, Contacto, Mi Carrito', () => {
  assert(indexHtml.includes('id="sidebarNav"'), 'Falta sidebarNav');
  assert(indexHtml.includes('INICIO'), 'Falta opción INICIO');
  assert(indexHtml.includes('CATEGORÍAS'), 'Falta opción CATEGORÍAS');
  assert(indexHtml.includes('PROMOCIONES'), 'Falta opción PROMOCIONES');
  assert(indexHtml.includes('CONTACTO'), 'Falta opción CONTACTO');
  assert(indexHtml.includes('MI CARRITO'), 'Falta opción MI CARRITO');
});

it('NO contiene ninguna opción de "Mi cuenta", "Login de clientes" ni perfiles', () => {
  assert(!indexHtml.includes('Mi cuenta'), 'No debe existir Mi cuenta');
  assert(!indexHtml.includes('Mi Cuenta'), 'No debe existir Mi Cuenta');
  assert(!indexHtml.includes('Iniciar sesión cliente'), 'No debe existir login de clientes');
});

it('Contiene redes sociales oficiales (Instagram, TikTok, WhatsApp)', () => {
  assert(indexHtml.includes('instagram.com/capitalvap'), 'Falta enlace Instagram oficial');
  assert(indexHtml.includes('tiktok.com/@capital..vape'), 'Falta enlace TikTok oficial');
  assert(indexHtml.includes('3133572726'), 'Falta WhatsApp oficial');
});

// --- 5. CATÁLOGOS Y CARRITOS INDEPENDIENTES ---
console.log('\n--- 5. Catálogos y Carritos Independientes ---');
it('Divide la interfaz en retailStoreView y wholesaleStoreView', () => {
  assert(indexHtml.includes('id="retailStoreView"'), 'Falta retailStoreView');
  assert(indexHtml.includes('id="wholesaleStoreView"'), 'Falta wholesaleStoreView');
});

it('El carrito usa almacenamiento separado e independiente para Retail y Mayorista', () => {
  assert(cartJs.includes('cv_cart_retail_v3'), 'Falta clave de carrito retail');
  assert(cartJs.includes('cv_cart_wholesale_v3'), 'Falta clave de carrito mayorista');
  assert(cartJs.includes('isRetailMode') || cartJs.includes('StoreMode.getMode()'), 'Falta lógica de separación en carrito');
});

// --- 6. CALCULADORA MAYORISTA EXISTENTE CONSERVADA INTACTA ---
console.log('\n--- 6. Calculadora Mayorista Intacta ---');
it('Conserva exactamente los elementos del DOM de la calculadora mayorista', () => {
  assert(indexHtml.includes('class="ws-budget-bar-card"'), 'Falta ws-budget-bar-card');
  assert(indexHtml.includes('id="wsBudgetForm"'), 'Falta wsBudgetForm');
  assert(indexHtml.includes('id="wsBudgetInput"'), 'Falta wsBudgetInput');
  assert(indexHtml.includes('id="wsBudgetClearBtn"'), 'Falta wsBudgetClearBtn');
  assert(indexHtml.includes('id="wsBudgetActiveNotice"'), 'Falta wsBudgetActiveNotice');
});

it('Conserva exactamente las fórmulas y lógica de cálculo de WholesaleService', () => {
  assert(wholesaleJs.includes('calculateMaxUnitsForBudget'), 'Falta calculateMaxUnitsForBudget');
  assert(wholesaleJs.includes('wsBudgetInput'), 'Falta wsBudgetInput');
  assert(wholesaleJs.includes('currentBudget'), 'Falta currentBudget');
  assert(wholesaleJs.includes('{ tier: 100, min: 100, max: Infinity }'), 'Faltan los tramos oficiales de la calculadora');
  assert(wholesaleJs.includes('{ tier: 5, min: 5, max: 9 }'), 'Falta tramo base de 5 unidades');
});

// --- 7. PANEL DE ADMINISTRACIÓN MEJORADO ---
console.log('\n--- 7. Panel de Administración con 8 Pestañas e Imágenes ---');
it('AdminService incluye las 8 pestañas organizadas', () => {
  assert(adminJs.includes('data-tab="dashboard"'), 'Falta pestaña dashboard');
  assert(adminJs.includes('data-tab="productos"'), 'Falta pestaña productos');
  assert(adminJs.includes('data-tab="imagenes"'), 'Falta pestaña imagenes');
  assert(adminJs.includes('data-tab="precios-retail"'), 'Falta pestaña precios-retail');
  assert(adminJs.includes('data-tab="precios-mayoristas"'), 'Falta pestaña precios-mayoristas');
  assert(adminJs.includes('data-tab="inventario"'), 'Falta pestaña inventario');
  assert(adminJs.includes('data-tab="pedidos"'), 'Falta pestaña pedidos');
  assert(adminJs.includes('data-tab="configuracion"'), 'Falta pestaña configuracion');
});

it('AdminService implementa subida de imágenes desde dispositivo con FileReader y preview', () => {
  assert(adminJs.includes('handleImageFileUpload'), 'Falta handleImageFileUpload');
  assert(adminJs.includes('handleModalImageFile'), 'Falta handleModalImageFile');
  assert(adminJs.includes('readAsDataURL'), 'Falta FileReader.readAsDataURL');
});

it('AdminService implementa la duplicación de productos', () => {
  assert(adminJs.includes('duplicateProduct(productId)'), 'Falta duplicateProduct');
  assert(indexHtml.includes('adminProductModal'), 'Falta modal de producto admin');
});

console.log('\n============================================================');
console.log(`RESULTADOS: ${passCount} Pasadas, ${failCount} Fallidas`);
console.log('============================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('¡TODAS LAS PRUEBAS DE LA ACTUALIZACIÓN PASARON SATISFACTORIAMENTE!\n');
}
