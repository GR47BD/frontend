const merge = require("webpack-merge");
const webpackBaseConfig = require("./webpack.base.conf");

// Merge the following config with the config at 'webpack.base.conf'
module.exports = merge.merge(webpackBaseConfig, {
	// Set webpack to regard this program as in production
	mode: "production"
});