/**
 * CAPITAL VAPE - Base de Datos Oficial de Productos, Puffs y Precios
 */
const PRODUCTS_DATA = [
  {
    "id": "bang-leader",
    "nombre": "BANG LEADER",
    "categoria": "desechables",
    "subtitulo": "32.000 Puffs • 6 Sabores",
    "puffs": 32000,
    "precio": 45000,
    "precio_promo_2": 80000,
    "ahorro_2": 10000,
    "rating": 4.8,
    "ventas": 3420,
    "imagen": "assets/productos/1.png",
    "descripcion": "El Bang Leader es un vape desechable de alto rendimiento diseñado para ofrecer hasta 32.000 caladas de sabor intenso y constante.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Red Bull – Blueberry",
        "img": "assets/productos/1.png",
        "desc": "Mezcla energética de arándanos con un toque ácido."
      },
      {
        "nombre": "Hielo de Lichi – Mango",
        "img": "assets/productos/2.png",
        "desc": "Lichi dulce con mango jugoso y un golpe helado."
      },
      {
        "nombre": "Helado de Sandía – Arándanos & Menta",
        "img": "assets/productos/3.png",
        "desc": "Sandía cremosa con arándanos y menta fresca."
      },
      {
        "nombre": "Helado de Sandía – Fresa & Mango",
        "img": "assets/productos/4.png",
        "desc": "Sandía helada con fresa dulce y mango tropical."
      },
      {
        "nombre": "Coca‑Cola – Cereza & Arándano",
        "img": "assets/productos/5.png",
        "desc": "Cola clásica con cereza y un toque de arándano."
      },
      {
        "nombre": "Sandía de Arándano – Mango de Fresa",
        "img": "assets/productos/6.png",
        "desc": "Combinación frutal de sandía, arándano, mango y fresa."
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
    "imagen": "assets/productos/214.png",
    "descripcion": "El gigante del vapeo: 40.000 puffs con tecnología DTL (Direct to Lung), simulador de narguile / shisha con vapor denso.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Amor Mágico",
        "img": "assets/productos/214.png",
        "desc": "Mezcla shisha de frutas del bosque y menta."
      },
      {
        "nombre": "Gomita",
        "img": "assets/productos/215.png",
        "desc": "Gomitas dulces estilo shisha."
      },
      {
        "nombre": "Menta Helada",
        "img": "assets/productos/216.png",
        "desc": "Menta potente con frescura helada."
      },
      {
        "nombre": "Mujer Asesina",
        "img": "assets/productos/217.png",
        "desc": "Frutos rojos con toque floral seductor."
      },
      {
        "nombre": "Amor 66",
        "img": "assets/productos/218.png",
        "desc": "Sabor legendario de melón, maracuyá y menta."
      },
      {
        "nombre": "Misterio Azul",
        "img": "assets/productos/219.png",
        "desc": "Arándano azul con toque secreto de hierbas."
      },
      {
        "nombre": "Doble Manzana",
        "img": "assets/productos/220.png",
        "desc": "Clásico sabor a doble manzana de narguile con anís."
      },
      {
        "nombre": "Vainilla Blanca",
        "img": "assets/productos/221.png",
        "desc": "Vainilla cremosa y suave."
      },
      {
        "nombre": "Sueño Lúcido",
        "img": "assets/productos/222.png",
        "desc": "Mezcla relajante de uvas y bayas dulces."
      },
      {
        "nombre": "Durazno Vainilla",
        "img": "assets/productos/223.png",
        "desc": "Durazno maduro con crema de vainilla."
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
    "imagen": "assets/productos/8.png",
    "descripcion": "Dispositivo con variantes por color, cada uno con una selección exclusiva de sabores frutales y refrescantes.",
    "agotado": false,
    "tipo_variante": "color",
    "colores": [
      {
        "nombre": "DORADO",
        "img": "assets/productos/8.png",
        "sabores": [
          "Fresa frambuesa",
          "Banano helado",
          "Toronja limón",
          "Menta",
          "Sandía",
          "Arándano"
        ]
      },
      {
        "nombre": "NEGRO",
        "img": "assets/productos/9.png",
        "sabores": [
          "Fresa frambuesa",
          "Gomitas dulces",
          "Sandía",
          "Manzana",
          "Arándano"
        ]
      },
      {
        "nombre": "ORO ROSA",
        "img": "assets/productos/10.png",
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
        "img": "assets/productos/11.png",
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
    "imagen": "assets/productos/248.png",
    "descripcion": "Diseño innovador y divertido con 12.000 caladas de sabor ultra dulce, notas de postre, frutas y gomitas.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Dragon Melón",
        "img": "assets/productos/248.png",
        "desc": "Fruta del dragón exótica con melón dulce."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "assets/productos/249.png",
        "desc": "Dúo fresco y dulce de fresa y sandía."
      },
      {
        "nombre": "Fresa Plátano",
        "img": "assets/productos/250.png",
        "desc": "Fresas con plátano cremoso."
      },
      {
        "nombre": "Mora Helada",
        "img": "assets/productos/251.png",
        "desc": "Moras silvestres con toque frío."
      },
      {
        "nombre": "Mango Helado",
        "img": "assets/productos/252.png",
        "desc": "Mango tropical con frescura helada."
      },
      {
        "nombre": "Gomitas",
        "img": "assets/productos/253.png",
        "desc": "Gomitas de osito dulces."
      },
      {
        "nombre": "Menta Fresca",
        "img": "assets/productos/254.png",
        "desc": "Menta limpia con frescura duradera."
      },
      {
        "nombre": "Sandía Helada",
        "img": "assets/productos/255.png",
        "desc": "Sandía jugosa con golpe de frío."
      },
      {
        "nombre": "Uva Helada",
        "img": "assets/productos/256.png",
        "desc": "Uvas moradas con acabado frío."
      },
      {
        "nombre": "Melocotón Mango",
        "img": "assets/productos/257.png",
        "desc": "Durazno sedoso con mango dulce."
      },
      {
        "nombre": "Kiwi Fresa",
        "img": "assets/productos/258.png",
        "desc": "Fresa dulce con kiwi cítrico."
      },
      {
        "nombre": "Piña Helada",
        "img": "assets/productos/259.png",
        "desc": "Piña dulce con toque helado."
      },
      {
        "nombre": "Arándano Frambuesa",
        "img": "assets/productos/260.png",
        "desc": "Arándanos jugosos y frambuesa ácida."
      },
      {
        "nombre": "Cereza Helada",
        "img": "assets/productos/261.png",
        "desc": "Cerezas con frescura intensa."
      },
      {
        "nombre": "Plátano Helado",
        "img": "assets/productos/262.png",
        "desc": "Plátano dulce con toque frío."
      },
      {
        "nombre": "Manzana Verde",
        "img": "assets/productos/263.png",
        "desc": "Manzana ácida y crujiente."
      },
      {
        "nombre": "Frutos Rojos",
        "img": "assets/productos/264.png",
        "desc": "Surtido de moras y bayas rojas."
      },
      {
        "nombre": "Algodón Dulce",
        "img": "assets/productos/265.png",
        "desc": "Algodón de azúcar dulce de feria."
      },
      {
        "nombre": "Limonada Rosa",
        "img": "assets/productos/266.png",
        "desc": "Limonada cítrica con fresas."
      },
      {
        "nombre": "Bebida Energética",
        "img": "assets/productos/267.png",
        "desc": "Sabor clásico a bebida energizante."
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
    "imagen": "assets/productos/12.png",
    "descripcion": "Kit con batería recargable y pods intercambiables de 10.000 puffs, ideal para quienes buscan versatilidad y ahorro continuo.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Arándano Frambuesa",
        "img": "assets/productos/12.png",
        "desc": "Arándanos jugosos con frambuesa ácida."
      },
      {
        "nombre": "Menta Fresca",
        "img": "assets/productos/13.png",
        "desc": "Menta intensa y refrescante para todo el día."
      },
      {
        "nombre": "Fresa Kiwi",
        "img": "assets/productos/14.png",
        "desc": "Fresas dulces combinadas con kiwi tropical ácido."
      },
      {
        "nombre": "Sandía Helada",
        "img": "assets/productos/15.png",
        "desc": "Sandía jugosa con un final helado irresistible."
      },
      {
        "nombre": "Mango Melocotón",
        "img": "assets/productos/16.png",
        "desc": "Mango maduro con durazno aterciopelado."
      },
      {
        "nombre": "Uva Helada",
        "img": "assets/productos/17.png",
        "desc": "Uvas moradas dulces con golpe frío."
      },
      {
        "nombre": "Manzana Doble",
        "img": "assets/productos/18.png",
        "desc": "Mezcla crujiente de manzana roja y verde."
      },
      {
        "nombre": "Frutos Rojos",
        "img": "assets/productos/19.png",
        "desc": "Explosión de bayas silvestres dulces y ácidas."
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
    "imagen": "assets/productos/20.png",
    "descripcion": "Cartucho de repuesto para Solobar Kit con 10.000 caladas de sabor puro y tecnología de resistencia de malla.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Arándano Frambuesa",
        "img": "assets/productos/20.png",
        "desc": "Arándanos jugosos con frambuesa ácida."
      },
      {
        "nombre": "Menta Fresca",
        "img": "assets/productos/21.png",
        "desc": "Menta intensa y refrescante para todo el día."
      },
      {
        "nombre": "Fresa Kiwi",
        "img": "assets/productos/22.png",
        "desc": "Fresas dulces combinadas con kiwi tropical ácido."
      },
      {
        "nombre": "Sandía Helada",
        "img": "assets/productos/23.png",
        "desc": "Sandía jugosa con un final helado irresistible."
      },
      {
        "nombre": "Mango Melocotón",
        "img": "assets/productos/24.png",
        "desc": "Mango maduro con durazno aterciopelado."
      },
      {
        "nombre": "Uva Helada",
        "img": "assets/productos/25.png",
        "desc": "Uvas moradas dulces con golpe frío."
      },
      {
        "nombre": "Manzana Doble",
        "img": "assets/productos/26.png",
        "desc": "Mezcla crujiente de manzana roja y verde."
      },
      {
        "nombre": "Frutos Rojos",
        "img": "assets/productos/27.png",
        "desc": "Explosión de bayas silvestres dulces y ácidas."
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
    "imagen": "assets/productos/28.png",
    "descripcion": "Vape desechable elegante y compacto con 10.000 puffs de sabores frutales y refrescantes.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Mora Azul",
        "img": "assets/productos/28.png",
        "desc": "Arándanos maduros con dulzura natural."
      },
      {
        "nombre": "Helado de Fresa",
        "img": "assets/productos/29.png",
        "desc": "Fresa dulce con base cremosa y fría."
      },
      {
        "nombre": "Menta Fresca",
        "img": "assets/productos/30.png",
        "desc": "Menta limpia con golpe fresco duradero."
      },
      {
        "nombre": "Helado de Sandía",
        "img": "assets/productos/31.png",
        "desc": "Sandía veraniega con toque helado."
      },
      {
        "nombre": "Mango Helado",
        "img": "assets/productos/32.png",
        "desc": "Mango tropical maduro con frescura glacial."
      },
      {
        "nombre": "Fresa Kiwi",
        "img": "assets/productos/33.png",
        "desc": "Balance frutal de fresa dulce y kiwi ácido."
      },
      {
        "nombre": "Uva Helada",
        "img": "assets/productos/34.png",
        "desc": "Uva morada dulce con acabado refrescante."
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
    "imagen": "assets/productos/36.png",
    "descripcion": "Edición oficial Death Row Records con 7.000 caladas de potencia pura y perfiles de sabor legendarios.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Manzana Dulce",
        "img": "assets/productos/36.png",
        "desc": "Manzana dulce tipo caramelo crujiente."
      },
      {
        "nombre": "Cereza Helada",
        "img": "assets/productos/37.png",
        "desc": "Cereza madura con golpe helado potente."
      },
      {
        "nombre": "Mora y Fresa",
        "img": "assets/productos/38.png",
        "desc": "Dúo clásico de moras y fresas dulces."
      },
      {
        "nombre": "Kiwi Fresa",
        "img": "assets/productos/39.png",
        "desc": "Equilibrio cítrico-dulce entre kiwi y fresa."
      },
      {
        "nombre": "Sandía Helada",
        "img": "assets/productos/40.png",
        "desc": "Sandía jugosa con frescura intensa."
      },
      {
        "nombre": "Mango Helado",
        "img": "assets/productos/41.png",
        "desc": "Mango exótico maduro con toque frío."
      },
      {
        "nombre": "Uva Helada",
        "img": "assets/productos/42.png",
        "desc": "Uvas oscuras dulces con frescura glacial."
      },
      {
        "nombre": "Menta Salvaje",
        "img": "assets/productos/43.png",
        "desc": "Menta herbal fuerte y refrescante."
      },
      {
        "nombre": "Limonada Rosa",
        "img": "assets/productos/44.png",
        "desc": "Limonada rosada dulce con toque ácido vibrante."
      }
    ]
  },
  {
    "id": "lost-mary-os",
    "nombre": "LOST MARY OS",
    "categoria": "desechables",
    "subtitulo": "5.000 Puffs • 27 Sabores",
    "puffs": 5000,
    "precio": 18000,
    "precio_promo_2": 30000,
    "ahorro_2": 6000,
    "rating": 4.8,
    "ventas": 5120,
    "imagen": "assets/productos/46.png",
    "descripcion": "Uno de los vapes desechables más reconocidos a nivel mundial, con diseño ergonómico de superficie planetaria y 5.000 caladas suaves.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Fresa Hielo",
        "img": "assets/productos/46.png",
        "desc": "Fresas maduras con toque helado."
      },
      {
        "nombre": "Fresa Mango",
        "img": "assets/productos/47.png",
        "desc": "Fresas dulces y mango tropical."
      },
      {
        "nombre": "Arándano Hielo",
        "img": "assets/productos/48.png",
        "desc": "Arándano silvestre con golpe frío."
      },
      {
        "nombre": "Sandía Hielo",
        "img": "assets/productos/49.png",
        "desc": "Sandía dulce con acabado fresco."
      },
      {
        "nombre": "Algodón de Azúcar",
        "img": "assets/productos/50.png",
        "desc": "Algodón de azúcar dulce de feria."
      },
      {
        "nombre": "Hielo Negro",
        "img": "assets/productos/51.png",
        "desc": "Moras oscuras con menta helada."
      },
      {
        "nombre": "Menta Verde",
        "img": "assets/productos/52.png",
        "desc": "Menta verde herbal clásica."
      },
      {
        "nombre": "Piña Helada",
        "img": "assets/productos/53.png",
        "desc": "Piña dulce tropical helada."
      },
      {
        "nombre": "Frutas Tropicales",
        "img": "assets/productos/54.png",
        "desc": "Mezcla de frutas exóticas del caribe."
      },
      {
        "nombre": "Frambuesa Fresa",
        "img": "assets/productos/55.png",
        "desc": "Frambuesa ácida con fresa suave."
      },
      {
        "nombre": "Melocotón Mango",
        "img": "assets/productos/56.png",
        "desc": "Durazno suave con mango aromático."
      },
      {
        "nombre": "Kiwi Maracuyá Guayaba",
        "img": "assets/productos/57.png",
        "desc": "Trío tropical cítrico y aromático."
      },
      {
        "nombre": "Cereza Helada",
        "img": "assets/productos/58.png",
        "desc": "Cereza dulce con frescura polar."
      },
      {
        "nombre": "Uva Helada",
        "img": "assets/productos/59.png",
        "desc": "Uvas moradas con frío intenso."
      },
      {
        "nombre": "Mango Hielo",
        "img": "assets/productos/60.png",
        "desc": "Mango cremoso con toque helado."
      },
      {
        "nombre": "Manzana Melocotón",
        "img": "assets/productos/61.png",
        "desc": "Manzana crujiente y durazno suave."
      },
      {
        "nombre": "Limonada Arándano",
        "img": "assets/productos/62.png",
        "desc": "Limonada fresca con arándanos."
      },
      {
        "nombre": "Lichi Hielo",
        "img": "assets/productos/63.png",
        "desc": "Lichi oriental dulce y frío."
      },
      {
        "nombre": "Maracuyá Naranja",
        "img": "assets/productos/64.png",
        "desc": "Maracuyá cítrico con naranja jugosa."
      },
      {
        "nombre": "Coco Melón",
        "img": "assets/productos/65.png",
        "desc": "Coco cremoso con melón dulce."
      },
      {
        "nombre": "Baya Mixta",
        "img": "assets/productos/66.png",
        "desc": "Surtido de moras y arándanos."
      },
      {
        "nombre": "Plátano Hielo",
        "img": "assets/productos/67.png",
        "desc": "Plátano dulce con acabado helado."
      },
      {
        "nombre": "Menta Arándano",
        "img": "assets/productos/68.png",
        "desc": "Arándano dulce con menta limpia."
      },
      {
        "nombre": "Gomita Osito",
        "img": "assets/productos/69.png",
        "desc": "Gomitas frutales masticables."
      },
      {
        "nombre": "Caramelo Ácido",
        "img": "assets/productos/70.png",
        "desc": "Caramelo con toque ácido chispeante."
      },
      {
        "nombre": "Fresa Piña",
        "img": "assets/productos/71.png",
        "desc": "Fresa dulce con piña ácida."
      },
      {
        "nombre": "Bebida Energética",
        "img": "assets/productos/72.png",
        "desc": "Bebida energética clásica estimulante."
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
    "imagen": "assets/productos/73.png",
    "descripcion": "Diseño cilíndrico ultra ergonómico con acabado marmoleado de lujo y tecnología de resistencia de malla para caladas sedosas.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Hielo de Cereza Negra",
        "img": "assets/productos/73.png",
        "desc": "Cereza negra intensa con golpe frío."
      },
      {
        "nombre": "Rosa Frutal",
        "img": "assets/productos/74.png",
        "desc": "Combinación suave de frutas rosadas."
      },
      {
        "nombre": "Mango Melocotón Sandía",
        "img": "assets/productos/75.png",
        "desc": "Trío tropical refrescante y dulce."
      },
      {
        "nombre": "Guayaba Kiwi Maracuyá",
        "img": "assets/productos/76.png",
        "desc": "Mezcla exótica cítrica y dulce."
      },
      {
        "nombre": "Fresa Helada",
        "img": "assets/productos/77.png",
        "desc": "Fresas dulces con toque helado."
      },
      {
        "nombre": "Mora y Frambuesa",
        "img": "assets/productos/78.png",
        "desc": "Bayas silvestres equilibradas."
      },
      {
        "nombre": "Menta Fresca",
        "img": "assets/productos/79.png",
        "desc": "Menta limpia con frescura duradera."
      },
      {
        "nombre": "Sandía Helada",
        "img": "assets/productos/80.png",
        "desc": "Sandía jugosa con frío polar."
      },
      {
        "nombre": "Uva Helada",
        "img": "assets/productos/81.png",
        "desc": "Uvas moradas con golpe helado."
      },
      {
        "nombre": "Piña Helada",
        "img": "assets/productos/82.png",
        "desc": "Piña dulce con toque fresco."
      },
      {
        "nombre": "Manzana Crujiente",
        "img": "assets/productos/83.png",
        "desc": "Manzana verde ácida y fresca."
      },
      {
        "nombre": "Limonada Rosa",
        "img": "assets/productos/84.png",
        "desc": "Limonada cítrica con toque dulce."
      },
      {
        "nombre": "Plátano Helado",
        "img": "assets/productos/85.png",
        "desc": "Plátano cremoso con frío suave."
      },
      {
        "nombre": "Arándano Helado",
        "img": "assets/productos/86.png",
        "desc": "Arándano silvestre con frescura."
      },
      {
        "nombre": "Naranja Helada",
        "img": "assets/productos/87.png",
        "desc": "Cítrico de naranja con golpe frío."
      }
    ]
  },
  {
    "id": "ease",
    "nombre": "EASE",
    "categoria": "desechables",
    "subtitulo": "8.000 Puffs • 30 Sabores",
    "puffs": 8000,
    "precio": 18000,
    "precio_promo_2": 30000,
    "ahorro_2": 6000,
    "rating": 4.8,
    "ventas": 4600,
    "imagen": "assets/productos/88.png",
    "descripcion": "El Ease destaca por su boquilla de silicona ergonómica, pantalla LED informativa y 30 opciones de sabor frutal e intenso.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Limonada de Fresa",
        "img": "assets/productos/88.png",
        "desc": "Limonada refrescante con fresas maduras."
      },
      {
        "nombre": "Gomitas de Sandía",
        "img": "assets/productos/89.png",
        "desc": "Caramelo masticable con sabor a sandía."
      },
      {
        "nombre": "Fresa y Frambuesa",
        "img": "assets/productos/90.png",
        "desc": "Dúo frutal rojo dulce y ácido."
      },
      {
        "nombre": "Sandía Helada",
        "img": "assets/productos/91.png",
        "desc": "Sandía jugosa con frescura glacial."
      },
      {
        "nombre": "Mora Azul y Arándano",
        "img": "assets/productos/92.png",
        "desc": "Combinación rica de bayas azules."
      },
      {
        "nombre": "Kiwi Maracuyá Guayaba",
        "img": "assets/productos/93.png",
        "desc": "Trío exótico tropical con notas ácidas."
      },
      {
        "nombre": "Mango y Melocotón",
        "img": "assets/productos/94.png",
        "desc": "Mango maduro con durazno suave."
      },
      {
        "nombre": "Menta Fresca",
        "img": "assets/productos/95.png",
        "desc": "Menta pura y refrescante."
      },
      {
        "nombre": "Uva Helada",
        "img": "assets/productos/96.png",
        "desc": "Uvas oscuras con golpe frío."
      },
      {
        "nombre": "Piña Colada",
        "img": "assets/productos/97.png",
        "desc": "Piña tropical con crema de coco."
      },
      {
        "nombre": "Plátano Helado",
        "img": "assets/productos/98.png",
        "desc": "Plátano dulce con acabado frío."
      },
      {
        "nombre": "Manzana Doble",
        "img": "assets/productos/99.png",
        "desc": "Manzanas rojas y verdes crujientes."
      },
      {
        "nombre": "Cereza Helada",
        "img": "assets/productos/100.png",
        "desc": "Cereza madura con frescura polar."
      },
      {
        "nombre": "Lichi Helado",
        "img": "assets/productos/101.png",
        "desc": "Lichi oriental con golpe frío."
      },
      {
        "nombre": "Melón Dulce",
        "img": "assets/productos/102.png",
        "desc": "Melón maduro con dulzura natural."
      },
      {
        "nombre": "Frutos del Bosque",
        "img": "assets/productos/103.png",
        "desc": "Surtido de frutas silvestres del bosque."
      },
      {
        "nombre": "Algodón de Azúcar",
        "img": "assets/productos/104.png",
        "desc": "Algodón de azúcar dulce de feria."
      },
      {
        "nombre": "Bebida Energética",
        "img": "assets/productos/105.png",
        "desc": "Sabor vibrante a bebida energizante."
      },
      {
        "nombre": "Cola Helada",
        "img": "assets/productos/106.png",
        "desc": "Refresco de cola con hielo."
      },
      {
        "nombre": "Naranja y Mango",
        "img": "assets/productos/107.png",
        "desc": "Cítricos de naranja con mango dulce."
      },
      {
        "nombre": "Fresa y Kiwi",
        "img": "assets/productos/108.png",
        "desc": "Fresa suave con kiwi ácido."
      },
      {
        "nombre": "Mora Helada",
        "img": "assets/productos/109.png",
        "desc": "Moras silvestres con toque frío."
      },
      {
        "nombre": "Durazno Helado",
        "img": "assets/productos/110.png",
        "desc": "Duraznos jugosos con acabado helado."
      },
      {
        "nombre": "Pomelo y Frutos",
        "img": "assets/productos/111.png",
        "desc": "Toronja amarga-dulce con frutas mixtas."
      },
      {
        "nombre": "Chicle de Fresa",
        "img": "assets/productos/112.png",
        "desc": "Chicle dulce de fresa clásica."
      },
      {
        "nombre": "Mango y Piña",
        "img": "assets/productos/113.png",
        "desc": "Mango tropical con piña ácida."
      },
      {
        "nombre": "Frambuesa Helada",
        "img": "assets/productos/114.png",
        "desc": "Frambuesa silvestre con toque frío."
      },
      {
        "nombre": "Menta y Hierbabuena",
        "img": "assets/productos/115.png",
        "desc": "Doble frescura de menta y hierba."
      },
      {
        "nombre": "Fruta de la Pasión",
        "img": "assets/productos/116.png",
        "desc": "Maracuyá exótico puro y aromático."
      },
      {
        "nombre": "Hielo Negro Especial",
        "img": "assets/productos/117.png",
        "desc": "Moras oscuras con menta polar intensa."
      }
    ]
  },
  {
    "id": "dummy",
    "nombre": "DUMMY",
    "categoria": "desechables",
    "subtitulo": "8.000 Puffs • 20 Sabores",
    "puffs": 8000,
    "precio": 18000,
    "precio_promo_2": 30000,
    "ahorro_2": 6000,
    "rating": 4.8,
    "ventas": 3750,
    "imagen": "assets/productos/118.png",
    "descripcion": "Inspirado en la cultura urbana con pantalla LED que indica batería y líquido, ofreciendo 8.000 caladas de gran densidad.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Fresa Helada",
        "img": "assets/productos/118.png",
        "desc": "Fresas dulces con toque polar."
      },
      {
        "nombre": "Menta Fresca",
        "img": "assets/productos/119.png",
        "desc": "Menta limpia con frescura duradera."
      },
      {
        "nombre": "Sandía Helada",
        "img": "assets/productos/120.png",
        "desc": "Sandía jugosa con acabado frío."
      },
      {
        "nombre": "Mango Helado",
        "img": "assets/productos/121.png",
        "desc": "Mango dulce con toque glacial."
      },
      {
        "nombre": "Uva Helada",
        "img": "assets/productos/122.png",
        "desc": "Uvas moradas con frío intenso."
      },
      {
        "nombre": "Arándano Helado",
        "img": "assets/productos/123.png",
        "desc": "Arándano con toque refrescante."
      },
      {
        "nombre": "Kiwi Fresa",
        "img": "assets/productos/124.png",
        "desc": "Equilibrio entre fresa y kiwi ácido."
      },
      {
        "nombre": "Piña Helada",
        "img": "assets/productos/125.png",
        "desc": "Piña dulce con toque helado."
      },
      {
        "nombre": "Plátano Helado",
        "img": "assets/productos/126.png",
        "desc": "Plátano cremoso con acabado frío."
      },
      {
        "nombre": "Manzana Helada",
        "img": "assets/productos/127.png",
        "desc": "Manzana crujiente con frescura."
      },
      {
        "nombre": "Cereza Helada",
        "img": "assets/productos/128.png",
        "desc": "Cereza dulce con golpe polar."
      },
      {
        "nombre": "Limonada Rosa",
        "img": "assets/productos/129.png",
        "desc": "Limonada cítrica con toque dulce."
      },
      {
        "nombre": "Gomitas Dulces",
        "img": "assets/productos/130.png",
        "desc": "Gomitas frutales masticables."
      },
      {
        "nombre": "Frutos Rojos",
        "img": "assets/productos/131.png",
        "desc": "Surtido de moras y fresas."
      },
      {
        "nombre": "Melón Helado",
        "img": "assets/productos/132.png",
        "desc": "Melón maduro con toque helado."
      },
      {
        "nombre": "Durazno Helado",
        "img": "assets/productos/133.png",
        "desc": "Durazno jugoso con acabado frío."
      },
      {
        "nombre": "Bebida Energética",
        "img": "assets/productos/134.png",
        "desc": "Sabor clásico a bebida energizante."
      },
      {
        "nombre": "Algodón de Azúcar",
        "img": "assets/productos/135.png",
        "desc": "Algodón de azúcar dulce de feria."
      },
      {
        "nombre": "Cola Helada",
        "img": "assets/productos/136.png",
        "desc": "Refresco de cola con hielo."
      },
      {
        "nombre": "Frutas Tropicales",
        "img": "assets/productos/137.png",
        "desc": "Mezcla de frutas tropicales exóticas."
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
    "imagen": "assets/productos/138.png",
    "descripcion": "Edición oficial de Nicky Jam con 10.000 puffs, pantalla digital de batería y líquido, y sabores urbanos irresistibles.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Fresa Sandía",
        "img": "assets/productos/138.png",
        "desc": "Fresas dulces combinadas con sandía jugosa."
      },
      {
        "nombre": "Arándano Helado",
        "img": "assets/productos/139.png",
        "desc": "Arándanos azules con golpe frío polar."
      },
      {
        "nombre": "Menta Miami",
        "img": "assets/productos/140.png",
        "desc": "Menta refrescante con estilo de Miami."
      },
      {
        "nombre": "Mango Melocotón",
        "img": "assets/productos/141.png",
        "desc": "Mango tropical con durazno suave."
      },
      {
        "nombre": "Uva Helada",
        "img": "assets/productos/142.png",
        "desc": "Uvas moradas con acabado glacial."
      },
      {
        "nombre": "Kiwi Maracuyá",
        "img": "assets/productos/143.png",
        "desc": "Kiwi cítrico con maracuyá aromático."
      },
      {
        "nombre": "Piña Colada",
        "img": "assets/productos/144.png",
        "desc": "Piña jugosa con crema de coco."
      },
      {
        "nombre": "Cereza Helada",
        "img": "assets/productos/145.png",
        "desc": "Cerezas rojas con golpe frío."
      },
      {
        "nombre": "Manzana Doble",
        "img": "assets/productos/146.png",
        "desc": "Manzanas rojas y verdes crujientes."
      },
      {
        "nombre": "Frutos Rojos",
        "img": "assets/productos/147.png",
        "desc": "Surtido de bayas silvestres dulces."
      },
      {
        "nombre": "Plátano Helado",
        "img": "assets/productos/148.png",
        "desc": "Plátano cremoso con toque helado."
      },
      {
        "nombre": "Limonada Rosa",
        "img": "assets/productos/149.png",
        "desc": "Limonada fresca con fresas."
      },
      {
        "nombre": "Gomitas de Oso",
        "img": "assets/productos/150.png",
        "desc": "Gomitas dulces masticables."
      },
      {
        "nombre": "Sandía Helada",
        "img": "assets/productos/151.png",
        "desc": "Sandía pura con frescura intensa."
      },
      {
        "nombre": "Melón Dulce",
        "img": "assets/productos/152.png",
        "desc": "Melón maduro con dulzura natural."
      },
      {
        "nombre": "Bebida Energética",
        "img": "assets/productos/153.png",
        "desc": "Sabor a bebida energética clásica."
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
    "imagen": "assets/productos/154.png",
    "descripcion": "Dispositivo premium de 10.000 caladas con diseño futurista y sabores frutales de máxima pureza.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Fresa Sandía",
        "img": "assets/productos/154.png",
        "desc": "Fresas dulces y sandía refrescante."
      },
      {
        "nombre": "Menta Fresca",
        "img": "assets/productos/155.png",
        "desc": "Menta pura con golpe helado duradero."
      },
      {
        "nombre": "Arándano Helado",
        "img": "assets/productos/156.png",
        "desc": "Arándanos silvestres con frescura polar."
      },
      {
        "nombre": "Mango Melocotón",
        "img": "assets/productos/157.png",
        "desc": "Mango tropical con durazno suave."
      },
      {
        "nombre": "Uva Helada",
        "img": "assets/productos/158.png",
        "desc": "Uvas dulces con acabado frío."
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
    "imagen": "assets/productos/159.png",
    "descripcion": "El lujo y la potencia automotriz llevados al vapeo: diseño aerodinámico exclusivo, acabados metálicos y 9.000 caladas de máxima intensidad.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Mora Azul y Arándano",
        "img": "assets/productos/159.png",
        "desc": "Bayas azules oscuras con toque dulce y frío."
      },
      {
        "nombre": "Fresa Kiwi",
        "img": "assets/productos/160.png",
        "desc": "Fresas dulces con kiwi cítrico equilibrado."
      },
      {
        "nombre": "Sandía Helada",
        "img": "assets/productos/161.png",
        "desc": "Sandía jugosa con golpe de frío polar."
      },
      {
        "nombre": "Menta de Miami",
        "img": "assets/productos/162.png",
        "desc": "Menta fresca y limpia con notas heladas."
      },
      {
        "nombre": "Mango Helado",
        "img": "assets/productos/163.png",
        "desc": "Mango tropical maduro con frescura glacial."
      },
      {
        "nombre": "Uva Helada",
        "img": "assets/productos/164.png",
        "desc": "Uvas moradas con frío intenso y dulce."
      },
      {
        "nombre": "Melocotón Mango",
        "img": "assets/productos/165.png",
        "desc": "Durazno sedoso con mango dulce."
      },
      {
        "nombre": "Frutos Rojos",
        "img": "assets/productos/166.png",
        "desc": "Surtido silvestre de frambuesas y moras."
      },
      {
        "nombre": "Cereza Helada",
        "img": "assets/productos/167.png",
        "desc": "Cereza madura con frescura extrema."
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
    "imagen": "assets/productos/168.png",
    "descripcion": "Sistema modular de vapeo con batería recargable tipo C y cartuchos intercambiables de 10.000 puffs.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Banana Ice",
        "img": "assets/productos/168.png",
        "desc": "Plátano dulce con toque helado."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "assets/productos/169.png",
        "desc": "Fresas dulces y sandía jugosa."
      },
      {
        "nombre": "Mango Ice",
        "img": "assets/productos/170.png",
        "desc": "Mango tropical con acabado frío."
      },
      {
        "nombre": "Maracuyá",
        "img": "assets/productos/171.png",
        "desc": "Maracuyá exótico cítrico aromático."
      },
      {
        "nombre": "Salpicón",
        "img": "assets/productos/172.png",
        "desc": "Mezcla tradicional de frutas colombianas."
      },
      {
        "nombre": "Arándano Ice",
        "img": "assets/productos/173.png",
        "desc": "Arándano silvestre con golpe helado."
      },
      {
        "nombre": "Energetic Ice",
        "img": "assets/productos/174.png",
        "desc": "Bebida energizante con toque frío."
      },
      {
        "nombre": "Frutos Morados",
        "img": "assets/productos/175.png",
        "desc": "Uvas y moras oscuras combinadas."
      },
      {
        "nombre": "Kiwi Fresa",
        "img": "assets/productos/176.png",
        "desc": "Fresa dulce con kiwi cítrico."
      },
      {
        "nombre": "Lulo",
        "img": "assets/productos/177.png",
        "desc": "Sabor a lulo ácido y refrescante."
      },
      {
        "nombre": "Doble Manzana",
        "img": "assets/productos/178.png",
        "desc": "Manzanas crujientes rojas y verdes."
      },
      {
        "nombre": "Menta Fresca",
        "img": "assets/productos/179.png",
        "desc": "Menta limpia con frescura prolongada."
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
    "imagen": "assets/productos/180.png",
    "descripcion": "Pod de repuesto para Nimbox Kit con 10.000 caladas de sabor continuo con resistencia de malla.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Banana Ice",
        "img": "assets/productos/180.png",
        "desc": "Plátano dulce con toque helado."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "assets/productos/181.png",
        "desc": "Fresas dulces y sandía jugosa."
      },
      {
        "nombre": "Mango Ice",
        "img": "assets/productos/182.png",
        "desc": "Mango tropical con acabado frío."
      },
      {
        "nombre": "Maracuyá",
        "img": "assets/productos/183.png",
        "desc": "Maracuyá exótico cítrico aromático."
      },
      {
        "nombre": "Salpicón",
        "img": "assets/productos/184.png",
        "desc": "Mezcla tradicional de frutas colombianas."
      },
      {
        "nombre": "Arándano Ice",
        "img": "assets/productos/185.png",
        "desc": "Arándano silvestre con golpe helado."
      },
      {
        "nombre": "Energetic Ice",
        "img": "assets/productos/186.png",
        "desc": "Bebida energizante con toque frío."
      },
      {
        "nombre": "Frutos Morados",
        "img": "assets/productos/187.png",
        "desc": "Uvas y moras oscuras combinadas."
      },
      {
        "nombre": "Kiwi Fresa",
        "img": "assets/productos/188.png",
        "desc": "Fresa dulce con kiwi cítrico."
      },
      {
        "nombre": "Lulo",
        "img": "assets/productos/189.png",
        "desc": "Sabor a lulo ácido y refrescante."
      },
      {
        "nombre": "Doble Manzana",
        "img": "assets/productos/190.png",
        "desc": "Manzanas crujientes rojas y verdes."
      },
      {
        "nombre": "Menta Fresca",
        "img": "assets/productos/191.png",
        "desc": "Menta limpia con frescura prolongada."
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
    "imagen": "assets/productos/192.png",
    "descripcion": "Dispositivo elegante de 12.000 caladas con excelente rendimiento de batería y perfiles frutales de gran intensidad.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Uva Helada",
        "img": "assets/productos/192.png",
        "desc": "Uvas oscuras con golpe frío polar."
      },
      {
        "nombre": "Cereza Arándano",
        "img": "assets/productos/193.png",
        "desc": "Cereza madura con arándano silvestre."
      },
      {
        "nombre": "Menta Helada",
        "img": "assets/productos/194.png",
        "desc": "Menta fresca con golpe helado duradero."
      },
      {
        "nombre": "Miami Mint",
        "img": "assets/productos/195.png",
        "desc": "Menta suave y refrescante."
      },
      {
        "nombre": "Kiwi Fresa",
        "img": "assets/productos/196.png",
        "desc": "Fresa dulce con kiwi cítrico."
      },
      {
        "nombre": "Triple Uva",
        "img": "assets/productos/197.png",
        "desc": "Intensa combinación de tres variedades de uva."
      },
      {
        "nombre": "Caminante Diurno",
        "img": "assets/productos/198.png",
        "desc": "Mezcla misteriosa de frutas energéticas."
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
    "imagen": "assets/productos/199.png",
    "descripcion": "Gran capacidad de 12.000 caladas con diseño innovador, flujo de aire regulable y sabores dulces y helados.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Gomita Blanca",
        "img": "assets/productos/199.png",
        "desc": "Gomitas dulces blancas con toque de piña."
      },
      {
        "nombre": "Mora Azul",
        "img": "assets/productos/200.png",
        "desc": "Arándanos silvestres dulces con frescura."
      },
      {
        "nombre": "Helado de Sandía",
        "img": "assets/productos/201.png",
        "desc": "Sandía dulce con acabado cremoso y frío."
      },
      {
        "nombre": "Explosión Arizona",
        "img": "assets/productos/202.png",
        "desc": "Té helado frutal con notas de durazno y limón."
      },
      {
        "nombre": "Menta de Miami",
        "img": "assets/productos/203.png",
        "desc": "Menta fresca de estilo veraniego."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "assets/productos/204.png",
        "desc": "Dúo clásico de fresas dulces y sandía."
      },
      {
        "nombre": "Cereza Azul",
        "img": "assets/productos/205.png",
        "desc": "Cereza jugosa con toque de mora azul."
      },
      {
        "nombre": "Lágrimas Ácidas",
        "img": "assets/productos/206.png",
        "desc": "Caramelo ácido y cítrico electrizante."
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
    "imagen": "assets/productos/207.png",
    "descripcion": "Edición oficial 50 Cent con 20.000 puffs de duración masiva, pantalla HD y perfiles de sabor explosivos.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Púrpura",
        "img": "assets/productos/207.png",
        "desc": "Uvas moradas intensas con toque helado."
      },
      {
        "nombre": "Niebla Azul",
        "img": "assets/productos/208.png",
        "desc": "Mora azul misteriosa con frescura polar."
      },
      {
        "nombre": "Fiesta Mango",
        "img": "assets/productos/209.png",
        "desc": "Mango tropical dulce y jugoso."
      },
      {
        "nombre": "Coca Cola",
        "img": "assets/productos/210.png",
        "desc": "Refresco de cola clásico con hielo."
      },
      {
        "nombre": "Osito de Azúcar",
        "img": "assets/productos/211.png",
        "desc": "Gomitas dulces masticables con azúcar."
      },
      {
        "nombre": "Durazno Helado",
        "img": "assets/productos/212.png",
        "desc": "Durazno aterciopelado con golpe frío."
      },
      {
        "nombre": "Cereza Uva",
        "img": "assets/productos/213.png",
        "desc": "Cereza roja con uvas oscuras."
      }
    ]
  },
  {
    "id": "spaceman",
    "nombre": "SPACEMAN",
    "categoria": "desechables",
    "subtitulo": "50.000 Puffs • 10 Sabores",
    "puffs": 50000,
    "precio": 40000,
    "precio_promo_2": 70000,
    "ahorro_2": 10000,
    "rating": 4.8,
    "ventas": 3300,
    "imagen": "assets/productos/224.png",
    "descripcion": "Diseño espacial con pantalla curva a todo color, múltiples modos de potencia y 20.000 caladas de gran fidelidad.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Uva Verde",
        "img": "assets/productos/224.png",
        "desc": "Uvas verdes crujientes y dulces."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "assets/productos/225.png",
        "desc": "Fresas con sandía veraniega."
      },
      {
        "nombre": "Mango Dulce",
        "img": "assets/productos/226.png",
        "desc": "Mango tropical aromático y dulce."
      },
      {
        "nombre": "Sandía Melocotón",
        "img": "assets/productos/227.png",
        "desc": "Sandía jugosa combinada con durazno."
      },
      {
        "nombre": "Menta Miami",
        "img": "assets/productos/228.png",
        "desc": "Menta pura y refrescante."
      },
      {
        "nombre": "Mora Azul",
        "img": "assets/productos/229.png",
        "desc": "Arándano silvestre con dulzura natural."
      },
      {
        "nombre": "Fresa",
        "img": "assets/productos/230.png",
        "desc": "Fresa madura dulce."
      },
      {
        "nombre": "Frambuesa Melocotón",
        "img": "assets/productos/231.png",
        "desc": "Frambuesa ácida con durazno aterciopelado."
      },
      {
        "nombre": "Frutos Rojos",
        "img": "assets/productos/232.png",
        "desc": "Surtido de moras y bayas."
      },
      {
        "nombre": "Fresa B-Pop",
        "img": "assets/productos/233.png",
        "desc": "Paleta de fresa dulce con centro efervescente."
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
    "imagen": "assets/productos/235.png",
    "descripcion": "Líquidos premium británicos en formato desechable de 15.000 caladas, reconocidos por su complejidad y calidad de sabor inigualable.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Frutos Rojos y Caramelo",
        "img": "assets/productos/235.png",
        "desc": "Frutos rojos con toque de caramelo dulce."
      },
      {
        "nombre": "Mora FAB",
        "img": "assets/productos/236.png",
        "desc": "Moras azules con toque helado fabuloso."
      },
      {
        "nombre": "Cereza Strazz",
        "img": "assets/productos/237.png",
        "desc": "Cereza dulce con fresa silvestre."
      },
      {
        "nombre": "Caramelo de Fresa",
        "img": "assets/productos/238.png",
        "desc": "Caramelo suave de fresa dulce."
      },
      {
        "nombre": "Menta Miami",
        "img": "assets/productos/239.png",
        "desc": "Menta fresca con golpe glacial."
      },
      {
        "nombre": "Cereza de California",
        "img": "assets/productos/240.png",
        "desc": "Cerezas rojas dulces californianas."
      },
      {
        "nombre": "Mango",
        "img": "assets/productos/241.png",
        "desc": "Mango tropical maduro."
      },
      {
        "nombre": "Rosa Ácida",
        "img": "assets/productos/242.png",
        "desc": "Frutas rosadas con golpe ácido."
      },
      {
        "nombre": "Melón Definitivo",
        "img": "assets/productos/243.png",
        "desc": "Mezcla de tres tipos de melón dulce."
      },
      {
        "nombre": "Chicle de Uva",
        "img": "assets/productos/244.png",
        "desc": "Chicle masticable de uva morada."
      },
      {
        "nombre": "Fresa B-Pop",
        "img": "assets/productos/245.png",
        "desc": "Paleta de fresa con toque burbujeante."
      },
      {
        "nombre": "Manzana Verde",
        "img": "assets/productos/246.png",
        "desc": "Manzana verde crujiente y ácida."
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
    "imagen": "assets/productos/268.png",
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
    "imagen": "assets/productos/269.png",
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
    "imagen": "assets/productos/270.png",
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
    "imagen": "assets/productos/271.png",
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
    "imagen": "assets/productos/273.png",
    "descripcion": "Dispositivo desechable compacto respaldado por la tecnología de Relx con 2.500 caladas de sabor refinado.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Arándano",
        "img": "assets/productos/273.png",
        "desc": "Arándano silvestre puro."
      },
      {
        "nombre": "Cereza",
        "img": "assets/productos/274.png",
        "desc": "Cereza dulce y aromática."
      },
      {
        "nombre": "Menta",
        "img": "assets/productos/275.png",
        "desc": "Menta fresca intensa."
      },
      {
        "nombre": "Piña Colada",
        "img": "assets/productos/276.png",
        "desc": "Piña con coco cremoso."
      },
      {
        "nombre": "Sandía",
        "img": "assets/productos/277.png",
        "desc": "Sandía jugosa y refrescante."
      },
      {
        "nombre": "Fresa",
        "img": "assets/productos/278.png",
        "desc": "Fresas maduras dulces."
      },
      {
        "nombre": "Uva",
        "img": "assets/productos/279.png",
        "desc": "Uvas moradas aromáticas."
      },
      {
        "nombre": "Maracuyá",
        "img": "assets/productos/280.png",
        "desc": "Maracuyá cítrico tropical."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "assets/productos/281.png",
        "desc": "Fresa dulce con sandía fresca."
      },
      {
        "nombre": "Fresa Uva",
        "img": "assets/productos/282.png",
        "desc": "Fresa jugosa con uva morada."
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
    "imagen": "assets/productos/283.png",
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
    "imagen": "assets/productos/285.png",
    "descripcion": "Cartucho de 20.000 caladas con pantalla digital integrada de nivel de líquido y doble resistencia de malla.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Arándano",
        "img": "assets/productos/285.png",
        "desc": "Arándano puro y fresco."
      },
      {
        "nombre": "Sandía",
        "img": "assets/productos/286.png",
        "desc": "Sandía dulce con golpe frío."
      },
      {
        "nombre": "Menta",
        "img": "assets/productos/287.png",
        "desc": "Menta polar refrescante."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "assets/productos/288.png",
        "desc": "Fresa dulce combinada con sandía."
      },
      {
        "nombre": "Cereza",
        "img": "assets/productos/289.png",
        "desc": "Cereza jugosa intensa."
      },
      {
        "nombre": "Fresa",
        "img": "assets/productos/290.png",
        "desc": "Fresa dulce madura."
      },
      {
        "nombre": "Uva",
        "img": "assets/productos/291.png",
        "desc": "Uvas moradas aromáticas."
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
    "imagen": "assets/productos/292.png",
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
    "imagen": "assets/productos/294.png",
    "descripcion": "Cartucho desechable de 12.000 caladas para batería Sammy 2 con amplio menú de sabores tropicales colombianos y mentolados.",
    "agotado": false,
    "tipo_variante": "sabor",
    "sabores": [
      {
        "nombre": "Banana Ice",
        "img": "assets/productos/294.png",
        "desc": "Plátano dulce con toque helado."
      },
      {
        "nombre": "Fresa Sandía",
        "img": "assets/productos/295.png",
        "desc": "Fresas dulces y sandía jugosa."
      },
      {
        "nombre": "Mango Ice",
        "img": "assets/productos/296.png",
        "desc": "Mango tropical con acabado frío."
      },
      {
        "nombre": "Maracuyá",
        "img": "assets/productos/297.png",
        "desc": "Maracuyá cítrico aromático."
      },
      {
        "nombre": "Salpicón",
        "img": "assets/productos/298.png",
        "desc": "Mezcla tradicional de frutas colombianas."
      },
      {
        "nombre": "Arándano Ice",
        "img": "assets/productos/299.png",
        "desc": "Arándano silvestre con golpe helado."
      },
      {
        "nombre": "Energetic Ice",
        "img": "assets/productos/300.png",
        "desc": "Bebida energizante con toque frío."
      },
      {
        "nombre": "Frutos Morados",
        "img": "assets/productos/301.png",
        "desc": "Uvas y moras oscuras combinadas."
      },
      {
        "nombre": "Kiwi Fresa",
        "img": "assets/productos/302.png",
        "desc": "Fresa dulce con kiwi cítrico."
      },
      {
        "nombre": "Lulo",
        "img": "assets/productos/303.png",
        "desc": "Sabor a lulo ácido y refrescante."
      },
      {
        "nombre": "Doble Manzana",
        "img": "assets/productos/304.png",
        "desc": "Manzanas crujientes rojas y verdes."
      },
      {
        "nombre": "Menta Fresca",
        "img": "assets/productos/305.png",
        "desc": "Menta limpia con frescura prolongada."
      },
      {
        "nombre": "Chicle",
        "img": "assets/productos/306.png",
        "desc": "Chicle dulce tradicional."
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRODUCTS_DATA };
}
