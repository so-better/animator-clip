const Clip = require('./clip')
class Animator {
	constructor(el,options) {
		this.$el = el;
		this.$options = options;
		this.clips = [];
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
		if(!clip){
			throw new TypeError('clip is not defined')
		}
		if(!(clip instanceof Clip)){
			throw new TypeError('clip is not a Clip instance')
		}
		//clip存在于其他animator中
		if(this.clips.lastIndexOf(clip) < 0 && clip.$parent){
			throw new Error('the clip has already been added to other Animator instances')
		}
		//clip已经在animator中了
		if(this.clips.lastIndexOf(clip) > -1){
			return this;
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
		if(!clip){
			throw new TypeError('clip is not defined')
		}
		if(!(clip instanceof Clip)){
			throw new TypeError('clip is not a Clip instance')
		}
		//clip不存在于此animator中
		if(this.clips.lastIndexOf(clip) < 0){
			//存在于其他animator中
			if(clip.$parent){
				throw new Error('the clip does not belong to this Animator instance')
			}
			//没有添加到任何一个animator中
			throw new Error('the clip has not been added to the Animator instance')
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
		return this;
	}

	/**
	 * 移除全部clip
	 */
	removeAllClips(){
		let length = this.clips.length;
		for(let i = 0;i<length;i++){
			let clip = this.clips[i];
			clip.$status = 0;//重置初始状态
			clip.$parent.$el.style.setProperty(clip.style, clip.$initValue, 'important');//恢复初始属性值
			clip.$initValue = null;//重置初始属性值
			clip.$parent = null;//重置父对象
		}
		this.clips = [];
		return this;
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
		return this;
	}

	/**
	 * 停止动画
	 */
	stop() {
		this.clips.forEach(clip=>{
			clip.stop();
		})
		return this;
	}

	/**
	 * 重置动画
	 */
	reset(){
		var chainClips = [];
		this.clips.forEach(clip=>{
			clip.reset();
			//如果是chain型clip则记录到数组内
			if(clip.$type == 1){
				chainClips.push(clip)
			}
		})
		//遍历记录的数组，将chain型clip移除
		chainClips.forEach(clip=>{
			this.removeClip(clip)
		})
		return this;
	}

}

module.exports = Animator
