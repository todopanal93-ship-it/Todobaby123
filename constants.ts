import { Product, StoreSettings } from './types';

export const CATEGORIES = [
  "Para la Clínica",
  "Para Mamita",
  "Mi llegada a casa",
  "Aseo",
  "Mis accesorios",
  "Extras importantes"
];

// fix: Export BADGE_COLORS constant to be used in ClientUI.tsx for displaying product badges.
export const BADGE_COLORS: { [key: string]: string } = {
  'Nuevo': 'bg-blue-500',
  'Oferta': 'bg-red-500',
  'Más Vendido': 'bg-yellow-500',
};

const surtilista = {
  "Para la Clínica": ["Pañales desechables R.N.", "Pañitos húmedos", "Crema antipañalitis", "Toallas", "Juegos de sábanas (x2)", "Cobilas", "Pijamas (primer día)", "Medias (escarpines)", "Mitones", "Gorritos", "1 Biberón", "Termo", "1 Babero (saca gases)", "Fajeros", "Bolso pañalera"],
  "Para Mamita": ["Toallas maternas", "Dos batas", "Pantuflas", "Lacti Nosotras", "Jabón", "Jabonera", "Sábanas", "Toalla de baño", "Salida de baño", "Almohadas"],
  "Mi llegada a casa": ["Corral o cuna", "Colchoneta", "Coche", "Juego de sabanitas con funda", "Ule (cambiador plástico)", "3 Almohadas", "1 Semanario", "1 Semanario de babero", "4 Pijamas", "Pañalera", "Canastilla", "Toldo", "Protector de cuna", "Móvil musical", "Cargador de bebé", "Ropita"],
  "Aseo": ["Pañales x 30 etapa 1", "Toallitas húmedas", "Jabón", "Shampoo", "Colonia", "Copitos", "Crema líquida", "Baño líquido antes de dormir", "Algodón, gasa, alcohol, esparadrapo", "Aceite", "Isodine", "Agua oxigenada", "Toallas, salida de baño", "Pantuflas"],
  "Mis accesorios": ["Bañera", "Jabón esponja", "Mosquitero", "Set de manicure", "Termómetro digital", "Jabonera", "Dosificador de medicamentos", "Cepillo de peinar", "Pera nasal", "Rasca encías", "Lavateteros", "Teteros de 2 oz, 4 oz, 9 oz", "Vaso pitillo", "Porta teteros", "Extractor de leche", "Termo para el agua", "Olla para calentar teteros", "Calentador de teteros"],
  "Extras importantes": ["Crema para pezones agrietados", "Almohada para lactancia", "Té para lactar", "App de ruido blanco", "Extractor de leche"]
};

let idCounter = 1;
const generateProducts = (): Product[] => {
  const products: Product[] = [];
  // fix: Added badges to be randomly assigned to mock products.
  const badges = ['Nuevo', 'Oferta', 'Más Vendido'];
  for (const category in surtilista) {
    // @ts-ignore
    for (const productName of surtilista[category]) {
      const nameTags = productName.toLowerCase().replace(/[^a-z0-9\s]/gi, '').split(' ').filter(Boolean);
      const categoryTag = category.toLowerCase();
      const tags = [...new Set([categoryTag, ...nameTags])];

      const hasBadge = Math.random() > 0.8; // 20% chance of having a badge
      const badge = hasBadge ? badges[Math.floor(Math.random() * badges.length)] : undefined;

      products.push({
        id: idCounter++,
        name: productName,
        description: `La solución perfecta para tu bebé. ${productName} de la más alta calidad, pensado para el cuidado y confort que tu pequeño merece.`,
        category: category,
        colors: ["Varios"],
        sizes: ["N/A"],
        tags: tags,
        price: parseFloat((Math.random() * (80 - 5) + 5).toFixed(2)),
        stock: Math.floor(Math.random() * 50) + 10,
        status: 'Active',
        images: [`https://picsum.photos/seed/p${idCounter}/400/400`],
        badge: badge,
      });
    }
  }
  return products;
}

export const MOCK_PRODUCTS: Product[] = generateProducts();

export const INITIAL_SETTINGS: StoreSettings = {
  whatsappNumber: "+573227772131",
  storeName: "Todo Baby Rio",
  instagram: "https://www.instagram.com/todobabyrio/",
  facebook: "https://www.facebook.com/profile.php?id=100068834140041",
  tiktok: "https://tiktok.com/@todobaby",
  address: "Calle 14 #8-25, Local 109, Riohacha, La Guajira",
  aboutUs: "En Todo Baby Rio, entendemos que la llegada de un bebé es el comienzo de una increíble aventura. Nacimos en el corazón de Riohacha con el propósito de ser más que una tienda: queremos ser tu compañero de confianza en cada paso. Ofrecemos una cuidada selección de productos que garantizan la seguridad, el confort y el bienestar de tu pequeño, desde artículos de higiene formulados con ingredientes naturales hasta los accesorios más prácticos para el día a día. Somos un equipo apasionado por apoyar a las familias de La Guajira, brindando asesoramiento cercano y productos de la más alta calidad.",
  mission: "Acompañar a las familias en la maravillosa etapa de la paternidad, ofreciendo productos de la más alta calidad, seguros y delicados, que garanticen el bienestar y confort de cada bebé en Riohacha y La Guajira.",
  vision: "Ser la tienda para bebés de referencia en La Guajira, reconocida por nuestra selección experta de productos, el asesoramiento cercano y una comunidad de apoyo que celebra el crecimiento y la felicidad de cada niño.",
  values: [
    { title: "Calidad y Seguridad", description: "Cada producto es seleccionado rigurosamente, priorizando fórmulas hipoalergénicas y materiales seguros para la delicada piel de tu bebé." },
    { title: "Confianza", description: "Actuamos con transparencia y honestidad, construyendo relaciones duraderas con nuestros clientes para ser su fuente más fiable." },
    { title: "Cercanía", description: "Ofrecemos un trato cálido y personalizado, escuchando las necesidades de cada familia para brindar la mejor orientación." },
    { title: "Compromiso", description: "Estamos dedicados al bienestar de los más pequeños y a la tranquilidad de sus padres, apoyando a nuestra comunidad local." }
  ],
  logoUrl: "https://lh3.googleusercontent.com/pw/AP1GczNWx_WgPtf8IncAvSxqO9iMkm27LcCxzzqaYAZ2qFhOZRCXo9bfLaQ29Mio2UGiFZkEHfZBmUIhYO_hZgWhfOdJvk9zQFZ1smwHZucyzi6cfeciul3or1JEVl4bSEWcZAUIibrXFHy7WMX4IezVIJ7R=w636-h203-s-no-gm?authuser=0",
  bannerUrl: "https://picsum.photos/seed/banner/1200/400",
};