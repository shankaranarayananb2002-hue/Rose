// Real public-key end-to-end encryption using tweetnacl (X25519 + XSalsa20-Poly1305).
// The private key NEVER leaves this device — it lives only in secure storage.
import nacl from "tweetnacl";
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from "tweetnacl-util";
import * as SecureStore from "expo-secure-store";

const PRIVATE_KEY_STORE_KEY = "rose_private_key_v1";

export async function loadOrCreateKeypair() {
  const existing = await SecureStore.getItemAsync(PRIVATE_KEY_STORE_KEY);
  if (existing) {
    const secretKey = decodeBase64(existing);
    const publicKey = nacl.box.keyPair.fromSecretKey(secretKey).publicKey;
    return { publicKey: encodeBase64(publicKey), secretKeyRaw: secretKey };
  }
  const pair = nacl.box.keyPair();
  await SecureStore.setItemAsync(PRIVATE_KEY_STORE_KEY, encodeBase64(pair.secretKey));
  return { publicKey: encodeBase64(pair.publicKey), secretKeyRaw: pair.secretKey };
}

export function encryptMessage(plaintext, theirPublicKeyB64, mySecretKeyRaw) {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const theirPublicKey = decodeBase64(theirPublicKeyB64);
  const cipher = nacl.box(decodeUTF8(plaintext), nonce, theirPublicKey, mySecretKeyRaw);
  return { ciphertext: encodeBase64(cipher), nonce: encodeBase64(nonce) };
}

export function decryptMessage(ciphertextB64, nonceB64, theirPublicKeyB64, mySecretKeyRaw) {
  try {
    const theirPublicKey = decodeBase64(theirPublicKeyB64);
    const plain = nacl.box.open(
      decodeBase64(ciphertextB64),
      decodeBase64(nonceB64),
      theirPublicKey,
      mySecretKeyRaw
    );
    if (!plain) return "[unable to decrypt]";
    return encodeUTF8(plain);
  } catch {
    return "[unable to decrypt]";
  }
}
