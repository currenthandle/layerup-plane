import * as THREE from 'three'
import { TrajectoryManager } from './trajectoryManager'
import { GAME_CONSTANTS } from './constants'
import { SpeedParams, RudderParams, WorldBounds, GameControls } from './types'
import { updateAirplaneState } from './gameLogic'

export function animate(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  airplane: THREE.Mesh,
  keys: GameControls,
  speedParams: SpeedParams,
  rudderParams: RudderParams,
  worldBounds: WorldBounds,
  trajectoryManager: TrajectoryManager
) {
  let lastTime = 0
  let accumulator = 0

  function loop(currentTime: number) {
    requestAnimationFrame(loop)

    // Convert time to seconds and handle first frame
    const timeSeconds = currentTime * 0.001
    if (lastTime === 0) {
      lastTime = timeSeconds
      return
    }

    // Calculate frame delta
    let deltaTime = timeSeconds - lastTime
    lastTime = timeSeconds

    // Cap maximum delta time to prevent huge physics steps
    deltaTime = Math.min(deltaTime, 0.1)
    accumulator += deltaTime

    // Fixed timestep physics updates
    while (accumulator >= GAME_CONSTANTS.PHYSICS_TIMESTEP) {
      updateAirplaneState(
        airplane,
        keys,
        speedParams,
        rudderParams,
        worldBounds
      )
      accumulator -= GAME_CONSTANTS.PHYSICS_TIMESTEP
    }

    // Update trajectory
    trajectoryManager.update(
      new THREE.Vector2(airplane.position.x, airplane.position.y),
      worldBounds,
      GAME_CONSTANTS.TRAJECTORY_MIN_DISTANCE
    )

    // Render scene
    renderer.render(scene, camera)
  }

  loop(0)
}
