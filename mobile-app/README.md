# AI Manus Unified - Mobile App

<div align="center">

![AI Manus Unified](https://img.shields.io/badge/AI%20Manus-Mobile-89b4fa?style=for-the-badge&labelColor=1e1e2e)

**Android & iOS Mobile Application**

Built with Expo and React Native

</div>

---

## 📱 Features

- **Multi-Provider AI Chat**: Switch between OpenAI, Anthropic, Google, DeepSeek, Groq, and Ollama
- **Workflow Management**: View and manage automation workflows on the go
- **Real-time Streaming**: Get streaming responses from AI models
- **Dark Mode**: Beautiful Catppuccin Mocha theme
- **Offline Support**: View cached conversations offline

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or bun
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Installation

```bash
# Navigate to mobile app directory
cd mobile-app

# Install dependencies
npm install

# Start development server
npm start
```

### Run on Device

```bash
# Android
npm run android

# iOS
npm run ios
```

---

## 📦 Build APK

### Using EAS Build (Recommended)

1. **Login to Expo**
   ```bash
   eas login
   ```

2. **Configure Project**
   ```bash
   eas build:configure
   ```

3. **Build APK**
   ```bash
   npm run build:apk
   ```
   
   Or manually:
   ```bash
   eas build --platform android --profile apk
   ```

4. **Download APK**
   - After build completes, download from Expo dashboard
   - Or use: `eas build:list`

### Build Profiles

| Profile | Description |
|---------|-------------|
| `apk` | Standalone APK for testing |
| `preview` | APK with development tools |
| `production` | Optimized production build |

---

## 🏗️ Project Structure

```
mobile-app/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home/landing screen
│   ├── login.tsx          # Login screen
│   └── (tabs)/            # Tab navigation
│       ├── _layout.tsx    # Tabs layout
│       ├── index.tsx      # Dashboard
│       ├── chat.tsx       # AI Chat
│       ├── workflows.tsx  # Workflows list
│       └── settings.tsx   # Settings
├── components/            # Reusable components
├── lib/                   # Utilities and API
├── hooks/                 # Custom React hooks
├── assets/               # Images and fonts
├── app.json              # Expo configuration
├── eas.json              # EAS build configuration
└── package.json          # Dependencies
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:

```env
API_URL=https://your-api.com
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### App Configuration

Edit `app.json` to customize:
- App name and icon
- Bundle identifier
- Permissions
- Splash screen

---

## 🎨 Theming

The app uses the **Catppuccin Mocha** color palette:

| Color | Hex | Usage |
|-------|-----|-------|
| Base | `#1e1e2e` | Background |
| Surface | `#313244` | Cards |
| Text | `#cdd6f4` | Primary text |
| Blue | `#89b4fa` | Accent |
| Green | `#a6e3a1` | Success |
| Red | `#f38ba8` | Error |

---

## 📲 Installation on Android

1. **Download APK** from EAS build or releases
2. **Enable Unknown Sources** in Android settings
3. **Open APK** and tap Install
4. **Launch App** from home screen

---

## 🔧 Development

### Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in web browser
npm run build:apk  # Build APK with EAS
```

### Debugging

- **React DevTools**: Press `j` in terminal
- **Expo Go**: Scan QR code with Expo Go app
- **Debug Mode**: Shake device or press `m` for menu

---

## 📄 License

MIT License - See [LICENSE](../LICENSE) for details.

---

<div align="center">

**Built with ❤️ using Expo and React Native**

</div>