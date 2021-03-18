const Animator = require('./animator')

const Clip = require('./clip')

const version = require('../package.json').version;
const github = require('../package.json').github;
console.log('%c感谢使用animator-clip，当前版本：%c v'+version+'\n%c如果觉得animator-clip还不错的话，欢迎前往github给个star，感谢！\ngithub地址：%c'+github,'color:#808080;','color:#008a00','color:#808080;','color:#008a00');

module.exports = {
	Animator,Clip
}