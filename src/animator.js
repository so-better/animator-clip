const Clip = require('./clip')
class Animator {
	constructor(el,options) {
		this.$el = el;
		this.$options = options;
		this.clips = [];
		this.$triggerStart = false;
		this._init();
	}

	/**
	 * 初始化参数
	 */
	_init() {
		//动画元素绑定
		if (typeof this.$el == 'string' && this.$el) {
			this.$el = document.body.querySelector(this.$el)
		}
		if (!this.$el) {
			throw new ReferenceError('el is not defined')
		}
		if (!(this.$el instanceof Node) || this.$el.nodeType !== 1) {
			throw new TypeError('el is not a node element')
		}
	
		//参数初始化
		if(typeof this.$options != 'object' || !this.$options){
			this.$options = {}
		}
		if(typeof this.$options.start != 'function'){
			this.$options.start = function(){}
		}
		if(typeof this.$options.complete != 'function'){
			this.$options.complete = function(){}
		}
		if(typeof this.$options.update != 'function'){
			this.$options.update = function(){}
		}
		if(typeof this.$options.stop != 'function'){
			this.$options.stop = function(){}
		}
		if(typeof this.$options.reset != 'function'){
			this.$options.reset = function(){}
		}
	}
	
	/**
	 * 将clip添加到队列
	 */
	addClip(clip){
		if(!(clip instanceof Clip)){
			throw new TypeError('param is not a Clip instance')
		}
		if(clip.$parent){
			return;
		}
		this.clips.push(clip);
		//设置父对象
		clip.$parent = this;
		//记录初始值
		clip.$initValue = clip._getCssStyle(clip.style);
		return this;
	}

	/**
	 * 将clip移出队列
	 */
	removeClip(clip){
		if(!(clip instanceof Clip)){
			throw new TypeError('param is not a Clip instance')
		}
		if(!clip.$parent){
			return;
		}
		let index = -1;
		let length = this.clips.length;
		for(let i = 0;i<length;i++){
			if(clip === this.clips[i]){
				clip.$status = 0;//重置初始状态
				clip.$parent.$el.style.setProperty(clip.style, clip.$initValue, 'important');//恢复初始属性值
				clip.$initValue = null;//重置初始属性值
				clip.$parent = null;//重置父对象
				index = i;
				break;
			}
		}
		if(index > -1){
			this.clips.splice(index,1);
		}
	}

	/**
	 * 获取正在运行的clip
	 */
	getClips(){
		let clips = [];
		this.clips.forEach(clip=>{
			if(clip.$status == 1){
				clips.push(clip)
			}
		})
		return clips;
	}
	
	/**
	 * 获取停止状态的clip
	 */
	getStopClips(){
		let clips = [];
		this.clips.forEach(clip=>{
			if(clip.$status == 2){
				clips.push(clip)
			}
		})
		return clips;
	}
	
	/**
	 * 获取已完成的clip
	 */
	getCompleteClips(){
		let clips = [];
		this.clips.forEach(clip=>{
			if(clip.$status == 3){
				clips.push(clip)
			}
		})
		return clips;
	}

	/**
	 * 执行动画
	 */
	start() {
		this.clips.forEach(clip=>{
			clip.start();
		})
	}

	/**
	 * 停止动画
	 */
	stop() {
		this.clips.forEach(clip=>{
			clip.stop();
		})
	}

	/**
	 * 重置动画
	 */
	reset(){
		this.clips.forEach(clip=>{
			clip.reset();
		})
	}

}

module.exports = Animator
