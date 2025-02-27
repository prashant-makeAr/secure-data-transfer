const express = require('express');
const router = express.Router();
const { handleEncryptedData } = require('../controllers/scoreController');



router.get('/', (req, res) => {
    res.render('index');
});

router.post('/send-data', handleEncryptedData);

module.exports = router;
