const path = require('path');

export {};

module.exports = {
	entry: './web/app.tsx',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
			},
			{
				test: /\.ts(x?)$/,
				exclude: /node_modules/,
				loader: 'ts-loader'
			},
			{
				enforce: 'pre',
				test: /\.js$/,
				loader: 'source-map-loader'
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
            }, {
				test: /\.(ttf|eot|svg)$/,
				use: {
					loader: 'file-loader',
					options: {
						name: 'fonts/[hash].[ext]'
					}
				}
			},
			{
				test: /\.(woff|woff2)$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 5000,
						mimetype: 'application/font-woff',
						name: 'fonts/[hash].[ext]'
					}
				}
			}
        ]
    },
    resolve: {
        extensions: [
            '*',
            '.js',
			'.jsx',
			'.ts',
			'.tsx'
        ]
    },
    output: {
        path: path.resolve(__dirname, 'web/public/')
    }
}