const path = require("path");
const webpack = require("webpack");
const WebpackDevServer = require('webpack-dev-server');

const port = 8080;
const config = require("./webpack.dev.conf");
const compiler = webpack(config);
const server = new WebpackDevServer(compiler, {
	contentBase: path.join(__dirname, '../dist')
});

// Start the development server on the specified port and 'localhost'.
server.listen(port, 'localhost', function (err) {
	if (err) throw err;
});