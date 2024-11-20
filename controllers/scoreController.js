const { privateKeyPath } = require('../utils/cryptoUtils');
const fs = require('fs').promises;
const crypto = require('crypto');
const Score = require('../models/score');
const dotenv = require('dotenv');
dotenv.config();

const handleEncryptedData = async (req, res) => {
    const { encryptedData, encryptedSecretKey } = req.body;

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

        const decipher = crypto.createDecipheriv('aes-128-cbc', secretKey, Buffer.alloc(16));
        let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        console.log('Decrypted Data:', decrypted);

        const scoreData = new Score({ score: decrypted });

        try {
            const saveResult = await scoreData.submitScore();
            res.status(200).json({ message: saveResult });
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
