const { privateKeyPath } = require('../utils/cryptoUtils');
const fs = require('fs').promises;
const crypto = require('crypto');
const Score = require('../models/score');
const dotenv = require('dotenv');
dotenv.config();

const handleEncryptedData = async (req, res) => {
    const { encryptedData, encryptedSecretKey, iv } = req.body;

    try {
        const privateKeyPem = await fs.readFile(privateKeyPath, 'utf8');

        const secretKey = crypto.privateDecrypt(
            {
                key: privateKeyPem,
                passphrase: process.env.SECURE_PASSPHRASE,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            Buffer.from(encryptedSecretKey, 'base64')
        );

        console.log('Decrypted Secret Key:', secretKey.toString('hex'));

        console.log('Decrypting the encrypted data...');

        const ivBuffer = Buffer.from(iv, 'base64');

        const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');

        const decipher = crypto.createDecipheriv('aes-128-cbc', secretKey, ivBuffer);
        let decrypted = decipher.update(encryptedDataBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        console.log('Decrypted Data:', decrypted.toString('utf8'));

        const scoreData = new Score({ score: decrypted.toString('utf8') });

        try {
            const saveResult = await scoreData.submitScore();
            res.status(201).json({ message: saveResult });
        } catch (dbError) {
            console.error("Error saving score to the database:", dbError);
            res.status(500).json({ message: dbError.message });
        }

    } catch (error) {
        console.error("Error during decryption or processing:", error);
        res.status(500).json({ message: error.message, error: error });
    }
};

module.exports = { handleEncryptedData };
