# 🍋 POPTO Mobile App — React Native + Expo

**Brand**: POPTO – From Farmers to Buyers  
**Tagline**: DISCOVER. PLAN. PROGRESS. (शोधा. नियोजन करा. प्रगती करा.)  
**Platform**: Android (Optimized for modern Android devices including OPPO, Samsung, OnePlus) & iOS  
**Backend**: Shared Next.js 14 API + SQLite Database (`data/popto.db`)  
**Currency**: INR ₹  
**Languages**: English & मराठी (Bilingual UI toggle)

---

## 📱 Features Included

- **Splash & Onboarding**: Premium agricultural branding with Maharashtra lemon orchard visual.
- **Home Dashboard**: Live platform counters (farmers, varieties, districts, rating) and featured lemon produce.
- **Shop Lemons**: Real-time search and faceted filters by District (Solapur, Jalgaon, Satara, Akola, etc.), Organic certification, and Price sorting.
- **Product Details**: Lemon variety specifications, harvest date, freshness meter, grower information, and weight selection.
- **Cart Management**: Quantity controls, delivery charge calculations, real-time total updates, and coupon application.
- **Maharashtra Checkout**: Strict Maharashtra PIN code validation (400001–445402), delivery address, and Test Payment / COD options.
- **Live Order Tracking**: Unique Order ID generation and interactive 4-stage tracking timeline (Order Placed → Packed → In Transit → Delivered).
- **My Orders**: Complete order history with status badges and re-order shortcuts.
- **Wishlist**: Save favorite lemon varieties with one-tap transfer to cart.
- **Notifications**: Instant alerts on order status and seasonal harvest releases.
- **Profile & Settings**: Account details, language selector (English $\leftrightarrow$ मराठी), and sign out.

---

## 🌐 Connecting to Backend API

The mobile app connects to the shared Next.js backend. **Do NOT use `localhost` on physical Android devices**, as `localhost` inside Android points to the phone itself.

### 1. Environment Variable Setup (`.env`)
Create `mobile/.env` or configure your environment:
```ini
# For Android Emulator:
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api

# For Physical Phone (OPPO / Samsung / OnePlus on same Wi-Fi):
# Replace 192.168.1.X with your computer's local IPv4 address
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api

# For Production Cloud Deployment:
EXPO_PUBLIC_API_URL=https://your-domain.com/api
```

### 2. In-App Dynamic API URL
If the environment variable is not set, the mobile app provides fallback to the emulator host (`http://10.0.2.2:3000/api`) or can be dynamically pointed to your LAN IP using `mobileApi.setBaseUrl('http://<your-lan-ip>:3000/api')`.

---

## 🚀 Running in Development

Ensure Node.js v20+ is active:

```powershell
# In project root/mobile
cd mobile

# Start Expo dev server
npx expo start
```

- Press `a` to launch in Android Emulator.
- Scan the displayed QR code with the **Expo Go** app on your physical Android phone (ensure the phone is connected to the same Wi-Fi network as your development machine).

---

## 📦 Building Standalone Android APK

The project is pre-configured with `eas.json` for building a standalone `.apk` package using EAS Build:

### Step 1: Login to Expo / EAS
```bash
npx eas login
```

### Step 2: Configure EAS Project (First time only)
```bash
npx eas build:configure
```

### Step 3: Trigger Android APK Preview Build
```bash
npx eas build --platform android --profile preview
```
*The `preview` profile in `eas.json` has `"buildType": "apk"`, ensuring that EAS outputs a directly installable `.apk` file instead of an `.aab` bundle.*

### Alternative: Local Standalone Build with Expo Prebuild
```bash
# Generate native Android project files:
npx expo prebuild --platform android

# Build local debug APK using Gradle (requires Android SDK):
cd android
./gradlew assembleDebug
# Output APK will be located at: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📲 Installing APK on Physical Android Phone (e.g. OPPO)

1. **Download / Transfer APK**:
   - Download the generated `.apk` file from the EAS build URL or transfer via USB cable / Google Drive to your phone.
2. **Open APK File**:
   - Locate the `.apk` file using your Android File Manager (e.g. "Files" app on OPPO ColorOS).
3. **Allow Installation from Unknown Sources**:
   - If prompted by Android security (*"For your security, your phone is not allowed to install unknown apps from this source"*), tap **Settings** and toggle **Allow from this source**.
4. **Complete Installation**:
   - Tap **Install**, then tap **Open** once installation completes.
5. **Verify Live App**:
   - Verify splash screen and brand iconography.
   - Toggle language between English and मराठी.
   - Log in using demo credentials (`rahul.sharma@example.com` / `Customer@123`).
   - Add fresh Maharashtra lemons to cart and complete checkout.
   - Notice the order immediately registers on the Web Admin portal (`http://localhost:3000/admin`).
