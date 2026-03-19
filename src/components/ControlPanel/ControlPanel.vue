<template>
  <view class="control-panel">
    <button class="btn" @tap="$emit('move', 'up')">上</button>
    <view class="row">
      <button class="btn" @tap="$emit('move', 'left')">左</button>
      <button class="btn" @tap="$emit('move', 'down')">下</button>
      <button class="btn" @tap="$emit('move', 'right')">右</button>
    </view>
    <view class="row">
      <button class="btn secondary" @tap="$emit('restart')">重新开始</button>
      <button class="btn secondary" @tap="$emit('back')">返回首页</button>
    </view>
  </view>
</template>

<script setup>
defineEmits(['move', 'restart', 'back'])
</script>

<style scoped lang="scss">
.control-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.row {
  display: flex;
  gap: $spacing-sm;
}

.btn {
  flex: 1;
  height: 84rpx;
  border-radius: 12rpx;
  background: linear-gradient(180deg, #9b8774 0%, #8a7765 100%);
  color: $color-text-light;
  border: none;
  font-size: $font-size-sm;
  box-shadow: 0 8rpx 14rpx rgba(119, 110, 101, 0.14);
  transition: transform 90ms ease, opacity 90ms ease;
}

.btn::after {
  border: none;
}

.btn:active {
  transform: scale(0.98);
  opacity: 0.92;
}

.secondary {
  background: linear-gradient(180deg, #b2a193 0%, #9f8d7e 100%);
}
</style>
