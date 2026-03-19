<template>
  <view class="score-board">
    <view class="score-box">
      <text class="label">分数</text>
      <text class="value">{{ score }}</text>
    </view>
    <view class="score-box">
      <text class="label">最高分</text>
      <text class="value">{{ bestScore }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  score: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped lang="scss">
.score-board {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: $spacing-sm;
}

.score-box {
  flex: 1;
  min-width: 180rpx;
  padding: 14rpx 16rpx;
  border-radius: 14rpx;
  background: linear-gradient(180deg, #b7a89b 0%, #a89789 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 6rpx 14rpx rgba(119, 110, 101, 0.16);
}

.label {
  font-size: $font-size-xs;
  color: $color-text-light;
}

.value {
  font-size: 42rpx;
  font-weight: 700;
  color: $color-text-light;
  line-height: 1.1;
}
</style>
