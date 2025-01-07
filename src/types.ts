export interface WorldBounds {
  left: number
  right: number
  top: number
  bottom: number
}

export interface EngineState {
  currentRPM: number
  targetRPM: number
  acceleration: number
  lastThrust: number
}

export interface SpeedParams {
  speed: number
  throttle: number
  targetThrottle: number
  throttleStep: number
  engineState: EngineState
}

export interface RudderParams {
  deflectionAngle: number
  maxDeflection: number
  sensitivity: number
}

export interface GameControls {
  ArrowUp: boolean
  ArrowDown: boolean
  ArrowLeft: boolean
  ArrowRight: boolean
}

export interface PhysicsState {
  position: THREE.Vector2
  velocity: THREE.Vector2
  acceleration: THREE.Vector2
  forces: Forces
}

export interface Forces {
  thrust: number
  drag: number
  total: number
}

export type Speed = number
export type Force = number
export type Angle = number
