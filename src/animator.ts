//引入Clip类对象
import { Clip } from './clip'

export type AnimatorOptionsType = {
	start?: (clip: Clip, el: HTMLElement) => void
	stop?: (clip: Clip, el: HTMLElement) => void
	complete?: (clip: Clip, el: HTMLElement) => void
	reset?: (clip: Clip, el: HTMLElement) => void
	beforeUpdate?: (clip: Clip, el: HTMLElement, style?: string, value?: number) => void
	update?: (clip: Clip, el: HTMLElement, style?: string, value?: number) => void
}

/**
 * Animator类对象
 */
export class Animator {
	//动画绑定元素
	$el: HTMLElement
	//参数配置
	$options?: AnimatorOptionsType
	//该实例下的所有clip实例
	clips: Clip[]

	//构造方法
	constructor(el: HTMLElement | string, options?: AnimatorOptionsType) {
		//动画元素绑定
		if (typeof el == 'string' && el) {
			this.$el = document.body.querySelector(el)!
		} else {
			this.$el = <HTMLElement>el
		}
		this.$options = options
		this.clips = []

		if (!this.$el) {
			throw new ReferenceError('The first construction argument of an animator should be an element or selector')
		}
		if (!(this.$el instanceof Node) || this.$el.nodeType !== 1) {
			throw new TypeError('The first construction argument of an animator should be an element or selector')
		}
		//参数初始化
		if (typeof this.$options != 'object' || !this.$options) {
			this.$options = {}
		}
		if (typeof this.$options.start != 'function') {
			this.$options.start = function () {}
		}
		if (typeof this.$options.complete != 'function') {
			this.$options.complete = function () {}
		}
		if (typeof this.$options.beforeUpdate != 'function') {
			this.$options.beforeUpdate = function () {}
		}
		if (typeof this.$options.update != 'function') {
			this.$options.update = function () {}
		}
		if (typeof this.$options.stop != 'function') {
			this.$options.stop = function () {}
		}
		if (typeof this.$options.reset != 'function') {
			this.$options.reset = function () {}
		}
	}

	/**
	 * 判断是否包含某个clip
	 */
	hasClip(clip: Clip) {
		if (!clip.$parent || typeof clip.id != 'number' || isNaN(clip.id)) {
			return false
		}
		return this.clips.some(item => {
			return item.id === clip.id
		})
	}

	/**
	 * 将clip添加到队列
	 */
	addClip(clip: Clip) {
		if (!clip) {
			throw new TypeError('Parameter does not exist')
		}
		if (!(clip instanceof Clip)) {
			throw new TypeError('The parameter is not a Clip instance')
		}
		//clip存在于其他animator中
		if (!this.hasClip(clip) && clip.$parent) {
			throw new Error('The clip has been added to other animator')
		}
		//clip已经在animator中了
		if (this.hasClip(clip)) {
			throw new Error('The clip has been added to the animator')
		}
		//设置clip的id
		if (this.clips.length == 0) {
			clip.id = 0
		} else {
			let maxClipId = this.clips[0].id!
			clip.id = maxClipId + 1
		}
		//设置父对象
		clip.$parent = this
		//非free模式下需要记录初始值
		if (!clip.free) {
			if (clip.$unit) {
				clip.$initValue = clip.__getUnitCssValue() + clip.$unit
			} else {
				clip.$initValue = clip.__getUnitCssValue()
			}
		}
		//将clip加入到clips中去
		this.clips.unshift(clip)
		return this
	}

	/**
	 * 将clip移出队列
	 * @param {Object} clip
	 */
	removeClip(clip: Clip) {
		if (!clip) {
			throw new TypeError('Parameter does not exist')
		}
		if (!(clip instanceof Clip)) {
			throw new TypeError('The parameter is not a Clip instance')
		}
		if (!clip.$parent || typeof clip.id != 'number' || isNaN(clip.id)) {
			throw new Error('The clip has not been added to the animator')
		}
		if (!this.hasClip(clip)) {
			throw new Error('The clip does not belong to the animator')
		}
		//更新clips数组
		this.clips = this.clips.filter(item => {
			return item.id != clip.id
		})
		//重置初始状态
		clip.state = 0
		//恢复初始的时间戳
		clip.$timeStamp = 0
		//恢复初始间隔时间
		clip.interval = 0
		//非free模式下的处理
		if (!clip.free) {
			//恢复元素的初始样式
			clip.$parent.$el.style.setProperty(clip.style!, clip.$initValue + '', 'important')
			//重置初始属性值
			clip.$initValue = undefined
		}
		//重置父对象
		clip.$parent = undefined
		//重置id
		clip.id = undefined
		//返回animator实例
		return this
	}

	/**
	 * 移除全部clip
	 */
	removeAllClips() {
		let clips = [...this.clips]
		clips.forEach(clip => {
			this.removeClip(clip)
		})
		return this
	}

	/**
	 * 获取正在运行的clip
	 */
	getClips() {
		return this.clips.filter(clip => {
			return clip.state == 1
		})
	}

	/**
	 * 获取停止状态的clip
	 */
	getStopClips() {
		return this.clips.filter(clip => {
			return clip.state == 2
		})
	}

	/**
	 * 获取已完成的clip
	 */
	getCompleteClips() {
		return this.clips.filter(clip => {
			return clip.state == 3
		})
	}

	/**
	 * 执行动画
	 */
	start() {
		this.clips.forEach(clip => {
			clip.start()
		})
		return this
	}

	/**
	 * 停止动画
	 */
	stop() {
		this.clips.forEach(clip => {
			clip.stop()
		})
		return this
	}

	/**
	 * 重置动画
	 */
	reset(reStoreStyle = true) {
		this.clips.forEach(clip => {
			clip.reset(reStoreStyle)
		})
		return this
	}
}
