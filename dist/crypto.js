(function (root) {
  const aes = typeof module === 'object' ? require('./aes-js.js') : root.aesjs;
  const utf8 = new TextEncoder();

  function keyBytes(password, bits) {
    const bytes = utf8.encode(password);
    const key = new Uint8Array(bits / 8);
    if (bytes.length > key.length) throw new Error('密码的 UTF-8 字节数超过所选密钥长度。');
    key.set(bytes);
    return key;
  }

  function pad(bytes, mode) {
    const remainder = bytes.length % 16;
    if (mode === 'none') {
      if (remainder) throw new Error('No Padding 要求明文 UTF-8 字节数是 16 的倍数。');
      return bytes;
    }

    const count = mode === 'zero' && !remainder ? 0 : 16 - remainder;
    const output = new Uint8Array(bytes.length + count);
    output.set(bytes);
    if (mode === 'pkcs5' || mode === 'pkcs7') output.fill(count, bytes.length);
    if (mode === 'iso10126') crypto.getRandomValues(output.subarray(bytes.length, output.length - 1));
    if (mode !== 'zero') output[output.length - 1] = count;
    return output;
  }

  function unpad(bytes, mode) {
    if (mode === 'none') return bytes;
    if (mode === 'zero') {
      let end = bytes.length;
      while (end > 0 && bytes[end - 1] === 0) end--;
      return bytes.subarray(0, end);
    }

    const count = bytes[bytes.length - 1];
    const error = '填充校验失败，请检查密码、密钥长度和填充方式。';
    if (!(count >= 1 && count <= 16)) throw new Error(error);
    const padding = bytes.subarray(bytes.length - count, bytes.length - 1);
    if ((mode === 'pkcs5' || mode === 'pkcs7') && padding.some(byte => byte !== count)) throw new Error(error);
    if (mode === 'ansix923' && padding.some(byte => byte !== 0)) throw new Error(error);
    return bytes.subarray(0, bytes.length - count);
  }

  function encode(bytes, format) {
    if (format === 'hex') return aes.utils.hex.fromBytes(bytes);
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 8192) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
    }
    return btoa(binary);
  }

  function decode(input, format) {
    const trimmed = input.trim();
    const unwrapped = trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2
      ? trimmed.slice(1, -1)
      : trimmed;
    const value = unwrapped.replace(/\s/g, '');
    if (format === 'hex') {
      if (!/^(?:[\da-f]{2})*$/i.test(value)) throw new Error('请输入有效的 Hex 密文。');
      return aes.utils.hex.toBytes(value);
    }
    try {
      return Uint8Array.from(atob(value), char => char.charCodeAt(0));
    } catch {
      throw new Error('请输入有效的 Base64 密文。');
    }
  }

  function transform(input, { operation, password, bits, padding, format }) {
    const ecb = new aes.ModeOfOperation.ecb(keyBytes(password, bits));
    if (operation === 'encrypt') return encode(ecb.encrypt(pad(utf8.encode(input), padding)), format);
    const ciphertext = decode(input, format);
    if (ciphertext.length % 16) throw new Error('密文字节数必须是 16 的倍数。');
    const plaintext = unpad(ecb.decrypt(ciphertext), padding);
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(plaintext);
  }

  if (typeof module === 'object') module.exports = transform;
  else root.transformAES = transform;
})(globalThis);
