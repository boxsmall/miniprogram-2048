<template>
  <view class="loading-page">
    <view class="logo">2048</view>
    <view class="progress-shell">
      <view class="progress-bar" />
    </view>
    <text class="hint">载入中...</text>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/index/index'
    })
  }, 800)
})
</script>

<style scoped lang="scss">
.loading-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  padding: 48rpx;
  background: radial-gradient(circle at 50% 30%, #fffaf4 0%, #f2e8dc 100%);
}

.logo {
  font-size: 86rpx;
  font-weight: 800;
  color: $color-text-dark;
  animation: title-breathe 1100ms ease-in-out infinite alternate;
}

.progress-shell {
  width: 360rpx;
  height: 18rpx;
  border-radius: 999rpx;
  background: rgba(187, 173, 160, 0.35);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  width: 42%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #d1c3b6 0%, #8f7a66 100%);
  animation: loading-slide 900ms ease-in-out infinite;
}

.hint {
  font-size: $font-size-sm;
  color: #8f7a66;
}

@keyframes title-breathe {
  0% {
    transform: scale(0.98);
    opacity: 0.86;
  }

  100% {
    transform: scale(1.02);
    opacity: 1;
  }
}

@keyframes loading-slide {
  0% {
    transform: translateX(-140%);
  }

  100% {
    transform: translateX(340%);
  }
}
</style>
