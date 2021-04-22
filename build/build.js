const webpack = require("webpack");

const startTime = process.hrtime();
const config = require("./webpack.prod.conf");

webpack(config, err => {
	if(err) throw err;

	const endTime = process.hrtime(startTime);

	console.log("Built in %ds and %dms", endTime[0], endTime[1] / 1000000);
});