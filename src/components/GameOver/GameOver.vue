<template>
  <view v-if="visible" class="overlay">
    <view class="panel">
      <text class="title">游戏结束</text>
      <text class="meta">本局分数：{{ score }}</text>
      <text class="meta">最高分：{{ bestScore }}</text>
      <button class="btn" @tap="$emit('restart')">再来一局</button>
    </view>
  </view>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  }
})

defineEmits(['restart'])
</script>

<style scoped lang="scss">
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(60, 58, 50, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
  z-index: 31;
  animation: overlay-fade-in 180ms ease-out;
}

.panel {
  width: 100%;
  max-width: 520rpx;
  background: $color-bg;
  border-radius: $radius-md;
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  align-items: center;
  animation: panel-pop-in 220ms ease-out;
}

.title {
  font-size: $font-size-lg;
  font-weight: 700;
  color: $color-text-dark;
}

.meta {
  font-size: $font-size-sm;
  color: $color-primary;
}

.btn {
  width: 100%;
  margin-top: $spacing-sm;
  background: $color-primary;
  color: $color-text-light;
  border: none;
  transition: transform 90ms ease, opacity 90ms ease;
}

.btn::after {
  border: none;
}

.btn:active {
  transform: scale(0.98);
  opacity: 0.92;
}

@keyframes overlay-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes panel-pop-in {
  0% {
    opacity: 0;
    transform: translateY(12rpx) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
