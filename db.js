const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const connectionString = process.env.CONNECTION_STRING;
let db;

const connectDb = async () => {
    const client = await MongoClient.connect(connectionString);
    db = client.db("Gamescores");
    console.log('Connected to MongoDB');
};

const getDb = () => {
    if (!db) {
        throw new Error('Database not connected');
    }
    return db;
};

module.exports = { connectDb, getDb };
