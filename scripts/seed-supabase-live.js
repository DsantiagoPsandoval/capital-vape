/**
 * CAPITAL VAPE - Sembrador en vivo de Catálogo en Supabase
 * Sube los 40 productos directamente mediante Supabase REST API
 */
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

async function seed() {
  const payload = PRODUCTS_DATA.map(p => {
    const wp = p.precios_mayoristas || wsPrices[p.id] || {
      '5': Math.round((p.precio || 0) * 0.75),
      '10': Math.round((p.precio || 0) * 0.60),
      '20': Math.round((p.precio || 0) * 0.55),
      '50': Math.round((p.precio || 0) * 0.50),
      '100': Math.round((p.precio || 0) * 0.45)
    };
    return {
      slug: p.id,
      name: p.nombre,
      brand: getBrand(p.nombre),
      description: p.descripcion || (p.nombre + ' - Calidad garantizada en Capital Vape.'),
      image_url: p.imagen || '',
      category: p.categoria || 'desechables',
      price: p.precio,
      price_two_units: p.precio_promo_2 || null,
      wholesale_prices: wp,
      stock: p.agotado ? 0 : 50,
      availability: p.agotado ? 'sold_out' : 'available',
      is_featured: !!p.recomendado,
      subtitulo: p.subtitulo || '',
      puffs: p.puffs || null,
      bateria: p.bateria || null,
      sabores: p.sabores || [],
      colores: p.colores || []
    };
  });

  const url = 'https://gkbzabubivjfzlefcnnq.supabase.co/rest/v1/products';
  const key = 'sb_publishable_5AQ9IzW8DHRowyT5mVF5og_FRVMFRdA';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(payload)
  });

  console.log('Seed result HTTP status:', res.status);
}

seed();
