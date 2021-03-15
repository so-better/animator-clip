/**
 * 单一属性动画类
 * @param {Object} options
 */
class Clip {
	constructor(options) {
		this.$options = options;//配置参数
		this.style = null; //样式名称
		this.value = null; //样式最终值
		this.speed = null; //动画速度，即每次样式改变的量
		this.$unit = null; //样式单位，无单位则为null
		this.$requestAnimationFrame = null;//动画api
		this.$status = 0; //0表示动画初始状态，1表示动画进行状态，2表示动画停止状态，3表示动画完成状态
		this.$events = []; //自定义事件数组
		this.$chainClip = null;//连续调用的动画
		this.$type = 0,//0表示普通clip，1表示chain型clip
		this.id = null;//id
		this.$initValue = null; //属性值初始值
		this.$parent = null; //animator实例
		this._init();
	}

	/**
	 * 初始化参数
	 */
	_init() {
		//options
		if (typeof this.$options != 'object' || !this.$options) {
			throw new Error('the options constructor parameter for clip should be an object')
		}
		
		//style
		if(!this.$options.style){
			throw new Error('style is not defined');
		}
		if(typeof this.$options.style != 'string'){
			throw new TypeError('style should be a string value')
		}
		this.style = this.$options.style;
		
		//value
		if(typeof this.$options.value == 'number'){
			this.value = this.$options.value;
		}else if(typeof this.$options.value == 'string' && this.$options.value){
			if(this.$options.value.endsWith('px')){
				this.value = parseFloat(this.$options.value);
				this.$unit = 'px';
			}else {
				throw new Error('currently, only attribute values for px units are supported')
			}
		}else {
			if(!this.$options.value){
				throw new Error('value is not defined');
			}else {
				throw new TypeError('value is should be a number or a string')
			}
		}
		
		//speed
		if (typeof this.$options.speed == 'number') {
			this.speed = this.$options.speed;
		}else {
			throw new TypeError('speed is should be a number')
		}
		
		//动画函数初始化
		this.$requestAnimationFrame = this._getRequestAnimationFrame();
		
		//事件数组初始化
		this.$events = [
			//动画开始事件
			{
				name: 'start',
				handler: function() {}
			},
			//动画结束事件
			{
				name: 'complete',
				handler: function() {}
			},
			//动画更新事件
			{
				name: 'update',
				handler: function() {}
			},
			//动画停止事件
			{
				name: 'stop',
				handler: function() {}
			},
			//动画重置事件
			{
				name: 'reset',
				handler: function() {}
			}
		]
	}

	/**
	 * 执行动画
	 */
	start() {
		if (!this.$parent || !this.$parent.$el) {
			throw new ReferenceError('clip shoud be added to the Animator instance')
		}
		//获取初始属性值
		let oldValue = parseFloat(this._getCssStyle(this.style));
		//如果属性为渐增的且属性值已经超过目标属性值大小，则不进行动画
		if (this.speed > 0 && oldValue >= this.value) {
			return this;
		}
		//如果属性为渐少的且属性值已经达到目标属性值大小，则不进行动画
		if (this.speed < 0 && oldValue <= this.value) {
			return this;
		}
		//如果已经是进行状态或者完成状态，则不进行动画
		if (this.$status == 1 || this.$status == 3) {
			return this;
		}
		//更改帧状态
		this.$status = 1;
		//clip触发start事件
		this._emit('start');
		//animator触发start事件,clip作为参数
		this.$parent.$options.start.call(this.$parent,this,this.$parent.$el);
		//动画帧执行函数
		let doFun = () => {
			//每一帧运行时判断是否处在运行状态
			if (this.$status != 1) {
				return;
			}
			//每一帧运行时判断是否达到目标属性值
			let currentValue = parseFloat(this._getCssStyle(this.style));
			if (this.speed > 0 && currentValue >= this.value) {
				return;
			}
			if (this.speed < 0 && currentValue <= this.value) {
				return;
			}
			//设置样式
			if(this.$unit){
				this.$parent.$el.style[this.style] = (currentValue + this.speed) + this.$unit;
			}else{
				this.$parent.$el.style[this.style] = currentValue + this.speed;
			}
			//获取新的属性值
			let newValue = parseFloat(this._getCssStyle(this.style));
			//clip触发update事件
			this._emit('update', [this.style, newValue])
			//animator触发update事件
			this.$parent.$options.update.call(this.$parent, this, this.$parent.$el, this.style, newValue)
			if (this.speed > 0 && newValue < this.value) {
				this.$requestAnimationFrame.call(window, doFun)
			} else if (this.speed < 0 && newValue > this.value) {
				this.$requestAnimationFrame.call(window, doFun)
			} else {
				//动画运行结束，修改状态
				this.$status = 3;
				//clip触发complete事件
				this._emit('complete');
				//animator触发complete事件
				this.$parent.$options.complete.call(this.$parent,this,this.$parent.$el);
				//调用clip自身的chain型clip
				if(this.$chainClip){
					this.$parent.addClip(this.$chainClip);
					this.$chainClip.start();
				}
			}
		}
		this.$requestAnimationFrame.call(window, doFun);
		//返回clip实例
		return this;
	}

	/**
	 * 停止动画
	 */
	stop() {
		if (!this.$parent || !this.$parent.$el) {
			throw new ReferenceError('clip shoud be added to the Animator instance')
		}
		//非运行状态的动画帧无法停止
		if (this.$status != 1) {
			return this;
		}
		//修改状态
		this.$status = 2;
		//clip触发stop事件
		this._emit('stop')
		//animator触发stop事件
		this.$parent.$options.stop.call(this.$parent,this,this.$parent.$el);
		//返回clip实例
		return this;
	}

	/**
	 * 重置动画
	 */
	reset() {
		if (!this.$parent || !this.$parent.$el) {
			throw new ReferenceError('clip shoud be added to the Animator instance')
		}
		//初始状态的动画帧无需重置
		if (this.$status == 0) {
			return this;
		}
		//修改状态
		this.$status = 0;
		//恢复初始属性值
		this.$parent.$el.style[this.style] = this.$initValue;
		//触发clip的reset事件
		this._emit('reset');
		//animator触发reset事件
		this.$parent.$options.reset.call(this.$parent,this,this.$parent.$el);
		//返回clip实例
		return this;
	}

	/**
	 * 连续执行动画
	 * @param {Object} clip
	 */
	chain(clip){
		if(!clip){
			throw new TypeError('clip is not defined')
		}
		if(!(clip instanceof Clip)){
			throw new TypeError('clip is not a Clip instance')
		}
		if (clip.$parent) {
			throw new ReferenceError('clip has already been added to other Animator instance')
		}
		clip.$type = 1;
		this.$chainClip = clip;
		//返回chain的clip
		return clip;
	}

	/**
	 * 自定义事件执行
	 * @param {Object} eventName
	 * @param {Object} handler
	 */
	on(eventName, handler) {
		let event = this._getEvent(eventName);
		if (event) {
			event.handler = handler;
		} else {
			throw new Error(eventName + ' is an illegal event')
		}
		return this;
	}

	/**
	 * requestAnimationFrame兼容性封装
	 */
	_getRequestAnimationFrame(){
		let animation = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
		//如果不兼容，则手动封装一个
		if(!animation){
			let lastTime = 0;
			animation = function(callback){
				let currTime = Date.now();
				let timeToCall = Math.max(0, 1000/60 - (currTime - lastTime));
				window.setTimeout(callback, timeToCall)
				lastTime = currTime + timeToCall;
			}
		}
		return animation;
	}

	/**
	 * 触发自定义事件
	 * @param {Object} eventName
	 * @param {Object} params
	 */
	_emit(eventName, params) {
		let event = this._getEvent(eventName);
		if (event) {
			if (params) {
				event.handler.call(this, this.$parent.$el, ...params);
			} else {
				event.handler.call(this, this.$parent.$el);
			}
		}
	}

	/**
	 * 获取事件数组中指定事件
	 * @param {Object} eventName
	 */
	_getEvent(eventName) {
		let event = null;
		let length = this.$events.length;
		for (let i = 0; i < length; i++) {
			if (this.$events[i].name == eventName) {
				event = this.$events[i];
				break;
			}
		}
		return event;
	}

	/**
	 * 获取元素指定样式
	 * @param {Object} cssName
	 */
	_getCssStyle(cssName) {
		if (typeof cssName == "string") {
			let cssText = "";
			//兼容IE9-IE11、chrome、firefox、safari、opera；不兼容IE7-IE8
			if (document.defaultView && document.defaultView.getComputedStyle) { 
				cssText = document.defaultView.getComputedStyle(this.$parent.$el)[cssName];
			} else { //兼容IE7-IE11；不兼容chrome、firefox、safari、opera
				cssText = this.$parent.$el.currentStyle[cssName];
			}
			return cssText;
		} else {
			return null;
		}
	}
}

module.exports = Clip