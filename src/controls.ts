import { GameControls } from './types'

export function setupControls(keys: GameControls) {
  // Prevent key events from affecting window scroll
  const preventDefaultKeys = new Set([
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Space',
  ])

  function handleKeyEvent(event: KeyboardEvent, isDown: boolean) {
    // Only handle keys we care about
    if (event.code in keys) {
      // Prevent default browser behavior (scrolling, etc)
      if (preventDefaultKeys.has(event.code)) {
        event.preventDefault()
      }

      // Update key state
      keys[event.code as keyof GameControls] = isDown

      // Prevent key repeat events
      if (event.repeat) {
        return
      }
    }
  }

  // Ensure smooth input handling
  window.addEventListener('keydown', (e) => handleKeyEvent(e, true))
  window.addEventListener('keyup', (e) => handleKeyEvent(e, false))

  // Handle loss of focus - reset all controls
  window.addEventListener('blur', () => {
    keys.ArrowUp = false
    keys.ArrowDown = false
    keys.ArrowLeft = false
    keys.ArrowRight = false
  })

  // Ensure cleanup
  return function cleanup() {
    window.removeEventListener('keydown', (e) => handleKeyEvent(e, true))
    window.removeEventListener('keyup', (e) => handleKeyEvent(e, false))
    window.removeEventListener('blur', () => {
      keys.ArrowUp = false
      keys.ArrowDown = false
      keys.ArrowLeft = false
      keys.ArrowRight = false
    })
  }
}

// check if any control is active
export function isAnyControlActive(keys: GameControls) {
  return Object.values(keys).some((value: boolean) => value)
}

// Helper function to get analog value for smooth input
export function getAnalogValue(isPositive: boolean, isNegative: boolean) {
  if (isPositive && !isNegative) return 1
  if (isNegative && !isPositive) return -1
  return 0
}

// Get throttle delta from controls
export function getThrottleInput(keys: GameControls) {
  return getAnalogValue(keys.ArrowUp, keys.ArrowDown)
}

// Get rudder input from controls
export function getRudderInput(keys: GameControls) {
  return getAnalogValue(keys.ArrowLeft, keys.ArrowRight)
}
