const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const EncodingPlugin = require('webpack-encoding-plugin');

module.exports = {
    entry: ['babel-polyfill', './resources/scss/stylesheet.scss', './src/index.js'],
    output: {
		path: path.resolve(__dirname, "../dist"),
		filename: "js/index.js"
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /\/node_modules\//,
				loader: "babel-loader"
			},
			{
				test: /\.scss$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'css/[name].css',
						}
					},
					"extract-loader",
					"css-loader",
					"sass-loader"
				]
			},
			{
				test: /\.ttf$/,
				loader: 'url-loader',
				options: {
					limit: 100000
				}
			},
			{
				test: /\.(jpe?g|gif|png|wav|mp3)$/, 
				loader: "file-loader"
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.html",
			inject: 'body'
		}),
		new EncodingPlugin({
			encoding: 'utf-16'
		})
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "../src"),
			"$": path.resolve(__dirname, "../")
		}
	},
	target: "web"
}