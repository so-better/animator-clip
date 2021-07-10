const Animator = require('./animator')

const Clip = require('./clip')

const packages = require('../package.json');

console.log('%c感谢使用' + packages.name + '，当前版本：%c v' + packages.version + '\n%c如果你觉得' + packages.name +
	'还不错，不妨去github点个star\ngithub地址：%c' + packages.github, 'color:#808080;', 'color:#008a00',
	'color:#808080;', 'color:#008a00');

module.exports = {
	Animator,
	Clip
}
