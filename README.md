# 2048 小程序介绍

## 项目概述

这是一个基于 **uni-app** 框架开发的微信小程序版本的 2048 游戏。2048 是一款经典的数字益智游戏，玩家通过滑动屏幕合并相同的数字，目标是在 4x4 的棋盘上合成出 2048。

## 技术栈

| 技术 | 说明 |
|------|------|
| **uni-app** | 跨平台应用框架，支持编译为微信小程序 |
| **Vue 3** | 前端框架，使用 Composition API |
| **Pinia** | 状态管理 |
| **SCSS** | CSS 预处理器 |

## 项目结构

```
miniprogram-2048/
├── src/
│   ├── pages/
│   │   ├── loading/          # 启动页
│   │   │   └── loading.vue
│   │   ├── index/            # 首页
│   │   │   └── index.vue
│   │   └── game/            # 游戏页
│   │       └── game.vue
│   ├── components/
│   │   ├── GameBoard/        # 游戏棋盘组件
│   │   │   └── GameBoard.vue
│   │   ├── Tile/            # 数字方块组件
│   │   │   └── Tile.vue
│   │   ├── ScoreBoard/      # 分数面板组件
│   │   │   └── ScoreBoard.vue
│   │   ├── ControlPanel/    # 方向控制面板
│   │   │   └── ControlPanel.vue
│   │   ├── WinDialog/       # 胜利弹窗
│   │   │   └── WinDialog.vue
│   │   ├── GameOver/        # 游戏结束弹窗
│   │   │   └── GameOver.vue
│   │   └── Settings/        # 设置弹窗
│   │       └── Settings.vue
│   ├── store/
│   │   └── game.js          # Pinia 游戏状态管理
│   ├── utils/
│   │   └── game.js          # 游戏核心算法
│   ├── App.vue              # 根组件
│   ├── pages.json           # 页面路由配置
│   ├── manifest.json        # 小程序配置
│   └── uni.scss             # 全局样式变量
├── node_modules/            # 依赖包
├── pages.json               # (根目录副本)
├── manifest.json            # (根目录副本)
└── uni.scss                 # (根目录副本)
```

## 核心功能

### 1. 游戏玩法
- **4x4 棋盘**：16 个格子，每次移动随机生成 2 或 4
- **滑动控制**：支持上下左右四个方向滑动
- **数字合并**：相同数字碰撞时合并为两数之和
- **得分系统**：合并产生新数字时累加分数

### 2. 游戏状态管理 (Pinia Store)

游戏状态通过 `useGameStore` 管理，包含：

| 状态 | 说明 |
|------|------|
| `grid` | 当前棋盘数据（16 位数组） |
| `score` | 当前分数 |
| `bestScore` | 历史最高分（本地存储） |
| `gameOver` | 游戏是否结束 |
| `winReached` | 是否达成 2048 |
| `winDialogVisible` | 胜利弹窗显示状态 |
| `settings.animation` | 动画效果开关 |
| `settings.vibrate` | 震动反馈开关 |

### 3. 核心算法 (`utils/game.js`)

- `createEmptyGrid()` - 创建空棋盘
- `addRandomTile()` - 随机添加新方块（90% 概率为 2，10% 概率为 4）
- `moveGrid()` - 执行移动并合并
- `isGameOver()` - 判断游戏是否结束
- `createInitialGrid()` - 初始化游戏

### 4. UI 组件

- **GameBoard**：棋盘渲染，支持触摸滑动识别
- **Tile**：数字方块，根据数值显示不同颜色
- **ScoreBoard**：实时显示当前分数和最高分
- **ControlPanel**：方向按钮面板（上下左右 + 重新开始 + 返回）
- **WinDialog**：达成 2048 时的胜利弹窗
- **GameOver**：游戏结束弹窗
- **Settings**：设置面板（动画开关、震动开关、清空最高分）

### 5. 特色功能

- **动画效果**：方块合并时的弹出动画、棋盘震动反馈
- **震动反馈**：移动成功时触发短震动（需设备支持）
- **数据持久化**：最高分和设置选项保存在本地存储
- **胜利后继续**：达成 2048 后可选择继续挑战更高分

## 页面结构

### 启动页 (loading)
- 显示 Logo 和加载动画
- 800ms 后自动跳转首页

### 首页 (index)
- 显示游戏 Logo
- 展示历史最高分
- "开始游戏" 按钮进入游戏
- "游戏设置" 按钮打开设置面板

### 游戏页 (game)
- 顶部标题栏 + 设置按钮
- 分数面板（当前分数 + 最高分）
- 4x4 游戏棋盘
- 方向控制面板
- 胜利/结束弹窗


## 运行方式

1. 安装依赖：
   ```bash
   npm install
   ```

2. 运行微信小程序：
   ```bash
   npm run dev:mp-weixin
   ```

3. 使用微信开发者工具打开 `dist/dev/mp-weixin` 目录


