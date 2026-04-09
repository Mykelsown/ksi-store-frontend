// src/data/products.js
// Standardized to match backend Product model

export const products = [
  // ── SMARTPHONES ──────────────────────────────────────────────────────
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'iPhone 16 Pro Max',
    brand: 'Apple',
    category: 'Smartphones',
    description: 'The most powerful iPhone ever. Titanium design with the A18 Pro chip, advanced camera system, and ProRes video recording.',
    price: 1250.00,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500'
    ],
    rating: 4.9,
    numReviews: 2841,
    featured: true,
    specs: {
      Display: '6.9" Super Retina XDR',
      Chip: 'A18 Pro',
      Camera: '48MP + 48MP + 12MP',
      Battery: '4422mAh',
      Storage: '256GB – 1TB',
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Samsung Galaxy S25 Ultra',
    brand: 'Samsung',
    category: 'Smartphones',
    description: 'Redefine what a phone can do. 200MP camera, integrated S Pen, 7 years of OS updates, and an AI-powered experience.',
    price: 850.00,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'
    ],
    rating: 4.8,
    numReviews: 1923,
    featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Xiaomi 14 Ultra',
    brand: 'Xiaomi',
    category: 'Smartphones',
    description: 'Co-engineered with Leica. Redefines smartphone photography with stunning 1-inch sensor technology.',
    price: 520.00,
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500'
    ],
    rating: 4.7,
    numReviews: 891,
    featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'iPhone 16',
    brand: 'Apple',
    category: 'Smartphones',
    description: 'The standard-setter. Camera Control, A18 chip, and refined design in a compact 6.1-inch form.',
    price: 750.00,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=500'
    ],
    rating: 4.7,
    numReviews: 1204,
    featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Samsung Galaxy A55',
    brand: 'Samsung',
    category: 'Smartphones',
    description: 'Premium features at a midrange price. IP67 water resistance, long-lasting battery, and stunning display.',
    price: 285.00,
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
    ],
    rating: 4.4,
    numReviews: 3201,
    featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Google Pixel 9 Pro',
    brand: 'Google',
    category: 'Smartphones',
    description: 'The smartest camera on a smartphone. AI features, 7 years of updates, and pure Google experience.',
    price: 680.00,
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500'
    ],
    rating: 4.8,
    numReviews: 743,
    featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'Tecno Phantom V Fold',
    brand: 'Tecno',
    category: 'Smartphones',
    description: "Africa's favourite foldable phone. Massive display, premium build, flagship performance.",
    price: 320.00,
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500'
    ],
    rating: 4.3,
    numReviews: 412,
    featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Infinix Zero Ultra',
    brand: 'Infinix',
    category: 'Smartphones',
    description: 'The 200MP photography beast at an unbeatable price. 180W HyperCharge — full charge in 12 minutes.',
    price: 120.00,
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
    ],
    rating: 4.2,
    numReviews: 1834,
    featured: false,
  },

  // ── LAPTOPS ─────────────────────────────────────────────────────
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    name: 'MacBook Pro 16" M4 Pro',
    brand: 'Apple',
    category: 'Laptops',
    description: 'The ultimate pro laptop. Unprecedented performance, stunning display, and all-day battery life with the M4 Pro chip.',
    price: 1850.00,
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'
    ],
    rating: 4.9,
    numReviews: 1024,
    featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Dell XPS 15 9530',
    brand: 'Dell',
    category: 'Laptops',
    description: 'Premium performance in a slim form factor. OLED display, powerful CPU and GPU for creators and professionals.',
    price: 1100.00,
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500'
    ],
    rating: 4.7,
    numReviews: 682,
    featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    name: 'HP Spectre x360 14',
    brand: 'HP',
    category: 'Laptops',
    description: 'A 2-in-1 convertible with OLED touch display, elegant design, and all-day battery life.',
    price: 890.00,
    stock: 10,
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500'
    ],
    rating: 4.6,
    numReviews: 520,
    featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    name: 'Lenovo ThinkPad X1 Carbon',
    brand: 'Lenovo',
    category: 'Laptops',
    description: 'The legendary business laptop. Ultra-light, ultra-durable, military-grade certified for reliable work anywhere.',
    price: 780.00,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'
    ],
    rating: 4.5,
    numReviews: 915,
    featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    name: 'Asus ROG Zephyrus G16',
    brand: 'Asus',
    category: 'Laptops',
    description: 'The most powerful gaming laptop in its class. Incredible 240Hz display, RTX 4080 GPU, premium ROG build.',
    price: 1400.00,
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500'
    ],
    rating: 4.8,
    numReviews: 374,
    featured: true,
  },

  // ── ACCESSORIES ─────────────────────────────────────────────────
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    name: 'Sony WH-1000XM6',
    brand: 'Sony',
    category: 'Accessories',
    description: 'The best noise-cancelling headphones on the market. Crystal-clear audio, 40-hour battery, and best-in-class ANC.',
    price: 185.00,
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500'
    ],
    rating: 4.9,
    numReviews: 4812,
    featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    name: 'Apple Watch Series 10',
    brand: 'Apple',
    category: 'Accessories',
    description: 'The most advanced Apple Watch ever. Thinnest design, brightest display, and powerful health & fitness tracking.',
    price: 420.00,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500'
    ],
    rating: 4.8,
    numReviews: 2103,
    featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440016',
    name: 'Samsung Galaxy Tab S10 Ultra',
    brand: 'Samsung',
    category: 'Accessories',
    description: 'The ultimate Android tablet. Massive AMOLED display, included S Pen, and desktop-class performance.',
    price: 680.00,
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500'
    ],
    rating: 4.7,
    numReviews: 891,
    featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440017',
    name: 'Anker PowerCore 26800',
    brand: 'Anker',
    category: 'Accessories',
    description: 'Never run out of power. 26800mAh capacity charges your laptop, phone, and tablet — all at once.',
    price: 28.00,
    stock: 100,
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500'
    ],
    rating: 4.6,
    numReviews: 7432,
    featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440018',
    name: 'Logitech MX Master 3S',
    brand: 'Logitech',
    category: 'Accessories',
    description: 'The perfect productivity mouse. Electromagnetically smooth scroll wheel, 8000 DPI precision, ergonomic comfort.',
    price: 45.00,
    stock: 60,
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'
    ],
    rating: 4.8,
    numReviews: 3201,
    featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440019',
    name: 'AirPods Pro 2nd Gen',
    brand: 'Apple',
    category: 'Accessories',
    description: 'Studio-quality audio in a tiny package. The H2 chip delivers 2x better noise cancellation than before.',
    price: 195.00,
    stock: 55,
    images: [
      'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500'
    ],
    rating: 4.9,
    numReviews: 5621,
    featured: true,
  },
];

export const brands = [
  { name: 'Apple', emoji: '🍎', category: 'Smartphones', desc: 'iPhone, iPad, MacBook' },
  { name: 'Samsung', emoji: '📲', category: 'Smartphones', desc: 'Galaxy S, A series, tablets' },
  { name: 'Dell', emoji: '🖥️', category: 'Laptops', desc: 'XPS, Inspiron, Latitude' },
  { name: 'HP', emoji: '💼', category: 'Laptops', desc: 'Spectre, Envy, Pavilion' },
  { name: 'Lenovo', emoji: '🔵', category: 'Laptops', desc: 'ThinkPad, IdeaPad, Legion' },
  { name: 'Sony', emoji: '🎵', category: 'Accessories', desc: 'Headphones, cameras, TVs' },
  { name: 'Xiaomi', emoji: '📱', category: 'Smartphones', desc: 'Mi series, Redmi, Poco' },
  { name: 'Asus', emoji: '🎮', category: 'Laptops', desc: 'ROG, ZenBook, VivoBook' },
];

export const categories = [
  { label: '📱 Smartphones', value: 'Smartphones' },
  { label: '💻 Laptops', value: 'Laptops' },
  { label: '🎧 Accessories', value: 'Accessories' },
];

export const faqs = [
  {
    q: 'How long does delivery take?',
    a: 'Same-day delivery within Lagos. Nationwide delivery takes 3–5 business days via our trusted courier partners.',
  },
  {
    q: 'Are all products genuine?',
    a: 'Yes! Every product sold on KSI Gadget is 100% authentic and sourced directly from manufacturers or authorized distributors. All come with official warranty.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a 15-day hassle-free return policy. Items must be in original condition with packaging. Contact us to initiate a return.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept bank transfers, debit/credit cards (Visa, Mastercard), USSD, and mobile money. All transactions are secured and encrypted.',
  },
  {
    q: 'Can I track my order?',
    a: "Yes! After your order is confirmed you'll receive a tracking number via email and SMS. You can also track it from your account dashboard.",
  },
];
