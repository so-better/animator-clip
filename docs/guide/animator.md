---
title: Animator 动画实例
---

# Animator 动画实例

> Animator 对象是 animator-clip 中唯一与 dom 绑定的对象，用以执行该 dom 的动画效果

## 创建一个动画实例

通过 `new` 一个 `Animator` 实例类型来创建动画

```ts
const animator = new Animator(el, [options])
```

其中 `el` 和 `options` 是 `Animator` 的构造参数，分别表示绑定的 `dom` 元素和配置

## 构造参数

##### el <Badge type="danger" text="HTMLElement | string" />

动画实例绑定的 `dom` 元素，如果是字符串，则表示 `dom` 元素的选择器

所有的动画效果都是围绕着该元素来执行的

##### options <Badge type="danger" text="AnimatorOptionsType" />

表示实例的相关配置，目标接受以下属性：

- onStart <Badge type="danger" text="(this: Animator, clip: Clip, el: HTMLElement) => void" />

  动画开始事件，`animator` 的每个 `clip` 动画开始执行时都会触发此事件，回调参数依次为 `clip` 实例和绑定的 `dom` 元素

- onStop <Badge type="danger" text="(this: Animator, clip: Clip, el: HTMLElement) => void" />

  动画停止事件，`animator` 的每个 `clip` 动画停止执行时都会触发此事件，回调参数依次为 `clip` 实例和绑定的 `dom` 元素

- onReset <Badge type="danger" text="(this: Animator, clip: Clip, el: HTMLElement) => void" />

  动画重置事件，`animator` 的每个 `clip` 动画重置执行时都会触发此事件，回调参数依次为 `clip` 实例和绑定的 `dom` 元素

- onBeforeUpdate <Badge type="danger" text="(this: Animator, clip: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: number) => void" />

  动画更新前触发事件，`animator` 的每个 `clip` 动画更新帧时都会触发此事件，此时该帧的样式还未改变，回调参数依次为 `clip` 实例、绑定的 `dom` 元素、元素动画相关的样式和元素动画更新时还未改变的值

- onUpdate <Badge type="danger" text="(this: Animator, clip: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: number) => void" />

  动画更新时触发事件，`animator` 的每个 `clip` 动画更新帧时都会触发此事件，此时该帧的样式已经改变，回调参数依次为 `clip` 实例、绑定的 `dom` 元素、元素动画相关的样式和元素动画更新时已经改变的值

- onComplete <Badge type="danger" text="(this: Animator, clip: Clip, el: HTMLElement) => void" />

  动画完成事件，`animator` 的每个 `clip` 动画完成时都会触发此事件，回调参数依次为 `clip` 实例和绑定的 `dom` 元素

## API

##### hasClip()

判断是否包含某个 `clip`

- 类型

  ```ts
  hasClip(clip: Clip): boolean
  ```

- 详细信息

  提供一个入参，类型为 `Clip`，该方法会判断入参是否已经添加到该动画实例了，返回 `boolean` 值

- 示例

  ```ts
  const animator = new Animator(el)
  const clip = new Clip({
    style: 'opacity',
    value: 0,
    speed: -0.01
  })
  const hasClip = animator.hasClip(clip) //false
  ```

##### addClip()

将 `clip` 添加到队列

- 类型

  ```ts
  addClip(clip: Clip): this
  ```

- 详细信息

  提供一个入参，类型为 `Clip`，表示需要添加到动画实例的单一动画帧实例，该方法会返回该动画实例自身，可用于链式调用

- 代码示例

  ```ts
  const animator = new Animator(el)
  const clip = new Clip({
    style: 'opacity',
    value: 0,
    speed: -0.01
  })
  animator.addClip(clip)
  ```

##### removeClip()

将 `clip` 移出队列

- 类型

  ```ts
  removeClip(clip: Clip): this
  ```

- 详细信息

  提供一个入参，类型为 `Clip`，表示需要从动画实例移除的单一动画帧实例，该方法会返回该动画实例自身，可用于链式调用

- 示例

  ```ts
  const animator = new Animator(el)
  const clip = new Clip({
    style: 'opacity',
    value: 0,
    speed: -0.01
  })
  animator.addClip(clip)
  setTimeout(() => {
    animator.removeClip(clip)
  }, 2000)
  ```

##### removeAllClips()

移除全部 clip

- 类型

  ```ts
  removeAllClips(): this
  ```

- 详细信息

  该方法会移除当前动画实例内的所有的单一动画帧实例 `Clip`，返回该动画实例自身，可用于链式调用

- 示例

  ```ts
  //移除animator内的所有clip
  animator.removeAllClips()
  ```

##### getClips()

获取正在运行的 `clip`

- 类型

  ```ts
  getClips(): Clip[]
  ```

- 详细信息

  该方法会返回该动画实例内的所有正在运行的单一动画帧实例

- 示例

  ```ts
  const clips = animator.getClips()
  ```

##### getStopClips()

获取停止状态的 `clip`

- 类型

  ```ts
  getStopClips(): Clip[]
  ```

- 详细信息

  该方法会返回该动画实例内的所有已停止的单一动画帧实例

- 示例

  ```ts
  const clips = animator.getStopClips()
  ```

##### getCompleteClips()

获取完成状态的 `clip`

- 类型

  ```ts
  getCompleteClips(): Clip[]
  ```

- 详细信息

  该方法会返回该动画实例内的所有已完成的单一动画帧实例

- 示例

  ```ts
  const clips = animator.getCompleteClips()
  ```

##### start()

开始动画

- 类型

  ```ts
  start(): this
  ```

- 详细信息

  调用该方法开始进行动画，该方法会依次执行队列中所有的 `Clip` 实例的 `start` 方法，同时返回该动画实例自身，可用于链式调用

- 示例

  ```ts
  animator.start()
  ```

##### stop()

停止动画

- 类型

  ```ts
  stop(): this
  ```

- 详细信息

  调用该方法停止动画，该方法会依次执行队列中所有的 `Clip` 实例的 `stop` 方法，同时返回该动画实例自身，可用于链式调用

- 示例

  ```ts
  animator.stop()
  ```

##### reset()

重置动画

- 类型

  ```ts
  reset(resetStyle?: boolean): this
  ```

- 详细信息

  提供一个入参，类型为 `boolean`，默认为 `true`，表示是否将元素恢复到初始样式，如果为 `false` 则只是针对 `Clip` 实例进行重置

  调用该方法重置动画，该方法会依次执行队列中所有的 `Clip` 实例的 `reset` 方法，然后移除 `chain` 型 `Clip` 实例，同时返回该动画实例自身，可用于链式调用

- 示例

  ```ts
  animator.reset()
  ```
