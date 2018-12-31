const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

export {};

module.exports = {
    entry: './web/app.jsx',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    resolve: {
        extensions: [
            '*',
            '.js',
            '.jsx'
        ]
    },
    output: {
        path: path.resolve(__dirname, 'web/public/')
    }
}