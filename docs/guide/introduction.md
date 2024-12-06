---
title: 简介
---

# 简介

## 基本介绍

`animator-clip` 是一个基于 `JavaScript` 的 `requestAnimationFrame API` 封装的轻量级 `JS` 动画插件，在不支持 `requestAnimationFrame` `语法的浏览器中，animator-clip` 能够使用 `setTimeout` 模拟做到兼容，可以放心在这类浏览器中使用。

尽量在现代浏览器中使用此插件，对于 `IE` 等老旧浏览器，本插件尚未进行测试

## 基于 RequestAnimationFrame 动画的特点

- 由系统来决定回调函数（即动画函数）的执行

  简单来说就是，系统每次绘制之前会主动调用动画函数

  如果系统绘制率是  60Hz，那么动画函数就每 16.7ms  被执行一次，如果绘制频率是 75Hz，那么这个间隔时间就变成了  1000/75=13.3ms，换句话说就是，动画函数的执行步伐跟着系统的绘制频率走

- 性能优异

  一般的 `JS` 动画或者 `Jquery` 动画性能较差，在移动端会有明显的卡顿，而 `requestAnimationFrame` 动画不会，甚至性能优于 `css` 动画，且容易控制

- CPU 节能

  使用 ` setTimeout ` 实现的动画，当页面被隐藏或最小化时，`setTimeout` 仍然在后台执行动画任务，由于此时页面处于不可见或不可用状态，刷新动画是没有意义的，而且还浪费 `CPU` 资源。而 `requestAnimationFrame` 则完全不同，当页面处理未激活的状态下，该页面的屏幕绘制任务也会被系统暂停，因此跟着系统步伐走的 `requestAnimationFrame` 也会停止渲染，当页面被激活时，动画就从上次停留的地方继续执行，有效节省了  CPU  开销

- 函数节流

  在高频率事件(`resize` `scroll`等)中，为了防止在一个刷新间隔内发生多次函数执行，使用 `requestAnimationFrame` 可保证每个绘制间隔内，函数只被执行一次，这样既能保证流畅性，也能更好的节省函数执行的开销

  一个绘制间隔内函数执行多次是没有意义的，因为显示器每 `16.7ms`  绘制一次，多次绘制并不会在屏幕上体现出来