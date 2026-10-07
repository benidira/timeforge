import crypto from 'crypto';

export class Castov {
    constructor(config = {}) {
        this.config = config;
    }

    /**
     * Generate a random UUID v4
     * @returns {string} UUID v4
     */
    uuid() {
        return crypto.randomUUID();
    }

    /**
     * Encode text to Base64
     * @param {string} text 
     * @returns {string} Base64 encoded string
     */
    encodeBase64(text) {
        return Buffer.from(text).toString('base64');
    }

    /**
     * Decode Base64 to text
     * @param {string} base64 
     * @returns {string} Decoded text
     */
    decodeBase64(base64) {
        return Buffer.from(base64, 'base64').toString('utf8');
    }

    /**
     * Get current Unix timestamp (seconds)
     * @returns {number} Unix timestamp
     */
    currentUnix() {
        return Math.floor(Date.now() / 1000);
    }

    /**
     * Convert Unix timestamp to ISO 8601 String
     * @param {number} timestamp 
     * @returns {string} ISO Date
     */
    unixToIso(timestamp) {
        return new Date(timestamp * 1000).toISOString();
    }

    /**
     * Create a secure Hash (MD5, SHA256)
     * @param {string} text 
     * @param {string} algorithm (default 'sha256')
     * @returns {string} Hash hex
     */
    hash(text, algorithm = 'sha256') {
        return crypto.createHash(algorithm).update(text).digest('hex');
    }
}

// Export default instance
export const castov = new Castov();
