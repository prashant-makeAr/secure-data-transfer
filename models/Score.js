const { getDb } = require('../db');

let Score = function (data) {
    this.data = data;
    this.errors = [];
};

Score.prototype.validate = async function () {
    if (!this.data.score) {
        this.errors.push("You must submit a valid score");
    } else {
        const score = parseInt(this.data.score, 10);
        if (isNaN(score) || score < 0 || score > 100) {
            this.errors.push("Score must be a number between 0 and 100");
        }
    }
};

Score.prototype.cleanUp = function () {
    this.data.score = typeof this.data.score === "string" ? parseInt(this.data.score, 10) : this.data.score;

    if (isNaN(this.data.score)) {
        this.data.score = null;
    }

    this.data = {
        score: this.data.score
    };
};

Score.prototype.submitScore = async function () {
    try {
        this.cleanUp();
        await this.validate();

        if (!this.errors.length) {
            const db = getDb();
            await db.collection("scores").insertOne(this.data);
            return "Successfully added the score !!!";
        } else {
            throw new Error(this.errors);
        }
    } catch (error) {
        throw error;
    }
};

module.exports = Score;
