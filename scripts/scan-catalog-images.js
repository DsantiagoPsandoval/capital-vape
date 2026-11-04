/**
 * CAPITAL VAPE — Escáner Automático de Carpetas, Imágenes y Sabores
 * Explora recursivamente los directorios del proyecto para:
 * - REIGN BAR PALETTE
 * - U-PENDS UP9 Disposable Vape Kit
 * - Nimmbox FLVX
 * - Y el resto de carpetas de productos del catálogo
 *
 * Detecta formatos (JPG, JPEG, PNG, WEBP, AVIF, GIF, SVG),
 * identifica sabores por nombre de carpeta, nombre de archivo y metadatos visuales,
 * detecta imágenes múltiples por sabor e identifica archivos duplicados por hash MD5.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']);

/**
 * Mapa verificado visualmente para los archivos codificados b-1.webp .. b-17.webp
 * de REIGN BAR PALETTE (donde el nombre del sabor aparece impreso en la fotografía
 * oficial del módulo y en el cuerpo lateral del dispositivo).
 */
const REIGN_BAR_VISUAL_FLAVOR_MAP = {
  'b-1.webp':  { nombre: 'Strawberry Banana',   colorPrimary: '#EC2E68', colorSecondary: '#F48FB1', desc: 'Fresas maduras combinadas con banano cremoso.' },
  'b-2.webp':  { nombre: 'Raspberry Lemonade',  colorPrimary: '#7B1EC8', colorSecondary: '#A78BFA', desc: 'Limonada refrescante con frambuesas silvestres.' },
  'b-3.webp':  { nombre: 'Miami Mint',          colorPrimary: '#08B6A6', colorSecondary: '#7AE068', desc: 'Menta fresca estilo Miami con toque helado.' },
  'b-4.webp':  { nombre: 'Blue Razz Ice',       colorPrimary: '#3553F6', colorSecondary: '#38BDF8', desc: 'Frambuesa azul intensa con final ultra helado.' },
  'b-5.webp':  { nombre: 'Mexico Mango',        colorPrimary: '#F5B700', colorSecondary: '#FDE047', desc: 'Mango dulce tropical estilo mexicano.' },
  'b-6.webp':  { nombre: 'Fcuking Fab',         colorPrimary: '#FF4713', colorSecondary: '#38BDF8', desc: 'Mezcla exótica de frutas tropicales y bayas dulces.' },
  'b-7.webp':  { nombre: 'Watermelon Ice',      colorPrimary: '#F92C1C', colorSecondary: '#FB923C', desc: 'Sandía jugosa y refrescante con toque frío.' },
  'b-8.webp':  { nombre: 'OMG B Pop',           colorPrimary: '#E136F5', colorSecondary: '#F472B6', desc: 'Paleta dulce de frutos del bosque y caramelo.' },
  'b-9.webp':  { nombre: 'Caramel Cream',       colorPrimary: '#A97538', colorSecondary: '#E5E7EB', desc: 'Crema suave con notas cálidas de caramelo.' },
  'b-10.webp': { nombre: 'Virginia Tobacco',    colorPrimary: '#5C3B1E', colorSecondary: '#374151', desc: 'Tabaco rubio Virginia clásico, suave y aromático.' },
  'b-11.webp': { nombre: 'Ice Coffee',          colorPrimary: '#6B441B', colorSecondary: '#374151', desc: 'Café espresso helado con notas tostadas.' },
  'b-12.webp': { nombre: 'Root Beer',           colorPrimary: '#F59E0B', colorSecondary: '#FB7185', desc: 'Refresco clásico de zarzaparrilla espumosa.' },
  'b-13.webp': { nombre: 'Vanilla Ice Cream',   colorPrimary: '#3E5924', colorSecondary: '#F3F4F6', desc: 'Helado cremoso de vainilla gourmet.' },
  'b-14.webp': { nombre: 'Cheese Cake',         colorPrimary: '#F5C400', colorSecondary: '#FACC15', desc: 'Postre cremoso de cheesecake tradicional.' },
  'b-15.webp': { nombre: 'Strawberry',          colorPrimary: '#FB5E9B', colorSecondary: '#F9A8D4', desc: 'Fresa natural dulce y jugosa.' },
  'b-16.webp': { nombre: 'Cherry Lemon',        colorPrimary: '#880D2B', colorSecondary: '#FB923C', desc: 'Cereza roja intensa con un toque cítrico de limón.' },
  'b-17.webp': { nombre: 'Cool Mint',           colorPrimary: '#00AD5A', colorSecondary: '#F3F4F6', desc: 'Hoja de menta pura y refrescante.' }
};

/**
 * Normaliza un nombre de sabor a partir del nombre de carpeta o de archivo.
 */
function normalizeFlavorName(rawName, productFolder = '') {
  let clean = rawName
    .replace(/\.[^.]+$/, '') // quitar extensión
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Limpiar sufijos de marca redundantes en nombres de archivo (ej: "cool mint upends" -> "Cool Mint")
  if (/upends$/i.test(clean)) {
    clean = clean.replace(/\s+upends$/i, '').trim();
  }

  // Correcciones ortográficas conocidas de archivos manteniendo intacto el archivo original
  if (/^wtermelon ice$/i.test(clean)) {
    clean = 'Watermelon Ice';
  }
  if (/^cookies&cream$/i.test(clean)) {
    clean = 'Cookies & Cream';
  }

  // Title Case elegante
  return clean
    .split(' ')
    .map(word => {
      if (!word) return '';
      if (word === '&') return '&';
      if (/^(omg|up9|flvx)$/i.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Explora recursivamente una carpeta de producto y devuelve el análisis detallado.
 */
function scanProductDirectory(folderName) {
  const absFolder = path.join(ROOT_DIR, folderName);
  const result = {
    folderName,
    exists: fs.existsSync(absFolder),
    totalFilesScanned: 0,
    totalImagesFound: 0,
    duplicates: [],
    flavors: [],
    unidentified: []
  };

  if (!result.exists) return result;

  const hashRegistry = new Map(); // md5 -> relativePath
  const flavorGroups = new Map(); // flavorName -> { nombre, img, additionalImages: [], originalFiles: [], desc, colorPrimary, colorSecondary }

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relFromRoot = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');
      const relFromProduct = path.relative(absFolder, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      result.totalFilesScanned++;
      const ext = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext)) continue;

      result.totalImagesFound++;
      const buffer = fs.readFileSync(fullPath);
      const md5 = crypto.createHash('md5').update(buffer).digest('hex');

      if (hashRegistry.has(md5)) {
        result.duplicates.push({
          file: relFromRoot,
          duplicateOf: hashRegistry.get(md5),
          md5
        });
      } else {
        hashRegistry.set(md5, relFromRoot);
      }

      // Determinar el sabor a partir de subcarpeta, nombre de archivo o mapa visual verificado
      const parts = relFromProduct.split('/');
      const subFolderName = parts.length > 1 ? parts[parts.length - 2] : null;
      const baseFileName = entry.name;

      let flavorName = null;
      let meta = {};

      if (folderName === 'REIGN BAR PALETTE' && REIGN_BAR_VISUAL_FLAVOR_MAP[baseFileName.toLowerCase()]) {
        const mapped = REIGN_BAR_VISUAL_FLAVOR_MAP[baseFileName.toLowerCase()];
        flavorName = mapped.nombre;
        meta = mapped;
      } else if (subFolderName && !/^(img|images|fotos|assets)$/i.test(subFolderName)) {
        // Caso 1: El sabor está en el nombre de la subcarpeta (/Blue-Razz/image1.png)
        flavorName = normalizeFlavorName(subFolderName, folderName);
      } else {
        // Caso 2: El sabor está directamente en el nombre del archivo
        const nameWithoutTrailingIndex = baseFileName
          .replace(/\.[^.]+$/, '')
          .replace(/[-_\s]+(0?\d+|copy|copia)$/i, '');

        if (/^\d+$/.test(nameWithoutTrailingIndex)) {
          // Archivo puramente numérico sin subcarpeta de sabor
          result.unidentified.push(relFromRoot);
          continue;
        }
        flavorName = normalizeFlavorName(nameWithoutTrailingIndex, folderName);
      }

      if (!flavorName) {
        result.unidentified.push(relFromRoot);
        continue;
      }

      if (!flavorGroups.has(flavorName)) {
        flavorGroups.set(flavorName, {
          nombre: flavorName,
          img: relFromRoot,
          imagenes_adicionales: [],
          archivos_originales: [relFromRoot],
          formato: ext.replace('.', '').toUpperCase(),
          bytes: buffer.length,
          ...(meta.desc ? { desc: meta.desc } : {}),
          ...(meta.colorPrimary ? { colorPrimary: meta.colorPrimary, colorSecondary: meta.colorSecondary } : {})
        });
      } else {
        const existing = flavorGroups.get(flavorName);
        existing.imagenes_adicionales.push(relFromRoot);
        existing.archivos_originales.push(relFromRoot);
      }
    }
  }

  walk(absFolder);

  // Ordenar sabores: para REIGN BAR PALETTE mantener el orden numérico b-1 .. b-17, para los demás orden alfabético
  const flavorsArray = Array.from(flavorGroups.values());
  if (folderName === 'REIGN BAR PALETTE') {
    flavorsArray.sort((a, b) => {
      const numA = parseInt((a.img.match(/b-(\d+)\.webp/i) || [0, 999])[1], 10);
      const numB = parseInt((b.img.match(/b-(\d+)\.webp/i) || [0, 999])[1], 10);
      return numA - numB;
    });
  } else {
    flavorsArray.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  result.flavors = flavorsArray;
  return result;
}

const TARGET_PRODUCTS = [
  'REIGN BAR PALETTE',
  'U-PENDS UP9',
  'NIMMBOX FLVX'
];

const report = TARGET_PRODUCTS.map(scanProductDirectory);
console.log(JSON.stringify(report, null, 2));
