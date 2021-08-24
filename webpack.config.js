const path = require('path')

let params = {
	entry: './src/index.js', //入口文件
	output: { //输出
		path: path.resolve(__dirname, 'dist'),
		filename: "animator-clip.js",
		library: 'AnimatorClip',
		libraryTarget: "umd"
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: "babel-loader"
		}]
	}
}

if (process.env.NODE_ENV == 'development') {
	params.devtool = 'eval-source-map'
}

module.exports = params
