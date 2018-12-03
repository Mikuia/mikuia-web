const merge = require('webpack-merge');
const webpack = require('webpack');
const uglify = require('uglifyjs-webpack-plugin');

const common = require('./webpack.common.config');

export {};

module.exports = merge(common, {
	mode: 'production',
	plugins: [
		new uglify({
			sourceMap: true
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		})
	]
});