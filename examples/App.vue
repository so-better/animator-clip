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
	animator.value = new Animator('#btn', {
		onComplete() {
			animator.value?.reset()
		}
	})
	clip.value = new Clip({
		style: 'opacity',
		speed: -0.004,
		value: 0
	})
	animator.value?.addClip(clip.value)
})

</script>
