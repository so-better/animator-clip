<template>
	<div style="padding: 20px">
		<button id="btn">按钮</button>
	</div>
</template>
<script>
import { Animator, Clip } from '../src'
export default {
	mounted() {
		const animator = new Animator('#btn')
		const clip = new Clip({
			style: 'opacity',
			speed: -0.004,
			value: 0
		})
		animator.addClip(clip).start()
	}
}
</script>
<style lang="less"></style>
