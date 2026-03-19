<template>
  <view class="home-page">
    <view class="hero-card">
      <text class="title">2048</text>
      <text class="subtitle">滑动合并数字，冲击更高分</text>

      <view class="score-card">
        <text class="score-label">历史最高</text>
        <text class="score-value">{{ bestScore }}</text>
      </view>

      <button class="start-btn" @tap="startGame">开始游戏</button>
      <button class="settings-btn" @tap="openSettings">游戏设置</button>
    </view>

    <Settings
      :visible="settingsVisible"
      :animation="animationEnabled"
      :vibrate="vibrateEnabled"
      @update:visible="settingsVisible = $event"
      @toggle-animation="toggleAnimation"
      @toggle-vibrate="toggleVibrate"
      @clear-best="clearBestScore"
    />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useGameStore } from '../../store/game'
import Settings from '../../components/Settings/Settings.vue'

const gameStore = useGameStore()
const settingsVisible = ref(false)

const bestScore = computed(() => gameStore.bestScore)
const animationEnabled = computed(() => gameStore.settings.animation)
const vibrateEnabled = computed(() => gameStore.settings.vibrate)

function startGame() {
  gameStore.startGame()
  uni.navigateTo({
    url: '/pages/game/game'
  })
}

function openSettings() {
  settingsVisible.value = true
}

function toggleAnimation(enabled) {
  gameStore.toggleAnimation(enabled)
}

function toggleVibrate(enabled) {
  gameStore.toggleVibrate(enabled)
}

function clearBestScore() {
  gameStore.clearBestScore()
}
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56rpx;
  background: linear-gradient(180deg, #fdfbf8 0%, #f4eee7 100%);
}

.hero-card {
  width: 100%;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 20rpx 50rpx rgba(119, 110, 101, 0.12);
  backdrop-filter: blur(4px);
  padding: 48rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22rpx;
}

.title {
  font-size: 84rpx;
  font-weight: 800;
  color: $color-text-dark;
  letter-spacing: 1rpx;
}

.subtitle {
  font-size: $font-size-sm;
  color: #8f7a66;
}

.score-card {
  width: 100%;
  border-radius: $radius-md;
  background: #bbada0;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-label {
  font-size: $font-size-xs;
  color: $color-text-light;
}

.score-value {
  font-size: 58rpx;
  font-weight: 700;
  color: $color-text-light;
  line-height: 1.1;
}

.start-btn,
.settings-btn {
  width: 100%;
  border: none;
  border-radius: 14rpx;
  color: $color-text-light;
  font-size: $font-size-sm;
  transition: transform 90ms ease, opacity 90ms ease;
}

.start-btn {
  background: #8f7a66;
}

.settings-btn {
  background: #a79585;
}

.start-btn::after,
.settings-btn::after {
  border: none;
}

.start-btn:active,
.settings-btn:active {
  transform: scale(0.98);
  opacity: 0.92;
}
</style>
