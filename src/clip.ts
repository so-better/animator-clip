/**
 * 单一属性动画类
 */
import { Animator } from './animator'
export type ClipOptionsType = {
	style?: string
	value?: number | string
	speed?: number
	free?: boolean
}

export type EventType = {
	name: string
	handler: (...args: any) => void
}

export class Clip {
	//唯一标志
	id?: number
	//样式名称
	style?: string
	//样式最终值
	value?: number
	//动画速度，即每次样式改变的量
	speed?: number
	//是否自由模式
	free: boolean = false
	//动画每次更新间隔时间
	interval: number = 0
	//配置参数
	$options?: ClipOptionsType
	//样式单位，无单位则为undefined
	$unit?: string | null
	//动画api
	$requestAnimationFrame: any
	//0表示动画初始状态，1表示动画进行状态，2表示动画停止状态，3表示动画完成状态
	state: number = 0
	//自定义事件数组
	$events: EventType[] = [
		//动画开始事件
		{
			name: 'start',
			handler: function () {}
		},
		//动画结束事件
		{
			name: 'complete',
			handler: function () {}
		},
		//动画更新之前
		{
			name: 'beforeUpdate',
			handler: function () {}
		},
		//动画更新事件
		{
			name: 'update',
			handler: function () {}
		},
		//动画停止事件
		{
			name: 'stop',
			handler: function () {}
		},
		//动画重置事件
		{
			name: 'reset',
			handler: function () {}
		}
	]
	//连续调用的动画
	$chainClip?: Clip
	//0表示普通clip，1表示chain型clip
	$type: number = 0
	//属性值初始值
	$initValue?: string | number
	//animator实例
	$parent?: Animator
	//每次动画帧执行时的时间戳记录
	$timeStamp: number = 0

	constructor(options: ClipOptionsType) {
		//options参数不存在的情况下默认为自由模式
		if (!options) {
			this.free = true
		}
		//options参数为对象
		else if (typeof options == 'object' && options) {
			//free模式
			if (typeof options.free == 'boolean') {
				this.free = options.free
			} else {
				this.free = false
			}
			//非free模式对其他参数进行验证
			if (!this.free) {
				//style
				if (typeof options.style == 'string' && options.style) {
					this.style = options.style
				} else {
					throw new TypeError('The style argument should be a string')
				}

				//value
				if (typeof options.value == 'number') {
					//如果是数值，则无单位
					this.value = options.value
					this.$unit = null
				} else if (typeof options.value == 'string' && options.value) {
					this.value = parseFloat(options.value) //记录值
					if (options.value.endsWith('px')) {
						//如果是px单位的值
						this.$unit = 'px' //记录单位
					} else if (options.value.endsWith('rem')) {
						//如果是rem单位的值
						this.$unit = 'rem' //记录单位
					} else if (options.value.endsWith('em')) {
						//如果是em单位的值
						this.$unit = 'em' //记录单位
					} else {
						throw new Error('Currently, only attribute values of px, rem, and em units are supported')
					}
				} else {
					throw new TypeError('The value argument should be a number or string')
				}

				//speed
				if (typeof options.speed == 'number') {
					this.speed = options.speed
				} else {
					throw new TypeError('The speed argument should be a number')
				}
			}
		}
		//options存在必须为对象，否则报错
		else {
			throw new Error('The construction parameter of the clip must be a non-null object')
		}

		//动画函数初始化
		this.$requestAnimationFrame = this.__getRequestAnimationFrame()
	}

	/**
	 * 执行动画
	 */
	start() {
		if (!this.$parent || !this.$parent.$el) {
			throw new ReferenceError('The clip has not been added to the animator')
		}
		//非free模式下进行属性值判断
		if (!this.free) {
			//获取初始属性值
			let oldValue = this.__getUnitCssValue()
			//如果属性为渐增的且属性值已经超过目标属性值大小，则不进行动画
			if (this.speed! > 0 && oldValue >= this.value!) {
				return this
			}
			//如果属性为渐少的且属性值已经达到目标属性值大小，则不进行动画
			if (this.speed! < 0 && oldValue <= this.value!) {
				return this
			}
		}
		//如果已经是进行状态或者完成状态，则不进行动画
		if (this.state == 1 || this.state == 3) {
			return this
		}
		//设置初始的时间戳
		this.$timeStamp = Date.now()
		//恢复初始间隔时间
		this.interval = 0
		//更改帧状态
		this.state = 1
		//animator触发start事件,clip作为参数
		this.$parent.$options!.start!.apply(this.$parent, [this, this.$parent.$el])
		//clip触发start事件
		this.__emit('start')
		//动画帧执行函数
		let doFun = () => {
			//每一帧运行时判断是否处在运行状态
			if (this.state != 1) {
				return
			}
			//获取当前的时间戳
			let now = Date.now()
			//记录动画间隔时间毫秒数
			this.interval = now - this.$timeStamp
			//更新记录的时间戳
			this.$timeStamp = now
			//free模式下
			if (this.free) {
				//animator触发beforeUpdate事件
				this.$parent!.$options!.beforeUpdate!.apply(this.$parent, [this, this.$parent!.$el])
				//clip触发beforeUpdate事件
				this.__emit('beforeUpdate')
				//animator触发update事件
				this.$parent!.$options!.update!.apply(this.$parent, [this, this.$parent!.$el])
				//clip触发update事件
				this.__emit('update')
				//递归调用动画
				this.$requestAnimationFrame.apply(window, [doFun])
			}
			//非free模式下
			else {
				//获取当前属性值
				let currentValue = this.__getUnitCssValue()
				//animator触发beforeUpdate事件
				this.$parent!.$options!.beforeUpdate!.apply(this.$parent, [this, this.$parent!.$el, this.style!, currentValue])
				//clip触发beforeUpdate事件
				this.__emit('beforeUpdate', [this.style, currentValue])
				//获取新的属性值
				let newValue = currentValue + this.speed!
				//给元素设置新属性值样式
				if (this.$unit) {
					this.$parent!.$el.style.setProperty(this.style!, newValue + this.$unit, 'important')
				} else {
					this.$parent!.$el.style.setProperty(this.style!, newValue + '', 'important')
				}
				//animator触发update事件
				this.$parent!.$options!.update!.apply(this.$parent, [this, this.$parent!.$el, this.style, newValue])
				//clip触发update事件
				this.__emit('update', [this.style, newValue])

				//达到目标值完成动画
				if ((this.speed! > 0 && newValue >= this.value!) || (this.speed! < 0 && newValue <= this.value!)) {
					//设置样式值为目标值
					if (this.$unit) {
						this.$parent!.$el.style.setProperty(this.style!, this.value + this.$unit, 'important')
					} else {
						this.$parent!.$el.style.setProperty(this.style!, this.value + '', 'important')
					}
					//恢复初始的时间戳
					this.$timeStamp = 0
					//恢复初始间隔时间
					this.interval = 0
					//动画运行结束，修改状态
					this.state = 3
					//animator触发complete事件
					this.$parent!.$options!.complete!.apply(this.$parent, [this, this.$parent!.$el])
					//clip触发complete事件
					this.__emit('complete')
					//调用clip自身的chain型clip
					if (this.$chainClip) {
						//chain型clip如果已经加入到animator中
						if (this.$parent!.hasClip(this.$chainClip)) {
							this.$parent!.removeClip(this.$chainClip).addClip(this.$chainClip)
						} else {
							this.$parent!.addClip(this.$chainClip)
						}
						this.$chainClip.start()
					}
				} else {
					//没有达到目标值则继续进行动画
					this.$requestAnimationFrame.apply(window, [doFun])
				}
			}
		}
		this.$requestAnimationFrame.apply(window, [doFun])
		//返回clip实例
		return this
	}

	/**
	 * 停止动画
	 */
	stop() {
		if (!this.$parent || !this.$parent.$el) {
			throw new ReferenceError('The clip has not been added to the animator')
		}
		//非运行状态的动画帧无法停止
		if (this.state != 1) {
			return this
		}
		//恢复初始的时间戳
		this.$timeStamp = 0
		//恢复初始间隔时间
		this.interval = 0
		//修改状态
		this.state = 2
		//animator触发stop事件
		this.$parent.$options!.stop!.apply(this.$parent, [this, this.$parent.$el])
		//clip触发stop事件
		this.__emit('stop')
		//返回clip实例
		return this
	}

	/**
	 * 重置动画
	 */
	reset(reStoreStyle = true) {
		if (!this.$parent || !this.$parent.$el) {
			throw new ReferenceError('The clip has not been added to the animator')
		}
		//初始状态的动画帧无需重置
		if (this.state == 0) {
			return this
		}
		//恢复初始的时间戳
		this.$timeStamp = 0
		//恢复初始间隔时间
		this.interval = 0
		//修改状态
		this.state = 0
		//非free模式下如果reStoreStyle是true则恢复元素的初始属性值
		if (!this.free && reStoreStyle) {
			this.$parent.$el.style.setProperty(this.style!, this.$initValue + '', 'important')
		}
		//animator触发reset事件
		this.$parent.$options!.reset!.apply(this.$parent, [this, this.$parent.$el])
		//触发clip的reset事件
		this.__emit('reset')
		//如果是chain型clip，则从animator中移除
		if (this.$type == 1) {
			this.$parent.removeClip(this)
		}
		//返回clip实例
		return this
	}

	/**
	 * 连续执行动画
	 * @param {Object} clip
	 */
	chain(clip: Clip) {
		if (!clip) {
			throw new TypeError('The parameter is not defined')
		}
		if (!(clip instanceof Clip)) {
			throw new TypeError('The parameter is not a Clip instance')
		}
		if (clip.$parent) {
			throw new ReferenceError('The clip has been added to an animator instance and cannot be passed as a chain argument')
		}
		clip.$type = 1
		this.$chainClip = clip
		//返回chain的clip
		return clip
	}

	/**
	 * 主动触发完成事件
	 */
	emitComplete() {
		//非free模式无效
		if (!this.free) {
			return
		}
		if (this.state == 0 || this.state == 3) {
			return
		}
		//动画运行结束，修改状态
		this.state = 3
		//animator触发complete事件
		this.$parent!.$options!.complete!.apply(this.$parent, [this, this.$parent!.$el])
		//clip触发complete事件
		this.__emit('complete')
		//调用clip自身的chain型clip
		if (this.$chainClip) {
			//chain型clip如果已经加入到animator中
			if (this.$parent!.hasClip(this.$chainClip)) {
				this.$parent!.removeClip(this.$chainClip).addClip(this.$chainClip)
			} else {
				this.$parent!.addClip(this.$chainClip)
			}
			this.$chainClip.start()
		}
	}

	/**
	 * 自定义事件执行
	 */
	on(eventName: string, handler: (...args: any) => void) {
		let event = this.__getEvent(eventName)
		if (event) {
			event.handler = handler
		} else {
			throw new Error(eventName + ' is an illegal event')
		}
		return this
	}

	/**
	 * requestAnimationFrame兼容性封装
	 */
	private __getRequestAnimationFrame() {
		let animation: any = window.requestAnimationFrame || (<any>window).webkitRequestAnimationFrame || (<any>window).mozRequestAnimationFrame
		//如果不兼容，则手动封装一个
		if (!animation) {
			let lastTime = 0
			animation = function (callback: () => void) {
				let currTime = Date.now()
				let timeToCall = Math.max(0, 1000 / 60 - (currTime - lastTime))
				window.setTimeout(callback, timeToCall)
				lastTime = currTime + timeToCall
			}
		}
		return animation
	}

	/**
	 * 触发自定义事件
	 * @param {Object} eventName
	 * @param {Object} params
	 */
	private __emit(eventName: string, params?: any[]) {
		let event = this.__getEvent(eventName)
		if (event) {
			if (params) {
				event.handler.apply(this, [this.$parent!.$el, ...params])
			} else {
				event.handler.apply(this, [this.$parent!.$el])
			}
		}
	}

	/**
	 * 获取事件数组中指定事件
	 * @param {Object} eventName
	 */
	private __getEvent(eventName: string) {
		let arr = this.$events.filter(event => {
			return event.name == eventName
		})
		return arr[0]
	}

	/**
	 * 获取元素基于单位$unit的值
	 */
	__getUnitCssValue() {
		//获取px单位的值
		let value = parseFloat(this.__getCssStyle(this.$parent!.$el, this.style!)!)
		//如果$unit为rem
		if (this.$unit == 'rem') {
			return this.__px2rem(value)
		} else if (this.$unit == 'em') {
			return this.__px2em(this.$parent!.$el, value)
		}
		//px单位或者无单位直接返回value
		return value
	}

	/**
	 * 获取元素指定样式值
	 * @param {Object} el
	 * @param {Object} cssName
	 */
	private __getCssStyle(el: HTMLElement, cssName: string) {
		if (typeof cssName == 'string') {
			let cssText = ''
			//兼容IE9-IE11、chrome、firefox、safari、opera；不兼容IE7-IE8
			if (document.defaultView && document.defaultView.getComputedStyle) {
				cssText = (<any>document.defaultView.getComputedStyle(el))[cssName]
			} else {
				//兼容IE7-IE11；不兼容chrome、firefox、safari、opera
				cssText = (<any>el).currentStyle[cssName]
			}
			return cssText
		}
		return null
	}

	/**
	 * px转为rem
	 * @param {Object} number
	 */
	private __px2rem(number: number) {
		let fs = this.__getCssStyle(document.documentElement, 'font-size')
		//获得rem单位的值
		return number / parseFloat(fs!)
	}

	/**
	 * px转为em
	 * @param {Object} el
	 * @param {Object} number
	 */
	private __px2em(el: HTMLElement, number: number) {
		let parentNode = el.parentNode || el.parentElement
		let fs = this.__getCssStyle(<HTMLElement>parentNode, 'font-size')
		//获得em单位的值
		return number / parseFloat(fs!)
	}
}
