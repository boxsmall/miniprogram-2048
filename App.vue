<template>
  <view class="app-root">
    <slot />
  </view>
</template>

<script>
export default {
  onLaunch() {
    // App-level startup hook for future initialization.
  }
}
</script>

<style lang="scss">
@import './uni.scss';

page {
  background: $color-bg;
  color: $color-text-dark;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.app-root {
  min-height: 100vh;
}
</style>
