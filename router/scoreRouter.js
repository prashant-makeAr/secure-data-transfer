const express = require('express');
const router = express.Router();
const { scoreController } = require('../controllers/scoreController');
const { cryptoMiddleware } = require('../middlewares/cryptoMiddleware');



router.get('/', (req, res) => {
    res.render('index');
});

router.post('/data', cryptoMiddleware, scoreController);


module.exports = router;
