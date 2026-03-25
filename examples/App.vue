<template>
  <div style="padding: 20px">
    <button id="btn" @click="animator?.start()">按钮</button>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Animator, Clip } from '../src/index'
const animator = ref<Animator | undefined>()
const clip = ref<Clip | undefined>()
onMounted(() => {
  //定义元素的初始属性值
  let scale = 1
  //创建animator实例
  animator.value = new Animator('#btn')
  //创建单一动画帧实例，设置free模式
  clip.value = new Clip({
    style: 'opacity',
    speed: -0.005,
    value: 0
  })
  //将单一动画帧添加到动画实例中去
  animator.value.addClip(clip.value)
})
</script>
