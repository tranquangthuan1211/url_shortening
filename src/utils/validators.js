const config = require('../config');

function isValidUrl(string) {
  try {
    const url = new URL(string);
    
    // Check protocol
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    
    // Check length
    if (string.length > config.app.maxUrlLength) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

function sanitizeUrl(url) {
  return url.trim();
}

function isValidShortKey(key) {
  return /^[a-zA-Z0-9_-]+$/.test(key) && key.length >= 3 && key.length <= 20;
}

module.exports = {
  isValidUrl,
  sanitizeUrl, 
  isValidShortKey
};
