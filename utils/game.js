const GRID_SIZE = 4
const GRID_CELLS = GRID_SIZE * GRID_SIZE

export function createEmptyGrid() {
  return Array(GRID_CELLS).fill(0)
}

export function getEmptyIndices(grid) {
  const emptyIndices = []
  for (let i = 0; i < grid.length; i += 1) {
    if (grid[i] === 0) {
      emptyIndices.push(i)
    }
  }
  return emptyIndices
}

export function addRandomTile(grid, randomFn = Math.random) {
  const emptyIndices = getEmptyIndices(grid)
  if (!emptyIndices.length) {
    return {
      grid: [...grid],
      added: false
    }
  }

  const pickedIndex = emptyIndices[Math.floor(randomFn() * emptyIndices.length)]
  const nextValue = randomFn() < 0.9 ? 2 : 4
  const nextGrid = [...grid]
  nextGrid[pickedIndex] = nextValue

  return {
    grid: nextGrid,
    added: true
  }
}

function mergeLine(line) {
  const filtered = line.filter((value) => value !== 0)
  const merged = []
  let scoreGain = 0

  for (let i = 0; i < filtered.length; i += 1) {
    const current = filtered[i]
    const next = filtered[i + 1]

    if (next !== undefined && current === next) {
      const combined = current * 2
      merged.push(combined)
      scoreGain += combined
      i += 1
    } else {
      merged.push(current)
    }
  }

  while (merged.length < GRID_SIZE) {
    merged.push(0)
  }

  return {
    line: merged,
    scoreGain
  }
}

function readLine(grid, index, direction) {
  if (direction === 'left') {
    const start = index * GRID_SIZE
    return [grid[start], grid[start + 1], grid[start + 2], grid[start + 3]]
  }

  if (direction === 'right') {
    const start = index * GRID_SIZE
    return [grid[start + 3], grid[start + 2], grid[start + 1], grid[start]]
  }

  if (direction === 'up') {
    return [grid[index], grid[index + 4], grid[index + 8], grid[index + 12]]
  }

  return [grid[index + 12], grid[index + 8], grid[index + 4], grid[index]]
}

function writeLine(target, index, direction, line) {
  if (direction === 'left') {
    const start = index * GRID_SIZE
    target[start] = line[0]
    target[start + 1] = line[1]
    target[start + 2] = line[2]
    target[start + 3] = line[3]
    return
  }

  if (direction === 'right') {
    const start = index * GRID_SIZE
    target[start + 3] = line[0]
    target[start + 2] = line[1]
    target[start + 1] = line[2]
    target[start] = line[3]
    return
  }

  if (direction === 'up') {
    target[index] = line[0]
    target[index + 4] = line[1]
    target[index + 8] = line[2]
    target[index + 12] = line[3]
    return
  }

  target[index + 12] = line[0]
  target[index + 8] = line[1]
  target[index + 4] = line[2]
  target[index] = line[3]
}

export function moveGrid(grid, direction, randomFn = Math.random) {
  const nextGrid = [...grid]
  let scoreGain = 0

  for (let i = 0; i < GRID_SIZE; i += 1) {
    const line = readLine(grid, i, direction)
    const merged = mergeLine(line)
    scoreGain += merged.scoreGain
    writeLine(nextGrid, i, direction, merged.line)
  }

  const moved = nextGrid.some((value, idx) => value !== grid[idx])
  if (!moved) {
    return {
      grid: [...grid],
      moved: false,
      scoreGain: 0
    }
  }

  const withRandomTile = addRandomTile(nextGrid, randomFn)
  return {
    grid: withRandomTile.grid,
    moved: true,
    scoreGain
  }
}

export function isGameOver(grid) {
  if (grid.includes(0)) {
    return false
  }

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const index = row * GRID_SIZE + col
      const value = grid[index]
      const rightIndex = index + 1
      const downIndex = index + GRID_SIZE

      if (col < GRID_SIZE - 1 && value === grid[rightIndex]) {
        return false
      }

      if (row < GRID_SIZE - 1 && value === grid[downIndex]) {
        return false
      }
    }
  }

  return true
}

export function createInitialGrid(randomFn = Math.random) {
  const first = addRandomTile(createEmptyGrid(), randomFn).grid
  return addRandomTile(first, randomFn).grid
}
