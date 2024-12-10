---
lastUpdated: false
aside: false
layout: page
title: 演示
---

<div :class="$style.wrapper">
  <div :class="$style.menus">
    <div style="margin-right: 10px;" :class="$style.button">动画：</div>
    <div :class="$style.button"><button class="demo-button" @click="doOpacity">渐变</button></div>
    <div :class="$style.button"><button class="demo-button" @click="doTranslate">偏移</button></div>
    <div :class="$style.button"><button class="demo-button" @click="doWidth">宽度</button></div>
    <div :class="$style.button"><button class="demo-button" @click="doHeight">高度</button></div>
    <div :class="$style.button"><button class="demo-button" @click="doRadius">圆角</button></div>
    <div :class="$style.button"><button class="demo-button" @click="doRoll">滚动</button></div>
    <div :class="$style.button"><button class="demo-button" @click="doScale">缩放</button></div>
    <div :class="$style.button"><button class="demo-button" @click="doSkew">倾斜</button></div>
    <div :class="$style.button"><button class="demo-button" @click="doMultiple">同时多个动画</button></div>
    <div :class="$style.button"><button class="demo-button" @click="doChain">链式动画</button></div>
  </div>
  <div ref="area" :class="$style.area">
    <div ref="el" :class="$style.el"></div>
  </div>
</div>

<script setup lang="ts">
  import { ref, computed, onMounted } from "vue"
  import { Animator,Clip } from "../lib/animator-clip.es"
  const el = ref<HTMLElement | undefined>()
  const area = ref<HTMLElement | undefined>()
  const animator = ref<Animator | undefined>()

  onMounted(()=>{
    animator.value = new Animator(el.value)
  })

  const doOpacity = ()=>{
    animator.value.reset()
    animator.value.removeAllClips()
    const clip = new Clip({
      style:'opacity',
      speed:-0.005,
      value:0,
      onComplete(){
        this.reset()
        animator.value.removeClip(this)
      }
    })
    animator.value.addClip(clip).start()
  }

  const doTranslate = ()=>{
    animator.value.reset()
    animator.value.removeAllClips()
    const clip = new Clip({
      style:'left',
      speed: 5,
      value: `${area.value.offsetWidth - el.value.offsetWidth}px`,
      onComplete(){
        this.reset()
        animator.value.removeClip(this)
      }
    })
    animator.value.addClip(clip).start()
  }

  const doWidth = ()=>{
    animator.value.reset()
    animator.value.removeAllClips()
    const clip = new Clip({
      style:'width',
      speed: 5,
      value: `${area.value.offsetWidth}px`,
      onComplete(){
        this.reset()
        animator.value.removeClip(this)
      }
    })
    animator.value.addClip(clip).start()
  }

  const doHeight = ()=>{
    animator.value.reset()
    animator.value.removeAllClips()
    const clip = new Clip({
      style:'height',
      speed: 5,
      value: `${area.value.offsetHeight}px`,
      onComplete(){
        this.reset()
        animator.value.removeClip(this)
      }
    })
    animator.value.addClip(clip).start()
  }

  const doRadius = ()=>{
    animator.value.reset()
    animator.value.removeAllClips()
    const clip = new Clip({
      style:'border-radius',
      speed: 0.1,
      value: `20px`,
      onComplete(){
        this.reset()
        animator.value.removeClip(this)
      }
    })
    animator.value.addClip(clip).start()
  }

  const doRoll = ()=>{
    animator.value.reset()
    animator.value.removeAllClips()
    let rotate = 0
    const clip = new Clip({
      free:true,
      onComplete(){
        this.reset()
        animator.value.removeClip(this)
      },
      onUpdate(el) {
        rotate += 10
        el.style.transform = 'rotate(' + rotate + 'deg)'
      },
      onReset(el) {
        rotate = 0
        el.style.transform = 'rotate(' + rotate + 'deg)'
      }
    })
    const clip2 = new Clip({
      style:'left',
      speed: 1,
      value: `${area.value.offsetWidth - el.value.offsetWidth}px`,
      onComplete(){
        clip.emitComplete()
        this.reset()
        animator.value.removeClip(this)
      }
    })
    animator.value.addClip(clip).addClip(clip2).start()
  }

  const doScale = ()=>{
    animator.value.reset()
    animator.value.removeAllClips()
    let scale = 1
    const clip = new Clip({
      free:true,
      onComplete(){
        this.reset()
        animator.value.removeClip(this)
      },
      onUpdate(el) {
        if (scale >= 0.1) {
          scale -= 0.01
          el.style.transform = 'scale(' + scale + ')'
        } else {
          clip.emitComplete()
        }
      },
      onReset(el) {
        scale = 1
        el.style.transform = 'scale(' + scale + ')'
      }
    })
    animator.value.addClip(clip).start()
  }

  const doSkew = ()=>{
    animator.value.reset()
    animator.value.removeAllClips()
    let skew = 0
    const clip = new Clip({
      free:true,
      onComplete(){
        this.reset()
        animator.value.removeClip(this)
      },
      onUpdate(el) {
        if (skew > -45) {
          skew -= 0.2
          el.style.transform = 'skewX(' + skew + 'deg)'
        } else {
          clip.emitComplete()
        }
      },
      onReset(el) {
        skew = 0
         el.style.transform = 'skewX(' + skew + 'deg)'
      }
    })
    animator.value.addClip(clip).start()
  }

  const doMultiple = ()=>{
    animator.value.reset()
    animator.value.removeAllClips()
    const clip = new Clip({
      style:'opacity',
      speed:-0.005,
      value:0,
      onComplete(){
        this.reset()
        animator.value.removeClip(this)
      }
    })
    const clip2 = new Clip({
      style:'left',
      speed: 5,
      value: `${area.value.offsetWidth - el.value.offsetWidth}px`,
      onComplete(){
        this.reset()
        animator.value.removeClip(this)
      }
    })
    const clip3 = new Clip({
      style:'height',
      speed: 5,
      value: `${area.value.offsetHeight}px`,
      onComplete(){
        this.reset()
        animator.value.removeClip(this)
      }
    })
    animator.value.addClip(clip).addClip(clip2).addClip(clip3).start()
  }

  const doChain = ()=>{
    animator.value.reset()
    animator.value.removeAllClips()
    const clip = new Clip({
      style:'left',
      speed: 5,
      value: `${area.value.offsetWidth - el.value.offsetWidth}px`
    })
    const clip2 = new Clip({
      style:'height',
      speed: 5,
      value: `${area.value.offsetHeight}px`,
    })
    const clip3 = new Clip({
      style:'opacity',
      speed:-0.005,
      value:0,      
      onComplete(){
        animator.value.reset()
        animator.value.removeClip(this)
      }
    })
    clip.chain(clip2).chain(clip3)
    animator.value.addClip(clip).start()
  }
</script>
<style module>
  .wrapper {
    display:flex;
    justify-content:flex-start;
    flex-direction:column;
    padding:10px;
    width:100%;
    height:calc(100vh - 64px);
  }

  .menus {
    display:flex;
    justify-content:flex-start;
    align-items:center;
    width:100%;
    flex-wrap:wrap;
    margin-bottom:10px;
  }

  .area {
    display:block;
    width:100%;
    flex:1;
    position:relative;
  }

  .button {
    padding: 5px;
  }

  .el {
    display:block;
    width:40px;
    height:40px;
    background:#000;
    position:absolute;
    left:0;
    top:0;
  }
</style>
