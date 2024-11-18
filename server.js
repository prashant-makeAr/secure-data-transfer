const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { connectDb } = require('./db.js');
const scoreRoutes = require('./router/scoreRouter');
const { ensureKeys } = require('./utils/cryptoUtils');

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

app.set('views', 'views');
app.set('view engine', 'ejs');

app.use('/', scoreRoutes);


const initApp = async () => {
    await ensureKeys();
    await connectDb();

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

initApp().catch(error => {
    console.error('Error initializing the application:', error);
});
