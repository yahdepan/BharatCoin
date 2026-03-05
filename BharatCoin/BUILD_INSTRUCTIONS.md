# BharatCoin — React Native App
## Build Instructions to Generate APK

---

## ✅ Prerequisites

Install the following before starting:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18 or higher | https://nodejs.org |
| JDK | 17 (OpenJDK) | https://adoptium.net |
| Android Studio | Latest | https://developer.android.com/studio |
| React Native CLI | Latest | `npm install -g react-native-cli` |

---

## 📱 Step 1 — Install Android Studio & SDK

1. Open Android Studio → SDK Manager
2. Install:
   - **Android SDK Platform 34**
   - **Android SDK Build-Tools 34.0.0**
   - **NDK (Side by side) 26.1.x**
   - **Android Emulator**

3. Set environment variables in `~/.bashrc` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```
Then run: `source ~/.bashrc`

---

## 📦 Step 2 — Install Dependencies

Open terminal in the `BharatCoin/` folder:

```bash
npm install
```

---

## 🔧 Step 3 — Link Native Modules

```bash
npx react-native-asset
cd android && ./gradlew clean && cd ..
```

---

## 🏃 Step 4 — Run on Emulator (for testing)

```bash
# Start an Android emulator from Android Studio first, then:
npx react-native run-android
```

---

## 📦 Step 5 — Build Release APK

### 5a. Generate a signing keystore (only once):
```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore android/app/bharatcoin-release.keystore \
  -alias bharatcoin \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### 5b. Add credentials to `android/gradle.properties`:
```properties
MYAPP_UPLOAD_STORE_FILE=bharatcoin-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=bharatcoin
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

### 5c. Build the APK:
```bash
cd android
./gradlew assembleRelease
```

### 5d. Find your APK here:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📲 Install APK on Phone

```bash
# Connect phone via USB with USB debugging ON, then:
adb install android/app/build/outputs/apk/release/app-release.apk
```

Or transfer the APK file to your phone and open it directly.

---

## 🔑 Features in This Build

| Feature | Status | Notes |
|---------|--------|-------|
| ⛏ BHC Mining | ✅ Working | Eco mode, every 10s, background |
| 💬 Chat | ✅ Working | Real-time, offline queue |
| 📴 Offline Messages | ✅ Working | Auto-syncs when online |
| 📥 QR Receive | ✅ Working | Shows scannable QR code |
| 📤 Send BHC | ✅ Working | Validates & deducts balance |
| 📷 QR Scanner | ⚠️ UI ready | Needs camera permission grant |
| 📹 Video Call | ✅ Working | WebRTC peer-to-peer |
| 🎤 Mute/Camera | ✅ Working | Live toggle during call |
| 💾 Persistence | ✅ Working | AsyncStorage saves coins/msgs |
| 🌐 Network detection | ✅ Working | NetInfo integration |

---

## ⚠️ Permissions Required

The app will request on first launch:
- **Camera** — for video calls and QR scanning
- **Microphone** — for video call audio
- **Internet** — for P2P networking

---

## 🔗 For Real Blockchain Integration

To connect BharatCoin to a real blockchain:
1. Deploy a smart contract on **Ethereum / Polygon / BSC**
2. Use **Web3.js** or **ethers.js** with `react-native-crypto`
3. Replace the mining timer logic with real block validation
4. Use **WebSocket** for real-time P2P chat (e.g. Socket.io)
5. Use STUN/TURN servers for production WebRTC signaling

---

## 📞 Support

Built with React Native 0.73 · Target SDK 34 · Min SDK 24 (Android 7+)
