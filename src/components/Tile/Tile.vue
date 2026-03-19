<template>
  <view class="tile" :class="tileClasses" :style="tileStyle">
    <text v-if="value > 0" class="tile-text" :style="textStyle">{{ value }}</text>
  </view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  animated: {
    type: Boolean,
    default: true
  }
})

const tilePalette = {
  0: { bg: '#CDC1B4', text: '#CDC1B4' },
  2: { bg: '#EEE4DA', text: '#776E65' },
  4: { bg: '#EDE0C8', text: '#776E65' },
  8: { bg: '#F2B179', text: '#F9F6F2' },
  16: { bg: '#F59563', text: '#F9F6F2' },
  32: { bg: '#F67C5F', text: '#F9F6F2' },
  64: { bg: '#F65E3B', text: '#F9F6F2' },
  128: { bg: '#EDCF72', text: '#F9F6F2' },
  256: { bg: '#EDCC61', text: '#F9F6F2' },
  512: { bg: '#EDC850', text: '#F9F6F2' },
  1024: { bg: '#EDC53F', text: '#F9F6F2' },
  2048: { bg: '#EDC22E', text: '#F9F6F2' }
}

const colorSet = computed(() => tilePalette[props.value] || { bg: '#3C3A32', text: '#F9F6F2' })
const pop = ref(false)
let popTimer = null

const tileStyle = computed(() => ({
  backgroundColor: colorSet.value.bg
}))

const textStyle = computed(() => ({
  color: colorSet.value.text
}))

const tileClasses = computed(() => ({
  filled: props.value > 0,
  pop: pop.value,
  animated: props.animated
}))

watch(
  () => props.value,
  (next, prev) => {
    if (!props.animated || next <= 0 || next === prev) {
      return
    }

    pop.value = false
    clearTimeout(popTimer)
    popTimer = setTimeout(() => {
      pop.value = true
      setTimeout(() => {
        pop.value = false
      }, 120)
    }, 0)
  }
)

onBeforeUnmount(() => {
  clearTimeout(popTimer)
})
</script>

<style scoped lang="scss">
.tile {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 120ms linear, transform 120ms ease;
}

.tile-text {
  font-size: $font-size-md;
  font-weight: 700;
  line-height: 1;
  transition: color 120ms linear;
}

.tile.animated.pop {
  animation: tile-pop 120ms ease-out;
}

@keyframes tile-pop {
  0% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
  }
}
</style>
