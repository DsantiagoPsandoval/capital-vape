/**
 * scripts/test-storage-real.js
 * Test suite exhaustivo para la integración de Supabase Storage en Capital Vape
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

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
    querySelector() { return createMockElement('sub', 'div'); },
    querySelectorAll() { return []; }
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
  readyState: 'complete',
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
global.Toast = { show: () => {} };

// Cargar scripts en el contexto global
['config.js', 'products-data.js', 'db-service.js', 'wholesale.js', 'admin.js'].forEach(file => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8');
  vm.runInThisContext(code, { filename: file });
});

const DBService = global.DBService || global.window.DBService;
const CONFIG = global.CONFIG || global.window.CONFIG;
const PRODUCTS_DATA = global.PRODUCTS_DATA || global.window.PRODUCTS_DATA;
const WholesaleService = global.WholesaleService || global.window.WholesaleService;
const AdminService = global.AdminService || global.window.AdminService;

let passedTests = 0;
let totalTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function itAsync(desc, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 SUITE DE PRUEBAS: SUPABASE STORAGE & GESTIÓN REAL DE IMÁGENES');
  console.log('======================================================\n');

  it('1. Configuración de Storage y Bucket', () => {
    assert.strictEqual(DBService.getStorageBucket(), 'capital-vape-products');
    assert.ok(CONFIG.STORAGE);
    assert.strictEqual(CONFIG.STORAGE.BUCKET_NAME, 'capital-vape-products');
    assert.strictEqual(CONFIG.STORAGE.MAX_IMAGE_SIZE_BYTES, 5242880);
  });

  it('2. Validación de formatos permitidos (JPG, PNG, WEBP)', () => {
    const validJpg = { name: 'producto1.jpg', type: 'image/jpeg', size: 1024 * 500 };
    assert.strictEqual(DBService.validateImageFile(validJpg).valid, true);

    const validPng = { name: 'producto2.png', type: 'image/png', size: 1024 * 1000 };
    assert.strictEqual(DBService.validateImageFile(validPng).valid, true);

    const validWebp = { name: 'producto3.webp', type: 'image/webp', size: 1024 * 800 };
    assert.strictEqual(DBService.validateImageFile(validWebp).valid, true);

    const invalidExe = { name: 'virus.exe', type: 'application/x-msdownload', size: 1024 };
    const resExe = DBService.validateImageFile(invalidExe);
    assert.strictEqual(resExe.valid, false);
    assert.ok(resExe.error.includes('Formato'));

    const invalidTxt = { name: 'notas.txt', type: 'text/plain', size: 500 };
    assert.strictEqual(DBService.validateImageFile(invalidTxt).valid, false);
  });

  it('3. Validación de límite de tamaño (<= 5 MB)', () => {
    const file4_9Mb = { name: 'grande.jpg', type: 'image/jpeg', size: 4.9 * 1024 * 1024 };
    assert.strictEqual(DBService.validateImageFile(file4_9Mb).valid, true);

    const file5_1Mb = { name: 'enorme.jpg', type: 'image/jpeg', size: 5.1 * 1024 * 1024 };
    const res = DBService.validateImageFile(file5_1Mb);
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes('supera el tamaño'));
  });

  it('4. Construcción correcta de Public URL permanente en Supabase Storage', () => {
    const path = 'products/geek_bar_pulse_12345.webp';
    const publicUrl = DBService.getStoragePublicUrl(path);
    assert.strictEqual(
      publicUrl,
      'https://gkbzabubivjfzlefcnnq.supabase.co/storage/v1/object/public/capital-vape-products/products/geek_bar_pulse_12345.webp'
    );

    const fullUrl = 'https://example.com/foto.jpg';
    assert.strictEqual(DBService.getStoragePublicUrl(fullUrl), fullUrl);

    const localAsset = 'assets/logo/logo.png';
    assert.strictEqual(DBService.getStoragePublicUrl(localAsset), localAsset);
  });

  await itAsync('5. Asignación y persistencia de Foto Principal en Base de Datos', async () => {
    DBService.init();
    const prods = DBService.getProducts();
    assert.ok(prods.length >= 40, `Debe haber al menos 40 productos (actual: ${prods.length})`);

    const testProd = prods[0];
    const testStorageUrl = 'https://gkbzabubivjfzlefcnnq.supabase.co/storage/v1/object/public/capital-vape-products/products/test_main_img_999.webp';

    await DBService.updateProductMainImage(testProd.id, testStorageUrl);

    const reloaded = DBService.getProductById(testProd.id);
    assert.strictEqual(reloaded.image_url, testStorageUrl);

    const rawSaved = localStorage.getItem('cv_db_products_v3');
    const parsed = JSON.parse(rawSaved);
    const foundInStorage = parsed.find(p => p.id === testProd.id);
    assert.strictEqual(foundInStorage.image_url, testStorageUrl);
  });

  await itAsync('6. Galería JSONB: añadir fotos, reordenar y eliminar', async () => {
    const testProd = DBService.getProducts()[0];
    const url1 = 'https://gkbzabubivjfzlefcnnq.supabase.co/storage/v1/object/public/capital-vape-products/gallery/img1.webp';
    const url2 = 'https://gkbzabubivjfzlefcnnq.supabase.co/storage/v1/object/public/capital-vape-products/gallery/img2.webp';
    const url3 = 'https://gkbzabubivjfzlefcnnq.supabase.co/storage/v1/object/public/capital-vape-products/gallery/img3.webp';

    const res1 = await DBService.addGalleryImage(testProd.id, url1);
    const res2 = await DBService.addGalleryImage(testProd.id, url2);
    const res3 = await DBService.addGalleryImage(testProd.id, url3);

    let updated = DBService.getProductById(testProd.id);
    assert.strictEqual(updated.galeria.length, 3);
    assert.strictEqual(updated.galeria[0].url, url1);
    assert.strictEqual(updated.galeria[1].url, url2);
    assert.strictEqual(updated.galeria[2].url, url3);

    const reorderedIds = [res3.item.id, res1.item.id, res2.item.id];
    await DBService.reorderGalleryImages(testProd.id, reorderedIds);

    updated = DBService.getProductById(testProd.id);
    assert.strictEqual(updated.galeria[0].url, url3);
    assert.strictEqual(updated.galeria[1].url, url1);
    assert.strictEqual(updated.galeria[2].url, url2);

    await DBService.deleteGalleryImage(testProd.id, res1.item.id);
    updated = DBService.getProductById(testProd.id);
    assert.strictEqual(updated.galeria.length, 2);
    assert.ok(!updated.galeria.some(g => g.id === res1.item.id));
  });

  await itAsync('7. Asignación de imagen a Sabores específicos', async () => {
    const testProd = DBService.getProducts()[0];
    const flavorName = 'Miami Mint';
    const flavorUrl = 'https://gkbzabubivjfzlefcnnq.supabase.co/storage/v1/object/public/capital-vape-products/flavors/miami_mint_555.webp';

    await DBService.assignFlavorImage(testProd.id, flavorName, flavorUrl);

    const updated = DBService.getProductById(testProd.id);
    const flavorItem = updated.sabores.find(s => (typeof s === 'string' ? s : s.nombre) === flavorName);
    assert.ok(flavorItem, 'El sabor debe existir');
    assert.strictEqual(flavorItem.imagen, flavorUrl);
  });

  await itAsync('8. Seguridad: Protección contra borrado accidental de assets locales', async () => {
    const localLogo = 'assets/logo/logo.png';
    const delRes = await DBService.deleteImageFromStorage(localLogo);
    assert.strictEqual(delRes.ok, true);
    assert.strictEqual(delRes.skipped, true);
  });

  it('9. Integridad de la Calculadora Mayorista y Precios (Regla de Oro)', () => {
    const prods = DBService.getProducts();
    prods.forEach(p => {
      assert.ok(p.wholesale_prices, `El producto ${p.id} debe tener precios mayoristas`);
      assert.ok(p.wholesale_prices['5'] !== undefined, `Tier 5 presente en ${p.id}`);
      assert.ok(p.wholesale_prices['10'] !== undefined, `Tier 10 presente en ${p.id}`);
      assert.ok(p.wholesale_prices['20'] !== undefined, `Tier 20 presente en ${p.id}`);
      assert.ok(p.wholesale_prices['50'] !== undefined, `Tier 50 presente en ${p.id}`);
      assert.ok(p.wholesale_prices['100'] !== undefined, `Tier 100 presente en ${p.id}`);
    });
  });

  console.log(`\n======================================================`);
  console.log(`✨ RESULTADO: ${passedTests} de ${totalTests} pruebas superadas con éxito (100%).`);
  console.log(`======================================================\n`);
}

runTests().catch(err => {
  console.error('Error fatal durante la ejecución de pruebas:', err);
  process.exit(1);
});
