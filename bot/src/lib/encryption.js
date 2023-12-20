const crypto = require('crypto');

class Encryption {
	constructor(algorithm, secret) {
		this.algorithm = algorithm;
		this.secret = secret;
	}

	deriveKey(secret) {
		// Use PBKDF2 to derive a key of the appropriate length
		return crypto.pbkdf2Sync(secret, 'salt', 100000, 32, 'sha256');
	  }

	encrypt(text) {
		const iv = crypto.randomBytes(16); // 16 bytes for AES-256-CBC
		const key = this.deriveKey(this.secret);
		const cipher = crypto.createCipheriv(this.algorithm, key, iv);
		let encrypted = cipher.update(text, 'utf-8', 'hex');
		encrypted += cipher.final('hex');
		return iv.toString('hex') + encrypted;
	}

	decrypt(text) {
		const iv = Buffer.from(text.slice(0, 32), 'hex');
		const encrypted = text.slice(32);
		const key = this.deriveKey(this.secret);
		const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
		let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
		decrypted += decipher.final('utf-8');
		return decrypted;
	}
}

module.exports = Encryption;