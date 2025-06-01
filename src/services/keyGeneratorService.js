const crypto = require('crypto');
const UrlModel = require('../models/urlModel');
const config = require('../config');

class KeyGeneratorService {
  constructor() {
    this.base62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    this.keyLength = config.app.keyLength;
  }

  generateRandomKey() {
    let result = '';
    for (let i = 0; i < this.keyLength; i++) {
      result += this.base62.charAt(Math.floor(Math.random() * this.base62.length));
    }
    return result;
  }

  async generateUniqueKey() {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const key = this.generateRandomKey();
      const exists = await UrlModel.checkKeyExists(key);
      
      if (!exists) {
        return key;
      }
      
      attempts++;
    }

    // Fallback to timestamp-based key
    return crypto.randomBytes(4).toString('hex') + Date.now().toString(36);
  }

  validateCustomKey(key) {
    if (!key || typeof key !== 'string') {
      return { valid: false, message: 'Key must be a string' };
    }
    
    if (key.length < 3 || key.length > 20) {
      return { valid: false, message: 'Key must be between 3-20 characters' };
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      return { valid: false, message: 'Key can only contain letters, numbers, hyphens, and underscores' };
    }
    
    return { valid: true };
  }
}

module.exports = new KeyGeneratorService();