const { privateKeyPath } = require('../utils/cryptoUtils');
const fs = require('fs').promises;
const crypto = require('crypto');
const Score = require('../models/score');
const dotenv = require('dotenv');
dotenv.config();

const handleEncryptedData = async (req, res) => {
    const { score } = req.body;

    try {
        const privateKeyPem = await fs.readFile(privateKeyPath, 'utf8');

        const encryptedBuffer = Buffer.from(score, 'hex');
        const decryptedData = crypto.privateDecrypt(
            {
                key: privateKeyPem,
                passphrase: process.env.SECURE_PASSPHRASE,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            encryptedBuffer
        );
        const decryptedMessage = decryptedData.toString('utf8');

        const scoreData = new Score({ score: decryptedMessage });

        try {
            const saveResult = await scoreData.submitScore();
            res.status(200).json({ message: saveResult });
        } catch (dbError) {
            console.error("Error saving score to the database:", dbError);
            res.status(500).json({ message: dbError.message });
        }

    } catch (error) {
        console.error("Error during decryption or reading file:", error);
        res.status(500).json({ message: error.message, error: error });
    }
};

module.exports = { handleEncryptedData };
