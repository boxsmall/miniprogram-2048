<template>
  <view class="game-page">
    <view class="game-card">
      <view class="header">
        <text class="title">2048</text>
        <button class="settings-btn" @tap="openSettings">设置</button>
      </view>

      <ScoreBoard :score="score" :best-score="bestScore" />
      <GameBoard
        :grid="grid"
        :animation-enabled="animationEnabled"
        @move="handleMove"
      />

      <ControlPanel
        @move="handleMove"
        @restart="restartGame"
        @back="backToHome"
      />
    </view>

    <WinDialog
      :visible="winDialogVisible"
      :score="score"
      :best-score="bestScore"
      @continue="continueAfterWin"
      @restart="restartGame"
    />

    <GameOver
      :visible="gameOver"
      :score="score"
      :best-score="bestScore"
      @restart="restartGame"
    />

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
import { computed, onBeforeUnmount, ref } from 'vue'
import { useGameStore } from '../../store/game'
import ScoreBoard from '../../components/ScoreBoard/ScoreBoard.vue'
import GameBoard from '../../components/GameBoard/GameBoard.vue'
import ControlPanel from '../../components/ControlPanel/ControlPanel.vue'
import WinDialog from '../../components/WinDialog/WinDialog.vue'
import GameOver from '../../components/GameOver/GameOver.vue'
import Settings from '../../components/Settings/Settings.vue'

const gameStore = useGameStore()
const settingsVisible = ref(false)
const moveLocked = ref(false)
let moveLockTimer = null

const score = computed(() => gameStore.score)
const bestScore = computed(() => gameStore.bestScore)
const gameOver = computed(() => gameStore.gameOver)
const winDialogVisible = computed(() => gameStore.winDialogVisible)
const grid = computed(() => gameStore.grid)
const animationEnabled = computed(() => gameStore.settings.animation)
const vibrateEnabled = computed(() => gameStore.settings.vibrate)

function releaseMoveLock() {
  moveLocked.value = false
  clearTimeout(moveLockTimer)
  moveLockTimer = null
}

function handleMove(direction) {
  if (moveLocked.value) {
    return
  }

  const moved = gameStore.move(direction)
  if (!moved) {
    return
  }

  if (vibrateEnabled.value) {
    try {
      uni.vibrateShort()
    } catch (error) {
      // Some platforms may not support vibration.
    }
  }

  moveLocked.value = true
  const lockDuration = animationEnabled.value ? 120 : 40
  clearTimeout(moveLockTimer)
  moveLockTimer = setTimeout(() => {
    moveLocked.value = false
    moveLockTimer = null
  }, lockDuration)
}

function restartGame() {
  gameStore.startGame()
  releaseMoveLock()
}

function continueAfterWin() {
  gameStore.continueAfterWin()
}

function backToHome() {
  uni.navigateBack()
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

onBeforeUnmount(() => {
  clearTimeout(moveLockTimer)
})
</script>

<style scoped lang="scss">
.game-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36rpx;
  background: linear-gradient(180deg, #fdfbf8 0%, #f4eee7 100%);
}

.game-card {
  width: 100%;
  max-width: 690rpx;
  border-radius: 24rpx;
  padding: 28rpx;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 18rpx 44rpx rgba(119, 110, 101, 0.14);
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 60rpx;
  font-weight: 800;
  color: $color-text-dark;
}

.settings-btn {
  height: 66rpx;
  line-height: 66rpx;
  padding: 0 20rpx;
  border-radius: 12rpx;
  border: none;
  background: linear-gradient(180deg, #a99889 0%, #978577 100%);
  color: $color-text-light;
  font-size: $font-size-xs;
  transition: transform 90ms ease, opacity 90ms ease;
}

.settings-btn::after {
  border: none;
}

.settings-btn:active {
  transform: scale(0.98);
  opacity: 0.92;
}
</style>
