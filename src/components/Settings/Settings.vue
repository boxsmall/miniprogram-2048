<template>
  <view v-if="visible" class="overlay" @tap="close">
    <view class="panel" @tap.stop>
      <text class="title">设置</text>

      <view class="setting-row">
        <text class="label">动画效果</text>
        <switch :checked="animation" color="#8F7A66" @change="onAnimationChange" />
      </view>

      <view class="setting-row">
        <text class="label">震动反馈</text>
        <switch :checked="vibrate" color="#8F7A66" @change="onVibrateChange" />
      </view>

      <button class="danger" @tap="onClearBest">清空最高分</button>
      <button class="close" @tap="close">关闭</button>
    </view>
  </view>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  animation: {
    type: Boolean,
    default: true
  },
  vibrate: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:visible',
  'toggle-animation',
  'toggle-vibrate',
  'clear-best'
])

function close() {
  emit('update:visible', false)
}

function onAnimationChange(event) {
  emit('toggle-animation', event.detail.value)
}

function onVibrateChange(event) {
  emit('toggle-vibrate', event.detail.value)
}

function onClearBest() {
  emit('clear-best')
}
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
  z-index: 30;
  animation: overlay-fade-in 180ms ease-out;
}

.panel {
  width: 100%;
  max-width: 560rpx;
  border-radius: $radius-md;
  background: $color-bg;
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  animation: panel-pop-in 220ms ease-out;
}

.title {
  font-size: $font-size-lg;
  font-weight: 700;
  text-align: center;
  color: $color-text-dark;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label {
  font-size: $font-size-sm;
  color: $color-text-dark;
}

.danger,
.close {
  color: $color-text-light;
  border: none;
  transition: transform 90ms ease, opacity 90ms ease;
}

.danger {
  background: #cc5f52;
}

.close {
  background: $color-primary;
}

.danger::after,
.close::after {
  border: none;
}

.danger:active,
.close:active {
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
