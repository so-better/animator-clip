import * as CSS from 'csstype'
import { Clip } from './clip'

/**
 * 构造参数
 */
export type AnimatorOptionsType = {
  /**
   * 动画开始事件
   */
  onStart?: (this: Animator, clip: Clip, el: HTMLElement) => void
  /**
   * 动画停止事件
   */
  onStop?: (this: Animator, clip: Clip, el: HTMLElement) => void
  /**
   * 动画重置事件
   */
  onReset?: (this: Animator, clip: Clip, el: HTMLElement) => void
  /**
   * 动画更新前事件，此时样式还未改变
   */
  onBeforeUpdate?: (this: Animator, clip: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: number) => void
  /**
   * 动画更新时事件，此时样式已经改变
   */
  onUpdate?: (this: Animator, clip: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: number) => void
  /**
   * 动画完成事件
   */
  onComplete?: (this: Animator, clip: Clip, el: HTMLElement) => void
}

/**
 * 动画类
 */
export class Animator {
  /**
   * 动画绑定的元素
   */
  $el?: HTMLElement
  /**
   * 动画开始事件
   */
  onStart?: (this: Animator, clip: Clip, el: HTMLElement) => void
  /**
   * 动画停止事件
   */
  onStop?: (this: Animator, clip: Clip, el: HTMLElement) => void
  /**
   * 动画重置事件
   */
  onReset?: (this: Animator, clip: Clip, el: HTMLElement) => void
  /**
   * 动画更新前事件，此时样式还未改变
   */
  onBeforeUpdate?: (this: Animator, clip: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: number) => void
  /**
   * 动画更新时事件，此时样式已经改变
   */
  onUpdate?: (this: Animator, clip: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: number) => void
  /**
   * 动画完成事件
   */
  onComplete?: (this: Animator, clip: Clip, el: HTMLElement) => void
  /**
   * 动画下的实例
   */
  children: Clip[] = []

  constructor(el: HTMLElement | string, options?: AnimatorOptionsType) {
    this.$el = typeof el == 'string' && el ? document.body.querySelector(el)! : (el as HTMLElement)
    if (options?.onStart) this.onStart = options.onStart
    if (options?.onStop) this.onStop = options.onStop
    if (options?.onReset) this.onReset = options.onReset
    if (options?.onBeforeUpdate) this.onBeforeUpdate = options.onBeforeUpdate
    if (options?.onUpdate) this.onUpdate = options.onUpdate
    if (options?.onComplete) this.onComplete = options.onComplete
  }

  /**
   * 判断是否包含某个clip
   */
  hasClip(clip: Clip) {
    if (!clip.parent) {
      return false
    }
    if (!this.children.length) {
      return false
    }
    return this.children.some(item => {
      return item.key === clip.key
    })
  }

  /**
   * 将clip添加到队列
   */
  addClip(clip: Clip) {
    //clip存在于其他animator中
    if (!this.hasClip(clip) && !!clip.parent) {
      throw new Error('The clip has been added to other animator')
    }
    //clip已经在animator中了
    if (this.hasClip(clip)) {
      throw new Error('The clip has been added to the animator')
    }
    //设置父对象
    clip.parent = this
    //非free模式下需要记录初始值
    if (!clip.free) {
      if (!!clip.unit) {
        clip.initValue = clip.getUnitCssValue() + clip.unit
      } else {
        clip.initValue = clip.getUnitCssValue()
      }
    }
    //将clip加入
    this.children.push(clip)

    return this
  }

  /**
   * 将clip移出队列
   */
  removeClip(clip: Clip) {
    if (!clip.parent) {
      throw new Error('The clip has not been added to the animator')
    }
    if (!this.hasClip(clip)) {
      throw new Error('The clip does not belong to the animator')
    }
    //更新children
    const index = this.children.findIndex(item => item.key == clip.key)
    this.children.splice(index, 1)
    //重置初始状态
    clip.state = 0
    //恢复初始的时间戳
    clip.timeStamp = 0
    //恢复初始间隔时间
    clip.interval = 0
    //非free模式下的处理
    if (!clip.free) {
      //恢复元素的初始样式
      clip.parent.$el!.style.setProperty(clip.style!, clip.initValue + '', 'important')
      //重置初始属性值
      clip.initValue = undefined
    }
    //重置父对象
    clip.parent = undefined
    //返回animator实例
    return this
  }

  /**
   * 移除全部clip
   */
  removeAllClips() {
    let i = 0
    while (i < this.children.length) {
      const clip = this.children[i]
      this.removeClip(clip)
    }
    return this
  }

  /**
   * 获取正在运行的clip
   */
  getClips() {
    return this.children.filter(item => {
      return item.state == 1
    })
  }

  /**
   * 获取停止状态的clip
   */
  getStopClips() {
    return this.children.filter(item => {
      return item.state == 2
    })
  }

  /**
   * 获取已完成的clip
   */
  getCompleteClips() {
    return this.children.filter(item => {
      return item.state == 3
    })
  }

  /**
   * 开始动画
   */
  start() {
    this.children.forEach(item => {
      item.start()
    })
    return this
  }

  /**
   * 停止动画
   */
  stop() {
    this.children.forEach(item => {
      item.stop()
    })
    return this
  }

  /**
   * 重置动画
   */
  reset(resetStyle: boolean | undefined = true) {
    this.children.forEach(item => {
      item.reset(resetStyle)
    })
    return this
  }
}
