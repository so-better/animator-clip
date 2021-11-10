/**
 * 单一属性动画类
 * @param {Object} options
 */
class Clip {
    constructor(options) {
        //唯一标志
        this.id = undefined
        //样式名称
        this.style = undefined
        //样式最终值
        this.value = undefined
        //动画速度，即每次样式改变的量
        this.speed = undefined
        //是否自由模式
        this.free = false
        //动画每次更新间隔时间
        this.interval = 0
        //配置参数
        this.$options = options
        //样式单位，无单位则为undefined
        this.$unit = undefined
        //动画api
        this.$requestAnimationFrame = undefined
        //0表示动画初始状态，1表示动画进行状态，2表示动画停止状态，3表示动画完成状态
        this.state = 0
        //自定义事件数组
        this.$events = []
        //连续调用的动画
        this.$chainClip = undefined
        //0表示普通clip，1表示chain型clip
        this.$type = 0
        //属性值初始值
        this.$initValue = undefined
        //animator实例
        this.$parent = undefined
        //每次动画帧执行时的时间戳记录
        this.$timeStamp = 0
        //执行初始化方法
        this._init()
    }

    /**
     * 初始化参数
     */
    _init() {
        //options参数不存在的情况下默认为自由模式
        if (!this.$options) {
            this.free = true
            this.$options = undefined
        }
        //options参数为对象
        else if (typeof this.$options == 'object' && this.$options) {
            //free模式
            if (typeof this.$options.free == 'boolean') {
                this.free = this.$options.free
            } else {
                this.free = false
            }
            //非free模式对其他参数进行验证
            if (!this.free) {
                //style
                if (
                    typeof this.$options.style == 'string' &&
                    this.$options.style
                ) {
                    this.style = this.$options.style
                } else {
                    throw new TypeError('The style argument should be a string')
                }

                //value
                if (typeof this.$options.value == 'number') {
                    //如果是数值，则无单位
                    this.value = this.$options.value
                    this.$unit = null
                } else if (
                    typeof this.$options.value == 'string' &&
                    this.$options.value
                ) {
                    this.value = parseFloat(this.$options.value) //记录值
                    if (this.$options.value.endsWith('px')) {
                        //如果是px单位的值
                        this.$unit = 'px' //记录单位
                    } else if (this.$options.value.endsWith('rem')) {
                        //如果是rem单位的值
                        this.$unit = 'rem' //记录单位
                    } else if (this.$options.value.endsWith('em')) {
                        //如果是em单位的值
                        this.$unit = 'em' //记录单位
                    } else {
                        throw new Error(
                            'Currently, only attribute values of px, rem, and em units are supported'
                        )
                    }
                } else {
                    throw new TypeError(
                        'The value argument should be a number or string'
                    )
                }

                //speed
                if (typeof this.$options.speed == 'number') {
                    this.speed = this.$options.speed
                } else {
                    throw new TypeError('The speed argument should be a number')
                }
            }
        } else {
            //options存在必须为对象，否则报错
            throw new Error(
                'The construction parameter of the clip must be a non-null object'
            )
        }

        //动画函数初始化
        this.$requestAnimationFrame = this._getRequestAnimationFrame()

        //事件数组初始化
        this.$events = [
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
    }

    /**
     * 执行动画
     */
    start() {
        if (!this.$parent || !this.$parent.$el) {
            throw new ReferenceError(
                'The clip has not been added to the animator'
            )
        }
        //非free模式下进行属性值判断
        if (!this.free) {
            //获取初始属性值
            let oldValue = this._getUnitCssValue()
            //如果属性为渐增的且属性值已经超过目标属性值大小，则不进行动画
            if (this.speed > 0 && oldValue >= this.value) {
                return this
            }
            //如果属性为渐少的且属性值已经达到目标属性值大小，则不进行动画
            if (this.speed < 0 && oldValue <= this.value) {
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
        //clip触发start事件
        this._emit('start')
        //animator触发start事件,clip作为参数
        this.$parent.$options.start.call(this.$parent, this, this.$parent.$el)
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
                //clip触发beforeUpdate事件
                this._emit('beforeUpdate')
                //animator触发beforeUpdate事件
                this.$parent.$options.beforeUpdate.call(
                    this.$parent,
                    this,
                    this.$parent.$el
                )
                //clip触发update事件
                this._emit('update')
                //animator触发update事件
                this.$parent.$options.update.call(
                    this.$parent,
                    this,
                    this.$parent.$el
                )
                //递归调用动画
                this.$requestAnimationFrame.call(window, doFun)
            } else {
                //非free模式下
                //获取当前属性值
                let currentValue = this._getUnitCssValue()
                //clip触发beforeUpdate事件
                this._emit('beforeUpdate', [this.style, currentValue])
                //animator触发beforeUpdate事件
                this.$parent.$options.beforeUpdate.call(
                    this.$parent,
                    this,
                    this.$parent.$el,
                    this.style,
                    currentValue
                )
                //获取新的属性值
                let newValue = Number((currentValue + this.speed).toFixed(2))
                //给元素设置新属性值样式
                if (this.$unit) {
                    this.$parent.$el.style.setProperty(
                        this.style,
                        newValue + this.$unit,
                        'important'
                    )
                } else {
                    this.$parent.$el.style.setProperty(
                        this.style,
                        newValue,
                        'important'
                    )
                }
                //clip触发update事件
                this._emit('update', [this.style, newValue])
                //animator触发update事件
                this.$parent.$options.update.call(
                    this.$parent,
                    this,
                    this.$parent.$el,
                    this.style,
                    newValue
                )
                //达到目标值完成动画
                if (
                    (this.speed > 0 && newValue >= this.value) ||
                    (this.speed < 0 && newValue <= this.value)
                ) {
                    //设置样式值为目标值
                    if (this.$unit) {
                        this.$parent.$el.style.setProperty(
                            this.style,
                            this.value + this.$unit,
                            'important'
                        )
                    } else {
                        this.$parent.$el.style.setProperty(
                            this.style,
                            this.value,
                            'important'
                        )
                    }
                    //恢复初始的时间戳
                    this.$timeStamp = 0
                    //恢复初始间隔时间
                    this.interval = 0
                    //动画运行结束，修改状态
                    this.state = 3
                    //clip触发complete事件
                    this._emit('complete')
                    //animator触发complete事件
                    this.$parent.$options.complete.call(
                        this.$parent,
                        this,
                        this.$parent.$el
                    )
                    //调用clip自身的chain型clip
                    if (this.$chainClip) {
                        //chain型clip如果已经加入到animator中
                        if (this.$parent.hasClip(this.$chainClip)) {
                            this.$parent
                                .removeClip(this.$chainClip)
                                .addClip(this.$chainClip)
                        } else {
                            this.$parent.addClip(this.$chainClip)
                        }
                        this.$chainClip.start()
                    }
                } else {
                    //没有达到目标值则继续进行动画
                    this.$requestAnimationFrame.call(window, doFun)
                }
            }
        }
        this.$requestAnimationFrame.call(window, doFun)
        //返回clip实例
        return this
    }

    /**
     * 停止动画
     */
    stop() {
        if (!this.$parent || !this.$parent.$el) {
            throw new ReferenceError(
                'The clip has not been added to the animator'
            )
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
        //clip触发stop事件
        this._emit('stop')
        //animator触发stop事件
        this.$parent.$options.stop.call(this.$parent, this, this.$parent.$el)
        //返回clip实例
        return this
    }

    /**
     * 重置动画
     */
    reset() {
        if (!this.$parent || !this.$parent.$el) {
            throw new ReferenceError(
                'The clip has not been added to the animator'
            )
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
        //非free模式下恢复初始属性值
        if (!this.free) {
            this.$parent.$el.style.setProperty(
                this.style,
                this.$initValue,
                'important'
            )
        }
        //触发clip的reset事件
        this._emit('reset')
        //animator触发reset事件
        this.$parent.$options.reset.call(this.$parent, this, this.$parent.$el)
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
    chain(clip) {
        if (!clip) {
            throw new TypeError('The parameter is not defined')
        }
        if (!(clip instanceof Clip)) {
            throw new TypeError('The parameter is not a Clip instance')
        }
        if (clip.$parent) {
            throw new ReferenceError(
                'The clip has been added to an animator instance and cannot be passed as a chain argument'
            )
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
        //clip触发complete事件
        this._emit('complete')
        //animator触发complete事件
        this.$parent.$options.complete.call(
            this.$parent,
            this,
            this.$parent.$el
        )
        //调用clip自身的chain型clip
        if (this.$chainClip) {
            //chain型clip如果已经加入到animator中
            if (this.$parent.hasClip(this.$chainClip)) {
                this.$parent
                    .removeClip(this.$chainClip)
                    .addClip(this.$chainClip)
            } else {
                this.$parent.addClip(this.$chainClip)
            }
            this.$chainClip.start()
        }
    }

    /**
     * 自定义事件执行
     * @param {Object} eventName
     * @param {Object} handler
     */
    on(eventName, handler) {
        let event = this._getEvent(eventName)
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
    _getRequestAnimationFrame() {
        let animation =
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame
        //如果不兼容，则手动封装一个
        if (!animation) {
            let lastTime = 0
            animation = function (callback) {
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
    _emit(eventName, params) {
        let event = this._getEvent(eventName)
        if (event) {
            if (params) {
                event.handler.call(this, this.$parent.$el, ...params)
            } else {
                event.handler.call(this, this.$parent.$el)
            }
        }
    }

    /**
     * 获取事件数组中指定事件
     * @param {Object} eventName
     */
    _getEvent(eventName) {
        let arr = this.$events.filter((event, index) => {
            return event.name == eventName
        })
        return arr[0]
    }

    /**
     * 获取元素基于单位$unit的值
     */
    _getUnitCssValue() {
        //获取px单位的值
        let value = parseFloat(this._getCssStyle(this.$parent.$el, this.style))
        //如果$unit为rem
        if (this.$unit == 'rem') {
            return this._px2rem(value)
        } else if (this.$unit == 'em') {
            return this._px2em(this.$parent.$el, value)
        }
        //px单位或者无单位直接返回value
        return value
    }

    /**
     * 获取元素指定样式值
     * @param {Object} el
     * @param {Object} cssName
     */
    _getCssStyle(el, cssName) {
        if (typeof cssName == 'string') {
            let cssText = ''
            //兼容IE9-IE11、chrome、firefox、safari、opera；不兼容IE7-IE8
            if (document.defaultView && document.defaultView.getComputedStyle) {
                cssText = document.defaultView.getComputedStyle(el)[cssName]
            } else {
                //兼容IE7-IE11；不兼容chrome、firefox、safari、opera
                cssText = el.currentStyle[cssName]
            }
            return cssText
        } else {
            return null
        }
    }

    /**
     * rem转为px
     * @param {Object} number
     */
    _rem2px(number) {
        let fs = this._getCssStyle(document.documentElement, 'font-size')
        let num = Number((number * parseFloat(fs)).toFixed(2)) //获得px单位的值
        return num
    }

    /**
     * px转为rem
     * @param {Object} number
     */
    _px2rem(number) {
        let fs = this._getCssStyle(document.documentElement, 'font-size')
        let num = Number((number / parseFloat(fs)).toFixed(2)) //获得rem单位的值
        return num
    }

    /**
     * px转为em
     * @param {Object} el
     * @param {Object} number
     */
    _px2em(el, number) {
        let parentNode = el.parentNode || el.parentElement
        let fs = this._getCssStyle(parentNode, 'font-size')
        let num = Number((number / parseFloat(fs)).toFixed(2)) //获得em单位的值
        return num
    }

    /**
     * em转为px
     * @param {Object} el
     * @param {Object} number
     */
    _em2px(el, number) {
        let parentNode = el.parentNode || el.parentElement
        let fs = this._getCssStyle(parentNode, 'font-size')
        let num = Number((number * parseFloat(fs)).toFixed(2)) //获得px单位的值
        return num
    }
}

module.exports = Clip
