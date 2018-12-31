const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const uglify = require('uglifyjs-webpack-plugin');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = require('./webpack.common.config');

export {};

module.exports = merge(common, {
	mode: 'production',
	optimization: {
		runtimeChunk: 'single',
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all'
				}
			}
		}
	},
	output: {
		filename: 'js/[name].[contenthash].js'
	},
	plugins: [
		new CleanWebpackPlugin([path.resolve(__dirname, 'web/public/js/')]),
		new HtmlWebpackPlugin({
			title: 'Mikuia',
			filename: 'app.html',
			template: path.resolve(__dirname, 'src/views/prod.html')
		}),
		new webpack.HashedModuleIdsPlugin(),
		new uglify({
			sourceMap: true
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		})
	]
});