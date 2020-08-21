/*!
 * @author dawangraoming<admin@yeenuo.net>
 * @website http://www.yeenuo.net
 * @date 2019-03-12
 */

const { basename } = require('path');
const gulp = require('gulp');
const webpack = require('webpack');
const Stream = require('stream');
const { version } = require('./package.json');
const webpackConfig = require('./webpack.config');
const clean = require('gulp-clean');

/**
 * 环境变量
 * @type {string}
 */
const env = process.env.NODE_ENV;
/**
 * 判断是否开发环境
 * @type {boolean}
 */
const IS_DEVELOPMENT = env === 'development';

/**
 * 清理输出目录
 */
function cleanDist() {
	return gulp.src('./dist', { read: false }).pipe(clean());
}

/**
 * 转换stream内容
 * @param transform {function}
 * @returns {Stream.Transform}
 */
function transformFromStream(transform) {
	const stream = new Stream.Transform({ objectMode: true });
	stream._transform = function(file, encoding, callback) {
		const contents = file.contents.toString();
		// 获取文件名
		const fileName = basename(file.history[file.history.length - 1]);
		file.contents = new Buffer(
			transform({
				contents,
				fileName
			})
		);
		callback(null, file);
	};
	return stream;
}

/**
 * 更新popup.html和manifest.json的版本号
 * @returns {*|worker}
 */
function generateVersion() {
	return gulp
		.src(['./src/popup/popup.html', './manifest.json'])
		.pipe(
			transformFromStream(({ contents }) => {
				// 自动填充版本号
				return contents.replace(/\$VERSION\$/, version);
			})
		)
		.pipe(gulp.dest('./dist'));
}

/**
 * 监听模块
 */
function webpackWatch() {
	webpack(webpackConfig).watch(200, function(err, stats) {});
}

/**
 * 编译模块
 * @param done
 */
function webpackBuild(done) {
	webpack(webpackConfig, function() {
		done();
	});
}

const watch = gulp.parallel(generateVersion, webpackWatch);
const build = gulp.parallel(generateVersion, webpackBuild);

exports.clean = cleanDist;
exports.watch = watch;
exports.build = build;
exports.default = build;
