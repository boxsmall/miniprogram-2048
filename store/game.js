import { defineStore } from 'pinia'
import { createInitialGrid, isGameOver, moveGrid } from '../utils/game'

const BEST_SCORE_KEY = 'bestScore'
const SETTING_ANIMATION_KEY = 'setting_animation'
const SETTING_VIBRATE_KEY = 'setting_vibrate'
const WIN_VALUE = 2048

function readStorage(key, fallback) {
  try {
    const value = uni.getStorageSync(key)
    return value === '' || value === null || value === undefined ? fallback : value
  } catch (error) {
    return fallback
  }
}

function readBooleanStorage(key, fallback) {
  const value = readStorage(key, fallback)
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true
    }
    if (value.toLowerCase() === 'false') {
      return false
    }
  }
  return Boolean(value)
}

function writeStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
  } catch (error) {
    // Ignore storage write errors in scaffold phase.
  }
}

export const useGameStore = defineStore('game', {
  state: () => ({
    grid: createInitialGrid(),
    score: 0,
    bestScore: Number(readStorage(BEST_SCORE_KEY, 0)),
    gameOver: false,
    winReached: false,
    winDialogVisible: false,
    settings: {
      animation: readBooleanStorage(SETTING_ANIMATION_KEY, true),
      vibrate: readBooleanStorage(SETTING_VIBRATE_KEY, true)
    }
  }),
  actions: {
    startGame() {
      this.grid = createInitialGrid()
      this.score = 0
      this.gameOver = false
      this.winReached = false
      this.winDialogVisible = false
    },
    resetGame() {
      this.startGame()
    },
    move(direction) {
      if (this.gameOver || this.winDialogVisible) {
        return false
      }

      const result = moveGrid(this.grid, direction)
      if (!result.moved) {
        return false
      }

      this.grid = result.grid
      this.score += result.scoreGain
      this.setBestScore(this.score)

      if (!this.winReached && this.grid.some((value) => value >= WIN_VALUE)) {
        this.winReached = true
        this.winDialogVisible = true
      }

      this.gameOver = isGameOver(this.grid)
      return true
    },
    continueAfterWin() {
      if (!this.winReached) {
        return
      }
      this.winDialogVisible = false
    },
    setBestScore(score) {
      this.bestScore = Math.max(this.bestScore, Number(score) || 0)
      writeStorage(BEST_SCORE_KEY, this.bestScore)
    },
    clearBestScore() {
      this.bestScore = 0
      writeStorage(BEST_SCORE_KEY, 0)
    },
    toggleAnimation(enabled) {
      this.settings.animation = Boolean(enabled)
      writeStorage(SETTING_ANIMATION_KEY, this.settings.animation)
    },
    toggleVibrate(enabled) {
      this.settings.vibrate = Boolean(enabled)
      writeStorage(SETTING_VIBRATE_KEY, this.settings.vibrate)
    }
  }
})
