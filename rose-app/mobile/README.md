# Rose mobile app (Expo / React Native)

## Run it locally
```
npm install
npx expo start
```
Scan the QR code with Expo Go on your phone, or press `a`/`i` for an emulator.

Before running, open `src/api.js` and set `API_URL` to your deployed backend
(e.g. `https://your-service.onrender.com`).

## Build real installable apps

This uses Expo Application Services (EAS) — free tier is enough to get started.
```
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android   # produces an .apk / .aab
eas build --platform ios       # requires an Apple Developer account ($99/yr)
```

To publish:
- **Android**: create a Google Play Console account ($25 one-time), create an app, upload the `.aab` from the build.
- **iOS**: create an Apple Developer account, create the app in App Store Connect, submit via `eas submit`.

## Security notes
- Each user's private key is generated on-device with `tweetnacl` and stored
  in `expo-secure-store` (hardware-backed keystore on both platforms). It is
  never sent to the server.
- Messages are encrypted with `nacl.box` (X25519 + XSalsa20-Poly1305) using
  the recipient's public key before they're ever sent over the network.
- This is real, correctly-implemented E2EE — but it's simpler than the full
  Signal protocol WhatsApp uses, which adds a "double ratchet" so each
  message gets a fresh key (forward secrecy) even within one conversation.
  If you want that upgrade later, look at integrating `libsignal-client`.
