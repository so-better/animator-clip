const Animator = require('./animator')

const Clip = require('./clip')

const packages = require('../package.json');

console.log('%c感谢使用'+packages.name+'，当前版本：%c v'+packages.version+'\n%c'+packages.name+'完全由个人开发，如果你觉得还不错的话，欢迎前往github给个star，感谢！\ngithub地址：%c'+packages.github,'color:#808080;','color:#008a00','color:#808080;','color:#008a00');

module.exports = {
	Animator,Clip
}