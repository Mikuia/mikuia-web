const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const common = require('./webpack.common.config');

export {};

module.exports = merge(common, {
	mode: 'development',
	devServer: {
		contentBase: path.join(__dirname, 'web/public/'),
		disableHostCheck: true,
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		host: '0.0.0.0',
		hotOnly: true,
		port: 16835,
		publicPath: 'http://localhost:16835/dist/'
	},
	output: {
		publicPath: 'http://localhost:16835/dist/',
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	]
});