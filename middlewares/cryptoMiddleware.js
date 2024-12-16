const fs = require('fs').promises;
const crypto = require('crypto');
const { privateKeyPath } = require('../utils/cryptoUtils');
const dotenv = require('dotenv');
dotenv.config();

const cryptoMiddleware = async (req, res, next) => {
    try {
        const { encryptedData, encryptedSecretKey, iv } = req.body;

        const privateKeyPem = await fs.readFile(privateKeyPath, 'utf8');
        const secretKey = crypto.privateDecrypt(
            {
                key: privateKeyPem,
                passphrase: process.env.SECURE_PASSPHRASE,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            Buffer.from(encryptedSecretKey, 'base64')
        );

        const ivBuffer = Buffer.from(iv, 'base64');
        const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');

        const decipher = crypto.createDecipheriv('aes-128-cbc', secretKey, ivBuffer);
        let decrypted = decipher.update(encryptedDataBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        req.body = JSON.parse(decrypted.toString('utf8'));


        next();
    } catch (error) {
        console.error('Decryption error:', error);
        res.status(500).json({ message: 'Failed to decrypt data', error: error.message });
    }
};

module.exports = { cryptoMiddleware };
