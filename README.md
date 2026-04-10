# animator-clip

[![npm](https://img.shields.io/npm/v/animator-clip)](https://www.npmjs.com/package/animator-clip)
[![License](https://img.shields.io/npm/l/animator-clip)](https://github.com/so-better/animator-clip/blob/master/LICENSE)

一个基于 `JavaScript` 的 `requestAnimationFrame API` 封装的轻量级 JS 动画插件。

## 特性

- **高性能**：跟随系统绘制频率执行动画，性能优于传统 `setTimeout` 动画，甚至优于 CSS 动画
- **CPU 节能**：页面未激活时自动暂停渲染，恢复后从断点继续，有效节省 CPU 开销
- **兼容性好**：不支持 `requestAnimationFrame` 的浏览器自动降级为 `setTimeout` 模拟
- **链式调用**：支持 `chain()` 串联多个动画帧，实现顺序动画
- **自由模式**：支持 `transform` 等复合属性动画，完全自定义更新逻辑
- **TypeScript**：完整的类型定义支持

## 安装

```bash
# npm
npm install animator-clip

# 安装指定版本
npm install animator-clip@1.4.10
```

```bash
# yarn
yarn add animator-clip

# 安装指定版本
yarn add animator-clip@1.4.10
```

```bash
# pnpm
pnpm add animator-clip

# 安装指定版本
pnpm add animator-clip@1.4.10
```

### CDN 使用

```html
<!-- 引入固定版本 -->
<script src="https://unpkg.com/animator-clip@1.4.10/lib/animator-clip.umd.js"></script>
<!-- 始终引入最新版本 -->
<script src="https://unpkg.com/animator-clip/lib/animator-clip.umd.js"></script>
```

CDN 引入后通过 `window.AnimatorClip` 获取：

```js
const { Animator, Clip } = window.AnimatorClip
```

## 快速上手

```ts
import { Animator, Clip } from 'animator-clip'

// 创建动画实例，绑定 DOM 元素
const animator = new Animator(el, {
  onComplete(clip, el) {
    console.log('动画完成')
  }
})

// 创建单一动画帧实例
const clip = new Clip({
  style: 'opacity',  // 动画属性
  value: 0,          // 目标值
  speed: -0.01       // 每帧变化量（负数表示减小）
})

// 将 clip 添加到 animator 并开始动画
animator.addClip(clip).start()
```

## 核心 API

### Animator

动画实例，与 DOM 元素绑定，管理多个 `Clip`。

```ts
const animator = new Animator(el, options)
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `el` | `HTMLElement \| string` | 绑定的 DOM 元素或选择器 |
| `options.onStart` | `(clip, el) => void` | 动画开始事件 |
| `options.onStop` | `(clip, el) => void` | 动画停止事件 |
| `options.onReset` | `(clip, el) => void` | 动画重置事件 |
| `options.onBeforeUpdate` | `(clip, el, style?, value?) => void` | 动画帧更新前事件 |
| `options.onUpdate` | `(clip, el, style?, value?) => void` | 动画帧更新时事件 |
| `options.onComplete` | `(clip, el) => void` | 动画完成事件 |

**主要方法：**

| 方法 | 说明 |
| --- | --- |
| `addClip(clip)` | 将 clip 添加到队列 |
| `removeClip(clip)` | 将 clip 移出队列 |
| `removeAllClips()` | 移除所有 clip |
| `getClips()` | 获取正在运行的 clip |
| `getStopClips()` | 获取已停止的 clip |
| `getCompleteClips()` | 获取已完成的 clip |
| `start()` | 开始动画 |
| `stop()` | 停止动画 |
| `reset(resetStyle?)` | 重置动画，`resetStyle` 默认 `true` |

### Clip

单一动画帧，定义具体的动画效果。

```ts
const clip = new Clip(options)
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `options.style` | `keyof CSS.Properties` | 动画属性名，如 `opacity`、`fontSize` |
| `options.value` | `string \| number` | 样式目标值，支持 `px`、`rem`、`em` 单位 |
| `options.speed` | `number` | 每帧变化量，负数表示减小 |
| `options.free` | `boolean` | 是否自由模式，默认 `false` |
| `options.onStart` | `(el) => void` | 动画开始事件 |
| `options.onStop` | `(el) => void` | 动画停止事件 |
| `options.onReset` | `(el) => void` | 动画重置事件 |
| `options.onBeforeUpdate` | `(el, style?, value?) => void` | 帧更新前事件 |
| `options.onUpdate` | `(el, style?, value?) => void` | 帧更新时事件 |
| `options.onComplete` | `(el) => void` | 动画完成事件 |

**主要方法：**

| 方法 | 说明 |
| --- | --- |
| `start()` | 开始该 clip 动画 |
| `stop()` | 停止该 clip 动画 |
| `reset(resetStyle?)` | 重置该 clip 动画 |
| `chain(clip)` | 链式调用，当前动画完成后自动执行下一个 |
| `emitComplete()` | 主动触发完成事件（仅自由模式有效） |

**主要属性：**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `state` | `0 \| 1 \| 2 \| 3` | 动画状态：0初始 / 1进行 / 2停止 / 3完成 |
| `interval` | `number` | 相邻两帧的时间间隔（ms），仅更新事件中有效 |
| `speed` | `number` | 动画速度，可动态修改 |

## 文档

完整文档请访问：[https://www.so-better.cn/docs/animator-clip/](https://www.so-better.cn/docs/animator-clip/)

## License

[MIT](./LICENSE)
