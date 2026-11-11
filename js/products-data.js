/**
 * CAPITAL VAPE - Base de Datos Oficial de Productos, Puffs y Precios
 */
const PRODUCTS_DATA = [
  {
    "id": "reign-bar-palette",
    "nombre": "REIGN BAR PALETTE",
    "categoria": "desechables",
    "recomendado": false,
    "es_combinable_2_sabores": true,
    "etiqueta_recomendado": "",
    "subtitulo": "50.000 Puffs • 1200 mAh • Sistema Dual 2 Sabores",
    "puffs": 50000,
    "bateria": "1200 mAh",
    "precio": 40000,
    "precio_promo_2": 70000,
    "ahorro_2": 10000,
    "rating": 5,
    "ventas": 5850,
    "imagen": "REIGN BAR PALETTE/b-4.webp",
    "imagen_pendiente": false,
    "carpeta_imagenes": "REIGN BAR PALETTE",
    "descripcion": "REIGN BAR PALETTE es nuestra referencia recomendada: dispositivo modular dual que te permite combinar 2 sabores independientes en un solo equipo con hasta 50.000 Puffs y batería de 1200 mAh. Aprovecha su promoción especial de 2 unidades por $70.000 COP.",
    "agotado": false,
    "coming_soon": false,
    "tipo_variante": "sabor",
    "precios_mayoristas": {
      "5": 25000,
      "10": 19500,
      "20": 18500,
      "50": 18000,
      "100": 17500
    },
    "sabores": [
      {
        "nombre": "Strawberry Banana",
        "img": "REIGN BAR PALETTE/b-1.webp",
        "archivo_original": "REIGN BAR PALETTE/b-1.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#EC2E68",
        "colorSecondary": "#F48FB1",
        "desc": "Fresas maduras combinadas con banano cremoso."
      },
      {
        "nombre": "Raspberry Lemonade",
        "img": "REIGN BAR PALETTE/b-2.webp",
        "archivo_original": "REIGN BAR PALETTE/b-2.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#7B1EC8",
        "colorSecondary": "#A78BFA",
        "desc": "Limonada refrescante con frambuesas silvestres."
      },
      {
        "nombre": "Miami Mint",
        "img": "REIGN BAR PALETTE/b-3.webp",
        "archivo_original": "REIGN BAR PALETTE/b-3.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#08B6A6",
        "colorSecondary": "#7AE068",
        "desc": "Menta fresca estilo Miami con toque helado."
      },
      {
        "nombre": "Blue Razz Ice",
        "img": "REIGN BAR PALETTE/b-4.webp",
        "archivo_original": "REIGN BAR PALETTE/b-4.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#3553F6",
        "colorSecondary": "#38BDF8",
        "desc": "Frambuesa azul intensa con final ultra helado."
      },
      {
        "nombre": "Mexico Mango",
        "img": "REIGN BAR PALETTE/b-5.webp",
        "archivo_original": "REIGN BAR PALETTE/b-5.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#F5B700",
        "colorSecondary": "#FDE047",
        "desc": "Mango dulce tropical estilo mexicano."
      },
      {
        "nombre": "Fcuking Fab",
        "img": "REIGN BAR PALETTE/b-6.webp",
        "archivo_original": "REIGN BAR PALETTE/b-6.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#FF4713",
        "colorSecondary": "#38BDF8",
        "desc": "Mezcla exótica de frutas tropicales y bayas dulces."
      },
      {
        "nombre": "Watermelon Ice",
        "img": "REIGN BAR PALETTE/b-7.webp",
        "archivo_original": "REIGN BAR PALETTE/b-7.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#F92C1C",
        "colorSecondary": "#FB923C",
        "desc": "Sandía jugosa y refrescante con toque frío."
      },
      {
        "nombre": "OMG B Pop",
        "img": "REIGN BAR PALETTE/b-8.webp",
        "archivo_original": "REIGN BAR PALETTE/b-8.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#E136F5",
        "colorSecondary": "#F472B6",
        "desc": "Paleta dulce de frutos del bosque y caramelo."
      },
      {
        "nombre": "Caramel Cream",
        "img": "REIGN BAR PALETTE/b-9.webp",
        "archivo_original": "REIGN BAR PALETTE/b-9.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#A97538",
        "colorSecondary": "#E5E7EB",
        "desc": "Crema suave con notas cálidas de caramelo."
      },
      {
        "nombre": "Virginia Tobacco",
        "img": "REIGN BAR PALETTE/b-10.webp",
        "archivo_original": "REIGN BAR PALETTE/b-10.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#5C3B1E",
        "colorSecondary": "#374151",
        "desc": "Tabaco rubio Virginia clásico, suave y aromático."
      },
      {
        "nombre": "Ice Coffee",
        "img": "REIGN BAR PALETTE/b-11.webp",
        "archivo_original": "REIGN BAR PALETTE/b-11.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#6B441B",
        "colorSecondary": "#374151",
        "desc": "Café espresso helado con notas tostadas."
      },
      {
        "nombre": "Root Beer",
        "img": "REIGN BAR PALETTE/b-12.webp",
        "archivo_original": "REIGN BAR PALETTE/b-12.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#F59E0B",
        "colorSecondary": "#FB7185",
        "desc": "Refresco clásico de zarzaparrilla espumosa."
      },
      {
        "nombre": "Vanilla Ice Cream",
        "img": "REIGN BAR PALETTE/b-13.webp",
        "archivo_original": "REIGN BAR PALETTE/b-13.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#3E5924",
        "colorSecondary": "#F3F4F6",
        "desc": "Helado cremoso de vainilla gourmet."
      },
      {
        "nombre": "Cheese Cake",
        "img": "REIGN BAR PALETTE/b-14.webp",
        "archivo_original": "REIGN BAR PALETTE/b-14.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#F5C400",
        "colorSecondary": "#FACC15",
        "desc": "Postre cremoso de cheesecake tradicional."
      },
      {
        "nombre": "Strawberry",
        "img": "REIGN BAR PALETTE/b-15.webp",
        "archivo_original": "REIGN BAR PALETTE/b-15.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#FB5E9B",
        "colorSecondary": "#F9A8D4",
        "desc": "Fresa natural dulce y jugosa."
      },
      {
        "nombre": "Cherry Lemon",
        "img": "REIGN BAR PALETTE/b-16.webp",
        "archivo_original": "REIGN BAR PALETTE/b-16.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#880D2B",
        "colorSecondary": "#FB923C",
        "desc": "Cereza roja intensa con un toque cítrico de limón."
      },
      {
        "nombre": "Cool Mint",
        "img": "REIGN BAR PALETTE/b-17.webp",
        "archivo_original": "REIGN BAR PALETTE/b-17.webp",
        "imagenes_adicionales": [],
        "colorPrimary": "#00AD5A",
        "colorSecondary": "#F3F4F6",
        "desc": "Hoja de menta pura y refrescante."
      }
    ]
  },
  {
    "id": "u-pends-up9",
    "nombre": "U-PENDS UP9 Disposable Vape Kit",
    "categoria": "desechables",
    "subtitulo": "50.000 Puffs • 1000 mAh",
    "puffs": 50000,
    "bateria": "1000 mAh",
    "precio": 35000,
    "precio_promo_2": 60000,
    "ahorro_2": 10000,
    "rating": 4.9,
    "ventas": 4620,
    "imagen": "U-PENDS UP9/blue razz ice.png",
    "imagen_pendiente": false,
    "carpeta_imagenes": "U-PENDS UP9",
    "descripcion": "U-PENDS UP9 Disposable Vape Kit ofrece hasta 50.000 Puffs con tanque visible y una potente batería de 1000 mAh. Llévalo por $35.000 COP la unidad o en promoción de 2 unidades por $60.000 COP.",
    "agotado": false,
    "coming_soon": false,
    "tipo_variante": "sabor",
    "precios_mayoristas": {
      "5": 20000,
      "10": 16500,
      "20": 15500,
      "50": 15000,
      "100": 14000
    },
    "sabores": [
      {
        "nombre": "Blue Razz Ice",
        "img": "U-PENDS UP9/blue razz ice.png",
        "archivo_original": "U-PENDS UP9/blue razz ice.jpg",
        "imagenes_adicionales": [],
        "desc": "Frambuesa azul intensa con toque helado refrescante."
      },
      {
        "nombre": "Cool Mint",
        "img": "U-PENDS UP9/cool mint upends.png",
        "archivo_original": "U-PENDS UP9/cool mint upends.jpg",
        "imagenes_adicionales": [],
        "desc": "Menta fresca y cristalina de máxima pureza."
      },
      {
        "nombre": "Grape Gush",
        "img": "U-PENDS UP9/grape gush.png",
        "archivo_original": "U-PENDS UP9/grape gush.jpg",
        "imagenes_adicionales": [],
        "desc": "Explosión jugosa de uvas dulces maduras."
      },
      {
        "nombre": "Miami Mint",
        "img": "U-PENDS UP9/miami mint.png",
        "archivo_original": "U-PENDS UP9/miami mint.jpg",
        "imagenes_adicionales": [],
        "desc": "Menta suave estilo Miami con frescura prolongada."
      },
      {
        "nombre": "Orange Slush",
        "img": "U-PENDS UP9/orange slush.png",
        "archivo_original": "U-PENDS UP9/orange slush.jpg",
        "imagenes_adicionales": [],
        "desc": "Granizado cítrico de naranja dulce y helada."
      },
      {
        "nombre": "Sour Apple Ice",
        "img": "U-PENDS UP9/sour apple ice.png",
        "archivo_original": "U-PENDS UP9/sour apple ice.jpg",
        "imagenes_adicionales": [],
        "desc": "Manzana verde ácida con acabado frío."
      },
      {
        "nombre": "Straw Melon",
        "img": "U-PENDS UP9/straw melon.png",
        "archivo_original": "U-PENDS UP9/straw melon.jpg",
        "imagenes_adicionales": [],
        "desc": "Combinación equilibrada de fresa dulce y sandía."
      },
      {
        "nombre": "Strawberry Kiwi",
        "img": "U-PENDS UP9/strawberry kiwi.png",
        "archivo_original": "U-PENDS UP9/strawberry kiwi.jpg",
        "imagenes_adicionales": [],
        "desc": "Clásico dúo frutal de fresas frescas y kiwi tropical."
      },
      {
        "nombre": "Watermelon Ice",
        "img": "U-PENDS UP9/watermelon ice.png",
        "archivo_original": "U-PENDS UP9/watermelon ice.jpg",
        "imagenes_adicionales": [],
        "desc": "Sandía jugosa con sensación helada."
      }
    ]
  },
  {
    "id": "dojo-x",
    "nombre": "DOJO X",
    "categoria": "desechables",
    "recomendado": false,
    "es_combinable_2_sabores": false,
    "etiqueta_recomendado": "",
    "subtitulo": "20.000 Puffs • 1300 mAh • Pantalla Digital & Power Mode",
    "puffs": 20000,
    "bateria": "1300 mAh",
    "precio": 33000,
    "precio_promo_2": 55000,
    "ahorro_2": 11000,
    "rating": 4.9,
    "ventas": 1450,
    "imagen": "DOJO X/dojo_imate_x_20k_disposable_-_screen.png",
    "imagen_pendiente": false,
    "carpeta_imagenes": "DOJO X",
    "descripcion": "DOJO X ofrece hasta 20.000 Puffs, potente batería de 1300 mAh con tecnología Vaporesso, pantalla digital con visualización de líquido/batería y modo Power. 1 unidad por .000 COP o lleva 2 por .000 COP.",
    "agotado": false,
    "coming_soon": false,
    "tipo_variante": "sabor",
    "precios_mayoristas": {
      "5": 22000,
      "10": 17500,
      "20": 17000,
      "50": 16000,
      "100": 15500
    },
    "sabores": [
      {
        "nombre": "Baja Smash",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_baja_smash_mtd_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_baja_smash_mtd_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#00B4D8",
        "colorSecondary": "#90E0EF",
        "desc": "Explosión cítrica refrescante estilo Baja con toque tropical."
      },
      {
        "nombre": "Blue Razz Ice",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_blue_razz_ice_1_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_blue_razz_ice_1_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#1E88E5",
        "colorSecondary": "#64B5F6",
        "desc": "Frambuesa azul vibrante con toque helado y refrescante."
      },
      {
        "nombre": "Blue Straw Splash",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_blue_straw_splash_1_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_blue_straw_splash_1_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#3949AB",
        "colorSecondary": "#F06292",
        "desc": "Fresas dulces combinadas con frambuesa azul y un golpe jugoso."
      },
      {
        "nombre": "Hawaii Dream",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_hawaii_dream_1_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_hawaii_dream_1_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#FFA000",
        "colorSecondary": "#FFD54F",
        "desc": "Sueño tropical hawaiano de piña dulce, mango y frutas de la pasión."
      },
      {
        "nombre": "Mango Straw",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_mango_straw_1_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_mango_straw_1_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#FB8C00",
        "colorSecondary": "#E91E63",
        "desc": "Mango maduro combinado con fresas jugosas."
      },
      {
        "nombre": "Miami Mint",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_miami_mint_1_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_miami_mint_1_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#00897B",
        "colorSecondary": "#80CBC4",
        "desc": "Menta fresca vigorizante con toque helado estilo costero."
      },
      {
        "nombre": "Peachy Smash",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_peachy_smash_1_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_peachy_smash_1_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#FF7043",
        "colorSecondary": "#FFAB91",
        "desc": "Durazno dulce y aterciopelado con explosión frutal intensa."
      },
      {
        "nombre": "Pink Lemonade",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_pink_lemonade_1_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_pink_lemonade_1_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#EC407A",
        "colorSecondary": "#F48FB1",
        "desc": "Limonada rosa ácida y dulce con toque burbujeante."
      },
      {
        "nombre": "Sour Apple B-Pop",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_sour_apple_b-pop_1_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_sour_apple_b-pop_1_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#7CB342",
        "colorSecondary": "#C0CA33",
        "desc": "Manzana ácida intensa con fondo de caramelo dulce estilo paleta."
      },
      {
        "nombre": "Sour Batch Watermelon Peach",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_sour_batch_watermelon_peach_1_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_sour_batch_watermelon_peach_1_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#E53935",
        "colorSecondary": "#FFA726",
        "desc": "Mezcla ácida y dulce de sandía jugosa y durazno suave."
      },
      {
        "nombre": "Sour Cranapple",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_sour_cranapple_1_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_sour_cranapple_1_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#D81B60",
        "colorSecondary": "#8BC34A",
        "desc": "Arándanos agridulces combinados con manzana crujiente."
      },
      {
        "nombre": "Sour Gush",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_sour_gush_1_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_sour_gush_1_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#8E24AA",
        "colorSecondary": "#BA68C8",
        "desc": "Explosión ultra ácida de frutas con final jugoso."
      },
      {
        "nombre": "Strawberry Slam Dunk",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_strawberry_slam_dunk_1_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_strawberry_slam_dunk_1_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#E53935",
        "colorSecondary": "#FFCDD2",
        "desc": "Fresas rojas maduras con un impacto frutal dulce e inolvidable."
      },
      {
        "nombre": "Watermelon Ice",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_watermelon_ice_1_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_watermelon_ice_1_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#E53935",
        "colorSecondary": "#81C784",
        "desc": "Sandía helada jugosa, refrescante y dulce."
      },
      {
        "nombre": "White Grape Ice",
        "img": "DOJO X/dojo_imate_x_20k_disposable_-_white_grape_ice_1_1.png",
        "archivo_original": "DOJO X/dojo_imate_x_20k_disposable_-_white_grape_ice_1_1.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#7E57C2",
        "colorSecondary": "#B39DDB",
        "desc": "Uvas blancas selectas con toque ultra frío y cristalino."
      }
    ]
  },
  {
    "id": "airmez-10000",
    "nombre": "AiRMEZ 10000",
    "categoria": "desechables",
    "recomendado": false,
    "es_combinable_2_sabores": false,
    "etiqueta_recomendado": "",
    "subtitulo": "10.000 Puffs • Pantalla LED • Batería Recargable",
    "puffs": 10000,
    "bateria": "650 mAh",
    "precio": 20000,
    "precio_promo_2": 32000,
    "ahorro_2": 8000,
    "rating": 4.8,
    "ventas": 980,
    "imagen": "Airmez/airmez_blue_razz_ice.png",
    "imagen_pendiente": false,
    "carpeta_imagenes": "Airmez",
    "descripcion": "AiRMEZ 10000 Disposable te brinda hasta 10.000 Puffs con pantalla LED inteligente para monitorear líquido y batería en tiempo real. 1 unidad por .000 COP o promoción especial de 2 unidades por .000 COP.",
    "agotado": false,
    "coming_soon": false,
    "tipo_variante": "sabor",
    "precios_mayoristas": {
      "5": 14000,
      "10": 11000,
      "20": 10500,
      "50": 10000,
      "100": 9500
    },
    "sabores": [
      {
        "nombre": "Blue Razz Ice",
        "img": "Airmez/airmez_blue_razz_ice.png",
        "archivo_original": "Airmez/airmez_blue_razz_ice.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#00B4D8",
        "colorSecondary": "#90E0EF",
        "desc": "Immerse yourself in the refreshing embrace of tangy blue raspberries, complemented by a chilly wave of menthol. This invigorating blend strikes the perfect balance between sweet and icy, offering a delightful vaping experience."
      },
      {
        "nombre": "Cherry Strazz",
        "img": "Airmez/airmez_cherry_strazz.png",
        "archivo_original": "Airmez/airmez_cherry_strazz.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#E91E63",
        "colorSecondary": "#F48FB1",
        "desc": "Indulge in the symphony of flavors as succulent cherries mingle with the zesty essence of ripe strawberries. The Cherry Strazz promises a harmonious dance of fruity notes that will tantalize your taste buds."
      },
      {
        "nombre": "Cranberry Grape",
        "img": "Airmez/airmez_cranberry_grape.png",
        "archivo_original": "Airmez/airmez_cranberry_grape.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#8E24AA",
        "colorSecondary": "#CE93D8",
        "desc": "Experience the vibrant burst of tart cranberries harmonizing with the lush richness of juicy grapes. This exquisite combination offers a unique and well-balanced flavor profile, perfect for those who appreciate a touch of tartness."
      },
      {
        "nombre": "Frost Ice Berry",
        "img": "Airmez/airmez_frost_ice_berry.png",
        "archivo_original": "Airmez/airmez_frost_ice_berry.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#00ACC1",
        "colorSecondary": "#80DEEA",
        "desc": "Brace yourself for a whirlwind of flavor as an assortment of mixed berries collide with a rush of menthol. The Frost Ice Berry delivers a refreshing and satisfying vaping experience that will leave you craving more."
      },
      {
        "nombre": "Ice Pop",
        "img": "Airmez/airmez_ice_pop.png",
        "archivo_original": "Airmez/airmez_ice_pop.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#03A9F4",
        "colorSecondary": "#FF4081",
        "desc": "Relive the nostalgia of your favorite childhood treats with the Ice Pop flavor. This delightful concoction combines a medley of fruity flavors with a cool undertone, providing a taste of pure nostalgia in every puff."
      },
      {
        "nombre": "Kiwi Dragon Berry",
        "img": "Airmez/airmez_kiwi_dragon_berry.png",
        "archivo_original": "Airmez/airmez_kiwi_dragon_berry.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#4CAF50",
        "colorSecondary": "#E91E63",
        "desc": "Embark on a tropical journey with the tantalizing fusion of exotic kiwi, succulent dragon fruit, and ripe mixed berries. This flavor profile promises a symphony of sweet and tangy notes that will transport you to paradise."
      },
      {
        "nombre": "NRG Berry Ice",
        "img": "Airmez/airmez_nrg_berry_ice.png",
        "archivo_original": "Airmez/airmez_nrg_berry_ice.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#FF5722",
        "colorSecondary": "#00E5FF",
        "desc": "Ignite your senses with the electrifying combination of energetic berries and a revitalizing blast of menthol. NRG Berry Ice is a dynamic flavor that will invigorate your palate and leave you feeling refreshed."
      },
      {
        "nombre": "Orange Mango",
        "img": "Airmez/airmez_orange_mango.png",
        "archivo_original": "Airmez/airmez_orange_mango.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#FF9800",
        "colorSecondary": "#FFD54F",
        "desc": "Savor the luscious harmony of zesty oranges and tropical mangoes. This flavor profile delivers a burst of citrusy brightness complemented by the smooth, velvety sweetness of ripe mangoes."
      },
      {
        "nombre": "Pineapple Coconut",
        "img": "Airmez/airmez_pineapple_coconut.png",
        "archivo_original": "Airmez/airmez_pineapple_coconut.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#FDD835",
        "colorSecondary": "#FFF9C4",
        "desc": "Transport yourself to a tropical paradise with the delightful fusion of juicy pineapple and creamy coconut. This flavor combination offers a perfect balance of sweet and creamy, making it an ideal choice for those seeking a taste of the tropics."
      },
      {
        "nombre": "Polar Mint Ice",
        "img": "Airmez/airmez_polar_mint_ice.png",
        "archivo_original": "Airmez/airmez_polar_mint_ice.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#00BFA5",
        "colorSecondary": "#A7FFEB",
        "desc": "Immerse yourself in the invigorating embrace of Polar Mint Ice. This menthol-infused flavor delivers a blast of icy freshness, providing a crisp and revitalizing vaping experience."
      },
      {
        "nombre": "Rainbow Cloudz",
        "img": "Airmez/airmez_rainbow_cloudz.png",
        "archivo_original": "Airmez/airmez_rainbow_cloudz.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#FF4081",
        "colorSecondary": "#7C4DFF",
        "desc": "Experience a kaleidoscope of flavors with Rainbow Cloudz. This vibrant and playful blend offers a symphony of fruity notes, ensuring each puff is a delightful burst of color and taste."
      },
      {
        "nombre": "Turkish Coffee",
        "img": "Airmez/airmez_turkish_coffee.png",
        "archivo_original": "Airmez/airmez_turkish_coffee.png",
        "imagenes_adicionales": [],
        "colorPrimary": "#6D4C41",
        "colorSecondary": "#D7CCC8",
        "desc": "Indulge in the rich and aromatic essence of Turkish coffee. This bold and robust flavor offers a sophisticated vaping experience, perfect for those who appreciate the depth and complexity of a good cup of coffee."
      }
    ]
  },
  {
    "id": "nimmbox-flvx",
    "nombre": "Nimmbox FLVX",
    "categoria": "desechables",
    "subtitulo": "40.000 Puffs • 700 mAh",
    "puffs": 40000,
    "bateria": "700 mAh",
    "precio": 35000,
    "precio_promo_2": 60000,
    "ahorro_2": 10000,
    "rating": 4.9,
    "ventas": 4480,
    "imagen": "NIMMBOX FLVX/Baja Splash.png",
    "imagen_pendiente": false,
    "carpeta_imagenes": "NIMMBOX FLVX",
    "descripcion": "Nimmbox FLVX combina hasta 40.000 Puffs de vapor denso con una batería eficiente de 700 mAh. Disponible a $35.000 COP la unidad o 2 unidades por $60.000 COP.",
    "agotado": false,
    "coming_soon": false,
    "tipo_variante": "sabor",
    "precios_mayoristas": {
      "5": 20000,
      "10": 16500,
      "20": 15500,
      "50": 15000,
      "100": 14000
    },
    "sabores": [
      {
        "nombre": "Baja Splash",
        "img": "NIMMBOX FLVX/Baja Splash.png",
        "archivo_original": "NIMMBOX FLVX/Baja Splash.png",
        "imagenes_adicionales": [],
        "desc": "Refrescante cóctel tropical cítrico estilo Baja."
      },
      {
        "nombre": "Blue Razz Ice",
        "img": "NIMMBOX FLVX/Blue Razz Ice.png",
        "archivo_original": "NIMMBOX FLVX/Blue Razz Ice.png",
        "imagenes_adicionales": [],
        "desc": "Frambuesa azul dulce con golpe de hielo."
      },
      {
        "nombre": "Clear",
        "img": "NIMMBOX FLVX/Clear.png",
        "archivo_original": "NIMMBOX FLVX/Clear.png",
        "imagenes_adicionales": [],
        "desc": "Vapor puro, neutro y cristalino con frescura limpia."
      },
      {
        "nombre": "Cookies & Cream",
        "img": "NIMMBOX FLVX/Cookies&Cream.png",
        "archivo_original": "NIMMBOX FLVX/Cookies&Cream.png",
        "imagenes_adicionales": [],
        "desc": "Galleta de chocolate crujiente con crema de vainilla."
      },
      {
        "nombre": "Frozen Strawberry",
        "img": "NIMMBOX FLVX/Frozen Strawberry.png",
        "archivo_original": "NIMMBOX FLVX/Frozen Strawberry.png",
        "imagenes_adicionales": [],
        "desc": "Fresas maduras congeladas con frescura intensa."
      },
      {
        "nombre": "Juicy Grape",
        "img": "NIMMBOX FLVX/Juicy Grape.png",
        "archivo_original": "NIMMBOX FLVX/Juicy Grape.png",
        "imagenes_adicionales": [],
        "desc": "Uva morada jugosa y dulce en cada calada."
      },
      {
        "nombre": "Melon Blossom",
        "img": "NIMMBOX FLVX/Melon Blossom.png",
        "archivo_original": "NIMMBOX FLVX/Melon Blossom.png",
        "imagenes_adicionales": [],
        "desc": "Melón dulce aromático con notas florales suaves."
      },
      {
        "nombre": "Miami Mint",
        "img": "NIMMBOX FLVX/Miami Mint.png",
        "archivo_original": "NIMMBOX FLVX/Miami Mint.png",
        "imagenes_adicionales": [],
        "desc": "Menta refrescante con toque cítrico suave."
      },
      {
        "nombre": "Sour Apple Ice",
        "img": "NIMMBOX FLVX/Sour Apple Ice.png",
        "archivo_original": "NIMMBOX FLVX/Sour Apple Ice.png",
        "imagenes_adicionales": [],
        "desc": "Manzana verde ácida con final helado."
      },
      {
        "nombre": "Sour Mango Pineapple",
        "img": "NIMMBOX FLVX/Sour Mango Pineapple.png",
        "archivo_original": "NIMMBOX FLVX/Sour Mango Pineapple.png",
        "imagenes_adicionales": [],
        "desc": "Fusión tropical de mango ácido y piña jugosa."
      },
      {
        "nombre": "Super Lemon",
        "img": "NIMMBOX FLVX/Super Lemon.png",
        "archivo_original": "NIMMBOX FLVX/Super Lemon.png",
        "imagenes_adicionales": [],
        "desc": "Limón cítrico vibrante e intenso."
      },
      {
        "nombre": "Tobacco",
        "img": "NIMMBOX FLVX/Tobacco.png",
        "archivo_original": "NIMMBOX FLVX/Tobacco.png",
        "imagenes_adicionales": [],
        "desc": "Tabaco clásico de cuerpo suave y tostado."
      },
      {
        "nombre": "Watermelon Ice",
        "img": "NIMMBOX FLVX/Wtermelon Ice.png",
        "archivo_original": "NIMMBOX FLVX/Wtermelon Ice.png",
        "imagenes_adicionales": [],
        "desc": "Sandía roja dulce con frescura helada."
      },
      {
        "nombre": "White Peach Ice",
        "img": "NIMMBOX FLVX/White Peach Ice.png",
        "archivo_original": "NIMMBOX FLVX/White Peach Ice.png",
        "imagenes_adicionales": [],
        "desc": "Durazno blanco delicado y jugoso con toque frío."
      }
    ]
  },
  {
    "id": "bang-leader",
    "nombre": "BANG LEADER",
    "categoria": "desechables",
    "subtitulo": "32.000 Puffs • 5 Sabores",
    "puffs": 32000,
    "precio": 45000,
    "precio_promo_2": 80000,
    "ahorro_2": 10000,
    "rating": 4.8,
    "ventas": 3420,
    "imagen": "BANG LEADER/Red Bull - Blueberry.png",
    "descripcion": "El Bang Leader es un vape desechable de alto rendimiento diseñado para ofrecer hasta 32.000 caladas de sabor intenso y constante.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Red Bull - Blueberry",
        "img": "BANG LEADER/Red Bull - Blueberry.png",
        "desc": "Mezcla energética de arándanos con un toque ácido."
      },
      {
        "nombre": "Arándanos & Menta",
        "img": "BANG LEADER/Arandanos & Menta.png",
        "desc": "Arándanos frescos con menta helada."
      },
      {
        "nombre": "Cereza & Arándano",
        "img": "BANG LEADER/Cereza & Arandano.png",
        "desc": "Cereza dulce combinada con arándanos jugosos."
      },
      {
        "nombre": "Fresa & Mango",
        "img": "BANG LEADER/Fresa & Mango.png",
        "desc": "Fresa dulce con mango tropical maduro."
      },
      {
        "nombre": "Mango de Fresa",
        "img": "BANG LEADER/Mango de Fresa.png",
        "desc": "Deliciosa fusión frutal de mango con fresa."
      }
    ]
  },
  {
    "id": "dojo",
    "nombre": "DOJO SPHERE S 40K",
    "categoria": "desechables",
    "subtitulo": "40.000 Puffs • 17 Sabores",
    "puffs": 40000,
    "precio": 35000,
    "precio_promo_2": 60000,
    "ahorro_2": 10000,
    "rating": 5,
    "ventas": 5120,
    "imagen": "DojoVape/Watermelon Ice.png",
    "descripcion": "El DOJO Sphere S 40K es un vape desechable premium de última generación con hasta 40.000 caladas extraordinarias, pantalla digital inteligente, doble resistencia de malla y 17 sabores ultra intensos.",
    "agotado": false,
    "coming_soon": false,
    "tipo_variante": "sabor",
    "precios_mayoristas": {
      "5": 22000,
      "10": 17500,
      "20": 17000,
      "50": 16000,
      "100": 15500
    },
    "sabores": [
      {
        "nombre": "Blue Razz Ice",
        "img": "DojoVape/Blue Razz Ice.png",
        "desc": "Arándano azul jugoso con un toque helado súper refrescante."
      },
      {
        "nombre": "Blueberry Watermelon",
        "img": "DojoVape/Blueberry Watermelon.png",
        "desc": "Dúo perfecto de arándanos silvestres y sandía dulce y madura."
      },
      {
        "nombre": "Clear",
        "img": "DojoVape/Clear.png",
        "desc": "Sabor neutro, limpio y puro con un golpe fresco sin azúcar añadido."
      },
      {
        "nombre": "Fcuking FAB",
        "img": "DojoVape/Fcuking FAB.png",
        "desc": "Mezcla secreta frutal tropical con notas de caramelo dulce y cítricos."
      },
      {
        "nombre": "Frozen Banana",
        "img": "DojoVape/Frozen Banana.png",
        "desc": "Plátano maduro cremoso con un acabado de hielo polar intenso."
      },
      {
        "nombre": "Georgia Peach",
        "img": "DojoVape/Georgia Peach.png",
        "desc": "Durazno dulce, aromático y jugoso recién cosechado de Georgia."
      },
      {
        "nombre": "Hawaii Dream",
        "img": "DojoVape/Hawaii Dream.png",
        "desc": "Sueño tropical de piña dulce, coco suave y frutas del pacífico."
      },
      {
        "nombre": "Juicy Grape",
        "img": "DojoVape/Juicy Grape.png",
        "desc": "Uva morada dulce, cristalina y profundamente jugosa."
      },
      {
        "nombre": "Lemonade Pink",
        "img": "DojoVape/Lemonade Pink.png",
        "desc": "Limonada rosa cítrica, chispeante y veraniega con dulzura sutil."
      },
      {
        "nombre": "Mexico Mango",
        "img": "DojoVape/Mexico Mango.png",
        "desc": "Auténtico mango mexicano dulce con abundante pulpa tropical madura."
      },
      {
        "nombre": "Miami Mint",
        "img": "DojoVape/Miami Mint.png",
        "desc": "Menta clásica estilo Miami Beach con frescura herbal balanceada."
      },
      {
        "nombre": "Sour Gush",
        "img": "DojoVape/Sour Gush.png",
        "desc": "Explosión agridulce inspirada en caramelos líquidos frutales."
      },
      {
        "nombre": "Strawberry Banana",
        "img": "DojoVape/Strawberry Banana.png",
        "desc": "Batido suave y cremoso de fresas silvestres maduras y banana dulce."
      },
      {
        "nombre": "Strawberry Ice",
        "img": "DojoVape/Strawberry Ice.png",
        "desc": "Fresas dulces recién recolectadas combinadas con escarcha glacial."
      },
      {
        "nombre": "Tobacco",
        "img": "DojoVape/Tobacco.png",
        "desc": "Tabaco tostado refinado, cálido, robusto y con un cuerpo elegante."
      },
      {
        "nombre": "Watermelon Ice",
        "img": "DojoVape/Watermelon Ice.png",
        "desc": "Sandía dulce refrescante combinada con una potente ráfaga de hielo."
      },
      {
        "nombre": "White Gummy",
        "img": "DojoVape/White Gummy.png",
        "desc": "Gomitas dulces de osito blanco con suaves toques de piña caramelizada."
      }
    ]
  },
  {
    "id": "hookalit",
    "nombre": "HOOKALIT",
    "categoria": "desechables",
    "subtitulo": "35.000 Puffs • 10 Sabores",
    "puffs": 35000,
    "precio": 35000,
    "precio_promo_2": 58000,
    "ahorro_2": 12000,
    "rating": 4.9,
    "ventas": 4900,
    "imagen": "HOOKALIT/Amor magico.png",
    "descripcion": "El gigante del vapeo: 40.000 puffs con tecnología DTL (Direct to Lung), simulador de narguile / shisha con vapor denso.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Amor Mágico",
        "img": "HOOKALIT/Amor magico.png",
        "desc": "Mezcla aromática y seductora estilo hookah."
      },
      {
        "nombre": "Cereza",
        "img": "HOOKALIT/cereza.png",
        "desc": "Cereza intensa y dulce."
      },
      {
        "nombre": "Gomita",
        "img": "HOOKALIT/gomita.png",
        "desc": "Sabor dulce a gomitas frutales."
      },
      {
        "nombre": "Lady Killer",
        "img": "HOOKALIT/lady killer.png",
        "desc": "Explosión exótica de frutas orientales."
      },
      {
        "nombre": "Lucid Dream",
        "img": "HOOKALIT/lucid dream.png",
        "desc": "Sueño lúcido con notas dulces y misteriosas."
      },
      {
        "nombre": "Manzana",
        "img": "HOOKALIT/manzana.png",
        "desc": "Doble manzana tradicional con anís suave."
      },
      {
        "nombre": "Menta Helada",
        "img": "HOOKALIT/menta helada.png",
        "desc": "Menta glaciar de frescura profunda."
      },
      {
        "nombre": "Mistery Blue",
        "img": "HOOKALIT/mistery blue.png",
        "desc": "Frutos azules con un toque secreto."
      },
      {
        "nombre": "Mujer Asesina",
        "img": "HOOKALIT/mujer asesina.png",
        "desc": "Combinación fatal de frutas dulces y ácidas."
      },
      {
        "nombre": "White Flash",
        "img": "HOOKALIT/white flash.png",
        "desc": "Destello blanco de vainilla y frescura mentolada."
      }
    ]
  },
  {
    "id": "humo-azul",
    "nombre": "HUMO AZUL",
    "categoria": "desechables",
    "subtitulo": "15.000 Puffs • 4 Colores",
    "puffs": 15000,
    "precio": 50000,
    "precio_promo_2": 85000,
    "ahorro_2": 15000,
    "rating": 4.8,
    "ventas": 2890,
    "imagen": "HUMO AZUL/DORADO (Bananno helado, toronja limon, menta, sandia, arandano).png",
    "descripcion": "Dispositivo con variantes por color, cada uno con una selección exclusiva de sabores frutales y refrescantes.",
    "agotado": false,
    "tipo_variante": "color",
    "colores": [
      {
        "nombre": "DORADO",
        "img": "HUMO AZUL/DORADO (Bananno helado, toronja limon, menta, sandia, arandano).png",
        "sabores": [
          "Banano helado",
          "Toronja limón",
          "Menta",
          "Sandía",
          "Arándano"
        ]
      },
      {
        "nombre": "NEGRO",
        "img": "HUMO AZUL/NEGRO (Frambuesa, gomitas dulces, sandia, manzana, arandano).png",
        "sabores": [
          "Frambuesa",
          "Gomitas dulces",
          "Sandía",
          "Manzana",
          "Arándano"
        ]
      },
      {
        "nombre": "ORO ROSA",
        "img": "HUMO AZUL/ORO ROSA (Melon, Toronja limon, uva helada, banano helado, lima limon).png",
        "sabores": [
          "Melón",
          "Toronja limón",
          "Uva helada",
          "Banano helado",
          "Lima limón"
        ]
      },
      {
        "nombre": "PLATEADO",
        "img": "HUMO AZUL/Plateado (Miel durazno, uva helada, gomita cereza).png",
        "sabores": [
          "Miel durazno",
          "Uva helada",
          "Gomita cereza"
        ]
      }
    ]
  },
  {
    "id": "baddie-bar",
    "nombre": "BADDIE BAR",
    "categoria": "desechables",
    "subtitulo": "15.000 Puffs • 21 Sabores",
    "puffs": 15000,
    "precio": 27000,
    "precio_promo_2": 45000,
    "ahorro_2": 9000,
    "rating": 4.9,
    "ventas": 3650,
    "imagen": "assets/productos/baddie-1.png",
    "descripcion": "El Baddie Bar 15.000 Puffs ofrece una experiencia de vapeo premium con 21 sabores intensos, pantalla digital y batería recargable tipo C.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Blue Razz Ice",
        "img": "assets/productos/baddie-1.png",
        "desc": "Arándanos azules con frambuesa y golpe helado."
      },
      {
        "nombre": "Watermelon Ice",
        "img": "assets/productos/baddie-2.png",
        "desc": "Sandía dulce jugosa con acabado ultra frío."
      },
      {
        "nombre": "Strawberry Kiwi",
        "img": "assets/productos/baddie-3.png",
        "desc": "Fresas maduras combinadas con kiwi tropical ácido."
      },
      {
        "nombre": "Cool Mint",
        "img": "assets/productos/baddie-4.png",
        "desc": "Menta glacial refrescante de alta pureza."
      },
      {
        "nombre": "Peach Mango",
        "img": "assets/productos/baddie-5.png",
        "desc": "Durazno aterciopelado con mango dulce."
      },
      {
        "nombre": "Grape Ice",
        "img": "assets/productos/baddie-6.png",
        "desc": "Uvas moradas intensas con toque helado."
      },
      {
        "nombre": "Sour Apple",
        "img": "assets/productos/baddie-7.png",
        "desc": "Manzana verde ácida y chispeante."
      },
      {
        "nombre": "Pink Lemonade",
        "img": "assets/productos/baddie-8.png",
        "desc": "Limonada rosada refrescante con frutos rojos."
      },
      {
        "nombre": "Cherry Cola",
        "img": "assets/productos/baddie-9.png",
        "desc": "Cola clásica burbujeante con cereza dulce."
      },
      {
        "nombre": "Blueberry Raspberry",
        "img": "assets/productos/baddie-10.png",
        "desc": "Mezcla de arándanos y frambuesas silvestres."
      },
      {
        "nombre": "Strawberry Banana",
        "img": "assets/productos/baddie-11.png",
        "desc": "Batido cremoso de fresa y banano."
      },
      {
        "nombre": "Kiwi Passion Fruit Guava",
        "img": "assets/productos/baddie-12.png",
        "desc": "Trilogía tropical de kiwi, maracuyá y guayaba."
      },
      {
        "nombre": "Triple Berry",
        "img": "assets/productos/baddie-13.png",
        "desc": "Tres tipos de bayas intensas y jugosas."
      },
      {
        "nombre": "Pineapple Ice",
        "img": "assets/productos/baddie-14.png",
        "desc": "Piña dorada tropical con efecto frío."
      },
      {
        "nombre": "Mango Ice",
        "img": "assets/productos/baddie-15.png",
        "desc": "Mango maduro caribeño con golpe helado."
      },
      {
        "nombre": "Juicy Peach",
        "img": "assets/productos/baddie-16.png",
        "desc": "Melocotón jugoso y dulce de aroma intenso."
      },
      {
        "nombre": "Blackberry Ice",
        "img": "assets/productos/baddie-17.png",
        "desc": "Moras negras silvestres con hielo."
      },
      {
        "nombre": "Cotton Candy",
        "img": "assets/productos/baddie-18.png",
        "desc": "Algodón de azúcar dulce y nostálgico."
      },
      {
        "nombre": "Miami Mint",
        "img": "assets/productos/baddie-19.png",
        "desc": "Menta suave estilo Miami con notas cítricas."
      },
      {
        "nombre": "Dragon Fruit Banana",
        "img": "assets/productos/baddie-20.png",
        "desc": "Pitahaya exótica combinada con banano."
      },
      {
        "nombre": "Energy Bull",
        "img": "assets/productos/baddie-21.png",
        "desc": "Sabor energizante con arándanos y toque efervescente."
      }
    ]
  },
  {
    "id": "donut",
    "nombre": "DONUT",
    "categoria": "desechables",
    "subtitulo": "50.000 Puffs • 20 Sabores",
    "puffs": 50000,
    "precio": 40000,
    "precio_promo_2": 70000,
    "ahorro_2": 10000,
    "rating": 4.8,
    "ventas": 3950,
    "imagen": "DONUT/248.png",
    "descripcion": "Diseño innovador y divertido con 12.000 caladas de sabor ultra dulce, notas de postre, frutas y gomitas.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Dragon Melón",
        "img": "DONUT/248.png",
        "desc": "Dragon Fruit y melón refrescante."
      },
      {
        "nombre": "Sour Chill Apple",
        "img": "DONUT/249.png",
        "desc": "Manzana verde helada y ácida."
      },
      {
        "nombre": "Blueberry Watermelon",
        "img": "DONUT/250.png",
        "desc": "Arándano jugoso con sandía helada."
      },
      {
        "nombre": "The Mighty Peach",
        "img": "DONUT/251.png",
        "desc": "Melocotón maduro dulce y carnoso."
      },
      {
        "nombre": "Uva",
        "img": "DONUT/252.png",
        "desc": "Uva morada intensa (The Mighty Grape)."
      },
      {
        "nombre": "Miami Mint",
        "img": "DONUT/253.png",
        "desc": "Menta fresca clásica estilo Miami."
      },
      {
        "nombre": "Blue Razz Ice",
        "img": "DONUT/254.png",
        "desc": "Mora azul ácida con golpe frío."
      },
      {
        "nombre": "Mango",
        "img": "DONUT/255.png",
        "desc": "Mango tropical súper dulce (The Mighty Mango)."
      },
      {
        "nombre": "Berry Crush",
        "img": "DONUT/256.png",
        "desc": "Triturado de frutos rojos silvestres."
      },
      {
        "nombre": "B Burst",
        "img": "DONUT/257.png",
        "desc": "Explosión de caramelos masticables y gomitas."
      },
      {
        "nombre": "Watermelon Ice",
        "img": "DONUT/258.png",
        "desc": "Sandía helada ultra refrescante."
      },
      {
        "nombre": "Fcuking FAB",
        "img": "DONUT/259.png",
        "desc": "Mezcla secreta frutal tropical y cítrica."
      },
      {
        "nombre": "Freezy Banana",
        "img": "DONUT/260.png",
        "desc": "Plátano cremoso con terminado frozen."
      },
      {
        "nombre": "The Mighty Straw",
        "img": "DONUT/261.png",
        "desc": "Fresa madura dulce e intensa."
      },
      {
        "nombre": "Piña Colada",
        "img": "DONUT/262.png",
        "desc": "Cóctel helado de piña y crema de coco (Freezy Pina Colada)."
      },
      {
        "nombre": "Blackberry FAB",
        "img": "DONUT/263.png",
        "desc": "Mora silvestre profunda con matices cítricos."
      },
      {
        "nombre": "Sour FAB",
        "img": "DONUT/264.png",
        "desc": "Caramelos ácidos explosivos."
      },
      {
        "nombre": "Oasis Bliss",
        "img": "DONUT/265.png",
        "desc": "Oasis de frutas tropicales y frescura."
      },
      {
        "nombre": "Dragon Razz",
        "img": "DONUT/266.png",
        "desc": "Pitahaya con frambuesas ácidas."
      },
      {
        "nombre": "Manzana Verde",
        "img": "DONUT/267.png",
        "desc": "Manzana crujiente (The Mighty Apple)."
      }
    ]
  },
  {
    "id": "solobar-kit",
    "nombre": "SOLOBAR KIT",
    "categoria": "kits",
    "subtitulo": "35.000 Puffs • 8 Sabores",
    "puffs": 35000,
    "precio": 39000,
    "precio_promo_2": 70000,
    "ahorro_2": 8000,
    "rating": 4.8,
    "ventas": 3100,
    "imagen": "SOLOBAR KIT/Citricos refrescantes.png",
    "descripcion": "Kit con batería recargable y pods intercambiables de 10.000 puffs, ideal para quienes buscan versatilidad y ahorro continuo.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Cítricos Refrescantes",
        "img": "SOLOBAR KIT/Citricos refrescantes.png",
        "desc": "Explosión de lima, limón y naranja cítrica."
      },
      {
        "nombre": "Durazno Morado",
        "img": "SOLOBAR KIT/Durazno morado.png",
        "desc": "Durazno dulce con notas oscuras frutales."
      },
      {
        "nombre": "Explosión de Uva",
        "img": "SOLOBAR KIT/Explosion de uva.png",
        "desc": "Uvas moradas jugosas en su punto."
      },
      {
        "nombre": "Mango Dulce",
        "img": "SOLOBAR KIT/Mango dulce.png",
        "desc": "Mango maduro caribeño."
      },
      {
        "nombre": "Manzana Sandía",
        "img": "SOLOBAR KIT/Manzana sandia.png",
        "desc": "Manzana crocante con sandía refrescante."
      },
      {
        "nombre": "Menta Fresca",
        "img": "SOLOBAR KIT/Menta fresca.png",
        "desc": "Menta natural revitalizante."
      },
      {
        "nombre": "Puro Neutro",
        "img": "SOLOBAR KIT/Puro neutro.png",
        "desc": "Vapor limpio sin notas invasivas."
      },
      {
        "nombre": "Tabaco",
        "img": "SOLOBAR KIT/Tabaco.png",
        "desc": "Tabaco rubio tostado tradicional."
      }
    ]
  },
  {
    "id": "solobar-pod",
    "nombre": "SOLOBAR POD",
    "categoria": "pods",
    "subtitulo": "35.000 Puffs • 8 Sabores",
    "puffs": 35000,
    "precio": 29000,
    "precio_promo_2": 50000,
    "ahorro_2": 8000,
    "rating": 4.8,
    "ventas": 4200,
    "imagen": "SOLOBAR POD/Durazno piña.png",
    "descripcion": "Cartucho de repuesto para Solobar Kit con 10.000 caladas de sabor puro y tecnología de resistencia de malla.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Durazno Piña",
        "img": "SOLOBAR POD/Durazno piña.png",
        "desc": "Fusión tropical de durazno y piña dorada."
      },
      {
        "nombre": "Explosión de Uva",
        "img": "SOLOBAR POD/Explosion de uva.png",
        "desc": "Uva negra dulce y jugosa."
      },
      {
        "nombre": "Frambuesa con Limón",
        "img": "SOLOBAR POD/Frambuesa con limon.png",
        "desc": "Frambuesa silvestre con toque cítrico de limón."
      },
      {
        "nombre": "Mango Dulce",
        "img": "SOLOBAR POD/Mango dulce.png",
        "desc": "Mango dulce tropical."
      },
      {
        "nombre": "Mora Azul",
        "img": "SOLOBAR POD/Mora azul.png",
        "desc": "Arándanos y moras azules maduras."
      },
      {
        "nombre": "Sandía",
        "img": "SOLOBAR POD/Sandia.png",
        "desc": "Sandía veraniega hidratante."
      },
      {
        "nombre": "Tabaco",
        "img": "SOLOBAR POD/Tabaco.png",
        "desc": "Tabaco clásico suave."
      },
      {
        "nombre": "Uva Helada",
        "img": "SOLOBAR POD/Uva helada.png",
        "desc": "Uvas dulces con toque de hielo."
      }
    ]
  },
  {
    "id": "yocco",
    "nombre": "YOCCO",
    "categoria": "desechables",
    "subtitulo": "5.100 Puffs • 7 Sabores",
    "puffs": 5100,
    "precio": 14000,
    "precio_promo_2": 24000,
    "ahorro_2": 4000,
    "rating": 4.8,
    "ventas": 2100,
    "imagen": "YOCCO/Mora azul.png",
    "descripcion": "Vape desechable elegante y compacto con 10.000 puffs de sabores frutales y refrescantes.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Durazno Helado",
        "img": "YOCCO/Durazno helado.png",
        "desc": "Melocotón con hielo polar."
      },
      {
        "nombre": "Explosión Tropical",
        "img": "YOCCO/Explosion tropical.png",
        "desc": "Frutas exóticas caribeñas."
      },
      {
        "nombre": "Fresa Kiwi",
        "img": "YOCCO/Fresa kiwi.png",
        "desc": "Fresa dulce y kiwi acidulado."
      },
      {
        "nombre": "Fresa Mango",
        "img": "YOCCO/Fresa mango.png",
        "desc": "Fresa combinada con mango."
      },
      {
        "nombre": "Maracuyá",
        "img": "YOCCO/Maracuya.png",
        "desc": "Fruta de la pasión intensa."
      },
      {
        "nombre": "Melocotón Mango",
        "img": "YOCCO/Melocoton mango.png",
        "desc": "Durazno y mango dulce."
      },
      {
        "nombre": "Mora Azul",
        "img": "YOCCO/Mora azul.png",
        "desc": "Moras silvestres frescas."
      }
    ]
  },
  {
    "id": "death-row",
    "nombre": "DEATH ROW",
    "categoria": "desechables",
    "subtitulo": "5.000 Puffs • 9 Sabores",
    "puffs": 5000,
    "precio": 15000,
    "precio_promo_2": 25000,
    "ahorro_2": 5000,
    "rating": 4.8,
    "ventas": 1950,
    "imagen": "DEATH ROW/Explosion tropical.png",
    "descripcion": "Edición oficial Death Row Records con 7.000 caladas de potencia pura y perfiles de sabor legendarios.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Dulce",
        "img": "DEATH ROW/Dulce.png",
        "desc": "Caramelo azucarado clásico."
      },
      {
        "nombre": "Durazno Uva",
        "img": "DEATH ROW/Durazno uva.png",
        "desc": "Durazno suave con uva oscura."
      },
      {
        "nombre": "Explosión Tropical",
        "img": "DEATH ROW/Explosion tropical.png",
        "desc": "Carga de frutas del trópico."
      },
      {
        "nombre": "Fresa Banano",
        "img": "DEATH ROW/Fresa banano.png",
        "desc": "Batido de fresa con banano."
      },
      {
        "nombre": "Fresa Durazno",
        "img": "DEATH ROW/Fresa durazno.png",
        "desc": "Fresas del huerto con melocotón."
      },
      {
        "nombre": "Kiwi Fresa",
        "img": "DEATH ROW/Kiwi fresa.png",
        "desc": "Kiwi fresco y fresa dulce."
      },
      {
        "nombre": "Mango Uva",
        "img": "DEATH ROW/Mango uva.png",
        "desc": "Mango maduro con uva morada."
      },
      {
        "nombre": "Menta",
        "img": "DEATH ROW/Menta.png",
        "desc": "Menta limpia y helada."
      },
      {
        "nombre": "Miel de Piña",
        "img": "DEATH ROW/Miel de piña.png",
        "desc": "Piña dorada caramelizada con miel."
      }
    ]
  },
  {
    "id": "lost-mary-os",
    "nombre": "LOST MARY OS",
    "categoria": "desechables",
    "subtitulo": "5.000 Puffs • 26 Sabores",
    "puffs": 5000,
    "precio": 18000,
    "precio_promo_2": 30000,
    "ahorro_2": 6000,
    "rating": 4.8,
    "ventas": 5120,
    "imagen": "LOST MARY OS/fresa hielo.png",
    "descripcion": "Uno de los vapes desechables más reconocidos a nivel mundial, con diseño ergonómico de superficie planetaria y 5.000 caladas suaves.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Arándano Helado",
        "img": "LOST MARY OS/arandano helado.png",
        "desc": "Arándano azul con frío polar."
      },
      {
        "nombre": "Arándano",
        "img": "LOST MARY OS/arandano.png",
        "desc": "Arándanos puros silvestres."
      },
      {
        "nombre": "Banano",
        "img": "LOST MARY OS/banano.png",
        "desc": "Plátano dulce y cremoso."
      },
      {
        "nombre": "Cereza",
        "img": "LOST MARY OS/cereza.png",
        "desc": "Cerezas rojas jugosas."
      },
      {
        "nombre": "Durazno",
        "img": "LOST MARY OS/durazno.png",
        "desc": "Melocotón carnoso dulce."
      },
      {
        "nombre": "Frambuesa",
        "img": "LOST MARY OS/frambuesa.png",
        "desc": "Frambuesas ácidas y vivas."
      },
      {
        "nombre": "Fresa Hielo",
        "img": "LOST MARY OS/fresa hielo.png",
        "desc": "Fresas maduras en hielo picado."
      },
      {
        "nombre": "Fresa Mango",
        "img": "LOST MARY OS/fresa mango.png",
        "desc": "Fresas dulces y mango tropical."
      },
      {
        "nombre": "Fresa Nieve",
        "img": "LOST MARY OS/fresa nieve.png",
        "desc": "Nieve helada sabor fresa."
      },
      {
        "nombre": "Kiwi",
        "img": "LOST MARY OS/kiwi.png",
        "desc": "Kiwi verde refrescante."
      },
      {
        "nombre": "Limón",
        "img": "LOST MARY OS/limon.png",
        "desc": "Limón amarillo cítrico."
      },
      {
        "nombre": "Limonada",
        "img": "LOST MARY OS/limonada.png",
        "desc": "Limonada clásica veraniega."
      },
      {
        "nombre": "Mad Azul",
        "img": "LOST MARY OS/mad azul.png",
        "desc": "Trilogía de frutos azules intensos."
      },
      {
        "nombre": "Mango",
        "img": "LOST MARY OS/mango.png",
        "desc": "Mango caribeño maduro."
      },
      {
        "nombre": "Menta Spear",
        "img": "LOST MARY OS/menta spear.png",
        "desc": "Hierbabuena suave y herbal."
      },
      {
        "nombre": "Menta",
        "img": "LOST MARY OS/menta.png",
        "desc": "Menta fresca y pura."
      },
      {
        "nombre": "Mora Azul",
        "img": "LOST MARY OS/mora azul.png",
        "desc": "Mora azul dulce."
      },
      {
        "nombre": "Neutro",
        "img": "LOST MARY OS/neutro.png",
        "desc": "Sin aroma dulce, vapor limpio."
      },
      {
        "nombre": "Pitaya",
        "img": "LOST MARY OS/pitaya.png",
        "desc": "Dragon fruit sutil y refrescante."
      },
      {
        "nombre": "Piña Colada",
        "img": "LOST MARY OS/piña colada.png",
        "desc": "Piña dulce con crema de coco."
      },
      {
        "nombre": "Piña Mango",
        "img": "LOST MARY OS/piña mango.png",
        "desc": "Piña caribeña con mango maduro."
      },
      {
        "nombre": "Sandía Limón",
        "img": "LOST MARY OS/sandia limon.png",
        "desc": "Sandía jugosa con gotas de limón."
      },
      {
        "nombre": "Sandía",
        "img": "LOST MARY OS/sandia.png",
        "desc": "Sandía roja y fresca."
      },
      {
        "nombre": "Sueño Mary",
        "img": "LOST MARY OS/sueño mary.png",
        "desc": "Fórmula de ensueño frutal Lost Mary."
      },
      {
        "nombre": "Uva Sakura",
        "img": "LOST MARY OS/uva sakura.png",
        "desc": "Uva dulce con notas florales de cerezo."
      },
      {
        "nombre": "Uva",
        "img": "LOST MARY OS/uva.png",
        "desc": "Uvas moradas clásicas."
      }
    ]
  },
  {
    "id": "lost-mary-mo",
    "nombre": "LOST MARY MO",
    "categoria": "desechables",
    "subtitulo": "5.000 Puffs • 15 Sabores",
    "puffs": 5000,
    "precio": 18000,
    "precio_promo_2": 30000,
    "ahorro_2": 6000,
    "rating": 4.8,
    "ventas": 3890,
    "imagen": "LOST MARY MO/Blue trio.png",
    "descripcion": "Diseño cilíndrico ultra ergonómico con acabado marmoleado de lujo y tecnología de resistencia de malla para caladas sedosas.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Arándano",
        "img": "LOST MARY MO/Arandano.png",
        "desc": "Arándano silvestre delicioso."
      },
      {
        "nombre": "Blue Trio",
        "img": "LOST MARY MO/Blue trio.png",
        "desc": "Trío de moras, frambuesas y arándanos."
      },
      {
        "nombre": "Cereza Limón",
        "img": "LOST MARY MO/Cereza limon.png",
        "desc": "Cerezas rojas con chispa de limón."
      },
      {
        "nombre": "Dulce",
        "img": "LOST MARY MO/Dulce.png",
        "desc": "Notas caramelizadas suaves."
      },
      {
        "nombre": "Durazno",
        "img": "LOST MARY MO/Durazno.png",
        "desc": "Melocotón jugoso de verano."
      },
      {
        "nombre": "Energizante",
        "img": "LOST MARY MO/Energizante.png",
        "desc": "Sabor a bebida energética revitalizante."
      },
      {
        "nombre": "Fusión Kiwi",
        "img": "LOST MARY MO/Fusion kiwi.png",
        "desc": "Kiwi mezclado con frutas verdes."
      },
      {
        "nombre": "Ginger",
        "img": "LOST MARY MO/Ginger.png",
        "desc": "Jengibre suave especiado y fresco."
      },
      {
        "nombre": "Limón",
        "img": "LOST MARY MO/Limon.png",
        "desc": "Limón cítrico refrescante."
      },
      {
        "nombre": "Mango",
        "img": "LOST MARY MO/Mango.png",
        "desc": "Mango tropical dulce."
      },
      {
        "nombre": "Menta",
        "img": "LOST MARY MO/Mneta.png",
        "desc": "Menta natural refrescante."
      },
      {
        "nombre": "Piña Manzana",
        "img": "LOST MARY MO/Piña manzana.png",
        "desc": "Piña dorada y manzana verde."
      },
      {
        "nombre": "Sandía Cereza",
        "img": "LOST MARY MO/Sandia cereza.png",
        "desc": "Sandía dulce con cerezas."
      },
      {
        "nombre": "Sandía",
        "img": "LOST MARY MO/Sandia.png",
        "desc": "Sandía jugosa."
      },
      {
        "nombre": "Uva Dulce",
        "img": "LOST MARY MO/Uva dulce.png",
        "desc": "Uvas dulces maduras."
      }
    ]
  },
  {
    "id": "ease",
    "nombre": "EASE",
    "categoria": "desechables",
    "subtitulo": "8.000 Puffs • 29 Sabores",
    "puffs": 8000,
    "precio": 18000,
    "precio_promo_2": 30000,
    "ahorro_2": 6000,
    "rating": 4.8,
    "ventas": 4600,
    "imagen": "EASE/Mango.png",
    "descripcion": "El Ease destaca por su boquilla de silicona ergonómica, pantalla LED informativa y 30 opciones de sabor frutal e intenso.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Algodón de Azúcar",
        "img": "EASE/Algodon de azucar.png",
        "desc": "Algodón dulce ferial nostálgico."
      },
      {
        "nombre": "Arándano Azul",
        "img": "EASE/Arandano azul.png",
        "desc": "Mora y arándano azul dulce."
      },
      {
        "nombre": "Arándano",
        "img": "EASE/Arandano.png",
        "desc": "Arándanos silvestres frescos."
      },
      {
        "nombre": "Cereza",
        "img": "EASE/cereza.png",
        "desc": "Cereza roja dulce."
      },
      {
        "nombre": "Coco",
        "img": "EASE/coco.png",
        "desc": "Coco tropical cremoso."
      },
      {
        "nombre": "Durazno",
        "img": "EASE/Durazno.png",
        "desc": "Melocotón dulce y jugoso."
      },
      {
        "nombre": "Fresa - Banano",
        "img": "EASE/fresa - banano.png",
        "desc": "Clásico batido de fresa y banano."
      },
      {
        "nombre": "Fresa Helada",
        "img": "EASE/fresa helada.png",
        "desc": "Fresas maduras en hielo."
      },
      {
        "nombre": "Frío Pacífico",
        "img": "EASE/Frio pacifico.png",
        "desc": "Brisa marina con frescura oceánica."
      },
      {
        "nombre": "Frutos Rojos",
        "img": "EASE/frutos rojos.png",
        "desc": "Mix silvestre de bayas y frutos rojos."
      },
      {
        "nombre": "Jungle",
        "img": "EASE/Jungel.png",
        "desc": "Fórmula misteriosa de la selva tropical."
      },
      {
        "nombre": "Kiwi",
        "img": "EASE/Kiwi.png",
        "desc": "Kiwi jugoso y acidito."
      },
      {
        "nombre": "Lulo",
        "img": "EASE/Lulo.png",
        "desc": "Lulo colombiano cítrico y refrescante."
      },
      {
        "nombre": "Mango Azul",
        "img": "EASE/Mango azul.png",
        "desc": "Mango dulce con toques de mora azul."
      },
      {
        "nombre": "Mango",
        "img": "EASE/Mango.png",
        "desc": "Mango caribeño maduro."
      },
      {
        "nombre": "Manzana",
        "img": "EASE/Manzana.png",
        "desc": "Manzana roja dulce y crocante."
      },
      {
        "nombre": "Manzana Verde",
        "img": "EASE/ManzanaVerde.png",
        "desc": "Manzana ácida y refrescante."
      },
      {
        "nombre": "Melón",
        "img": "EASE/Melon.png",
        "desc": "Melón verde suave."
      },
      {
        "nombre": "Menta Azul",
        "img": "EASE/Menta azul.png",
        "desc": "Menta fresca con fondo de arándano."
      },
      {
        "nombre": "Menta",
        "img": "EASE/Menta.png",
        "desc": "Menta glaciar pura."
      },
      {
        "nombre": "Naranja",
        "img": "EASE/Naranja.png",
        "desc": "Naranja dulce exprimida."
      },
      {
        "nombre": "Pera",
        "img": "EASE/Pera.png",
        "desc": "Pera dulce y delicada."
      },
      {
        "nombre": "Piña Colada",
        "img": "EASE/piña colada.png",
        "desc": "Piña dulce y crema de coco."
      },
      {
        "nombre": "Piña",
        "img": "EASE/piña.png",
        "desc": "Piña dorada tropical."
      },
      {
        "nombre": "Sandía",
        "img": "EASE/Sandia.png",
        "desc": "Sandía roja y refrescante."
      },
      {
        "nombre": "Toronja",
        "img": "EASE/Toronja.png",
        "desc": "Toronja rosada con agradable amargor cítrico."
      },
      {
        "nombre": "Trío Azul",
        "img": "EASE/Trio azul.png",
        "desc": "Combinación de 3 frutas azules."
      },
      {
        "nombre": "Uva Rojo",
        "img": "EASE/uva rojo.png",
        "desc": "Uva borgoña dulce e intensa."
      },
      {
        "nombre": "Uva",
        "img": "EASE/Uva.png",
        "desc": "Uva morada clásica."
      }
    ]
  },
  {
    "id": "dummy",
    "nombre": "DUMMY",
    "categoria": "desechables",
    "subtitulo": "8.000 Puffs • 16 Sabores",
    "puffs": 8000,
    "precio": 18000,
    "precio_promo_2": 30000,
    "ahorro_2": 6000,
    "rating": 4.8,
    "ventas": 3750,
    "imagen": "DUMMY/fresa.png",
    "descripcion": "Inspirado en la cultura urbana con pantalla LED que indica batería y líquido, ofreciendo 8.000 caladas de gran densidad.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Arándano",
        "img": "DUMMY/arandano.png",
        "desc": "Arándano silvestre."
      },
      {
        "nombre": "Bad Berry",
        "img": "DUMMY/bad berry.png",
        "desc": "Bayas oscuras rebeldes."
      },
      {
        "nombre": "Fizzy Limón",
        "img": "DUMMY/fizzy limon.png",
        "desc": "Limón burbujeante efervescente."
      },
      {
        "nombre": "Fresa",
        "img": "DUMMY/fresa.png",
        "desc": "Fresa madura dulce."
      },
      {
        "nombre": "Gomita",
        "img": "DUMMY/gomita.png",
        "desc": "Gomitas de osito masticables."
      },
      {
        "nombre": "Guava",
        "img": "DUMMY/guava.png",
        "desc": "Guayaba tropical aromática."
      },
      {
        "nombre": "Invasión Alien",
        "img": "DUMMY/invasion alien.png",
        "desc": "Mezcla misteriosa de otro planeta."
      },
      {
        "nombre": "Kiwi",
        "img": "DUMMY/kiwi.png",
        "desc": "Kiwi verde fresco."
      },
      {
        "nombre": "Manzana",
        "img": "DUMMY/manzana.png",
        "desc": "Manzana dulce crocante."
      },
      {
        "nombre": "Naranja",
        "img": "DUMMY/naranja.png",
        "desc": "Naranja jugosa."
      },
      {
        "nombre": "Neutro",
        "img": "DUMMY/neutro.png",
        "desc": "Sabor neutro sin dulzura."
      },
      {
        "nombre": "Rainbow Rapper",
        "img": "DUMMY/rainbow rapper.png",
        "desc": "Caramelos multicolores de rap."
      },
      {
        "nombre": "Sandía",
        "img": "DUMMY/sandia.png",
        "desc": "Sandía veraniega."
      },
      {
        "nombre": "Sueño Dummy",
        "img": "DUMMY/sueño dummy.png",
        "desc": "Fantasía frutal de la casa Dummy."
      },
      {
        "nombre": "Troll",
        "img": "DUMMY/troll.png",
        "desc": "Caramelo ácido de troll."
      },
      {
        "nombre": "Uva",
        "img": "DUMMY/uva.png",
        "desc": "Uvas moradas intensas."
      }
    ]
  },
  {
    "id": "nicky-jam",
    "nombre": "NICKY JAM",
    "categoria": "desechables",
    "subtitulo": "15.000 Puffs • 16 Sabores",
    "puffs": 15000,
    "precio": 27000,
    "precio_promo_2": 45000,
    "ahorro_2": 9000,
    "rating": 4.8,
    "ventas": 4100,
    "imagen": "NICKY JAM/el ganador.png",
    "descripcion": "Edición oficial de Nicky Jam con 10.000 puffs, pantalla digital de batería y líquido, y sabores urbanos irresistibles.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "69 Bananas",
        "img": "NICKY JAM/69 bananas.png",
        "desc": "Plátano dulce con estilo urbano."
      },
      {
        "nombre": "Black Hat",
        "img": "NICKY JAM/black hat.png",
        "desc": "Misterio de moras oscuras de Nicky."
      },
      {
        "nombre": "Calor Juice",
        "img": "NICKY JAM/calor juice.png",
        "desc": "Jugo frutal encendido de verano."
      },
      {
        "nombre": "Durazno XXX",
        "img": "NICKY JAM/durazno xxx.png",
        "desc": "Melocotón extra jugoso y atrevido."
      },
      {
        "nombre": "El Ganador",
        "img": "NICKY JAM/el ganador.png",
        "desc": "El sabor insignia de los campeones."
      },
      {
        "nombre": "Estilo en Miami",
        "img": "NICKY JAM/estilo en miami.png",
        "desc": "Frutas tropicales frente al mar."
      },
      {
        "nombre": "Fantasía Fume",
        "img": "NICKY JAM/fantasia fume.png",
        "desc": "Fantasía exótica de vapor denso."
      },
      {
        "nombre": "Fresh Whine Up",
        "img": "NICKY JAM/fresh whine up.png",
        "desc": "Golpe fresco con ritmo caribeño."
      },
      {
        "nombre": "Jugo Cálido",
        "img": "NICKY JAM/jugo calido.png",
        "desc": "Néctar frutal suave y placentero."
      },
      {
        "nombre": "Lush Medellín",
        "img": "NICKY JAM/lush medellin.png",
        "desc": "Sandía helada homenaje a la ciudad de la eterna primavera."
      },
      {
        "nombre": "Menta en la Disco",
        "img": "NICKY JAM/menta en la disco.png",
        "desc": "Menta electrizante de fiesta nocturna."
      },
      {
        "nombre": "Menta",
        "img": "NICKY JAM/menta.png",
        "desc": "Menta fresca clásica."
      },
      {
        "nombre": "Ojos Rojos",
        "img": "NICKY JAM/ojos rojos.png",
        "desc": "Frutas rojas maduras e intensas."
      },
      {
        "nombre": "Summer Amante",
        "img": "NICKY JAM/summer amante.png",
        "desc": "Amor de verano entre frutas tropicales."
      },
      {
        "nombre": "Sweet Gatas",
        "img": "NICKY JAM/sweet gatas.png",
        "desc": "Dulzura frutal irresistible."
      },
      {
        "nombre": "Yellow Amanecer",
        "img": "NICKY JAM/yellow amanecer.png",
        "desc": "Frutas amarillas de amanecer tropical."
      }
    ]
  },
  {
    "id": "beyond",
    "nombre": "BEYOND",
    "categoria": "desechables",
    "subtitulo": "12.000 Puffs • 5 Sabores",
    "puffs": 12000,
    "precio": 22000,
    "precio_promo_2": 40000,
    "ahorro_2": 4000,
    "rating": 4.8,
    "ventas": 2300,
    "imagen": "BEYOND/Blue sour razz.png",
    "descripcion": "Dispositivo premium de 10.000 caladas con diseño futurista y sabores frutales de máxima pureza.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Blue Sour Razz",
        "img": "BEYOND/Blue sour razz.png",
        "desc": "Frambuesa azul ácida y electrizante."
      },
      {
        "nombre": "Cereza Crush",
        "img": "BEYOND/Cereza crush.png",
        "desc": "Cereza triturada súper jugosa."
      },
      {
        "nombre": "Cereza Durazno Limón",
        "img": "BEYOND/Cereza durazno limon.png",
        "desc": "Trío de cereza dulce, durazno y toque cítrico."
      },
      {
        "nombre": "Durazno Blanco",
        "img": "BEYOND/Durazno blanco.png",
        "desc": "Melocotón blanco delicado y dulce."
      },
      {
        "nombre": "Piña",
        "img": "BEYOND/Piña.png",
        "desc": "Piña tropical madura."
      }
    ]
  },
  {
    "id": "bugatti",
    "nombre": "BUGATTI",
    "categoria": "desechables",
    "subtitulo": "17.000 Puffs • 9 Sabores",
    "puffs": 17000,
    "precio": 27000,
    "precio_promo_2": 45000,
    "ahorro_2": 9000,
    "rating": 4.9,
    "ventas": 3800,
    "imagen": "BUGATTI/Mora azul.png",
    "descripcion": "El lujo y la potencia automotriz llevados al vapeo: diseño aerodinámico exclusivo, acabados metálicos y 9.000 caladas de máxima intensidad.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Fresa Piña Colada",
        "img": "BUGATTI/fresa piña colada.png",
        "desc": "Cóctel premium de fresa, piña y coco."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "BUGATTI/Fresa sandia.png",
        "desc": "Fresa madura con sandía jugosa."
      },
      {
        "nombre": "Fruta de Dragón",
        "img": "BUGATTI/fruta de dragon.png",
        "desc": "Pitahaya exótica refinada."
      },
      {
        "nombre": "Helado de Banana",
        "img": "BUGATTI/helado de banana.png",
        "desc": "Crema de banana helada gourmet."
      },
      {
        "nombre": "Mango Melón",
        "img": "BUGATTI/mango melon.png",
        "desc": "Mango caribeño con melón dulce."
      },
      {
        "nombre": "Menta",
        "img": "BUGATTI/menta.png",
        "desc": "Menta glaciar de alta gama."
      },
      {
        "nombre": "Mora Azul",
        "img": "BUGATTI/Mora azul.png",
        "desc": "Arándanos y moras azules intensas."
      },
      {
        "nombre": "Naranja Coqueta",
        "img": "BUGATTI/naranja coqueta.png",
        "desc": "Naranja cítrica y seductora."
      },
      {
        "nombre": "Uva Deliciosa",
        "img": "BUGATTI/uva deliciosa.png",
        "desc": "Uvas moradas exquisitas."
      }
    ]
  },
  {
    "id": "nimbox-kit",
    "nombre": "NIMBOX KIT",
    "categoria": "kits",
    "subtitulo": "25.000 Puffs • 12 Sabores",
    "puffs": 25000,
    "precio": 28000,
    "precio_promo_2": 45000,
    "ahorro_2": 11000,
    "rating": 4.8,
    "ventas": 2900,
    "imagen": "NIMBOX KIT/fresa sandia.png",
    "descripcion": "Sistema modular de vapeo con batería recargable tipo C y cartuchos intercambiables de 10.000 puffs.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Arándano",
        "img": "NIMBOX KIT/arandano.png",
        "desc": "Arándanos frescos."
      },
      {
        "nombre": "Bayas Mixtas",
        "img": "NIMBOX KIT/bayas mixtas.png",
        "desc": "Cosecha de bayas del bosque."
      },
      {
        "nombre": "Dulce Arcoíris",
        "img": "NIMBOX KIT/dulce arcoirirs.png",
        "desc": "Caramelos masticables dulces."
      },
      {
        "nombre": "Fresa Crema",
        "img": "NIMBOX KIT/fresa crema.png",
        "desc": "Fresas dulces con crema suave."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "NIMBOX KIT/fresa sandia.png",
        "desc": "Fresas y sandía refrescante."
      },
      {
        "nombre": "Fresa",
        "img": "NIMBOX KIT/fresa.png",
        "desc": "Fresa madura dulce."
      },
      {
        "nombre": "Grosella Negra",
        "img": "NIMBOX KIT/grosella negra.png",
        "desc": "Grosellas oscuras aciduladas."
      },
      {
        "nombre": "Manzana",
        "img": "NIMBOX KIT/manzana.png",
        "desc": "Manzana verde fresca."
      },
      {
        "nombre": "Melón",
        "img": "NIMBOX KIT/melon.png",
        "desc": "Melón jugoso."
      },
      {
        "nombre": "Menta",
        "img": "NIMBOX KIT/menta.png",
        "desc": "Menta fresca."
      },
      {
        "nombre": "Uva",
        "img": "NIMBOX KIT/uva.png",
        "desc": "Uva morada intensa."
      },
      {
        "nombre": "Yogurt Cítrico",
        "img": "NIMBOX KIT/yogurt citrico.png",
        "desc": "Yogurt cremoso con toque de limón."
      }
    ]
  },
  {
    "id": "nimbox-pod",
    "nombre": "NIMBOX POD",
    "categoria": "pods",
    "subtitulo": "25.000 Puffs • 12 Sabores",
    "puffs": 25000,
    "precio": 22000,
    "precio_promo_2": 35000,
    "ahorro_2": 9000,
    "rating": 4.8,
    "ventas": 4100,
    "imagen": "NIMBOX POD/fresa sandia.png",
    "descripcion": "Pod de repuesto para Nimbox Kit con 10.000 caladas de sabor continuo con resistencia de malla.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Arándanos",
        "img": "NIMBOX POD/arandanos.png",
        "desc": "Arándanos seleccionados."
      },
      {
        "nombre": "Bayas Mixtas",
        "img": "NIMBOX POD/bayas mixtas.png",
        "desc": "Mix de frutos del bosque."
      },
      {
        "nombre": "Explosión Dulce",
        "img": "NIMBOX POD/explosion dulce.png",
        "desc": "Caramelos dulces intensos."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "NIMBOX POD/fresa sandia.png",
        "desc": "Fresa y sandía veraniega."
      },
      {
        "nombre": "Fresa",
        "img": "NIMBOX POD/fresa.png",
        "desc": "Fresas rojas del huerto."
      },
      {
        "nombre": "Grosella Negra",
        "img": "NIMBOX POD/grosella negra.png",
        "desc": "Grosella oscura profunda."
      },
      {
        "nombre": "Helado de Fresa",
        "img": "NIMBOX POD/helado de fresa.png",
        "desc": "Helado artesanal de fresa."
      },
      {
        "nombre": "Manzana",
        "img": "NIMBOX POD/manzana.png",
        "desc": "Manzana crujiente."
      },
      {
        "nombre": "Melón",
        "img": "NIMBOX POD/melon.png",
        "desc": "Melón dulce maduro."
      },
      {
        "nombre": "Menta",
        "img": "NIMBOX POD/menta.png",
        "desc": "Menta refrescante."
      },
      {
        "nombre": "Uva",
        "img": "NIMBOX POD/uva.png",
        "desc": "Uva madura."
      },
      {
        "nombre": "Yogurt Cítrico",
        "img": "NIMBOX POD/yogurt citrico.png",
        "desc": "Yogurt suave con cítricos."
      }
    ]
  },
  {
    "id": "vera",
    "nombre": "VERA",
    "categoria": "desechables",
    "subtitulo": "22.000 Puffs • 7 Sabores",
    "puffs": 22000,
    "precio": 30000,
    "precio_promo_2": 50000,
    "ahorro_2": 10000,
    "rating": 4.8,
    "ventas": 2750,
    "imagen": "VERA/uva.png",
    "descripcion": "Dispositivo elegante de 12.000 caladas con excelente rendimiento de batería y perfiles frutales de gran intensidad.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Fresa Kiwi",
        "img": "VERA/fresa kiwi.png",
        "desc": "Fresas dulces y kiwi verde."
      },
      {
        "nombre": "Frutos Rojos",
        "img": "VERA/frutos rojos.png",
        "desc": "Mix de frutos rojos silvestres."
      },
      {
        "nombre": "Gomita",
        "img": "VERA/gomita.png",
        "desc": "Gomitas dulces masticables."
      },
      {
        "nombre": "Manzana",
        "img": "VERA/manzana.png",
        "desc": "Manzana verde jugosa."
      },
      {
        "nombre": "Menta",
        "img": "VERA/menta.png",
        "desc": "Menta helada cristalina."
      },
      {
        "nombre": "Triple Uva",
        "img": "VERA/uva triple.png",
        "desc": "Tres variedades de uva dulce."
      },
      {
        "nombre": "Uva",
        "img": "VERA/uva.png",
        "desc": "Uva clásica morada."
      }
    ]
  },
  {
    "id": "katchmi",
    "nombre": "KATCHMI",
    "categoria": "desechables",
    "subtitulo": "24.000 Puffs • 8 Sabores",
    "puffs": 24000,
    "precio": 28000,
    "precio_promo_2": 48000,
    "ahorro_2": 8000,
    "rating": 4.8,
    "ventas": 3200,
    "imagen": "KATCHMI/gomita blanca.png",
    "descripcion": "Gran capacidad de 12.000 caladas con diseño innovador, flujo de aire regulable y sabores dulces y helados.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Cereza Azul",
        "img": "KATCHMI/cereza azul.png",
        "desc": "Cereza con moras azules."
      },
      {
        "nombre": "Explosión Arizona",
        "img": "KATCHMI/explosion arizona.png",
        "desc": "Té helado frutal estilo Arizona."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "KATCHMI/fresa sandia.png",
        "desc": "Fresas dulces y sandía."
      },
      {
        "nombre": "Gomita Blanca",
        "img": "KATCHMI/gomita blanca.png",
        "desc": "Gomita blanca de piña dulce."
      },
      {
        "nombre": "Helado de Sandía",
        "img": "KATCHMI/helado de sandia.png",
        "desc": "Sandía helada ultra fresca."
      },
      {
        "nombre": "Lágrimas Ácidas",
        "img": "KATCHMI/lagrimas acidas.png",
        "desc": "Caramelo ácido potente."
      },
      {
        "nombre": "Menta de Miami",
        "img": "KATCHMI/menta de miami.png",
        "desc": "Menta refrescante Miami breeze."
      },
      {
        "nombre": "Mora Azul",
        "img": "KATCHMI/mora azul.png",
        "desc": "Mora azul jugosa."
      }
    ]
  },
  {
    "id": "fifty-cent",
    "nombre": "FIFTY CENT",
    "categoria": "desechables",
    "subtitulo": "30.000 Puffs • 7 Sabores",
    "puffs": 30000,
    "precio": 35000,
    "precio_promo_2": 55000,
    "ahorro_2": 15000,
    "rating": 4.8,
    "ventas": 3600,
    "imagen": "FIFTY CENT/purpura.png",
    "descripcion": "Edición oficial 50 Cent con 20.000 puffs de duración masiva, pantalla HD y perfiles de sabor explosivos.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Cereza Uva",
        "img": "FIFTY CENT/cereza uva.png",
        "desc": "Cereza silvestre con uvas oscuras."
      },
      {
        "nombre": "Coca Cola",
        "img": "FIFTY CENT/coca cola.png",
        "desc": "Refresco de cola clásico con hielo."
      },
      {
        "nombre": "Durazno Helado",
        "img": "FIFTY CENT/durazno helado.png",
        "desc": "Durazno maduro sobre hielo."
      },
      {
        "nombre": "Fiesta Mango",
        "img": "FIFTY CENT/fiesta mango.png",
        "desc": "Mango tropical en fiesta de sabor."
      },
      {
        "nombre": "Niebla Azul",
        "img": "FIFTY CENT/niebla azul.png",
        "desc": "Blue mist de arándanos y menta suave."
      },
      {
        "nombre": "Púrpura",
        "img": "FIFTY CENT/purpura.png",
        "desc": "Uva morada de lujo 50 Cent."
      },
      {
        "nombre": "Osito de Azúcar",
        "img": "FIFTY CENT/sito de azucar.png",
        "desc": "Gomitas de osito con azúcar escarchada."
      }
    ]
  },
  {
    "id": "spaceman",
    "nombre": "SPACEMAN",
    "categoria": "desechables",
    "subtitulo": "50.000 Puffs • 8 Sabores",
    "puffs": 50000,
    "precio": 40000,
    "precio_promo_2": 70000,
    "ahorro_2": 10000,
    "rating": 4.8,
    "ventas": 3300,
    "imagen": "SPACEMAN/fresa sandia.png",
    "descripcion": "Diseño espacial con pantalla curva a todo color, múltiples modos de potencia y 20.000 caladas de gran fidelidad.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Durazno Sandía",
        "img": "SPACEMAN/durazno sandia.png",
        "desc": "Durazno dulce con sandía espacial."
      },
      {
        "nombre": "Fresa B-Pop",
        "img": "SPACEMAN/fresa bpop.png",
        "desc": "Paleta clásica de fresa con chicle."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "SPACEMAN/fresa sandia.png",
        "desc": "Fresas y sandía cósmica."
      },
      {
        "nombre": "Fresa",
        "img": "SPACEMAN/fresa.png",
        "desc": "Fresa madura espacial."
      },
      {
        "nombre": "Mango",
        "img": "SPACEMAN/mango.png",
        "desc": "Mango tropical estelar."
      },
      {
        "nombre": "Miami Mint",
        "img": "SPACEMAN/miami mint.png",
        "desc": "Menta fresca interestelar."
      },
      {
        "nombre": "Mora Frambuesa",
        "img": "SPACEMAN/mora frambuesa.png",
        "desc": "Moras y frambuesas ácidas."
      },
      {
        "nombre": "Uva Blanca",
        "img": "SPACEMAN/uva blanca.png",
        "desc": "Uva blanca cristalina."
      }
    ]
  },
  {
    "id": "dinner-lady",
    "nombre": "DINNER LADY",
    "categoria": "desechables",
    "subtitulo": "60.000 Puffs • 12 Sabores",
    "puffs": 60000,
    "precio": 40000,
    "precio_promo_2": 70000,
    "ahorro_2": 10000,
    "rating": 4.8,
    "ventas": 3100,
    "imagen": "DINNER LADY/cereza dulce.png",
    "descripcion": "Líquidos premium británicos en formato desechable de 15.000 caladas, reconocidos por su complejidad y calidad de sabor inigualable.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Cereza California",
        "img": "DINNER LADY/cereza california.png",
        "desc": "Cerezas rojas de los valles de California."
      },
      {
        "nombre": "Cereza Dulce",
        "img": "DINNER LADY/cereza dulce.png",
        "desc": "Cereza dulce estilo repostería británica."
      },
      {
        "nombre": "Cereza Limón",
        "img": "DINNER LADY/cereza limon.png",
        "desc": "Cereza con acento cítrico de limón."
      },
      {
        "nombre": "Dulce de Arándano",
        "img": "DINNER LADY/dulce de arandano.png",
        "desc": "Arándanos caramelizados."
      },
      {
        "nombre": "Fresa B-Pop",
        "img": "DINNER LADY/fresa b pop.png",
        "desc": "Piruleta dulce de fresa."
      },
      {
        "nombre": "Melón",
        "img": "DINNER LADY/melon.png",
        "desc": "Melón dulce y perfumado."
      },
      {
        "nombre": "Miami Menta",
        "img": "DINNER LADY/miami menta.png",
        "desc": "Menta refinada y refrescante."
      },
      {
        "nombre": "Mora",
        "img": "DINNER LADY/mora.png",
        "desc": "Moras silvestres de campo inglés."
      },
      {
        "nombre": "Rosa Ácido",
        "img": "DINNER LADY/rosa acido.png",
        "desc": "Caramelos rosados agridulces."
      },
      {
        "nombre": "Sour Apple",
        "img": "DINNER LADY/sour apple.png",
        "desc": "Manzana ácida intensa."
      },
      {
        "nombre": "Sour Mango Piña",
        "img": "DINNER LADY/sour mango piña.png",
        "desc": "Mango y piña con toque ácido."
      },
      {
        "nombre": "Uva Chicle",
        "img": "DINNER LADY/uva chicle.png",
        "desc": "Chicle bomba sabor uva."
      }
    ]
  },
  {
    "id": "brass-type-c",
    "nombre": "BRASS TYPE-C",
    "categoria": "baterias",
    "subtitulo": "Batería 510 Rosca Universal",
    "precio": 35000,
    "precio_promo_2": 60000,
    "ahorro_2": 10000,
    "rating": 4.8,
    "ventas": 2100,
    "imagen": "BRASS TYPE - C/268.png",
    "descripcion": "Batería clásica con rosca 510 universal, voltaje variable, puerto de carga Type-C y cuerpo metálico de alta durabilidad.",
    "agotado": false,
    "tipo_variante": "color",
    "colores": [
      {
        "nombre": "Negro",
        "img": "assets/productos/268.png",
        "desc": "Elegante acabado negro mate."
      },
      {
        "nombre": "Dorado",
        "img": "assets/productos/268.png",
        "desc": "Acabado dorado brillante de lujo."
      },
      {
        "nombre": "Plateado",
        "img": "assets/productos/268.png",
        "desc": "Acabado cromo plateado clásico."
      },
      {
        "nombre": "Madera",
        "img": "assets/productos/268.png",
        "desc": "Acabado textura madera vintage."
      },
      {
        "nombre": "Tornasol",
        "img": "assets/productos/268.png",
        "desc": "Efecto arcoíris tornasolado brillante."
      }
    ],
    "puffs": null
  },
  {
    "id": "anv-digital",
    "nombre": "ANV DIGITAL",
    "categoria": "baterias",
    "subtitulo": "Batería 510 con Pantalla Digital",
    "precio": 40000,
    "precio_promo_2": 70000,
    "ahorro_2": 10000,
    "rating": 4.8,
    "ventas": 1950,
    "imagen": "ANV DIGITAL/269.png",
    "descripcion": "Batería 510 avanzada con pantalla digital que muestra voltaje exacto y nivel de batería en tiempo real.",
    "agotado": false,
    "tipo_variante": "color",
    "colores": [
      {
        "nombre": "Negro",
        "img": "assets/productos/269.png",
        "desc": "Acabado negro satinado con pantalla OLED."
      },
      {
        "nombre": "Dorado",
        "img": "assets/productos/269.png",
        "desc": "Dorado pulido de lujo."
      },
      {
        "nombre": "Plateado",
        "img": "assets/productos/269.png",
        "desc": "Plateado metálico refinado."
      },
      {
        "nombre": "Rojo",
        "img": "assets/productos/269.png",
        "desc": "Rojo metálico deportivo."
      },
      {
        "nombre": "Tornasol",
        "img": "assets/productos/269.png",
        "desc": "Arcoíris camaleónico."
      }
    ],
    "puffs": null
  },
  {
    "id": "high-pro",
    "nombre": "HIGH PRO",
    "categoria": "baterias",
    "subtitulo": "Batería 510 Oculta",
    "precio": 65000,
    "precio_promo_2": null,
    "ahorro_2": 0,
    "rating": 4.8,
    "ventas": 2400,
    "imagen": "HIGH PRO/270.png",
    "descripcion": "Batería de cartucho oculto para máxima discreción, protección contra caídas y precalentamiento rápido.",
    "agotado": false,
    "tipo_variante": "color",
    "colores": [
      {
        "nombre": "Rosa",
        "img": "assets/productos/270.png",
        "desc": "Tono pastel suave y moderno."
      },
      {
        "nombre": "Verde",
        "img": "assets/productos/270.png",
        "desc": "Verde militar mate."
      },
      {
        "nombre": "Negro",
        "img": "assets/productos/270.png",
        "desc": "Negro mate discreto y resistente."
      },
      {
        "nombre": "Amarillo",
        "img": "assets/productos/270.png",
        "desc": "Amarillo neón vibrante."
      },
      {
        "nombre": "Azul",
        "img": "assets/productos/270.png",
        "desc": "Azul cobalto profundo."
      }
    ],
    "puffs": null
  },
  {
    "id": "secret-pro",
    "nombre": "SECRET PRO",
    "categoria": "baterias",
    "subtitulo": "Batería 510 Ultra Discreta",
    "precio": 80000,
    "precio_promo_2": null,
    "ahorro_2": 0,
    "rating": 4.8,
    "ventas": 2150,
    "imagen": "SECRET PRO/271.png",
    "descripcion": "Batería en formato encendedor / llavero que oculta el cartucho completamente para total privacidad.",
    "agotado": false,
    "tipo_variante": "color",
    "colores": [
      {
        "nombre": "Negro",
        "img": "assets/productos/271.png",
        "desc": "Acabado negro mate táctico."
      },
      {
        "nombre": "Tornasol",
        "img": "assets/productos/271.png",
        "desc": "Tornasol irisado brillante."
      },
      {
        "nombre": "Azul",
        "img": "assets/productos/271.png",
        "desc": "Azul marino satinado."
      }
    ],
    "puffs": null
  },
  {
    "id": "waka-solo-2",
    "nombre": "WAKA SOLO 2",
    "categoria": "desechables",
    "subtitulo": "3.500 Puffs • 10 Sabores",
    "puffs": 3500,
    "precio": 45000,
    "precio_promo_2": null,
    "ahorro_2": 0,
    "rating": 4.8,
    "ventas": 3600,
    "imagen": "WAKA SOLO 2/arandano.png",
    "descripcion": "Dispositivo desechable compacto respaldado por la tecnología de Relx con 2.500 caladas de sabor refinado.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Arándano",
        "img": "WAKA SOLO 2/arandano.png",
        "desc": "Arándanos frescos intensos."
      },
      {
        "nombre": "Cereza",
        "img": "WAKA SOLO 2/cereza.png",
        "desc": "Cereza jugosa."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "WAKA SOLO 2/fresa sandia.png",
        "desc": "Fresas y sandía."
      },
      {
        "nombre": "Fresa Uva",
        "img": "WAKA SOLO 2/fresa uva.png",
        "desc": "Fresas con uvas oscuras."
      },
      {
        "nombre": "Fresa",
        "img": "WAKA SOLO 2/fresa.png",
        "desc": "Fresa dulce."
      },
      {
        "nombre": "Kiwi Maracuyá",
        "img": "WAKA SOLO 2/kiwi maracuya.png",
        "desc": "Kiwi fresco con maracuyá."
      },
      {
        "nombre": "Menta",
        "img": "WAKA SOLO 2/menta.png",
        "desc": "Menta glaciar pura."
      },
      {
        "nombre": "Piña Colada",
        "img": "WAKA SOLO 2/piña colada.png",
        "desc": "Piña dulce y coco."
      },
      {
        "nombre": "Sandía",
        "img": "WAKA SOLO 2/sandia.png",
        "desc": "Sandía veraniega."
      },
      {
        "nombre": "Uva",
        "img": "WAKA SOLO 2/uva.png",
        "desc": "Uva morada clásica."
      }
    ]
  },
  {
    "id": "waka-creator-bateria",
    "nombre": "WAKA CREATOR BATERÍA",
    "categoria": "kits",
    "subtitulo": "Batería Reutilizable Waka",
    "precio": 35000,
    "precio_promo_2": null,
    "ahorro_2": 0,
    "rating": 4.8,
    "ventas": 2100,
    "imagen": "WAKA BATERIA/283.png",
    "descripcion": "Batería recargable reutilizable compatible con todos los pods Waka Creator de 20.000 caladas.",
    "agotado": false,
    "tipo_variante": "color",
    "colores": [
      {
        "nombre": "Blanco / Plata",
        "img": "assets/productos/283.png",
        "desc": "Acabado minimalista moderno."
      },
      {
        "nombre": "Negro Grafito",
        "img": "assets/productos/283.png",
        "desc": "Elegante negro mate."
      }
    ],
    "puffs": null
  },
  {
    "id": "waka-creator-pod",
    "nombre": "WAKA CREATOR POD",
    "categoria": "pods",
    "subtitulo": "15.000 Puffs • 7 Sabores",
    "puffs": 15000,
    "precio": 50000,
    "precio_promo_2": null,
    "ahorro_2": 0,
    "rating": 4.9,
    "ventas": 4300,
    "imagen": "WAKA CREATOR POD/arandano.png",
    "descripcion": "Cartucho de 20.000 caladas con pantalla digital integrada de nivel de líquido y doble resistencia de malla.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Arándano",
        "img": "WAKA CREATOR POD/arandano.png",
        "desc": "Arándanos jugosos."
      },
      {
        "nombre": "Cereza",
        "img": "WAKA CREATOR POD/cereza.png",
        "desc": "Cerezas rojas dulces."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "WAKA CREATOR POD/fresa sandia.png",
        "desc": "Fresa y sandía fresca."
      },
      {
        "nombre": "Fresa",
        "img": "WAKA CREATOR POD/fresa.png",
        "desc": "Fresas dulces del huerto."
      },
      {
        "nombre": "Menta",
        "img": "WAKA CREATOR POD/menta.png",
        "desc": "Menta helada profunda."
      },
      {
        "nombre": "Sandía",
        "img": "WAKA CREATOR POD/sandia.png",
        "desc": "Sandía dulce refrescante."
      },
      {
        "nombre": "Uva",
        "img": "WAKA CREATOR POD/uva.png",
        "desc": "Uva morada dulce."
      }
    ]
  },
  {
    "id": "sami-2-bateria",
    "nombre": "SAMMY 2 BATERÍA",
    "categoria": "kits",
    "subtitulo": "Batería Reutilizable Sammy",
    "precio": 35000,
    "precio_promo_2": null,
    "ahorro_2": 0,
    "rating": 4.8,
    "ventas": 1850,
    "imagen": "SAMMY 2 BATERIA/292.png",
    "descripcion": "Batería de larga duración recargable por USB Tipo-C, diseñada específicamente para el sistema Sammy Pod 2.",
    "agotado": false,
    "tipo_variante": "color",
    "colores": [
      {
        "nombre": "Negro",
        "img": "assets/productos/292.png",
        "desc": "Negro mate con grip antideslizante."
      },
      {
        "nombre": "Gris Metálico",
        "img": "assets/productos/292.png",
        "desc": "Gris espacial satinado."
      }
    ],
    "puffs": null
  },
  {
    "id": "sami-pod-2",
    "nombre": "SAMMY POD 2",
    "categoria": "pods",
    "subtitulo": "15.000 Puffs • 13 Sabores",
    "puffs": 15000,
    "precio": 50000,
    "precio_promo_2": null,
    "ahorro_2": 0,
    "rating": 4.8,
    "ventas": 3700,
    "imagen": "SAMMY POD 2/banana ice.png",
    "descripcion": "Cartucho desechable de 12.000 caladas para batería Sammy 2 con amplio menú de sabores tropicales colombianos y mentolados.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Arándano Ice",
        "img": "SAMMY POD 2/arandano ice.png",
        "desc": "Arándanos con toque helado."
      },
      {
        "nombre": "Banana Ice",
        "img": "SAMMY POD 2/banana ice.png",
        "desc": "Plátano cremoso helado."
      },
      {
        "nombre": "Energetic Ice",
        "img": "SAMMY POD 2/energetic ice.png",
        "desc": "Bebida energética congelada."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "SAMMY POD 2/fresa sandia.png",
        "desc": "Fresas con sandía."
      },
      {
        "nombre": "Frutos Morados",
        "img": "SAMMY POD 2/frutos morados.png",
        "desc": "Uva, mora y arándano morado."
      },
      {
        "nombre": "Kiwi Fresa",
        "img": "SAMMY POD 2/kiwi fresa.png",
        "desc": "Kiwi ácido con fresa dulce."
      },
      {
        "nombre": "Lulo",
        "img": "SAMMY POD 2/lulo.png",
        "desc": "Lulo exótico cítrico."
      },
      {
        "nombre": "Mango Ice",
        "img": "SAMMY POD 2/mango ice.png",
        "desc": "Mango caribeño en hielo."
      },
      {
        "nombre": "Manzana Doble",
        "img": "SAMMY POD 2/manzana doble.png",
        "desc": "Doble manzana verde y roja."
      },
      {
        "nombre": "Maracuyá",
        "img": "SAMMY POD 2/maracuya.png",
        "desc": "Fruta de la pasión refrescante."
      },
      {
        "nombre": "Melón Chicle",
        "img": "SAMMY POD 2/melon chicle.png",
        "desc": "Chicle dulce de melón."
      },
      {
        "nombre": "Menta Fresca",
        "img": "SAMMY POD 2/menta fresca.png",
        "desc": "Menta natural refrescante."
      },
      {
        "nombre": "Piña Colada",
        "img": "SAMMY POD 2/piña colada.png",
        "desc": "Piña y crema de coco caribeña."
      }
    ]
  },
  {
    "id": "airpods-pro-2",
    "nombre": "AIRPODS PRO 2",
    "categoria": "accesorios",
    "subtitulo": "Cancelación Activa de Ruido",
    "precio": 75000,
    "precio_promo_2": 130000,
    "ahorro_2": 20000,
    "rating": 4.9,
    "ventas": 1820,
    "imagen": "assets/productos/311.png",
    "descripcion": "Audífonos inalámbricos con cancelación activa de ruido, modo ambiente adaptativo, audio espacial y estuche con carga MagSafe y USB-C.",
    "agotado": false,
    "tipo_variante": "color",
    "colores": [
      {
        "nombre": "Blanco Estándar",
        "img": "assets/productos/311.png",
        "desc": "Color blanco brillante original de Apple."
      }
    ]
  },
  {
    "id": "airpods-4-anc",
    "nombre": "AIRPODS 4",
    "categoria": "accesorios",
    "subtitulo": "Audio Espacial • Cancelación de Ruido",
    "precio": 69999,
    "precio_promo_2": null,
    "ahorro_2": 0,
    "rating": 5,
    "ventas": 2100,
    "imagen": "assets/productos/airpods-4.png",
    "descripcion": "La última generación de AirPods con ajuste acústico rediseñado, chip H2, aislamiento de voz superior y estuche de carga ultra compacto.",
    "agotado": false,
    "tipo_variante": "color",
    "colores": [
      {
        "nombre": "Blanco",
        "img": "assets/productos/airpods-4.png",
        "desc": "Diseño icónico blanco con estuche USB-C."
      }
    ],
    "puffs": null
  }
];
