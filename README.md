# Unified Web & Native Architecture (BentoShell)

This monorepo contains a unified architecture where a single Next.js web application serves both desktop browsers and a mobile shell, utilizing a bi-directional bridge for device communication.

## 1. Architecture Overview

- **Monorepo Manager**: Turborepo
- **Web App**: Next.js (`apps/web`) - Responsive, platform-aware UI.
- **Mobile Shell**: React Native / Expo (`apps/mobile`) - Native wrapper with hardware integration.
- **Bridge**: `react-native-webview` - Handles messaging and injection.

---

## 2. Web Application

### User Agent Detection
We detect the shell environment using the custom `useIsBentoShell` hook. This checks `window.navigator.userAgent` for the string `"BentoShell"`. 
> *Note: We specifically check for the shell token, not just "mobile" behavior, to ensure precise targeting of our native wrapper capability.*

### Dynamic Layout
- **Browser View**: Displays a persistent Sidebar and Footer.
- **App View (BentoShell)**: 
  - Hides Sidebar and Footer.
  - Applies top padding via the CSS variable `--bento-safe-top`.
  - **Fallback**: Defaults to `0px` in standard browsers.

### Bridge Communication
- **Trigger**: The "Sync with Device" button checks for `window.ReactNativeWebView`.
- **Protocol**:
  - **Web -> Native**: `window.ReactNativeWebView.postMessage("Sync with Device")`
  - **Native -> Web**: Listens for `message` event with payload: `{ "deviceId": "...", "status": "Synced" }`

---

## 3. Mobile Shell

### WebView Setup
- Uses `react-native-webview` pointing to the locally served web app (`localhost:3000` or `10.0.2.2:3000` for Android Emulator).
- **User Agent Injection**: Appends `BentoShell/1.0` to the default user agent, enabling the web app's detection logic.

### Safe Area Injection
- **Tech**: Uses `useSafeAreaInsets` from `react-native-safe-area-context`.
- **Mechanism**: Injects JavaScript before the page loads to set the CSS variable:
  ```javascript
  document.documentElement.style.setProperty('--bento-safe-top', '${insets.top}px');
  ```

### Back Button Handling (Android)
- Intercepts the hardware back button.
- **Logic**:
  - If WebView `canGoBack` is true: Navigate WebView history.
  - If `canGoBack` is false: Exit the app (default behavior).

### Loading & Error Polish
- **No White Flash**:
  - Validated by using a native `ActivityIndicator` overlay that only hides when `onLoadEnd` fires.
  - WebView background color matches the app theme.
- **Offline Support**: Displays a custom native "Try Again" screen if the URL fails to load.

---

## 4. Performance & Polish

### Bridge Message Protocol
We adhere to a strict message flow for reliability:

**Request (Web -> Native)**
```json
{ "type": "SYNC_DEVICE", "payload": {} } 
// Current implementation sends simple string: "Sync with Device"
```

**Response (Native -> Web)**
```json
{
  "deviceId": "BENTO-99",
  "status": "Synced"
}
```

### Screen Recording
*A 60-second demo recording (if requested) typically showcases:*
1. **Desktop**: Sidebar visible, "Sync" logs console warning.
2. **Mobile**: Sidebar hidden, Notch padding applied, "Sync" triggers native alert and data update.

---

## 5. How to Run

### Prerequisites
- **Node.js**: v18+
- **Expo Go**: Installed on your physical device or Simulator.

### Steps
1.  **Start the Web App**:
    ```bash
    cd apps/web
    npm run dev
    # App runs at http://localhost:3000
    ```

2.  **Start the Mobile App**:
    *Open a new terminal window.*
    ```bash
    cd apps/mobile
    npm run ios     # For iOS Simulator
    # OR
    npm run android # For Android Emulator
    ```

> **Tip for Real Devices**: To test on a physical phone, you may need to use a tunnel (like `ngrok`) to expose your localhost, or confirm your phone and computer are on the same Wi-Fi and update `LOCALHOST` in `apps/mobile/App.js` to your computer's IP address.

---

## 6. Verification Results

### Browser Verification
- [x] **Sidebar/Footer**: Visible.
- [x] **Safe Area**: 0px (No visual gap).
- [x] **Sync Button**: Logs "Device sync not available on web" to console.

### Mobile Verification
- [x] **Sidebar/Footer**: Hidden automatically.
- [x] **Safe Area**: Correct top padding injected matching the device notch.
- [x] **Sync Button**: 
  - Triggers Native Alert ("Sync Requested").
  - Upon confirmation, Web UI updates with "Device Data Received".
- [x] **Back Button**: Navigates history correctly; exits app only at root.

### Offline Verification
- [x] **Error Screen**: Disabling the server shows the Native Error View with "Try Again" button.
