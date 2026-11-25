const fs = require('fs');
const path = require('path');

const pCode = fs.readFileSync(path.join(__dirname, '../js/products-data.js'), 'utf8');
const wCode = fs.readFileSync(path.join(__dirname, '../js/wholesale.js'), 'utf8');

let PRODUCTS_DATA;
eval(pCode.replace('const PRODUCTS_DATA', 'PRODUCTS_DATA'));

const m = wCode.match(/PRICES:\s*(\{[\s\S]*?\n  \}),/);
const wsPrices = m ? eval('(' + m[1] + ')') : {};

function getBrand(name) {
  const n = name.toUpperCase();
  if (n.startsWith('REIGN')) return 'REIGN';
  if (n.startsWith('U-PENDS')) return 'U-PENDS';
  if (n.startsWith('DOJO')) return 'DOJO';
  if (n.startsWith('AIRMEZ') || n.startsWith('AiRMEZ')) return 'AiRMEZ';
  if (n.startsWith('NIMMBOX') || n.startsWith('NIMBOX')) return 'NIMMBOX';
  if (n.startsWith('BANG')) return 'BANG';
  if (n.startsWith('HOOKALIT')) return 'HOOKALIT';
  if (n.startsWith('HUMO AZUL')) return 'HUMO AZUL';
  if (n.startsWith('BADDIE')) return 'BADDIE BAR';
  if (n.startsWith('DONUT')) return 'DONUT';
  if (n.startsWith('SOLOBAR')) return 'SOLOBAR';
  if (n.startsWith('YOCCO')) return 'YOCCO';
  if (n.startsWith('DEATH ROW')) return 'DEATH ROW';
  if (n.startsWith('LOST MARY')) return 'LOST MARY';
  if (n.startsWith('EASE')) return 'EASE';
  if (n.startsWith('DUMMY')) return 'DUMMY';
  if (n.startsWith('NICKY JAM')) return 'NICKY JAM';
  if (n.startsWith('BEYOND')) return 'BEYOND';
  if (n.startsWith('BUGATTI')) return 'BUGATTI';
  if (n.startsWith('VERA')) return 'VERA';
  if (n.startsWith('KATCHMI')) return 'KATCHMI';
  if (n.startsWith('FIFTY CENT')) return 'FIFTY CENT';
  if (n.startsWith('SPACEMAN')) return 'SPACEMAN';
  if (n.startsWith('DINNER LADY')) return 'DINNER LADY';
  if (n.startsWith('BRASS')) return 'BRASS';
  if (n.startsWith('ANV DIGITAL')) return 'ANV DIGITAL';
  if (n.startsWith('HIGH PRO')) return 'HIGH PRO';
  if (n.startsWith('SECRET PRO')) return 'SECRET PRO';
  if (n.startsWith('WAKA')) return 'WAKA';
  if (n.startsWith('SAMMY') || n.startsWith('SAMI')) return 'SAMMY';
  if (n.startsWith('AIRPODS')) return 'APPLE';
  return name.split(' ')[0];
}

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

let sql = '-- ============================================================================\n';
sql += '-- CAPITAL VAPE - DATOS INICIALES DE MIGRACIÓN (SEED DATA)\n';
sql += '-- Contiene los 40 productos del catálogo con sus precios, promociones e inventario\n';
sql += '-- ============================================================================\n\n';

sql += 'INSERT INTO public.products (\n';
sql += '    id, name, brand, description, image_url, category, price, price_two_units,\n';
sql += '    wholesale_prices, stock, status, is_featured, subtitulo, puffs, bateria,\n';
sql += '    rating, ventas, carpeta_imagenes, tipo_variante, sabores, colores\n';
sql += ') VALUES\n';

const valueRows = [];
const historyRows = [];

PRODUCTS_DATA.forEach((p) => {
  const brand = getBrand(p.nombre);
  const wp = p.precios_mayoristas || wsPrices[p.id] || { '5': 0, '10': 0, '20': 0, '50': 0, '100': 0 };
  const p2 = (p.precio_promo_2 !== undefined && p.precio_promo_2 !== null) ? p.precio_promo_2 : 'NULL';
  const puffs = p.puffs ? p.puffs : 'NULL';
  const bateria = p.bateria ? escapeSql(p.bateria) : 'NULL';
  const status = p.agotado ? 'agotado' : 'disponible';
  const stock = p.stock !== undefined ? p.stock : (p.agotado ? 0 : 50);

  const row = `(\n` +
    `    ${escapeSql(p.id)},\n` +
    `    ${escapeSql(p.nombre)},\n` +
    `    ${escapeSql(brand)},\n` +
    `    ${escapeSql(p.descripcion || '')},\n` +
    `    ${escapeSql(p.imagen || '')},\n` +
    `    ${escapeSql(p.categoria || 'desechables')},\n` +
    `    ${p.precio || 0},\n` +
    `    ${p2},\n` +
    `    ${escapeSql(JSON.stringify(wp))}::jsonb,\n` +
    `    ${stock},\n` +
    `    ${escapeSql(status)},\n` +
    `    ${p.recomendado ? 'true' : 'false'},\n` +
    `    ${escapeSql(p.subtitulo || '')},\n` +
    `    ${puffs},\n` +
    `    ${bateria},\n` +
    `    ${p.rating || 5.0},\n` +
    `    ${p.ventas || 0},\n` +
    `    ${escapeSql(p.carpeta_imagenes || '')},\n` +
    `    ${escapeSql(p.tipo_variante || 'sabor')},\n` +
    `    ${escapeSql(JSON.stringify(p.sabores || []))}::jsonb,\n` +
    `    ${escapeSql(JSON.stringify(p.colores || []))}::jsonb\n` +
    `)`;
  valueRows.push(row);

  // Initial price history entry
  const histRow = `(\n` +
    `    ${escapeSql(p.id)},\n` +
    `    NULL,\n` +
    `    ${p.precio || 0},\n` +
    `    NULL,\n` +
    `    ${p2},\n` +
    `    NULL,\n` +
    `    ${escapeSql(JSON.stringify(wp))}::jsonb,\n` +
    `    NULL,\n` +
    `    ${stock},\n` +
    `    NULL,\n` +
    `    ${escapeSql(status)},\n` +
    `    'product_created',\n` +
    `    'Sistema (Migración Inicial)',\n` +
    `    'Carga y migración inicial del catálogo de Capital Vape'\n` +
    `)`;
  historyRows.push(histRow);
});

sql += valueRows.join(',\n') + '\n';
sql += 'ON CONFLICT (id) DO UPDATE SET\n';
sql += '    name = EXCLUDED.name,\n';
sql += '    brand = EXCLUDED.brand,\n';
sql += '    description = EXCLUDED.description,\n';
sql += '    image_url = EXCLUDED.image_url,\n';
sql += '    category = EXCLUDED.category,\n';
sql += '    price = EXCLUDED.price,\n';
sql += '    price_two_units = EXCLUDED.price_two_units,\n';
sql += '    wholesale_prices = EXCLUDED.wholesale_prices,\n';
sql += '    stock = EXCLUDED.stock,\n';
sql += '    status = EXCLUDED.status,\n';
sql += '    is_featured = EXCLUDED.is_featured,\n';
sql += '    subtitulo = EXCLUDED.subtitulo,\n';
sql += '    puffs = EXCLUDED.puffs,\n';
sql += '    bateria = EXCLUDED.bateria,\n';
sql += '    carpeta_imagenes = EXCLUDED.carpeta_imagenes,\n';
sql += '    tipo_variante = EXCLUDED.tipo_variante,\n';
sql += '    sabores = EXCLUDED.sabores,\n';
sql += '    colores = EXCLUDED.colores,\n';
sql += "    updated_at = timezone('utc'::text, now());\n\n";

sql += '-- ============================================================================\n';
sql += '-- HISTORIAL INICIAL DE PRECIOS Y ESTADOS\n';
sql += '-- ============================================================================\n';
sql += 'INSERT INTO public.price_history (\n';
sql += '    product_id, old_price, new_price, old_price_two_units, new_price_two_units,\n';
sql += '    old_wholesale_prices, new_wholesale_prices, old_stock, new_stock, old_status, new_status,\n';
sql += '    change_type, admin_user, change_reason\n';
sql += ') VALUES\n';
sql += historyRows.join(',\n') + ';\n';

fs.writeFileSync(path.join(__dirname, '../sql/seed.sql'), sql, 'utf8');
fs.writeFileSync(path.join(__dirname, '../supabase/seed.sql'), sql, 'utf8');
console.log('Seed files created successfully. Total products inserted:', PRODUCTS_DATA.length);
