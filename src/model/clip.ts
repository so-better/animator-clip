import * as CSS from 'csstype'
import { element as DapElement } from 'dap-util'
import { createUniqueKey } from '@/tool'
import { Animator } from './animator'

/**
 * 动画帧实例构建参数
 */
export type ClipOptionsType = {
  /**
   * 样式名称
   */
  style?: keyof CSS.Properties
  /**
   * 样式最终值
   */
  value?: string | number
  /**
   * 动画速度，即每次改变的量
   */
  speed?: number
  /**
   * 是否自由模式
   */
  free?: boolean
  /**
   * 动画开始事件
   */
  onStart?: (this: Clip, el: HTMLElement) => void
  /**
   * 动画停止事件
   */
  onStop?: (this: Clip, el: HTMLElement) => void
  /**
   * 动画重置事件
   */
  onReset?: (this: Clip, el: HTMLElement) => void
  /**
   * 动画更新前事件，此时样式还未改变
   */
  onBeforeUpdate?: (this: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: string | number) => void
  /**
   * 动画更新时事件，此时样式已经改变
   */
  onUpdate?: (this: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: string | number) => void
  /**
   * 动画完成事件
   */
  onComplete?: (this: Clip, el: HTMLElement) => void
}

/**
 * 单一动画帧
 */
export class Clip {
  /**
   * 样式名称
   */
  style?: keyof CSS.Properties
  /**
   * 样式最终值
   */
  value?: number
  /**
   * 动画速度，即每次改变的量
   */
  speed?: number
  /**
   * 是否自由模式
   */
  free: boolean = false
  /**
   * 动画开始事件
   */
  onStart?: (this: Clip, el: HTMLElement) => void
  /**
   * 动画停止事件
   */
  onStop?: (this: Clip, el: HTMLElement) => void
  /**
   * 动画重置事件
   */
  onReset?: (this: Clip, el: HTMLElement) => void
  /**
   * 动画更新前事件，此时样式还未改变
   */
  onBeforeUpdate?: (this: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: string | number) => void
  /**
   * 动画更新时事件，此时样式已经改变
   */
  onUpdate?: (this: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: string | number) => void
  /**
   * 动画完成事件
   */
  onComplete?: (this: Clip, el: HTMLElement) => void

  // 以下是不参与构建实例的属性

  /**
   * 唯一key
   */
  key: number = createUniqueKey()
  /**
   * 类型，0表示普通clip，1表示chain型clip
   */
  type: 0 | 1 = 0
  /**
   * 动画每次更新的间隔时间，单位ms
   */
  interval: number = 0
  /**
   * 样式的单位
   */
  unit?: 'px' | 'em' | 'rem'
  /**
   * requestAnimationFrame动画API
   */
  requestAnimationFrame: typeof window.requestAnimationFrame | ((callback: () => number) => number)
  /**
   * 动画状态，0表示动画初始状态，1表示动画进行状态，2表示动画停止状态，3表示动画完成状态
   */
  state: 0 | 1 | 2 | 3 = 0
  /**
   * 链式调用的动画
   */
  chainClip?: Clip
  /**
   * 样式初始值
   */
  initValue?: string | number
  /**
   * animator实例
   */
  parent?: Animator
  /**
   * 每次动画帧执行的时间戳记录
   */
  timeStamp: number = 0

  constructor(options: ClipOptionsType) {
    this.free = options.free ?? false
    if (!this.free && options.value) {
      this.style = options.style
      this.speed = options.speed
      this.value = typeof options.value == 'number' ? options.value : parseFloat(options.value)
      this.unit = this.getUnit(options.value)
    }
    if (options.onStart) this.onStart = options.onStart
    if (options.onStop) this.onStop = options.onStop
    if (options.onReset) this.onReset = options.onReset
    if (options.onBeforeUpdate) this.onBeforeUpdate = options.onBeforeUpdate
    if (options.onUpdate) this.onUpdate = options.onUpdate
    if (options.onComplete) this.onComplete = options.onComplete
    this.requestAnimationFrame = this.getRequestAnimationFrame()
  }

  /**
   * 开始动画
   */
  start() {
    if (!this.parent || !this.parent.$el) {
      throw new Error('The clip has not been added to the animator')
    }
    //非free模式下进行属性值判断
    if (!this.free) {
      //获取初始属性值
      const oldValue = this.getUnitCssValue()
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
    this.timeStamp = Date.now()
    //恢复初始间隔时间
    this.interval = 0
    //更改帧状态
    this.state = 1
    //animator触发start事件,clip作为参数
    this.parent.onStart?.apply(this.parent, [this, this.parent.$el])
    //clip触发start事件
    this.onStart?.apply(this, [this.parent.$el])
    //动画帧执行函数
    const doFun = () => {
      //每一帧运行时判断是否处在运行状态
      if (this.state != 1) {
        return 1
      }
      //获取当前的时间戳
      const now = Date.now()
      //记录动画间隔时间毫秒数
      this.interval = now - this.timeStamp
      //更新记录的时间戳
      this.timeStamp = now
      //free模式下
      if (this.free) {
        //animator触发beforeUpdate事件
        this.parent!.onBeforeUpdate?.apply(this.parent!, [this, this.parent!.$el!])
        //clip触发beforeUpdate事件
        this.onBeforeUpdate?.apply(this, [this.parent!.$el!])
        //animator触发update事件
        this.parent!.onUpdate?.apply(this.parent!, [this, this.parent!.$el!])
        //clip触发update事件
        this.onUpdate?.apply(this, [this.parent!.$el!])
        //递归调用动画
        this.requestAnimationFrame.apply(window, [doFun])
      }
      //非free模式下
      else {
        //获取当前属性值
        const currentValue = this.getUnitCssValue()
        //animator触发beforeUpdate事件
        this.parent!.onBeforeUpdate?.apply(this.parent!, [this, this.parent!.$el!, this.style, currentValue])
        //clip触发beforeUpdate事件
        this.onBeforeUpdate?.apply(this, [this.parent!.$el!, this.style, currentValue])
        //获取新的属性值
        const newValue = currentValue + this.speed!
        //给元素设置新属性值样式
        if (this.unit) {
          this.parent!.$el!.style.setProperty(this.style!, newValue + this.unit, 'important')
        } else {
          this.parent!.$el!.style.setProperty(this.style!, newValue + '', 'important')
        }
        //animator触发update事件
        this.parent!.onUpdate?.apply(this.parent!, [this, this.parent!.$el!, this.style, newValue])
        //clip触发update事件
        this.onUpdate?.apply(this, [this.parent!.$el!, this.style, newValue])

        //达到目标值完成动画
        if ((this.speed! > 0 && newValue >= this.value!) || (this.speed! < 0 && newValue <= this.value!)) {
          //设置样式值为目标值
          if (this.unit) {
            this.parent!.$el!.style.setProperty(this.style!, this.value + this.unit, 'important')
          } else {
            this.parent!.$el!.style.setProperty(this.style!, this.value + '', 'important')
          }
          //恢复初始的时间戳
          this.timeStamp = 0
          //恢复初始间隔时间
          this.interval = 0
          //动画运行结束，修改状态
          this.state = 3
          //animator触发complete事件
          this.parent!.onComplete?.apply(this.parent!, [this, this.parent!.$el!])
          //clip触发complete事件
          this.onComplete?.apply(this, [this.parent!.$el!])
          //调用clip自身的chain型clip
          if (this.chainClip) {
            //chain型clip如果已经加入到animator中
            if (this.parent!.hasClip(this.chainClip)) {
              this.parent!.removeClip(this.chainClip).addClip(this.chainClip)
            } else {
              this.parent!.addClip(this.chainClip)
            }
            this.chainClip.start()
          }
        } else {
          //没有达到目标值则继续进行动画
          this.requestAnimationFrame.apply(window, [doFun])
        }
      }
      return 1
    }
    this.requestAnimationFrame.apply(window, [doFun])
    //返回clip实例
    return this
  }
  /**
   * 停止动画
   */
  stop() {
    if (!this.parent || !this.parent.$el) {
      throw new Error('The clip has not been added to the animator')
    }
    //非运行状态的动画帧无法停止
    if (this.state != 1) {
      return this
    }
    //恢复初始的时间戳
    this.timeStamp = 0
    //恢复初始间隔时间
    this.interval = 0
    //修改状态
    this.state = 2
    //animator触发stop事件
    this.parent.onStop?.apply(this.parent, [this, this.parent.$el])
    //clip触发stop事件
    this.onStop?.apply(this, [this.parent.$el])
    //返回clip实例
    return this
  }

  /**
   * 重置动画
   */
  reset(resetStyle: boolean | undefined = true) {
    if (!this.parent || !this.parent.$el) {
      throw new Error('The clip has not been added to the animator')
    }
    //初始状态的动画帧无需重置
    if (this.state == 0) {
      return this
    }
    //恢复初始的时间戳
    this.timeStamp = 0
    //恢复初始间隔时间
    this.interval = 0
    //修改状态
    this.state = 0
    //非free模式下如果reStoreStyle是true则恢复元素的初始属性值
    if (!this.free && resetStyle) {
      this.parent.$el.style.setProperty(this.style!, this.initValue + '', 'important')
    }
    //animator触发reset事件
    this.parent.onReset?.apply(this.parent, [this, this.parent.$el])
    //触发clip的reset事件
    this.onReset?.apply(this, [this.parent.$el])
    //如果是chain型clip，则从animator中移除
    if (this.type == 1) {
      this.parent.removeClip(this)
    }
    //返回clip实例
    return this
  }

  /**
   * 链式调用动画
   */
  chain(clip: Clip) {
    if (clip.parent) {
      throw new Error('The clip has been added to an animator instance and cannot be passed as a chain argument')
    }
    clip.type = 1
    this.chainClip = clip
    return clip
  }

  /**
   * 主动触发完成事件
   */
  emitComplete() {
    if (!this.parent || !this.parent.$el) {
      throw new Error('The clip has not been added to the animator')
    }
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
    this.parent.onComplete?.apply(this.parent, [this, this.parent.$el])
    //clip触发complete事件
    this.onComplete?.apply(this, [this.parent.$el])
    //调用clip自身的chain型clip
    if (this.chainClip) {
      //chain型clip如果已经加入到animator中
      if (this.parent.hasClip(this.chainClip)) {
        this.parent.removeClip(this.chainClip).addClip(this.chainClip)
      } else {
        this.parent.addClip(this.chainClip)
      }
      this.chainClip.start()
    }
  }

  /**
   * 获取元素基于单位unit的值
   */
  getUnitCssValue() {
    //获取px单位的值
    const value = parseFloat(DapElement.getCssStyle(this.parent!.$el!, this.style!))
    //unit为rem
    if (this.unit == 'rem') {
      return DapElement.px2rem(value)
    }
    //unit为em
    if (this.unit == 'em') {
      return this.px2em(this.parent!.$el!, value)
    }
    //px单位或者无单位直接返回value
    return value
  }

  /**
   * requestAnimationFrame兼容性封装
   */
  private getRequestAnimationFrame() {
    if (window.requestAnimationFrame) {
      return window.requestAnimationFrame
    }
    let lastTime = 0
    return function (callback: () => number) {
      let currTime = Date.now()
      let timeToCall = Math.max(0, 1000 / 60 - (currTime - lastTime))
      window.setTimeout(callback, timeToCall)
      lastTime = currTime + timeToCall
      return 1
    }
  }

  /**
   * 获取单位值
   */
  private getUnit(value: string | number) {
    if (typeof value == 'number') {
      return
    }
    if (value.endsWith('px')) {
      return 'px'
    }
    if (value.endsWith('rem')) {
      return 'rem'
    }
    if (value.endsWith('em')) {
      return 'em'
    }
  }

  /**
   * px转为em
   */
  private px2em(el: HTMLElement, number: number) {
    const parentNode = el.parentNode || el.parentElement
    const fs = DapElement.getCssStyle(parentNode as HTMLElement, 'font-size')
    //获得em单位的值
    return number / parseFloat(fs)
  }
}
