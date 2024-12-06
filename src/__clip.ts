import { element as DapElement } from 'dap-util'
import { Animator } from './__animator'

export type ClipOptionsType = {
  style: string
  value: number | string
  speed: number
  free?: boolean
}

export type EventType = {
  name: string
  handler: (...args: any) => void
}

export class Clip {
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
    this.$parent.$options.stop?.apply(this.$parent, [this, this.$parent.$el])
    //clip触发stop事件
    this.__emit('stop')
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
    this.$parent?.$options.complete?.apply(this.$parent, [this, this.$parent!.$el])
    //clip触发complete事件
    this.__emit('complete')
    //调用clip自身的chain型clip
    if (this.$chainClip) {
      //chain型clip如果已经加入到animator中
      if (this.$parent?.hasClip(this.$chainClip)) {
        this.$parent.removeClip(this.$chainClip).addClip(this.$chainClip)
      } else {
        this.$parent?.addClip(this.$chainClip)
      }
      this.$chainClip.start()
    }
  }
}
