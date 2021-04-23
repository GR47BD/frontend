const webpack = require("webpack");

const startTime = process.hrtime();
const config = require("./webpack.prod.conf");

// Run webpack using the given config from './webpack.prod.conf'
webpack(config, (err, stats) => {
	if (err) throw err;
	if (stats.compilation.errors.length > 0) console.error(stats.compilation.errors)

	const endTime = process.hrtime(startTime);

	console.log("Built in %ds and %dms", endTime[0], endTime[1] / 1000000);
});