const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const common = require('./webpack.common.config');

export {};

module.exports = merge(common, {
	mode: 'production',
	optimization: {
		minimizer: [
			new TerserWebpackPlugin({
				sourceMap: true,
				terserOptions: {
					compress: {
						collapse_vars: false
					}
				}	
			})
		],
		runtimeChunk: 'single',
		splitChunks: {
			cacheGroups: {
				vendor: {
					chunks: 'initial',
					maxInitialRequests: Infinity,
					// minSize: 0,
					test: /[\\/]node_modules[\\/]/,
					name(module) {
						const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

						return `vendors~npm.${packageName.replace('@', '')}`;
					}
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
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		})
	]
});