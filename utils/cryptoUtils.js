const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();


const privateKeyPath = path.join(__dirname, '../private_key.pem');
const publicKeyPath = path.join(__dirname, '../public/public_key.pem');

const generateKeyPair = () => {
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase: `${process.env.SECURE_PASSPHRASE}`,
            },
        }, (err, publicKey, privateKey) => {
            if (err) {
                reject(err);
                return;
            }
            fs.writeFileSync(publicKeyPath, publicKey);
            fs.writeFileSync(privateKeyPath, privateKey);
            resolve();
        });
    });
};


const ensureKeys = async () => {
    if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
        try {
            await generateKeyPair();
        } catch (error) {
            console.error('Error generating RSA keys:', error);
            process.exit(1);
        }
    }
};


module.exports = { ensureKeys, privateKeyPath };
