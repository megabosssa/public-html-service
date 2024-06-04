import * as jose from "jose";

const ENC: string = "A256GCM";
const ALG: string = "dir";
const encrypt = async (plainText: string, encryptionKey: any) => {
  return await new jose.CompactEncrypt(new TextEncoder().encode(plainText))
    .setProtectedHeader({ alg: ALG, enc: ENC })
    .encrypt(encryptionKey);
};

const decrypt = async (encryptedData: string, encryptionKey: any) => {
  const { plaintext, protectedHeader } = await jose.compactDecrypt(encryptedData, encryptionKey);
  return new TextDecoder().decode(plaintext);
};

export { encrypt, decrypt };