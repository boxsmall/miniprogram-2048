<template>
  <view
    class="game-board"
    :class="{ pulse: boardPulse && animationEnabled }"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <view v-for="(row, rowIndex) in rows" :key="`row-${rowIndex}`" class="row">
      <Tile
        v-for="(cell, colIndex) in row"
        :key="`tile-${rowIndex}-${colIndex}`"
        :value="cell"
        :animated="animationEnabled"
      />
    </view>
  </view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Tile from '../Tile/Tile.vue'

const props = defineProps({
  grid: {
    type: Array,
    default: () => []
  },
  animationEnabled: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['move'])
const touchStartX = ref(0)
const touchStartY = ref(0)
const boardPulse = ref(false)
let pulseTimer = null
let pulseOffTimer = null

const rows = computed(() => {
  const result = []
  for (let i = 0; i < 16; i += 4) {
    result.push(props.grid.slice(i, i + 4))
  }
  return result
})

function onTouchStart(event) {
  const touch = event.changedTouches?.[0]
  if (!touch) {
    return
  }

  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
}

function onTouchEnd(event) {
  const touch = event.changedTouches?.[0]
  if (!touch) {
    return
  }

  const deltaX = touch.clientX - touchStartX.value
  const deltaY = touch.clientY - touchStartY.value
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)
  const threshold = 40

  if (absX < threshold && absY < threshold) {
    return
  }

  if (absX > absY) {
    emit('move', deltaX > 0 ? 'right' : 'left')
    return
  }

  emit('move', deltaY > 0 ? 'down' : 'up')
}

watch(
  () => props.grid.join(','),
  () => {
    if (!props.animationEnabled) {
      return
    }

    boardPulse.value = false
    clearTimeout(pulseTimer)
    clearTimeout(pulseOffTimer)

    pulseTimer = setTimeout(() => {
      boardPulse.value = true
      pulseOffTimer = setTimeout(() => {
        boardPulse.value = false
      }, 120)
    }, 0)
  }
)

onBeforeUnmount(() => {
  clearTimeout(pulseTimer)
  clearTimeout(pulseOffTimer)
})
</script>

<style scoped lang="scss">
.game-board {
  background: $color-grid-bg;
  padding: $spacing-sm;
  border-radius: $radius-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  touch-action: none;
}

.game-board.pulse {
  animation: board-pulse 120ms ease-out;
}

.row {
  display: flex;
  gap: $spacing-sm;
}

@keyframes board-pulse {
  0% {
    transform: scale(0.985);
  }

  100% {
    transform: scale(1);
  }
}
</style>
