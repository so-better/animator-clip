//引入Clip类对象
const Clip = require('./clip')
/**
 * Animator类对象
 * @param {Object} el
 * @param {Object} options
 */
class Animator {
	//构造方法
	constructor(el, options) {
		this.$el = el //动画绑定元素
		this.$options = options //参数配置
		this.clips = [] //该实例下的所有clip实例
		this._init() //调用初始化方法
	}

	/**
	 * 初始化方法
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
		if (typeof this.$options != 'object' || !this.$options) {
			this.$options = {}
		}
		if (typeof this.$options.start != 'function') {
			this.$options.start = function() {}
		}
		if (typeof this.$options.complete != 'function') {
			this.$options.complete = function() {}
		}
		if (typeof this.$options.beforeUpdate != 'function') {
			this.$options.beforeUpdate = function() {}
		}
		if (typeof this.$options.update != 'function') {
			this.$options.update = function() {}
		}
		if (typeof this.$options.stop != 'function') {
			this.$options.stop = function() {}
		}
		if (typeof this.$options.reset != 'function') {
			this.$options.reset = function() {}
		}
	}

	/**
	 * 判断是否包含某个clip
	 * @param {Object} clip
	 */
	hasClip(clip) {
		if (!clip.$parent || typeof clip.id != 'number' || isNaN(clip.id)) {
			return false
		}
		return this.clips.some(item => {
			return item.id === clip.id
		})
	}

	/**
	 * 将clip添加到队列
	 * @param {Object} clip
	 */
	addClip(clip) {
		if (!clip) {
			throw new TypeError('clip is not defined')
		}
		if (!(clip instanceof Clip)) {
			throw new TypeError('clip is not a Clip instance')
		}
		//clip存在于其他animator中
		if (!this.hasClip(clip) && clip.$parent) {
			throw new Error('clip has already been added to other animator')
		}
		//clip已经在animator中了
		if (this.hasClip(clip)) {
			throw new Error('clip has already been added to the animator')
		}
		//设置clip的id
		if (this.clips.length == 0) {
			clip.id = 0
		} else {
			let lastClip = this.clips[this.clips.length - 1]
			clip.id = lastClip.id + 1
		}
		//设置父对象
		clip.$parent = this
		//非free模式下需要记录初始值
		if (!clip.free) {
			if (clip.$unit) {
				clip.$initValue = clip._getUnitCssValue() + clip.$unit
			} else {
				clip.$initValue = clip._getUnitCssValue()
			}
		}
		//将clip加入到clips中去
		this.clips.push(clip)
		return this
	}

	/**
	 * 将clip移出队列
	 * @param {Object} clip
	 */
	removeClip(clip) {
		if (!clip) {
			throw new TypeError('clip is not defined')
		}
		if (!(clip instanceof Clip)) {
			throw new TypeError('clip is not a Clip instance')
		}
		if (!clip.$parent || typeof clip.id != 'number' || isNaN(clip.id)) {
			throw new Error('the clip has not been added to the animator')
		}
		if (!this.hasClip(clip)) {
			throw new Error('the clip does not belong to the animator')
		}
		//clips数组中移出
		this.clips = this.clips.filter(item => {
			return item.id != clip.id
		})
		//重置初始状态
		clip.state = 0
		//非free模式下处理
		if (!clip.free) {
			//恢复元素的初始样式
			clip.$parent.$el.style.setProperty(clip.style, clip.$initValue, 'important')
			//重置初始属性值
			clip.$initValue = null
		}
		//重置父对象
		clip.$parent = null
		//重置id
		clip.id = null
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
		let clips = this.clips.filter((clip, index) => {
			return clip.state == 1
		})
		return clips
	}

	/**
	 * 获取停止状态的clip
	 */
	getStopClips() {
		let clips = this.clips.filter((clip, index) => {
			return clip.state == 2
		})
		return clips
	}

	/**
	 * 获取已完成的clip
	 */
	getCompleteClips() {
		let clips = this.clips.filter((clip, index) => {
			return clip.state == 3
		})
		return clips
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
	reset() {
		let chainClips = []
		this.clips.forEach(clip => {
			clip.reset()
			//如果是chain型clip则记录到数组内
			if (clip.$type == 1) {
				chainClips.push(clip)
			}
		})
		//遍历记录的数组，将chain型clip移除
		chainClips.forEach(clip => {
			this.removeClip(clip)
		})
		return this
	}

}

module.exports = Animator
