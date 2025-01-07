import * as THREE from 'three'
import { WorldBounds } from './types'
import { GAME_CONSTANTS } from './constants'
import { TrajectoryManager } from './trajectoryManager'

export class ViewportManager {
  private aspectRatio: number

  constructor(
    private readonly camera: THREE.OrthographicCamera,
    private readonly renderer: THREE.WebGLRenderer,
    private readonly worldBounds: WorldBounds,
    private readonly trajectoryManager: TrajectoryManager,
  ) {
    this.aspectRatio = window.innerWidth / window.innerHeight
    this.updateViewport()
    this.setupResizeHandler()
  }

  updateViewport() {
    const aspectRatio = window.innerWidth / window.innerHeight
    const halfWidth = (GAME_CONSTANTS.FRUSTUM_SIZE * aspectRatio) / 2

    // Update camera
    this.camera.left = -halfWidth
    this.camera.right = halfWidth
    this.camera.top = GAME_CONSTANTS.FRUSTUM_SIZE / 2
    this.camera.bottom = -GAME_CONSTANTS.FRUSTUM_SIZE / 2
    this.camera.updateProjectionMatrix()

    // Update world bounds
    this.worldBounds.left = -halfWidth
    this.worldBounds.right = halfWidth
    this.worldBounds.top = GAME_CONSTANTS.FRUSTUM_SIZE / 2
    this.worldBounds.bottom = -GAME_CONSTANTS.FRUSTUM_SIZE / 2

    // Update renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    // Update trajectory manager
    this.trajectoryManager.updateResolution(
      window.innerWidth,
      window.innerHeight,
    )
  }

  private setupResizeHandler() {
    window.addEventListener('resize', () => this.updateViewport())
  }

  getWorldBounds() {
    const halfWidth = (GAME_CONSTANTS.FRUSTUM_SIZE * this.aspectRatio) / 2
    return {
      left: -halfWidth,
      right: halfWidth,
      top: GAME_CONSTANTS.FRUSTUM_SIZE / 2,
      bottom: -GAME_CONSTANTS.FRUSTUM_SIZE / 2,
    }
  }
}
