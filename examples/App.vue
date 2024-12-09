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
		free: true,
		onUpdate(el) {
			if (scale >= 0.1) {
				scale -= 0.01
				el.style.transform = 'scale(' + scale + ')'
			} else {
				//这里动画完成，主动触发onComplete事件，如果该方法不调用，则onComplete事件不会触发，chain方法失效
				clip.value.emitComplete()
			}
		},
		//调用reset方法后触发onReset事件，此时可以设置元素的初始样式来达到恢复的目的
		onReset(el) {
			scale = 1
			el.style.transform = 'scale(' + scale + ')'
		},
		onComplete(el) {
			animator.value.reset()
		}
	})
	//将单一动画帧添加到动画实例中去
	animator.value.addClip(clip.value)
})

</script>
