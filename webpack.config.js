const path = require('path');

module.exports = [
    {
        entry: './frontend-js/app.js',
        output: {
            filename: 'main-bundled.js',
            path: path.resolve(__dirname, 'public/script'),
        },
        mode: 'production',
        devtool: false,
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                        },
                    },
                },
            ],
        },
    },
];
