# Rose — a real, deployable E2EE chat app

Two parts:
- `backend/` — Node.js/Express/Socket.io/PostgreSQL server. See `backend/README.md` to deploy (Render/Railway/AWS all work).
- `mobile/` — Expo/React Native app for Android + iOS. See `mobile/README.md` to run and build it.

## Architecture
```
[Phone A] --keypair on-device, private key never leaves-->
    encrypt(message, PhoneB's public key) --> Socket.io --> [Your server]
    server stores/relays CIPHERTEXT ONLY, can't read it
    --> Socket.io --> [Phone B] --decrypt with its private key-->
```

## Order of operations to get this fully live
1. Deploy `backend/` (10–15 min, see its README).
2. Put that URL into `mobile/src/api.js`.
3. Run `mobile/` with Expo Go to test on your own phone.
4. When happy, use EAS Build to produce a real Android/iOS build and submit to the stores.

## What's intentionally left out of this first version
- Media/voice messages, calls — text only for now.
- Push notifications when the app is backgrounded (add `expo-notifications` + a device-token table).
- Full Signal-protocol double-ratchet (current crypto is strong public-key E2EE, not per-message forward secrecy).
- Group chats (schema/socket logic would need a `Room` model fanning out to members).
