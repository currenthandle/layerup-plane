import { createScene, createCamera, createRenderer } from './sceneSetup'
import { createAirplane } from './airplane'
import { setupControls } from './controls'
import { createUI } from './ui'
import { GAME_CONSTANTS } from './constants'
import { WorldBounds, SpeedParams, RudderParams, GameControls } from './types'
import { TrajectoryManager } from './trajectoryManager'
import { ViewportManager } from './viewportManger'
import { animate } from './animate'

export function initGame() {
  const aspectRatio = window.innerWidth / window.innerHeight
  const scene = createScene()
  const camera = createCamera(GAME_CONSTANTS.FRUSTUM_SIZE, aspectRatio)
  const renderer = createRenderer()

  const trajectoryManager = new TrajectoryManager(scene)

  const airplane = createAirplane()
  scene.add(airplane)

  const keys: GameControls = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  }
  setupControls(keys)

  const worldBounds: WorldBounds = {
    left: (GAME_CONSTANTS.FRUSTUM_SIZE * aspectRatio) / -2,
    right: (GAME_CONSTANTS.FRUSTUM_SIZE * aspectRatio) / 2,
    top: GAME_CONSTANTS.FRUSTUM_SIZE / 2,
    bottom: GAME_CONSTANTS.FRUSTUM_SIZE / -2,
  }

  // Initialize ViewportManager
  new ViewportManager(camera, renderer, worldBounds, trajectoryManager)

  const speedParams: SpeedParams = {
    speed: GAME_CONSTANTS.INITIAL_SPEED,
    throttle: GAME_CONSTANTS.INITIAL_THROTTLE,
    targetThrottle: GAME_CONSTANTS.INITIAL_THROTTLE,
    throttleStep: GAME_CONSTANTS.THROTTLE_STEP,
    engineState: {
      currentRPM: GAME_CONSTANTS.INITIAL_THROTTLE * GAME_CONSTANTS.RPM_SCALE,
      targetRPM: GAME_CONSTANTS.INITIAL_THROTTLE * GAME_CONSTANTS.RPM_SCALE,
      acceleration: 0,
      lastThrust: GAME_CONSTANTS.MIN_THRUST_PERCENT as number,
    },
  }

  const rudderParams: RudderParams = {
    deflectionAngle: 0,
    maxDeflection: GAME_CONSTANTS.RUDDER_MAX_DEFLECTION,
    sensitivity: GAME_CONSTANTS.RUDDER_SENSITIVITY,
  }

  // Setup UI
  document.body.appendChild(createUI())

  animate(
    scene,
    camera,
    renderer,
    airplane,
    keys,
    speedParams,
    rudderParams,
    worldBounds,
    trajectoryManager
  )

  function updateGauges() {
    function calcSpeedInKnots(physicsSpeed: number): number {
      if (!physicsSpeed || isNaN(physicsSpeed)) return 0
      return physicsSpeed * GAME_CONSTANTS.KNOTS_CONVERSION_FACTOR
    }

    const airspeedDisplay = document.getElementById('airspeed')
    const throttleDisplay = document.getElementById('throttle')
    const thrustDisplay = document.getElementById('thrust')
    const rudderDisplay = document.getElementById('rudder-deflection')

    if (airspeedDisplay) {
      const speedInKnots = calcSpeedInKnots(speedParams.speed)
      airspeedDisplay.textContent = `Airspeed: ${speedInKnots.toFixed(1)} kts`
    }

    if (throttleDisplay) {
      throttleDisplay.textContent = `Throttle: ${(
        speedParams.throttle * 100
      ).toFixed(0)}%`
    }

    if (thrustDisplay) {
      thrustDisplay.textContent = `Thrust: ${speedParams.engineState.lastThrust.toFixed(
        1
      )}%`
    }

    if (rudderDisplay) {
      rudderDisplay.textContent = `Rudder Deflection: ${(
        rudderParams.deflectionAngle *
        (180 / Math.PI)
      ).toFixed(1)}°`
    }
  }

  // Update UI with "gauges"
  setInterval(updateGauges, GAME_CONSTANTS.UI_UPDATE_INTERVAL)
}

initGame()
