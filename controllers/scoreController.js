const Score = require('../models/Score');

const scoreController = async (req, res) => {
    const { data } = req.body;

    try {
        const scoreData = new Score({ score: data });
        const saveResult = await scoreData.submitScore();
        res.status(201).json({ message: saveResult });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { scoreController };
