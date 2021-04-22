const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const EncodingPlugin = require('webpack-encoding-plugin');

module.exports = {
	// The files for webpack to compile
    entry: ['babel-polyfill', './resources/scss/stylesheet.scss', './src/index.js'],
	// Where these files need to go -> the 'dist' folder
    output: {
		path: path.resolve(__dirname, "../dist"),
		filename: "js/index.js"
	},
	// The different ways to handle files to compie
	module: {
		rules: [
			// How to compile .js (code) files
			{
				test: /\.js$/,
				exclude: /\/node_modules\//,
				loader: "babel-loader"
			},
			// How to compile .scss (styling) files
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
			// How to compile .ttf (font) files
			{
				test: /\.ttf$/,
				loader: 'url-loader',
				options: {
					limit: 100000
				}
			},
			// How to compile image/audio files
			{
				test: /\.(jpe?g|gif|png|wav|mp3)$/, 
				loader: "file-loader"
			}
		]
	},
	// The different plugins we're using
	plugins: [
		// The html plugin compiles our html file and inserts the reference to our main js script.
		new HtmlWebpackPlugin({
			template: "./src/index.html",
			inject: 'body'
		}),
		// The encoding plugin makes sure the correct encoding is used throughout all compilations.
		new EncodingPlugin({
			encoding: 'utf-16'
		})
	],
	resolve: {
		// Using the resolve aliasses you can import from '@/' instead of importing relative to the 
		// current file.
		alias: {
			"@": path.resolve(__dirname, "../src"),
			"$": path.resolve(__dirname, "../")
		}
	},
	// This is a website, thus we compile it as a website
	target: "web"
}