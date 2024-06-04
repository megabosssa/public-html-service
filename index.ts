// index.ts

import { encrypt, decrypt } from './encryption';

const runEncryptionDemo = async () => {
  const plainText = "Sample, code ggggg";
  const encryptionKey = new Uint8Array(32); // Example key, ensure it matches the requirements

  // Fill encryptionKey with your actual key bytes here
  for (let i = 0; i < 32; i++) {
    encryptionKey[i] = i; // Example, replace with your key
  }

  try {
    const encryptedData = await encrypt(plainText, encryptionKey);
    console.log("Encrypted Data:", encryptedData);

    const decryptedText = await decrypt("eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..O8XI8SxlUEThztxg.6xAIwi0l9BkPNb7E.UTzoGPGZ9Yq48Igyo4kkJQ", encryptionKey);
    console.log("Decrypted Text:", decryptedText);
  } catch (error) {
    console.error("Error during encryption/decryption process:", error);
  }
};

runEncryptionDemo();
