export function createUI() {
  const uiContainer = document.createElement('div')
  uiContainer.id = 'ui-container'

  const airspeed = document.createElement('div')
  airspeed.id = 'airspeed'
  airspeed.textContent = 'Airspeed: 0 kts'
  uiContainer.appendChild(airspeed)

  const throttle = document.createElement('div')
  throttle.id = 'throttle'
  throttle.textContent = 'Throttle: 0%'
  uiContainer.appendChild(throttle)

  const thrust = document.createElement('div')
  thrust.id = 'thrust'
  thrust.textContent = 'Thrust: 0%'
  uiContainer.appendChild(thrust)

  const rudderDeflection = document.createElement('div')
  rudderDeflection.id = 'rudder-deflection'
  rudderDeflection.textContent = 'Rudder Deflection: 0.0°'
  uiContainer.appendChild(rudderDeflection)

  const controls = document.createElement('div')
  controls.id = 'controls'

  controls.innerHTML = 'Controls:<br>↑/↓ - Throttle<br>←/→ - Rudder'
  uiContainer.appendChild(controls)

  return uiContainer
}
