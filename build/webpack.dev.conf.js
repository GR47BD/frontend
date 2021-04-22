const merge = require("webpack-merge");
const webpackBaseConfig = require("./webpack.base.conf");

module.exports = merge.merge(webpackBaseConfig, {
	mode: "development"
});