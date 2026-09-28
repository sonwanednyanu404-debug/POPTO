import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { mobileApi } from './services/api';

// ═══════════════════════════════════════════════════════════════
// TYPES & DICTIONARY
// ═══════════════════════════════════════════════════════════════

type Screen =
  | 'splash'
  | 'onboarding'
  | 'home'
  | 'shop'
  | 'product_detail'
  | 'wishlist'
  | 'cart'
  | 'checkout'
  | 'order_success'
  | 'my_orders'
  | 'order_tracking'
  | 'notifications'
  | 'login'
  | 'signup'
  | 'profile'
  | 'settings';

type Lang = 'en' | 'mr';

interface Product {
  id: string;
  name_en: string;
  name_mr?: string;
  price: number;
  compare_price?: number;
  unit: string;
  seller_district?: string;
  farm_name?: string;
  rating?: number;
  stock?: number;
  is_organic?: boolean;
  is_farm_fresh?: boolean;
  description_en?: string;
  description_mr?: string;
  primary_image?: string;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

const STRINGS = {
  en: {
    brand: 'POPTO',
    tagline: 'DISCOVER. PLAN. PROGRESS.',
    subheadline: 'From Farmers to Buyers • Maharashtra',
    heroTitle: 'Fresh Maharashtra Lemons, Delivered to You',
    heroSubtitle: 'Direct orchard harvest from Solapur, Jalgaon, Satara & Akola.',
    shopLemons: 'Shop Lemons',
    meetFarmers: 'Meet Farmers',
    verifiedFarms: 'Verified Farms',
    lemonVarieties: 'Lemon Varieties',
    liveDb: 'Live Database',
    featured: 'Featured Fresh Lemons',
    allProducts: 'All Lemon Products',
    searchPlaceholder: 'Search lemons by variety, farm, district...',
    filterAll: 'All',
    filterSolapur: 'Solapur',
    filterJalgaon: 'Jalgaon',
    filterSatara: 'Satara',
    filterAkola: 'Akola',
    organicOnly: 'Organic Only',
    inStockOnly: 'In Stock Only',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    kg: 'kg',
    cartTitle: 'Your Lemon Cart',
    cartEmpty: 'Your cart is empty',
    subtotal: 'Subtotal',
    deliveryFee: 'Cold-Chain Delivery',
    freeDeliveryNote: 'Free shipping on orders above ₹250 in Maharashtra!',
    total: 'Total Amount',
    proceedToCheckout: 'Proceed to Checkout',
    checkoutTitle: 'Delivery & Payment',
    shippingAddress: 'Maharashtra Shipping Address',
    nameLabel: 'Full Name',
    mobileLabel: 'Mobile (+91)',
    addressLabel: 'House, Street & Area',
    cityLabel: 'City / District',
    pinLabel: 'Maharashtra PIN Code (400001-445402)',
    paymentMethod: 'Payment Option',
    cod: 'Cash on Delivery (COD)',
    upi: 'Online / UPI Test Payment',
    placeOrder: 'Confirm & Place Order',
    orderSuccessTitle: 'Order Placed Successfully!',
    orderSuccessSubtitle: 'Your harvest batch has been confirmed and queued for dispatch.',
    trackOrderBtn: 'Track Your Order',
    myOrdersTitle: 'My Lemon Orders',
    trackingTitle: 'Live Cold-Chain Tracking',
    stageConfirmed: 'Confirmed',
    stagePacked: 'Harvested & Packed',
    stageShipped: 'Shipped from Orchard',
    stageDelivered: 'Delivered',
    wishlistTitle: 'Saved Wishlist',
    notificationsTitle: 'Notifications & Alerts',
    profileTitle: 'Customer Profile',
    settingsTitle: 'App Settings',
    loginTitle: 'Sign In to POPTO',
    signupTitle: 'Create Customer Account',
    loginBtn: 'Login',
    signupBtn: 'Register',
    noAccount: "Don't have an account? Sign Up",
    haveAccount: 'Already registered? Sign In',
    logout: 'Sign Out',
    switchLang: 'मराठी',
    tabHome: 'Home',
    tabShop: 'Shop',
    tabWishlist: 'Wishlist',
    tabCart: 'Cart',
    tabProfile: 'Account',
  },
  mr: {
    brand: 'POPTO',
    tagline: 'शोधा. नियोजन करा. प्रगती करा.',
    subheadline: 'शेतकऱ्यांकडून खरेदीदारांपर्यंत • महाराष्ट्र',
    heroTitle: 'महाराष्ट्रातील ताजे लिंबू, थेट तुमच्या घरापर्यंत',
    heroSubtitle: 'सोलापूर, जळगाव, सातारा आणि अकोला बागांमधून थेट ताजी काढणी.',
    shopLemons: 'लिंबू खरेदी करा',
    meetFarmers: 'शेतकऱ्यांना भेटा',
    verifiedFarms: 'प्रमाणित शेतकरी',
    lemonVarieties: 'लिंबू प्रकार',
    liveDb: 'थेट डेटाबेस',
    featured: 'ताजे वैशिष्ट्यीकृत लिंबू',
    allProducts: 'सर्व लिंबू उत्पादने',
    searchPlaceholder: 'जात, शेत किंवा जिल्ह्यानुसार लिंबू शोधा...',
    filterAll: 'सर्व',
    filterSolapur: 'सोलापूर',
    filterJalgaon: 'जळगाव',
    filterSatara: 'सातारा',
    filterAkola: 'अकोला',
    organicOnly: 'केवळ सेंद्रिय',
    inStockOnly: 'केवळ शिल्लक साठा',
    addToCart: 'कार्टमध्ये जोडा',
    buyNow: 'आत्ता खरेदी करा',
    inStock: 'उपलब्ध साठा',
    outOfStock: 'साठा संपला',
    kg: 'कि.ग्रॅ.',
    cartTitle: 'तुमची लिंबू कार्ट',
    cartEmpty: 'तुमची कार्ट रिकामी आहे',
    subtotal: 'उपएकूण',
    deliveryFee: 'कोल्ड-चेन डिलिव्हरी',
    freeDeliveryNote: 'महाराष्ट्रात ₹२५० वरील ऑर्डर्सवर मोफत डिलिव्हरी!',
    total: 'एकूण रक्कम',
    proceedToCheckout: 'चेकआउट करा',
    checkoutTitle: 'डिलिव्हरी आणि पेमेंट',
    shippingAddress: 'महाराष्ट्र डिलिव्हरी पत्ता',
    nameLabel: 'पूर्ण नाव',
    mobileLabel: 'मोबाईल (+९१)',
    addressLabel: 'घर, रस्ता आणि परिसर',
    cityLabel: 'शहर / जिल्हा',
    pinLabel: 'महाराष्ट्र पिन कोड (४००००१-४४५४०२)',
    paymentMethod: 'पेमेंट पर्याय',
    cod: 'कॅश ऑन डिलिव्हरी (COD)',
    upi: 'ऑनलाइन / युपीआय चाचणी पेमेंट',
    placeOrder: 'ऑर्डर निश्चित करा',
    orderSuccessTitle: 'ऑर्डर यशस्वीरीत्या दिली गेली!',
    orderSuccessSubtitle: 'तुमची लिंबू बॅच निश्चित झाली असून पाठवण्यासाठी तयार आहे.',
    trackOrderBtn: 'ऑर्डर ट्रॅक करा',
    myOrdersTitle: 'माझ्या ऑर्डर्स',
    trackingTitle: 'थेट कोल्ड-चेन ट्रॅकिंग',
    stageConfirmed: 'पुष्टी झाली',
    stagePacked: 'काढणी व पॅक केले',
    stageShipped: 'बागेतून रवाना',
    stageDelivered: 'पोहोचवले',
    wishlistTitle: 'जतन केलेली इच्छासूची',
    notificationsTitle: 'सूचना आणि अलर्ट',
    profileTitle: 'ग्राहक प्रोफाइल',
    settingsTitle: 'ॲप सेटिंग्ज',
    loginTitle: 'POPTO मध्ये लॉगिन करा',
    signupTitle: 'नवीन ग्राहक खाते तयार करा',
    loginBtn: 'लॉगिन करा',
    signupBtn: 'नोंदणी करा',
    noAccount: 'खाते नाही? साइन अप करा',
    haveAccount: 'आधीच खाते आहे? लॉगिन करा',
    logout: 'लॉगआउट',
    switchLang: 'English',
    tabHome: 'मुख्यपृष्ठ',
    tabShop: 'दुकान',
    tabWishlist: 'इच्छासूची',
    tabCart: 'कार्ट',
    tabProfile: 'खाते',
  },
};


const getProductImageUrl = (item?: Product | null): string => {
  if (!item) return 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=600&q=80';
  if (item.primary_image && item.primary_image.startsWith('http')) return item.primary_image;
  if (item.primary_image) {
    const base = mobileApi.getBaseUrl().replace(/\/api\/?$/, '');
    return `${base}${item.primary_image.startsWith('/') ? '' : '/'}${item.primary_image}`;
  }
  const curated: Record<string, string> = {
    'prod-1': 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=600&q=80',
    'prod-2': 'https://images.unsplash.com/photo-1568569350062-ebfa3cb195df?auto=format&fit=crop&w=600&q=80',
    'prod-3': 'https://images.unsplash.com/photo-1533083441298-5c4900dd7ba3?auto=format&fit=crop&w=600&q=80',
    'prod-4': 'https://images.unsplash.com/photo-1521997888043-aa9c02742461?auto=format&fit=crop&w=600&q=80',
    'prod-5': 'https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=600&q=80',
    'prod-6': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    'prod-7': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  };
  return curated[item.id] || 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=600&q=80';
};

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const t = useMemo(() => STRINGS[lang], [lang]);

  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'wishlist' | 'cart' | 'profile'>('home');

  // App Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Live Stats State
  const [stats, setStats] = useState({
    farmersCount: 3,
    productsCount: 7,
    ordersCount: 4,
    avgRating: 4.6,
  });

  // User Authentication State
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>({
    full_name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    mobile: '9822012345',
    role: 'customer',
    district: 'Pune',
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Checkout Form State
  const [checkoutName, setCheckoutName] = useState('Rahul Sharma');
  const [checkoutMobile, setCheckoutMobile] = useState('9822012345');
  const [checkoutAddress, setCheckoutAddress] = useState('Flat 402, Lemon Grove Residency, Baner');
  const [checkoutCity, setCheckoutCity] = useState('Pune');
  const [checkoutPin, setCheckoutPin] = useState('411045');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');

  // Auth Form State
  const [authEmail, setAuthEmail] = useState('rahul.sharma@example.com');
  const [authPassword, setAuthPassword] = useState('Customer@123');
  const [signupName, setSignupName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');

  // ═══════════════════════════════════════════════════════════════
  // INITIAL DATA FETCH
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([mobileApi.getProducts(), mobileApi.getStats()]);
      if (pRes && pRes.data && pRes.data.length > 0) {
        setProducts(pRes.data);
      } else {
        // Fallback default lemon varieties if backend is in cold boot
        setProducts([
          {
            id: 'prod-1',
            name_en: 'Fresh Maharashtra Lemons',
            name_mr: 'ताजे महाराष्ट्र लिंबू',
            price: 80,
            compare_price: 100,
            unit: 'kg',
            seller_district: 'Jalgaon',
            farm_name: 'Patil Lemon Farm',
            rating: 4.8,
            stock: 150,
            is_farm_fresh: true,
            description_en: 'Hand-picked thin-skinned juicy Kagzi lemons from Jalgaon orchards.',
          },
          {
            id: 'prod-2',
            name_en: 'Premium Farm Lemons',
            name_mr: 'प्रीमियम शेती लिंबू',
            price: 120,
            compare_price: 140,
            unit: 'kg',
            seller_district: 'Satara',
            farm_name: 'Jadhav Citrus Grove',
            rating: 4.9,
            stock: 85,
            is_organic: true,
            description_en: 'Grade-A premium size lemons with aromatic citrus zest and rich juice.',
          },
          {
            id: 'prod-3',
            name_en: 'Organic Fresh Lemons',
            name_mr: 'सेंद्रिय ताजे लिंबू',
            price: 150,
            unit: 'kg',
            seller_district: 'Satara',
            farm_name: 'Jadhav Organic Farm',
            rating: 4.9,
            stock: 60,
            is_organic: true,
            description_en: '100% naturally grown organic lemons without chemical fertilizers.',
          },
          {
            id: 'prod-4',
            name_en: 'Farmer Direct Lemon Box',
            name_mr: 'शेतकरी थेट लिंबू बॉक्स',
            price: 299,
            compare_price: 360,
            unit: '3kg',
            seller_district: 'Akola',
            farm_name: 'Deshmukh Citrus Farms',
            rating: 4.7,
            stock: 45,
            is_farm_fresh: true,
            description_en: 'Carefully sorted 3kg family harvest pack direct from tree to table.',
          },
        ]);
      }

      if (sRes && sRes.data) {
        setStats(sRes.data);
      }
    } catch {
      // offline safety
    }
    setLoading(false);
  };

  // ═══════════════════════════════════════════════════════════════
  // CART & CHECKOUT HELPERS
  // ═══════════════════════════════════════════════════════════════

  const addToCart = (product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { id: 'cart-' + Date.now(), product_id: product.id, quantity: qty, product }];
    });
    Alert.alert('🍋 Added to Cart', `${product.name_en} (${qty} ${product.unit})`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );
  const deliveryFee = cartSubtotal >= 250 || cartSubtotal === 0 ? 0 : 40;
  const cartTotal = cartSubtotal + deliveryFee;

  const handlePlaceOrder = () => {
    if (!checkoutName || !checkoutMobile || !checkoutPin) {
      Alert.alert('Incomplete Address', 'Please provide a valid recipient name, mobile, and PIN code.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(checkoutMobile.trim())) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    const pin = parseInt(checkoutPin.trim(), 10);
    if (isNaN(pin) || pin < 400001 || pin > 445402) {
      Alert.alert('Delivery Region', 'POPTO delivers exclusively to Maharashtra PIN codes (400001 to 445402).');
      return;
    }

    const orderId = 'POPTO-2026-000' + (orders.length + 5);
    const newOrder = {
      id: orderId,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      total: cartTotal,
      status: 'confirmed',
      items: [...cart],
      address: {
        name: checkoutName,
        mobile: checkoutMobile,
        address: checkoutAddress,
        city: checkoutCity,
        pin: checkoutPin,
      },
      paymentMethod,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrder(newOrder);
    setCart([]);
    setCurrentScreen('order_success');
  };

  // ═══════════════════════════════════════════════════════════════
  // FILTERED PRODUCTS
  // ═══════════════════════════════════════════════════════════════

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.name_mr && p.name_mr.includes(searchQuery)) ||
        (p.seller_district && p.seller_district.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.farm_name && p.farm_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDistrict = selectedDistrict === 'All' || p.seller_district === selectedDistrict;
      const matchOrganic = !organicOnly || p.is_organic;
      const matchStock = !inStockOnly || (p.stock && p.stock > 0);

      return matchSearch && matchDistrict && matchOrganic && matchStock;
    });
  }, [products, searchQuery, selectedDistrict, organicOnly, inStockOnly]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER SCREEN VIEWS
  // ═══════════════════════════════════════════════════════════════

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#183D2B" />

      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => {
            setCurrentScreen('home');
            setActiveTab('home');
          }}
          style={styles.logoRow}
        >
          <Text style={styles.logoLemon}>🍋</Text>
          <View>
            <Text style={styles.brandTitle}>{t.brand}</Text>
            <Text style={styles.brandSubtitle}>{t.subheadline}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.langBadge}
            onPress={() => setLang((l) => (l === 'en' ? 'mr' : 'en'))}
          >
            <Text style={styles.langBadgeText}>{lang === 'en' ? 'मराठी' : 'EN'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setCurrentScreen('notifications')}
          >
            <Text style={styles.headerIconText}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Body View */}
      <View style={styles.mainContainer}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#235338" />
            <Text style={styles.loadingText}>Connecting to Maharashtra Lemon Orchards...</Text>
          </View>
        ) : (
          <>
            {/* ═══ SCREEN: HOME ═══ */}
            {currentScreen === 'home' && (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Banner */}
                <View style={styles.heroBanner}>
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeDot}>•</Text>
                    <Text style={styles.heroBadgeText}>Maharashtra Direct Lemon Harvest</Text>
                  </View>
                  <Text style={styles.heroHeadline}>{t.heroTitle}</Text>
                  <Text style={styles.heroSubheadline}>{t.heroSubtitle}</Text>

                  <View style={styles.heroBtnRow}>
                    <TouchableOpacity
                      style={styles.heroCtaPrimary}
                      onPress={() => {
                        setCurrentScreen('shop');
                        setActiveTab('shop');
                      }}
                    >
                      <Text style={styles.heroCtaPrimaryText}>🍋 {t.shopLemons}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.heroCtaSecondary}
                      onPress={() => setCurrentScreen('shop')}
                    >
                      <Text style={styles.heroCtaSecondaryText}>{t.meetFarmers}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Live Database Strip */}
                  <View style={styles.statsStrip}>
                    <View style={styles.statBox}>
                      <Text style={styles.statVal}>{stats.farmersCount}</Text>
                      <Text style={styles.statLbl}>{t.verifiedFarms}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                      <Text style={styles.statVal}>{stats.productsCount}</Text>
                      <Text style={styles.statLbl}>{t.lemonVarieties}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                      <Text style={styles.statVal}>{stats.avgRating} ★</Text>
                      <Text style={styles.statLbl}>{t.liveDb}</Text>
                    </View>
                  </View>
                </View>

                {/* Featured Products */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{t.featured}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentScreen('shop');
                      setActiveTab('shop');
                    }}
                  >
                    <Text style={styles.sectionLink}>{t.allProducts} →</Text>
                  </TouchableOpacity>
                </View>

                {products.slice(0, 4).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.productCard}
                    onPress={() => {
                      setSelectedProduct(item);
                      setCurrentScreen('product_detail');
                    }}
                  >
                    <View style={styles.productLeft}>
                      <View style={styles.productThumb}><Image source={{ uri: getProductImageUrl(item) }} style={styles.productThumbImage} resizeMode="cover" /></View>
                    </View>

                    <View style={styles.productInfo}>
                      <View style={styles.districtBadge}>
                        <Text style={styles.districtBadgeText}>📍 {item.seller_district || 'Maharashtra'}</Text>
                        {item.is_organic && (
                          <Text style={styles.organicBadgeText}>🌱 Organic</Text>
                        )}
                      </View>

                      <Text style={styles.productName}>
                        {lang === 'mr' && item.name_mr ? item.name_mr : item.name_en}
                      </Text>
                      <Text style={styles.farmName}>{item.farm_name || 'Lemon Farm'}</Text>

                      <View style={styles.priceRow}>
                        <Text style={styles.priceText}>₹{item.price}</Text>
                        <Text style={styles.unitText}>/ {item.unit}</Text>
                        {item.compare_price && (
                          <Text style={styles.comparePriceText}>₹{item.compare_price}</Text>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.addCartMiniBtn}
                      onPress={() => addToCart(item)}
                    >
                      <Text style={styles.addCartMiniText}>+ Add</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* ═══ SCREEN: SHOP LEMONS ═══ */}
            {currentScreen === 'shop' && (
              <View style={{ flex: 1 }}>
                <View style={styles.searchBarContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder={t.searchPlaceholder}
                    placeholderTextColor="#8C9A90"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                {/* District Filter Chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterChipsRow}
                >
                  {['All', 'Solapur', 'Jalgaon', 'Satara', 'Akola'].map((dist) => (
                    <TouchableOpacity
                      key={dist}
                      style={[styles.chip, selectedDistrict === dist && styles.chipActive]}
                      onPress={() => setSelectedDistrict(dist)}
                    >
                      <Text
                        style={[styles.chipText, selectedDistrict === dist && styles.chipTextActive]}
                      >
                        {dist === 'All' ? t.filterAll : dist}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[styles.chip, organicOnly && styles.chipActive]}
                    onPress={() => setOrganicOnly((o) => !o)}
                  >
                    <Text style={[styles.chipText, organicOnly && styles.chipTextActive]}>
                      🌱 {t.organicOnly}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                  <Text style={styles.catalogResultCount}>
                    {filteredProducts.length} {t.lemonVarieties}
                  </Text>

                  {filteredProducts.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.productCard}
                      onPress={() => {
                        setSelectedProduct(item);
                        setCurrentScreen('product_detail');
                      }}
                    >
                      <View style={styles.productLeft}>
                        <View style={styles.productThumb}><Image source={{ uri: getProductImageUrl(item) }} style={styles.productThumbImage} resizeMode="cover" /></View>
                      </View>

                      <View style={styles.productInfo}>
                        <View style={styles.districtBadge}>
                          <Text style={styles.districtBadgeText}>📍 {item.seller_district || 'Maharashtra'}</Text>
                        </View>
                        <Text style={styles.productName}>
                          {lang === 'mr' && item.name_mr ? item.name_mr : item.name_en}
                        </Text>
                        <Text style={styles.farmName}>{item.farm_name || 'Direct Orchard'}</Text>
                        <View style={styles.priceRow}>
                          <Text style={styles.priceText}>₹{item.price}</Text>
                          <Text style={styles.unitText}>/ {item.unit}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.addCartMiniBtn}
                        onPress={() => addToCart(item)}
                      >
                        <Text style={styles.addCartMiniText}>+ Add</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* ═══ SCREEN: PRODUCT DETAIL ═══ */}
            {currentScreen === 'product_detail' && selectedProduct && (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setCurrentScreen('shop')}
                >
                  <Text style={styles.backBtnText}>← Back to Shop</Text>
                </TouchableOpacity>

                <View style={styles.detailHeroImage}><Image source={{ uri: getProductImageUrl(selectedProduct) }} style={styles.detailHeroImageContent} resizeMode="cover" />
                  <View style={styles.freshnessStamp}>
                    <Text style={styles.freshnessStampText}>100% FARM FRESH</Text>
                  </View>
                </View>

                <View style={styles.detailBody}>
                  <View style={styles.badgeRow}>
                    <Text style={styles.detailDistrict}>📍 {selectedProduct.seller_district} District</Text>
                    {selectedProduct.is_organic && (
                      <Text style={styles.organicPill}>🌱 Certified Organic</Text>
                    )}
                  </View>

                  <Text style={styles.detailTitle}>
                    {lang === 'mr' && selectedProduct.name_mr ? selectedProduct.name_mr : selectedProduct.name_en}
                  </Text>
                  <Text style={styles.detailFarm}>Harvested by: {selectedProduct.farm_name || 'Maharashtra Grove'}</Text>

                  <View style={styles.detailPriceRow}>
                    <Text style={styles.detailPrice}>₹{selectedProduct.price}</Text>
                    <Text style={styles.detailUnit}>per {selectedProduct.unit}</Text>
                  </View>

                  <Text style={styles.descTitle}>About this Variety</Text>
                  <Text style={styles.descText}>
                    {selectedProduct.description_en ||
                      'Authentic Maharashtra variety grown with direct solar exposure. Ideal for culinary use, high juice yield, natural vitamin-C, and traditional Ayurvedic hydration.'}
                  </Text>

                  <View style={styles.deliveryPromiseCard}>
                    <Text style={styles.deliveryPromiseTitle}>🚚 Maharashtra Cold-Chain Dispatch</Text>
                    <Text style={styles.deliveryPromiseBody}>
                      Same-day harvest & sanitized packing. Dispatched directly from orchard hub with temperature retention.
                    </Text>
                  </View>

                  <View style={styles.ctaActionRow}>
                    <TouchableOpacity
                      style={styles.wishlistToggleBtn}
                      onPress={() => toggleWishlist(selectedProduct.id)}
                    >
                      <Text style={styles.wishlistToggleText}>
                        {wishlist.includes(selectedProduct.id) ? '❤️ Saved' : '🤍 Wishlist'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.primaryCartBtn}
                      onPress={() => addToCart(selectedProduct, 1)}
                    >
                      <Text style={styles.primaryCartText}>{t.addToCart}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* ═══ SCREEN: CART ═══ */}
            {currentScreen === 'cart' && (
              <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                  <Text style={styles.screenHeading}>{t.cartTitle}</Text>

                  {cart.length === 0 ? (
                    <View style={styles.emptyCartBox}>
                      <Text style={styles.emptyCartEmoji}>🍋</Text>
                      <Text style={styles.emptyCartText}>{t.cartEmpty}</Text>
                      <TouchableOpacity
                        style={styles.heroCtaPrimary}
                        onPress={() => {
                          setCurrentScreen('shop');
                          setActiveTab('shop');
                        }}
                      >
                        <Text style={styles.heroCtaPrimaryText}>{t.shopLemons}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      {cart.map((item) => (
                        <View key={item.product_id} style={styles.cartItemCard}>
                          <View style={styles.cartItemLeft}><Image source={{ uri: getProductImageUrl(item.product) }} style={styles.cartThumbImage} resizeMode="cover" /></View>
                          <View style={styles.cartItemDetails}>
                            <Text style={styles.cartItemTitle}>{item.product.name_en}</Text>
                            <Text style={styles.cartItemPrice}>
                              ₹{item.product.price} / {item.product.unit}
                            </Text>
                          </View>
                          <View style={styles.qtyControl}>
                            <TouchableOpacity
                              style={styles.qtyBtn}
                              onPress={() => updateQuantity(item.product_id, -1)}
                            >
                              <Text style={styles.qtyBtnText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyValue}>{item.quantity}</Text>
                            <TouchableOpacity
                              style={styles.qtyBtn}
                              onPress={() => updateQuantity(item.product_id, 1)}
                            >
                              <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}

                      {/* Summary */}
                      <View style={styles.billCard}>
                        <View style={styles.billRow}>
                          <Text style={styles.billLabel}>{t.subtotal}</Text>
                          <Text style={styles.billVal}>₹{cartSubtotal}</Text>
                        </View>
                        <View style={styles.billRow}>
                          <Text style={styles.billLabel}>{t.deliveryFee}</Text>
                          <Text style={styles.billVal}>
                            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                          </Text>
                        </View>
                        <Text style={styles.freeDeliveryNotice}>{t.freeDeliveryNote}</Text>
                        <View style={styles.billDivider} />
                        <View style={styles.billRow}>
                          <Text style={styles.billTotalLabel}>{t.total}</Text>
                          <Text style={styles.billTotalVal}>₹{cartTotal}</Text>
                        </View>
                      </View>
                    </>
                  )}
                </ScrollView>

                {cart.length > 0 && (
                  <View style={styles.bottomCheckoutBar}>
                    <View>
                      <Text style={styles.barTotalLabel}>Total Amount</Text>
                      <Text style={styles.barTotalVal}>₹{cartTotal}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.checkoutBtn}
                      onPress={() => setCurrentScreen('checkout')}
                    >
                      <Text style={styles.checkoutBtnText}>{t.proceedToCheckout} →</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* ═══ SCREEN: CHECKOUT ═══ */}
            {currentScreen === 'checkout' && (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setCurrentScreen('cart')}
                >
                  <Text style={styles.backBtnText}>← Back to Cart</Text>
                </TouchableOpacity>

                <Text style={styles.screenHeading}>{t.checkoutTitle}</Text>

                <View style={styles.formCard}>
                  <Text style={styles.formSectionTitle}>📍 {t.shippingAddress}</Text>

                  <Text style={styles.fieldLabel}>{t.nameLabel}</Text>
                  <TextInput
                    style={styles.inputField}
                    value={checkoutName}
                    onChangeText={setCheckoutName}
                  />

                  <Text style={styles.fieldLabel}>{t.mobileLabel}</Text>
                  <TextInput
                    style={styles.inputField}
                    keyboardType="phone-pad"
                    value={checkoutMobile}
                    onChangeText={setCheckoutMobile}
                  />

                  <Text style={styles.fieldLabel}>{t.addressLabel}</Text>
                  <TextInput
                    style={styles.inputField}
                    value={checkoutAddress}
                    onChangeText={setCheckoutAddress}
                  />

                  <View style={styles.formRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.fieldLabel}>{t.cityLabel}</Text>
                      <TextInput
                        style={styles.inputField}
                        value={checkoutCity}
                        onChangeText={setCheckoutCity}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.fieldLabel}>PIN Code</Text>
                      <TextInput
                        style={styles.inputField}
                        keyboardType="number-pad"
                        value={checkoutPin}
                        onChangeText={setCheckoutPin}
                      />
                    </View>
                  </View>
                </View>

                {/* Payment Option */}
                <View style={styles.formCard}>
                  <Text style={styles.formSectionTitle}>💳 {t.paymentMethod}</Text>

                  <TouchableOpacity
                    style={[styles.radioCard, paymentMethod === 'cod' && styles.radioCardSelected]}
                    onPress={() => setPaymentMethod('cod')}
                  >
                    <Text style={styles.radioText}>💵 {t.cod}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.radioCard, paymentMethod === 'upi' && styles.radioCardSelected]}
                    onPress={() => setPaymentMethod('upi')}
                  >
                    <Text style={styles.radioText}>⚡ {t.upi}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.orderSubmitBtn}
                  onPress={handlePlaceOrder}
                >
                  <Text style={styles.orderSubmitText}>{t.placeOrder} (₹{cartTotal})</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* ═══ SCREEN: ORDER SUCCESS ═══ */}
            {currentScreen === 'order_success' && selectedOrder && (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.successBox}>
                  <Text style={styles.successEmoji}>🎉</Text>
                  <Text style={styles.successTitle}>{t.orderSuccessTitle}</Text>
                  <Text style={styles.orderIdBadge}>Order #{selectedOrder.id}</Text>
                  <Text style={styles.successSubtitle}>{t.orderSuccessSubtitle}</Text>

                  <TouchableOpacity
                    style={styles.heroCtaPrimary}
                    onPress={() => setCurrentScreen('order_tracking')}
                  >
                    <Text style={styles.heroCtaPrimaryText}>📍 {t.trackOrderBtn}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryLink}
                    onPress={() => {
                      setCurrentScreen('shop');
                      setActiveTab('shop');
                    }}
                  >
                    <Text style={styles.secondaryLinkText}>Continue Shopping Lemons →</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* ═══ SCREEN: ORDER TRACKING ═══ */}
            {currentScreen === 'order_tracking' && selectedOrder && (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setCurrentScreen('my_orders')}
                >
                  <Text style={styles.backBtnText}>← All Orders</Text>
                </TouchableOpacity>

                <Text style={styles.screenHeading}>{t.trackingTitle}</Text>
                <Text style={styles.trackingSub}>Order #{selectedOrder.id}</Text>

                {/* Progress Timeline */}
                <View style={styles.timelineCard}>
                  {[
                    { title: t.stageConfirmed, desc: 'Orchard notification accepted', done: true },
                    { title: t.stagePacked, desc: 'Selected and packed in cold crate', done: true },
                    { title: t.stageShipped, desc: 'In transit via Maharashtra logistics', done: false },
                    { title: t.stageDelivered, desc: 'Direct doorstep delivery', done: false },
                  ].map((step, idx) => (
                    <View key={idx} style={styles.timelineStep}>
                      <View style={[styles.timelineDot, step.done && styles.timelineDotActive]} />
                      <View style={styles.timelineContent}>
                        <Text style={[styles.timelineTitle, step.done && styles.timelineTitleActive]}>
                          {step.title}
                        </Text>
                        <Text style={styles.timelineDesc}>{step.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Destination */}
                <View style={styles.formCard}>
                  <Text style={styles.formSectionTitle}>Destination Address</Text>
                  <Text style={styles.addressLine}>{selectedOrder.address.name}</Text>
                  <Text style={styles.addressLine}>{selectedOrder.address.address}</Text>
                  <Text style={styles.addressLine}>
                    {selectedOrder.address.city} - {selectedOrder.address.pin}, Maharashtra
                  </Text>
                  <Text style={styles.addressLine}>Mobile: {selectedOrder.address.mobile}</Text>
                </View>
              </ScrollView>
            )}

            {/* ═══ SCREEN: MY ORDERS ═══ */}
            {currentScreen === 'my_orders' && (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.screenHeading}>{t.myOrdersTitle}</Text>

                {orders.length === 0 ? (
                  <View style={styles.emptyCartBox}>
                    <Text style={styles.emptyCartEmoji}>📦</Text>
                    <Text style={styles.emptyCartText}>No orders recorded yet.</Text>
                  </View>
                ) : (
                  orders.map((ord) => (
                    <TouchableOpacity
                      key={ord.id}
                      style={styles.orderListItem}
                      onPress={() => {
                        setSelectedOrder(ord);
                        setCurrentScreen('order_tracking');
                      }}
                    >
                      <View>
                        <Text style={styles.orderNumberText}>Order #{ord.id}</Text>
                        <Text style={styles.orderDateText}>{ord.created_at}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.orderTotalText}>₹{ord.total}</Text>
                        <Text style={styles.orderStatusPill}>{ord.status.toUpperCase()}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}

            {/* ═══ SCREEN: WISHLIST ═══ */}
            {currentScreen === 'wishlist' && (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.screenHeading}>{t.wishlistTitle}</Text>

                {wishlist.length === 0 ? (
                  <View style={styles.emptyCartBox}>
                    <Text style={styles.emptyCartEmoji}>🤍</Text>
                    <Text style={styles.emptyCartText}>No lemon varieties in your wishlist.</Text>
                  </View>
                ) : (
                  products
                    .filter((p) => wishlist.includes(p.id))
                    .map((item) => (
                      <View key={item.id} style={styles.productCard}>
                        <View style={styles.productLeft}>
                          <View style={styles.productThumb}><Image source={{ uri: getProductImageUrl(item) }} style={styles.productThumbImage} resizeMode="cover" /></View>
                        </View>
                        <View style={styles.productInfo}>
                          <Text style={styles.productName}>{item.name_en}</Text>
                          <Text style={styles.priceText}>₹{item.price} / {item.unit}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.addCartMiniBtn}
                          onPress={() => addToCart(item)}
                        >
                          <Text style={styles.addCartMiniText}>Move to Cart</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                )}
              </ScrollView>
            )}

            {/* ═══ SCREEN: NOTIFICATIONS ═══ */}
            {currentScreen === 'notifications' && (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.screenHeading}>{t.notificationsTitle}</Text>

                {[
                  { id: '1', title: 'Fresh Jalgaon Harvest Ready', time: '10 mins ago', desc: 'Rajesh Patil lemon grove has harvested 500kg fresh Kagzi lemons.' },
                  { id: '2', title: 'Order POPTO-2026-0004 Dispatched', time: '1 hour ago', desc: 'Cold-chain vehicle dispatched for Pune delivery hub.' },
                  { id: '3', title: 'Satara Organic Batch Approved', time: 'Yesterday', desc: '100% pesticide-free certification renewed for Jadhav Organic Farm.' },
                ].map((n) => (
                  <View key={n.id} style={styles.notificationCard}>
                    <Text style={styles.notifTitle}>🍋 {n.title}</Text>
                    <Text style={styles.notifDesc}>{n.desc}</Text>
                    <Text style={styles.notifTime}>{n.time}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* ═══ SCREEN: PROFILE / SETTINGS ═══ */}
            {currentScreen === 'profile' && (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileHeaderCard}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{user.full_name?.charAt(0) || 'R'}</Text>
                  </View>
                  <Text style={styles.profileName}>{user.full_name}</Text>
                  <Text style={styles.profileEmail}>{user.email} • +91 {user.mobile}</Text>
                  <Text style={styles.profileRoleBadge}>CUSTOMER • MAHARASHTRA</Text>
                </View>

                {/* Profile Navigation Links */}
                <View style={styles.menuCard}>
                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => {
                      setCurrentScreen('my_orders');
                      setActiveTab('profile');
                    }}
                  >
                    <Text style={styles.menuRowText}>📦 {t.myOrdersTitle}</Text>
                    <Text style={styles.menuArrow}>→</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => {
                      setCurrentScreen('wishlist');
                      setActiveTab('wishlist');
                    }}
                  >
                    <Text style={styles.menuRowText}>🤍 {t.wishlistTitle}</Text>
                    <Text style={styles.menuArrow}>→</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => setLang((l) => (l === 'en' ? 'mr' : 'en'))}
                  >
                    <Text style={styles.menuRowText}>🌐 Language / भाषा: {lang.toUpperCase()}</Text>
                    <Text style={styles.menuArrow}>{lang === 'en' ? 'मराठी' : 'English'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => setCurrentScreen('notifications')}
                  >
                    <Text style={styles.menuRowText}>🔔 {t.notificationsTitle}</Text>
                    <Text style={styles.menuArrow}>→</Text>
                  </TouchableOpacity>
                </View>

                {/* Shared Platform Info */}
                <View style={styles.platformCard}>
                  <Text style={styles.platformTitle}>POPTO Digital Platform</Text>
                  <Text style={styles.platformBody}>
                    Web & Mobile App synchronized with SQLite backend. Exclusively supporting Maharashtra Lemon Commerce.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={() => {
                    Alert.alert('Signed Out', 'You have been logged out of your session.');
                  }}
                >
                  <Text style={styles.logoutBtnText}>🚪 {t.logout}</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </>
        )}
      </View>

      {/* ═══ BOTTOM NAVIGATION BAR ═══ */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            setActiveTab('home');
            setCurrentScreen('home');
          }}
        >
          <Text style={[styles.navTabIcon, activeTab === 'home' && styles.navTabIconActive]}>🏠</Text>
          <Text style={[styles.navTabLabel, activeTab === 'home' && styles.navTabLabelActive]}>
            {t.tabHome}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            setActiveTab('shop');
            setCurrentScreen('shop');
          }}
        >
          <Text style={[styles.navTabIcon, activeTab === 'shop' && styles.navTabIconActive]}>🍋</Text>
          <Text style={[styles.navTabLabel, activeTab === 'shop' && styles.navTabLabelActive]}>
            {t.tabShop}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            setActiveTab('wishlist');
            setCurrentScreen('wishlist');
          }}
        >
          <Text style={[styles.navTabIcon, activeTab === 'wishlist' && styles.navTabIconActive]}>🤍</Text>
          <Text style={[styles.navTabLabel, activeTab === 'wishlist' && styles.navTabLabelActive]}>
            {t.tabWishlist}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            setActiveTab('cart');
            setCurrentScreen('cart');
          }}
        >
          <View>
            <Text style={[styles.navTabIcon, activeTab === 'cart' && styles.navTabIconActive]}>🛒</Text>
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.navTabLabel, activeTab === 'cart' && styles.navTabLabelActive]}>
            {t.tabCart}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            setActiveTab('profile');
            setCurrentScreen('profile');
          }}
        >
          <Text style={[styles.navTabIcon, activeTab === 'profile' && styles.navTabIconActive]}>👤</Text>
          <Text style={[styles.navTabLabel, activeTab === 'profile' && styles.navTabLabelActive]}>
            {t.tabProfile}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#183D2B',
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 0,
  },
  topHeader: {
    backgroundColor: '#183D2B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoLemon: { fontSize: 26 },
  brandTitle: { color: '#FFE04B', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  brandSubtitle: { color: '#E2E8F0', fontSize: 10, opacity: 0.9 },
  headerRightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 224, 75, 0.4)',
  },
  langBadgeText: { color: '#FFE04B', fontSize: 11, fontWeight: 'bold' },
  headerIconBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: 6,
    borderRadius: 12,
  },
  headerIconText: { fontSize: 16 },
  mainContainer: { flex: 1, backgroundColor: '#F9F8F3' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { color: '#4A5B50', fontSize: 13, marginTop: 12 },

  // Hero
  heroBanner: {
    backgroundColor: '#1B4731',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  heroBadgeDot: { color: '#FFE04B', fontSize: 14, marginRight: 4 },
  heroBadgeText: { color: '#FFE04B', fontSize: 10, fontWeight: 'bold' },
  heroHeadline: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', lineHeight: 26, marginBottom: 6 },
  heroSubheadline: { color: '#E2E8F0', fontSize: 12, lineHeight: 18, marginBottom: 16 },
  heroBtnRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  heroCtaPrimary: {
    backgroundColor: '#FFE04B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  heroCtaPrimaryText: { color: '#1B2C21', fontSize: 12, fontWeight: 'bold' },
  heroCtaSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroCtaSecondaryText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { color: '#FFE04B', fontSize: 16, fontWeight: 'bold' },
  statLbl: { color: '#E2E8F0', fontSize: 9, marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.15)' },

  // Sections & Cards
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1B2C21' },
  sectionLink: { fontSize: 12, color: '#235338', fontWeight: 'bold' },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECE9',
  },
  productLeft: { marginRight: 12 },
  productThumb: {
    width: 72,
    height: 72,
    backgroundColor: '#FEF9C3',
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productThumbImage: {
    width: '100%',
    height: '100%',
  },
  lemonEmoji: { fontSize: 32 },
  productInfo: { flex: 1 },
  districtBadge: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  districtBadgeText: { fontSize: 10, color: '#235338', fontWeight: '600' },
  organicBadgeText: { fontSize: 10, color: '#15803D', fontWeight: 'bold' },
  productName: { fontSize: 14, fontWeight: 'bold', color: '#1B2C21' },
  farmName: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 },
  priceText: { fontSize: 15, fontWeight: 'bold', color: '#1B2C21' },
  unitText: { fontSize: 11, color: '#6B7280' },
  comparePriceText: { fontSize: 11, color: '#9CA3AF', textDecorationLine: 'line-through' },
  addCartMiniBtn: {
    backgroundColor: '#235338',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addCartMiniText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },

  // Shop & Filters
  searchBarContainer: { padding: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E8ECE9' },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 12,
    color: '#1B2C21',
  },
  filterChipsRow: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFFFFF', gap: 8 },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#235338', borderColor: '#235338' },
  chipText: { fontSize: 11, color: '#4B5563', fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  catalogResultCount: { fontSize: 11, color: '#6B7280', marginBottom: 10, fontWeight: '600' },

  // Detail View
  backBtn: { marginBottom: 12 },
  backBtnText: { color: '#235338', fontSize: 12, fontWeight: 'bold' },
  detailHeroImage: {
    height: 220,
    backgroundColor: '#FEF9C3',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  detailHeroImageContent: {
    width: '100%',
    height: '100%',
  },
  detailHeroEmoji: { fontSize: 72 },
  freshnessStamp: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#15803D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freshnessStampText: { color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' },
  detailBody: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E8ECE9' },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  detailDistrict: { fontSize: 11, color: '#235338', fontWeight: 'bold' },
  organicPill: { fontSize: 11, color: '#15803D', fontWeight: 'bold' },
  detailTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B2C21', marginBottom: 4 },
  detailFarm: { fontSize: 12, color: '#6B7280', marginBottom: 12 },
  detailPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 16 },
  detailPrice: { fontSize: 24, fontWeight: 'extrabold', color: '#235338' },
  detailUnit: { fontSize: 13, color: '#6B7280' },
  descTitle: { fontSize: 13, fontWeight: 'bold', color: '#1B2C21', marginBottom: 4 },
  descText: { fontSize: 12, color: '#4B5563', lineHeight: 18, marginBottom: 16 },
  deliveryPromiseCard: { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 12, marginBottom: 20 },
  deliveryPromiseTitle: { fontSize: 12, fontWeight: 'bold', color: '#166534', marginBottom: 2 },
  deliveryPromiseBody: { fontSize: 11, color: '#15803D', lineHeight: 16 },
  ctaActionRow: { flexDirection: 'row', gap: 10 },
  wishlistToggleBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistToggleText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  primaryCartBtn: {
    flex: 2,
    backgroundColor: '#235338',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCartText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },

  // Cart & Checkout
  screenHeading: { fontSize: 20, fontWeight: 'bold', color: '#1B2C21', marginBottom: 16 },
  emptyCartBox: { alignItems: 'center', paddingVertical: 40 },
  emptyCartEmoji: { fontSize: 50, marginBottom: 10 },
  emptyCartText: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  cartItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECE9',
  },
  cartItemLeft: { width: 44, height: 44, backgroundColor: '#FEF9C3', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  cartLemonEmoji: { fontSize: 22 },
  cartThumbImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  cartItemDetails: { flex: 1 },
  cartItemTitle: { fontSize: 13, fontWeight: 'bold', color: '#1B2C21' },
  cartItemPrice: { fontSize: 12, color: '#235338', fontWeight: '600' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, backgroundColor: '#F3F4F6', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
  qtyValue: { fontSize: 13, fontWeight: 'bold', color: '#1B2C21' },
  billCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#E8ECE9' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billLabel: { fontSize: 12, color: '#4B5563' },
  billVal: { fontSize: 12, fontWeight: 'bold', color: '#1B2C21' },
  freeDeliveryNotice: { fontSize: 10, color: '#15803D', fontWeight: 'bold', marginBottom: 8 },
  billDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  billTotalLabel: { fontSize: 14, fontWeight: 'bold', color: '#1B2C21' },
  billTotalVal: { fontSize: 17, fontWeight: 'extrabold', color: '#235338' },
  bottomCheckoutBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barTotalLabel: { fontSize: 10, color: '#6B7280' },
  barTotalVal: { fontSize: 18, fontWeight: 'extrabold', color: '#235338' },
  checkoutBtn: { backgroundColor: '#235338', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  checkoutBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },

  // Forms
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E8ECE9' },
  formSectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#1B2C21', marginBottom: 12 },
  fieldLabel: { fontSize: 11, color: '#4B5563', fontWeight: '600', marginBottom: 4 },
  inputField: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#1B2C21',
    marginBottom: 10,
  },
  formRow: { flexDirection: 'row' },
  radioCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 8,
  },
  radioCardSelected: { borderColor: '#235338', backgroundColor: '#F0FDF4' },
  radioText: { fontSize: 12, fontWeight: 'bold', color: '#1B2C21' },
  orderSubmitBtn: { backgroundColor: '#FFE04B', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 20 },
  orderSubmitText: { color: '#1B2C21', fontSize: 14, fontWeight: 'extrabold' },

  // Order Success & Tracking
  successBox: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: '#E8ECE9' },
  successEmoji: { fontSize: 54, marginBottom: 10 },
  successTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B2C21', textAlign: 'center', marginBottom: 6 },
  orderIdBadge: { fontSize: 13, fontWeight: 'bold', color: '#235338', backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  successSubtitle: { fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  secondaryLink: { marginTop: 16 },
  secondaryLinkText: { color: '#235338', fontSize: 12, fontWeight: 'bold' },
  trackingSub: { fontSize: 12, color: '#6B7280', marginTop: -10, marginBottom: 16 },
  timelineCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E8ECE9' },
  timelineStep: { flexDirection: 'row', marginBottom: 16 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#D1D5DB', marginRight: 12, marginTop: 2 },
  timelineDotActive: { backgroundColor: '#15803D' },
  timelineContent: { flex: 1 },
  timelineTitle: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  timelineTitleActive: { color: '#15803D', fontWeight: 'bold' },
  timelineDesc: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  addressLine: { fontSize: 12, color: '#4B5563', lineHeight: 18 },

  // My Orders
  orderListItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECE9',
  },
  orderNumberText: { fontSize: 13, fontWeight: 'bold', color: '#1B2C21' },
  orderDateText: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  orderTotalText: { fontSize: 14, fontWeight: 'extrabold', color: '#235338' },
  orderStatusPill: { fontSize: 9, fontWeight: 'bold', color: '#15803D', backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 2 },

  // Notifications
  notificationCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E8ECE9' },
  notifTitle: { fontSize: 13, fontWeight: 'bold', color: '#1B2C21' },
  notifDesc: { fontSize: 11, color: '#4B5563', marginTop: 3, lineHeight: 16 },
  notifTime: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },

  // Profile
  profileHeaderCard: { backgroundColor: '#1B4731', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16 },
  avatarCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#FFE04B', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#1B2C21' },
  profileName: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
  profileEmail: { color: '#E2E8F0', fontSize: 11, marginTop: 2 },
  profileRoleBadge: { color: '#FFE04B', fontSize: 9, fontWeight: 'bold', marginTop: 6, backgroundColor: 'rgba(255, 224, 75, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  menuCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 8, marginBottom: 14, borderWidth: 1, borderColor: '#E8ECE9' },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  menuRowText: { fontSize: 13, fontWeight: '600', color: '#1B2C21' },
  menuArrow: { fontSize: 14, color: '#9CA3AF' },
  platformCard: { backgroundColor: '#F0FDF4', padding: 14, borderRadius: 14, marginBottom: 16 },
  platformTitle: { fontSize: 12, fontWeight: 'bold', color: '#166534', marginBottom: 2 },
  platformBody: { fontSize: 11, color: '#15803D', lineHeight: 16 },
  logoutBtn: { backgroundColor: '#FEE2E2', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  logoutBtnText: { color: '#B91C1C', fontSize: 12, fontWeight: 'bold' },

  // Bottom Navigation
  bottomNav: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    paddingVertical: 6,
    paddingBottom: 10,
  },
  navTab: { flex: 1, alignItems: 'center', position: 'relative' },
  navTabIcon: { fontSize: 18, color: '#9CA3AF' },
  navTabIconActive: { color: '#235338' },
  navTabLabel: { fontSize: 10, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  navTabLabelActive: { color: '#235338', fontWeight: 'bold' },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#DC2626',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' },
});
