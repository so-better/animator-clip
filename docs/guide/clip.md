---
title: Clip 单一动画帧实例
---

# Clip 单一动画帧实例

> clip 对象用来定义每一种动画效果，必须加入到 animator 实例后才会发挥效果

## 创建一个单一动画帧实例

通过 `new` 一个 `Clip` 实例类型来创建动画帧实例

```ts
const clip = new Clip(options)
```

`options` 是 `Clip` 的构造参数，表示动画帧的配置

## 构造参数

##### options <Badge type="danger" text="ClipOptionsType" />

表示实例的相关配置，目标接受以下属性：

- style <Badge type="danger" text="keyof CSS.Properties" />

  动画的样式名称，如 `opacity`、`fontSize`、`lineHeight` 等

- value <Badge type="danger" text="string | number" />

  动画的样式的最终值

- speed <Badge type="danger" text="number" />

  动画速度，即动画的样式每一帧改变的量，如果是从大到小的变化，这个值需要为负数

- free <Badge type="danger" text="boolean" />

  是否自由模式，自由模式下 `style`、`value`、`speed` 通通无需设置，即使设置了也无效，具体使用详见[自由模式](/guide/free)

- onStart <Badge type="danger" text="(this: Clip, el: HTMLElement) => void" />

  动画开始事件，回调参数为绑定的 `dom` 元素

- onStop <Badge type="danger" text="(this: Clip, el: HTMLElement) => void" />

  动画停止事件，回调参数为绑定的 `dom` 元素

- onReset <Badge type="danger" text="(this: Clip, el: HTMLElement) => void" />

  动画重置事件，回调参数为绑定的 `dom` 元素

- onBeforeUpdate <Badge type="danger" text="(this: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: string | number) => void" />

  动画更新前触发事件，此时该帧的样式还未改变，回调参数依次为绑定的 `dom` 元素、元素动画相关的样式和元素动画更新时还未改变的值

- onUpdate <Badge type="danger" text="(this: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: string | number) => void" />

  动画更新时触发事件，此时该帧的样式已经改变，回调参数依次为绑定的 `dom` 元素、元素动画相关的样式和元素动画更新时已经改变的值

- onComplete <Badge type="danger" text="(this: Clip, el: HTMLElement) => void" />

  动画完成事件，回调参数为绑定的 `dom` 元素

## API

##### speed

动画速度

- 类型

  ```ts
  speed: number
  ```

- 详细信息

  `speed` 是 `clip` 的属性，表示动画速度，可以获取，也可以直接修改，并即时生效

- 示例

  ```ts
  clip.speed = 5 //修改speed
  ```

##### state

动画状态

- 类型

  ```ts
  state: 0 | 1 | 2 | 3
  ```

- 详细信息

  `state` 是 `clip` 的属性，表示 `clip` 的状态，`0` 为动画初始状态，`1` 为动画进行状态，`2` 为动画停止状态，`3` 为动画完成状态，可以修改此值，但需要谨慎修改，否则会影响动画进行

- 示例

  ```ts
  console.log(clip.state) // 2
  ```

##### interval

动画帧时间间隔

- 类型

  ```ts
  interval: number
  ```

- 详细信息

  该属性只能在 `onUpdate` 或者 `onBeforeUpdate` 事件里获取到值，其余情况为 `0`，表示此时此刻记录的与上一次动画帧发生的时间间隔，单位 `ms`，该属性能侧面的反映屏幕的刷新率水平，该值不能修改

- 示例

  ```ts
  console.log(clip.inertval) // 0
  ```

##### start()

开始动画

- 类型

  ```ts
  start(): this
  ```

- 详细信息

  开始该 `clip` 动画，该方法返回 `clip` 对象

- 示例

  ```ts
  clip.start()
  ```

##### stop()

停止动画

- 类型

  ```ts
  stop(): this
  ```

- 详细信息

  停止该 `clip` 动画，该方法返回 `clip` 对象

- 示例

  ```ts
  clip.stop()
  ```

##### reset()

重置动画

- 类型

  ```ts
  reset(resetStyle?: boolean): this
  ```

- 详细信息

  提供一个入参，类型为 `boolean`，默认为 `true`，表示是否将元素恢复到初始样式，如果为 `false` 则只是针对 `Clip` 实例进行重置

  调用该方法重置该 `clip` 动画，如果该 `clip` 是 `chain` 型则会从 `animator` 中移除，该方法返回 `clip` 对象

- 示例

  ```ts
  clip.reset()
  ```

##### chain()

链式调用动画

- 类型

  ```ts
  chain(clip: Clip): Clip
  ```

- 详细信息

  提供一个入参，类型为 `Clip`，表示需要链式调用的单一动画帧实例

  该方法会在当前的单一动画帧实例完成后将该 `Clip` 添加到当前单一动画帧实例所在的 `animator` 实例中并执行，该方法返回该 `Clip` 实例

- 示例

  ```ts
  clip.chain(clip2)
  clip.start()
  //当clip执行完毕后会自动接着执行clip2的动画
  ```

##### emitComplete()

主动触发完成事件

- 类型

  ```ts
  emitComplete(): void
  ```

- 详细信息

  主动触发 `Clip` 实例的 `onComplete` 事件，该方法仅在自由模式下生效

- 示例

  ```ts
  clip.emitComplete()
  ```
