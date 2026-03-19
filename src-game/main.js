const GRID_SIZE = 4
const CELL_COUNT = GRID_SIZE * GRID_SIZE
const WIN_VALUE = 2048

const STORAGE_KEYS = {
  bestScore: 'wxgame_2048_best_score',
  animation: 'wxgame_2048_animation',
  vibrate: 'wxgame_2048_vibrate'
}

class Game2048 {
  constructor() {
    const info = wx.getSystemInfoSync()
    this.width = info.screenWidth
    this.height = info.screenHeight
    this.pixelRatio = info.pixelRatio || 1

    this.canvas = wx.createCanvas()
    this.ctx = this.canvas.getContext('2d')
    this.canvas.width = this.width * this.pixelRatio
    this.canvas.height = this.height * this.pixelRatio
    this.ctx.scale(this.pixelRatio, this.pixelRatio)

    this.scene = 'loading'
    this.loadingProgress = 0
    this.loadingPulse = 0
    this.loadingTimer = null

    this.touchStartX = 0
    this.touchStartY = 0

    this.settings = {
      animation: this.readBool(STORAGE_KEYS.animation, true),
      vibrate: this.readBool(STORAGE_KEYS.vibrate, true)
    }

    this.bestScore = this.readNumber(STORAGE_KEYS.bestScore, 0)
    this.grid = this.createEmptyGrid()
    this.score = 0
    this.lastScore = 0
    this.gameOver = false
    this.winReached = false
    this.winDialogVisible = false

    this.settingsVisible = false
    this.helpVisible = false

    this.computeLayout()
    this.bindEvents()
    this.startLoading()
  }

  computeLayout() {
    const margin = 22
    this.navTop = 24
    this.navHeight = 56

    this.boardSize = Math.min(this.width - margin * 2, 420)
    this.boardX = (this.width - this.boardSize) / 2
    this.boardY = this.navTop + this.navHeight + 94
    this.cellGap = 8
    this.cellSize = (this.boardSize - this.cellGap * 5) / 4

    this.homeStartBtn = {
      x: (this.width - 240) / 2,
      y: this.height * 0.56,
      w: 240,
      h: 50
    }

    this.homeAnimToggle = {
      x: (this.width - 230) / 2,
      y: this.homeStartBtn.y + 76,
      w: 104,
      h: 40
    }

    this.homeVibrateToggle = {
      x: this.homeAnimToggle.x + 126,
      y: this.homeAnimToggle.y,
      w: 104,
      h: 40
    }

    this.gameBackBtn = { x: 16, y: this.navTop + 10, w: 70, h: 36 }
    const footerY = this.boardY + this.boardSize + 28
    const footerTotalWidth = 336
    const footerStartX = (this.width - footerTotalWidth) / 2
    this.gameNewBtn = { x: footerStartX, y: footerY, w: 104, h: 42 }
    this.gameHelpBtn = { x: footerStartX + 116, y: footerY, w: 104, h: 42 }
    this.gameSettingsBtn = { x: footerStartX + 232, y: footerY, w: 104, h: 42 }

    this.dialogRect = {
      x: (this.width - 310) / 2,
      y: (this.height - 250) / 2,
      w: 310,
      h: 250
    }

    this.settingsPanel = {
      x: (this.width - 330) / 2,
      y: (this.height - 320) / 2,
      w: 330,
      h: 320
    }
  }

  createEmptyGrid() {
    return Array(CELL_COUNT).fill(0)
  }

  readNumber(key, fallback) {
    try {
      const value = wx.getStorageSync(key)
      return value === '' || value === null || value === undefined ? fallback : Number(value)
    } catch (error) {
      return fallback
    }
  }

  readBool(key, fallback) {
    try {
      const value = wx.getStorageSync(key)
      if (value === '' || value === null || value === undefined) return fallback
      if (typeof value === 'boolean') return value
      if (typeof value === 'string') return value.toLowerCase() === 'true'
      return Boolean(value)
    } catch (error) {
      return fallback
    }
  }

  writeStorage(key, value) {
    try {
      wx.setStorageSync(key, value)
    } catch (error) {
      // Ignore storage failures.
    }
  }

  startLoading() {
    const startTime = Date.now()
    this.loadingTimer = setInterval(() => {
      const elapsed = Date.now() - startTime
      this.loadingProgress = Math.min(1, elapsed / 1300)
      this.loadingPulse = elapsed / 260
      if (this.loadingProgress >= 1) {
        clearInterval(this.loadingTimer)
        this.loadingTimer = null
        this.scene = 'home'
      }
      this.render()
    }, 33)
  }

  startGame() {
    this.grid = this.createEmptyGrid()
    this.score = 0
    this.gameOver = false
    this.winReached = false
    this.winDialogVisible = false
    this.helpVisible = false
    this.addRandomTile()
    this.addRandomTile()
    this.scene = 'game'
    this.render()
  }

  bindEvents() {
    wx.onTouchStart((event) => {
      const touch = event.touches && event.touches[0]
      if (!touch) return
      this.touchStartX = touch.clientX
      this.touchStartY = touch.clientY
    })

    wx.onTouchEnd((event) => {
      const touch = event.changedTouches && event.changedTouches[0]
      if (!touch) return

      const endX = touch.clientX
      const endY = touch.clientY

      if (this.scene === 'loading') return

      if (this.settingsVisible) {
        this.handleSettingsTap(endX, endY)
        this.render()
        return
      }

      if (this.helpVisible) {
        this.helpVisible = false
        this.render()
        return
      }

      if (this.winDialogVisible || this.gameOver) {
        this.handleDialogTap(endX, endY)
        this.render()
        return
      }

      if (this.scene === 'home') {
        this.handleHomeTap(endX, endY)
        this.render()
        return
      }

      this.handleGameInput(endX, endY)
      this.render()
    })
  }

  handleHomeTap(x, y) {
    if (this.hitRect(x, y, this.homeStartBtn)) {
      this.startGame()
      return
    }

    if (this.hitRect(x, y, this.homeAnimToggle)) {
      this.settings.animation = !this.settings.animation
      this.writeStorage(STORAGE_KEYS.animation, this.settings.animation)
      return
    }

    if (this.hitRect(x, y, this.homeVibrateToggle)) {
      this.settings.vibrate = !this.settings.vibrate
      this.writeStorage(STORAGE_KEYS.vibrate, this.settings.vibrate)
    }
  }

  handleGameInput(x, y) {
    if (this.hitRect(x, y, this.gameBackBtn)) {
      this.lastScore = this.score
      this.scene = 'home'
      return
    }

    if (this.hitRect(x, y, this.gameNewBtn)) {
      this.startGame()
      return
    }

    if (this.hitRect(x, y, this.gameHelpBtn)) {
      this.helpVisible = true
      return
    }

    if (this.hitRect(x, y, this.gameSettingsBtn)) {
      this.settingsVisible = true
      return
    }

    if (!this.hitRect(x, y, { x: this.boardX, y: this.boardY, w: this.boardSize, h: this.boardSize })) {
      return
    }

    const dx = x - this.touchStartX
    const dy = y - this.touchStartY
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)

    if (absX < 20 && absY < 20) {
      return
    }

    if (absX > absY) {
      this.tryMove(dx > 0 ? 'right' : 'left')
    } else {
      this.tryMove(dy > 0 ? 'down' : 'up')
    }
  }

  handleSettingsTap(x, y) {
    const panel = this.settingsPanel

    if (!this.hitRect(x, y, panel)) {
      this.settingsVisible = false
      return
    }

    const animationRect = { x: panel.x + 236, y: panel.y + 92, w: 68, h: 32 }
    const vibrateRect = { x: panel.x + 236, y: panel.y + 145, w: 68, h: 32 }
    const clearRect = { x: panel.x + 28, y: panel.y + 208, w: panel.w - 56, h: 42 }
    const closeRect = { x: panel.x + 28, y: panel.y + 260, w: panel.w - 56, h: 42 }

    if (this.hitRect(x, y, animationRect)) {
      this.settings.animation = !this.settings.animation
      this.writeStorage(STORAGE_KEYS.animation, this.settings.animation)
      return
    }

    if (this.hitRect(x, y, vibrateRect)) {
      this.settings.vibrate = !this.settings.vibrate
      this.writeStorage(STORAGE_KEYS.vibrate, this.settings.vibrate)
      return
    }

    if (this.hitRect(x, y, clearRect)) {
      this.bestScore = 0
      this.writeStorage(STORAGE_KEYS.bestScore, 0)
      return
    }

    if (this.hitRect(x, y, closeRect)) {
      this.settingsVisible = false
    }
  }

  handleDialogTap(x, y) {
    const d = this.dialogRect
    const restartBtn = { x: d.x + 28, y: d.y + d.h - 60, w: d.w - 56, h: 40 }
    if (this.hitRect(x, y, restartBtn)) {
      this.startGame()
      return
    }

    if (this.winDialogVisible) {
      const continueBtn = { x: d.x + 28, y: d.y + d.h - 108, w: d.w - 56, h: 40 }
      if (this.hitRect(x, y, continueBtn)) {
        this.winDialogVisible = false
      }
    }
  }

  hitRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h
  }

  addRandomTile() {
    const empty = []
    for (let i = 0; i < this.grid.length; i += 1) {
      if (this.grid[i] === 0) empty.push(i)
    }
    if (!empty.length) return false

    const index = empty[Math.floor(Math.random() * empty.length)]
    this.grid[index] = Math.random() < 0.9 ? 2 : 4
    return true
  }

  mergeLine(line) {
    const filtered = line.filter((n) => n !== 0)
    const merged = []
    let gain = 0

    for (let i = 0; i < filtered.length; i += 1) {
      const cur = filtered[i]
      const next = filtered[i + 1]
      if (next !== undefined && cur === next) {
        const val = cur * 2
        merged.push(val)
        gain += val
        i += 1
      } else {
        merged.push(cur)
      }
    }

    while (merged.length < GRID_SIZE) {
      merged.push(0)
    }

    return { merged, gain }
  }

  readLine(index, direction) {
    const g = this.grid
    if (direction === 'left') {
      const s = index * 4
      return [g[s], g[s + 1], g[s + 2], g[s + 3]]
    }
    if (direction === 'right') {
      const s = index * 4
      return [g[s + 3], g[s + 2], g[s + 1], g[s]]
    }
    if (direction === 'up') {
      return [g[index], g[index + 4], g[index + 8], g[index + 12]]
    }
    return [g[index + 12], g[index + 8], g[index + 4], g[index]]
  }

  writeLine(nextGrid, index, direction, line) {
    if (direction === 'left') {
      const s = index * 4
      nextGrid[s] = line[0]
      nextGrid[s + 1] = line[1]
      nextGrid[s + 2] = line[2]
      nextGrid[s + 3] = line[3]
      return
    }
    if (direction === 'right') {
      const s = index * 4
      nextGrid[s + 3] = line[0]
      nextGrid[s + 2] = line[1]
      nextGrid[s + 1] = line[2]
      nextGrid[s] = line[3]
      return
    }
    if (direction === 'up') {
      nextGrid[index] = line[0]
      nextGrid[index + 4] = line[1]
      nextGrid[index + 8] = line[2]
      nextGrid[index + 12] = line[3]
      return
    }
    nextGrid[index + 12] = line[0]
    nextGrid[index + 8] = line[1]
    nextGrid[index + 4] = line[2]
    nextGrid[index] = line[3]
  }

  tryMove(direction) {
    if (this.gameOver || this.winDialogVisible) {
      return
    }

    const nextGrid = [...this.grid]
    let gain = 0

    for (let i = 0; i < 4; i += 1) {
      const line = this.readLine(i, direction)
      const merged = this.mergeLine(line)
      gain += merged.gain
      this.writeLine(nextGrid, i, direction, merged.merged)
    }

    let moved = false
    for (let i = 0; i < this.grid.length; i += 1) {
      if (this.grid[i] !== nextGrid[i]) {
        moved = true
        break
      }
    }
    if (!moved) return

    this.grid = nextGrid
    this.score += gain

    if (this.score > this.bestScore) {
      this.bestScore = this.score
      this.writeStorage(STORAGE_KEYS.bestScore, this.bestScore)
    }

    this.addRandomTile()

    if (!this.winReached && this.grid.some((v) => v >= WIN_VALUE)) {
      this.winReached = true
      this.winDialogVisible = true
    }

    if (this.settings.vibrate) {
      wx.vibrateShort({ type: 'light' })
    }

    this.gameOver = this.checkGameOver()
  }

  checkGameOver() {
    if (this.grid.includes(0)) return false

    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        const i = row * 4 + col
        if (col < 3 && this.grid[i] === this.grid[i + 1]) return false
        if (row < 3 && this.grid[i] === this.grid[i + 4]) return false
      }
    }

    return true
  }

  getTileColor(value) {
    const palette = {
      0: '#CDC1B4',
      2: '#EEE4DA',
      4: '#EDE0C8',
      8: '#F2B179',
      16: '#F59563',
      32: '#F67C5F',
      64: '#F65E3B',
      128: '#EDCF72',
      256: '#EDCC61',
      512: '#EDC850',
      1024: '#EDC53F',
      2048: '#EDC22E'
    }
    return palette[value] || '#3C3A32'
  }

  roundRect(x, y, w, h, r) {
    const ctx = this.ctx
    const radius = Math.min(r, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + w, y, x + w, y + h, radius)
    ctx.arcTo(x + w, y + h, x, y + h, radius)
    ctx.arcTo(x, y + h, x, y, radius)
    ctx.arcTo(x, y, x + w, y, radius)
    ctx.closePath()
  }

  drawButton(rect, label, color, textColor = '#F9F6F2', fontSize = 16) {
    const ctx = this.ctx
    ctx.fillStyle = color
    this.roundRect(rect.x, rect.y, rect.w, rect.h, 10)
    ctx.fill()
    ctx.fillStyle = textColor
    ctx.font = 'bold ' + fontSize + 'px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2)
  }

  drawToggle(x, y, enabled) {
    const ctx = this.ctx
    ctx.fillStyle = enabled ? '#8F7A66' : '#CDC1B4'
    this.roundRect(x, y, 68, 32, 16)
    ctx.fill()

    ctx.fillStyle = '#fff'
    const knobX = enabled ? x + 50 : x + 18
    ctx.beginPath()
    ctx.arc(knobX, y + 16, 12, 0, Math.PI * 2)
    ctx.fill()
  }

  renderLoading() {
    const ctx = this.ctx
    ctx.fillStyle = '#F9F6F2'
    ctx.fillRect(0, 0, this.width, this.height)

    const pulse = 1 + Math.sin(this.loadingPulse) * 0.04
    ctx.save()
    ctx.translate(this.width / 2, this.height * 0.36)
    ctx.scale(pulse, pulse)
    ctx.fillStyle = '#776E65'
    ctx.font = 'bold 68px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('2048', 0, 0)
    ctx.restore()

    const bar = { x: this.width / 2 - 130, y: this.height * 0.54, w: 260, h: 16 }
    ctx.fillStyle = '#CDC1B4'
    this.roundRect(bar.x, bar.y, bar.w, bar.h, 8)
    ctx.fill()

    ctx.fillStyle = '#8F7A66'
    this.roundRect(bar.x, bar.y, bar.w * this.loadingProgress, bar.h, 8)
    ctx.fill()

    ctx.fillStyle = '#8F7A66'
    ctx.font = '18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('载入中...', this.width / 2, bar.y + 52)
  }

  renderHome() {
    const ctx = this.ctx
    ctx.fillStyle = '#F9F6F2'
    ctx.fillRect(0, 0, this.width, this.height)

    ctx.fillStyle = '#776E65'
    ctx.font = 'bold 76px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('2048', this.width / 2, this.height * 0.22)

    ctx.fillStyle = '#8F7A66'
    ctx.font = '24px sans-serif'
    ctx.fillText('最高分: ' + this.bestScore, this.width / 2, this.height * 0.34)
    ctx.fillText('当前: ' + (this.lastScore || 0), this.width / 2, this.height * 0.39)

    this.drawButton(this.homeStartBtn, '开始游戏', '#8F7A66', '#F9F6F2', 20)
    this.drawButton(this.homeAnimToggle, this.settings.animation ? '动画 开' : '动画 关', '#A99889', '#F9F6F2', 14)
    this.drawButton(this.homeVibrateToggle, this.settings.vibrate ? '震动 开' : '震动 关', '#A99889', '#F9F6F2', 14)
  }

  renderGame() {
    const ctx = this.ctx

    ctx.fillStyle = '#F9F6F2'
    ctx.fillRect(0, 0, this.width, this.height)

    ctx.fillStyle = '#EFE7DD'
    ctx.fillRect(0, this.navTop, this.width, this.navHeight)

    this.drawButton(this.gameBackBtn, '← 返回', '#B2A193', '#F9F6F2', 14)

    ctx.fillStyle = '#776E65'
    ctx.font = 'bold 48px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('2048', this.width / 2, this.navTop + this.navHeight / 2 + 1)

    ctx.fillStyle = '#BBADA0'
    this.roundRect(this.boardX, this.navTop + this.navHeight + 20, this.boardSize, 54, 10)
    ctx.fill()

    ctx.fillStyle = '#F9F6F2'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('分数: ' + this.score + '   最高: ' + this.bestScore, this.width / 2, this.navTop + this.navHeight + 47)

    ctx.fillStyle = '#BBADA0'
    this.roundRect(this.boardX, this.boardY, this.boardSize, this.boardSize, 12)
    ctx.fill()

    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        const index = row * 4 + col
        const val = this.grid[index]
        const x = this.boardX + this.cellGap + col * (this.cellSize + this.cellGap)
        const y = this.boardY + this.cellGap + row * (this.cellSize + this.cellGap)

        ctx.fillStyle = this.getTileColor(val)
        this.roundRect(x, y, this.cellSize, this.cellSize, 8)
        ctx.fill()

        if (val > 0) {
          ctx.fillStyle = val <= 4 ? '#776E65' : '#F9F6F2'
          const fontSize = val >= 1024 ? 26 : val >= 128 ? 30 : 34
          ctx.font = 'bold ' + fontSize + 'px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(val), x + this.cellSize / 2, y + this.cellSize / 2)
        }
      }
    }

    this.drawButton(this.gameNewBtn, '新游戏', '#8F7A66', '#F9F6F2', 16)
    this.drawButton(this.gameHelpBtn, '说明', '#A99889', '#F9F6F2', 16)
    this.drawButton(this.gameSettingsBtn, '设置', '#A99889', '#F9F6F2', 16)
  }

  renderHelp() {
    const ctx = this.ctx
    ctx.fillStyle = 'rgba(60,58,50,0.45)'
    ctx.fillRect(0, 0, this.width, this.height)

    const d = this.dialogRect
    ctx.fillStyle = '#F9F6F2'
    this.roundRect(d.x, d.y, d.w, d.h, 16)
    ctx.fill()

    ctx.fillStyle = '#776E65'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('说明', d.x + d.w / 2, d.y + 20)

    ctx.font = '16px sans-serif'
    ctx.fillText('1. 在网格区域滑动移动方块', d.x + d.w / 2, d.y + 74)
    ctx.fillText('2. 相同数字相撞会合并加分', d.x + d.w / 2, d.y + 104)
    ctx.fillText('3. 达成 2048 后可继续挑战', d.x + d.w / 2, d.y + 134)

    this.drawButton({ x: d.x + 28, y: d.y + d.h - 60, w: d.w - 56, h: 40 }, '关闭', '#8F7A66')
  }

  renderDialog(title, lines, withContinue) {
    const ctx = this.ctx

    ctx.fillStyle = 'rgba(60,58,50,0.45)'
    ctx.fillRect(0, 0, this.width, this.height)

    const d = this.dialogRect
    ctx.fillStyle = '#F9F6F2'
    this.roundRect(d.x, d.y, d.w, d.h, 16)
    ctx.fill()

    ctx.fillStyle = '#776E65'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(title, d.x + d.w / 2, d.y + 24)

    ctx.font = '16px sans-serif'
    for (let i = 0; i < lines.length; i += 1) {
      ctx.fillText(lines[i], d.x + d.w / 2, d.y + 76 + i * 28)
    }

    if (withContinue) {
      this.drawButton({ x: d.x + 28, y: d.y + d.h - 108, w: d.w - 56, h: 40 }, '继续挑战', '#B2A193')
    }
    this.drawButton({ x: d.x + 28, y: d.y + d.h - 60, w: d.w - 56, h: 40 }, '再来一局', '#8F7A66')
  }

  renderSettings() {
    const ctx = this.ctx
    const panel = this.settingsPanel

    ctx.fillStyle = 'rgba(60,58,50,0.45)'
    ctx.fillRect(0, 0, this.width, this.height)

    ctx.fillStyle = '#F9F6F2'
    this.roundRect(panel.x, panel.y, panel.w, panel.h, 16)
    ctx.fill()

    ctx.fillStyle = '#776E65'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('设置', panel.x + panel.w / 2, panel.y + 20)

    ctx.font = '18px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('动画效果', panel.x + 28, panel.y + 98)
    ctx.fillText('震动反馈', panel.x + 28, panel.y + 151)

    ctx.strokeStyle = '#E1D5C8'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(panel.x + 28, panel.y + 126)
    ctx.lineTo(panel.x + panel.w - 28, panel.y + 126)
    ctx.moveTo(panel.x + 28, panel.y + 179)
    ctx.lineTo(panel.x + panel.w - 28, panel.y + 179)
    ctx.stroke()

    this.drawToggle(panel.x + 236, panel.y + 92, this.settings.animation)
    this.drawToggle(panel.x + 236, panel.y + 145, this.settings.vibrate)

    this.drawButton({ x: panel.x + 28, y: panel.y + 208, w: panel.w - 56, h: 42 }, '清除最高分', '#CC5F52')
    this.drawButton({ x: panel.x + 28, y: panel.y + 260, w: panel.w - 56, h: 42 }, '关闭', '#8F7A66')
  }

  render() {
    if (this.scene === 'loading') {
      this.renderLoading()
      return
    }

    if (this.scene === 'home') {
      this.renderHome()
      if (this.settingsVisible) {
        this.renderSettings()
      }
      return
    }

    this.renderGame()

    if (this.settingsVisible) {
      this.renderSettings()
      return
    }

    if (this.helpVisible) {
      this.renderHelp()
      return
    }

    if (this.winDialogVisible) {
      this.renderDialog('你达成 2048 了', ['当前分数: ' + this.score, '最高分: ' + this.bestScore], true)
      return
    }

    if (this.gameOver) {
      this.renderDialog('游戏结束', ['当前分数: ' + this.score, '最高分: ' + this.bestScore], false)
    }
  }
}

new Game2048()
