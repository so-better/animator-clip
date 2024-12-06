<template>
	<div style="padding: 20px">
		<button id="btn">按钮</button>
	</div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Animator, Clip } from '../src/index'
onMounted(() => {
	const clip = new Clip({
		style: 'fontSize',
		value: '200px',
		speed: -1,
	})
	console.log(clip);
})

</script>
