var webpack = require('webpack');

var bootstrapPath = __dirname + '/node_modules/bootstrap';
var fontAwesomePath = __dirname + '/node_modules/font-awesome/css';

module.exports = {

	entry: [
        "webpack-hot-middleware/client",
        "react-hot-loader/patch",
		"./src/app"
	],
	devServer: {
		contentBase: './src',
		hot: true
	},
	output: {
		path: __dirname + "/public/build/",
		filename: "app.js",
		publicPath: "http://beta.mikuia.tv/build"
	},

	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin()
	],

	module: {
		loaders: [
			{ test: /\.jsx?$/, exclude: /node_modules/, loaders: "babel-loader" },
			{ test: /\.css$/, loader: "style-loader!css-loader" },
			{ test: /\.less$/, loader: 'style-loader!css-loader!less-loader' },
			{ test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
			{ test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
			{ test: /\.(jpe|jpg|woff|woff2|eot|ttf|svg)(\?.*$|$)/, loaders: ["file-loader"] },
		]
	},

	resolve: {
		extensions: ['.js', '.jsx', '.css']
	}

}