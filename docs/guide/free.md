---
title: 自由模式
---

# 自由模式

> animator-clip 仅支持 px、rem、em 或者无单位的属性值动画变化，对于 transform 一类的动画无法直接设置，此时可以使用自由模式来达到目标

## 自由模式的特点

- `clip` 无需设置 `style`、`value`、`speed` 参数

- 动画的重置和完成需要自定义

- 利用 `onUpdate` 事件的触发更新元素样式，并自己设置一个终点

- 利用 `onReset` 事件的触发自定义恢复的样式，无法自动恢复

- 动画的 `onComplete` 事件需要自行触发

- `onBeforeUpdate` 事件和 `onUpdate` 事件回调参数无 `style` 和 `value`，且 `onBeforeUpdate` 事件和 `onUpdate` 事件没有区别

- 可以实现 `transform` 等动画效果

## 示例

```ts
import { Animator, Clip } from 'animator-clip'
//定义元素的初始属性值
let scale = 1
//创建animator实例
const animator = new Animator(el)
//创建单一动画帧实例，设置free模式
const clip = new Clip({
  free: true,
  onUpdate(el) {
    if (scale >= 0.1) {
      scale -= 0.01
      el.style.transform = 'scale(' + scale + ')'
    } else {
      //这里动画完成，主动触发onComplete事件，如果该方法不调用，则onComplete事件不会触发，chain方法失效
      clip.emitComplete()
    }
  },
  //调用reset方法后触发onReset事件，此时可以设置元素的初始样式来达到恢复的目的
  onReset(el) {
    scale = 1
    el.style.transform = 'scale(' + scale + ')'
  }
})
//将单一动画帧添加到动画实例中去
animator.addClip(clip).start()
```
