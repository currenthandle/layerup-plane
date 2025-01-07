import * as THREE from 'three'
import {
  SpeedParams,
  RudderParams,
  WorldBounds,
  GameControls,
  EngineState,
} from './types'
import { GAME_CONSTANTS } from './constants'

export function calcThrust(throttle: number, engineState: EngineState) {
  const {
    RPM_SCALE,
    PHYSICS_TIMESTEP: deltaTime,
    ENGINE_ACCEL_RESPONSE_TIME,
    ENGINE_DECEL_RESPONSE_TIME,
    MIN_THRUST_PERCENT,
    POWER_EXPONENT,
    ENGINE_POWER,
  } = GAME_CONSTANTS

  // Convert throttle to target RPM
  const targetRPM = throttle * RPM_SCALE
  const responseTime =
    throttle > engineState.currentRPM / RPM_SCALE
      ? ENGINE_ACCEL_RESPONSE_TIME
      : ENGINE_DECEL_RESPONSE_TIME

  // Calculate RPM change
  const rpmDelta =
    (targetRPM - engineState.currentRPM) *
    (1 - Math.exp(-deltaTime / responseTime))

  engineState.currentRPM = Math.max(
    0,
    Math.min(RPM_SCALE, engineState.currentRPM + rpmDelta)
  )

  // Normalize RPM
  const normalizedRPM = engineState.currentRPM / RPM_SCALE

  // Calculate thrust percentage
  const thrustPercent = Math.max(
    MIN_THRUST_PERCENT,
    RPM_SCALE * Math.pow(normalizedRPM, POWER_EXPONENT)
  )

  // Update engine state
  engineState.lastThrust = thrustPercent

  // Calculate and return thrust
  return (thrustPercent / RPM_SCALE) * ENGINE_POWER * 10
}

function calcDrag(speed: number): number {
  // Quadratic drag proportional to square of speed
  return -GAME_CONSTANTS.DRAG_COEFFICIENT * speed * Math.abs(speed)
}

function calcNetForce(
  speed: number,
  throttle: number,
  engineState: EngineState
) {
  // Calculate thrust and drag forces
  const thrustForce = calcThrust(throttle, engineState)
  const dragForce = calcDrag(speed)

  // Return net force
  return thrustForce + dragForce
}

function updateSpeed(speedParams: SpeedParams) {
  const deltaTime = GAME_CONSTANTS.PHYSICS_TIMESTEP

  // Calculate net force
  const netForce = calcNetForce(
    speedParams.speed,
    speedParams.throttle,
    speedParams.engineState
  )

  // F = ma -> a = F/m
  const acceleration = netForce / GAME_CONSTANTS.AIRCRAFT_MASS

  // v = v0 + at
  const deltaV = acceleration * deltaTime * GAME_CONSTANTS.FORCE_SCALING_FACTOR

  // Skip small updates to avoid floating-point noise
  const percentChange = Math.abs((100 * deltaV) / speedParams.speed)
  if (percentChange < 0.1) {
    return
  }

  // Update speed
  speedParams.speed = Math.max(0, speedParams.speed + deltaV)
}

function calcTurnRate(rudderDeflection: number, speed: number) {
  const baseMinTurnEffect = GAME_CONSTANTS.RUDDER_EFFECTIVENESS
  const speedFactor = Math.max(baseMinTurnEffect, Math.sqrt(speed) * 1.2)
  const baseTurnRate =
    rudderDeflection * (GAME_CONSTANTS.RUDDER_EFFECTIVENESS / 3)
  return baseTurnRate / speedFactor
}

export function updateAirplaneState(
  airplane: THREE.Mesh,
  keys: GameControls,
  speedParams: SpeedParams,
  rudderParams: RudderParams,
  worldBounds: WorldBounds
) {
  // Update throttle
  if (keys.ArrowUp) {
    speedParams.throttle = Math.min(
      GAME_CONSTANTS.MAX_THROTTLE,
      speedParams.throttle + speedParams.throttleStep
    )
  }
  if (keys.ArrowDown) {
    speedParams.throttle = Math.max(
      GAME_CONSTANTS.MIN_THROTTLE,
      speedParams.throttle - speedParams.throttleStep
    )
  }

  // Update rudder deflection
  if (keys.ArrowLeft && !keys.ArrowRight) {
    rudderParams.deflectionAngle = Math.min(
      rudderParams.deflectionAngle + rudderParams.sensitivity,
      rudderParams.maxDeflection
    )
  } else if (keys.ArrowRight && !keys.ArrowLeft) {
    rudderParams.deflectionAngle = Math.max(
      rudderParams.deflectionAngle - rudderParams.sensitivity,
      -rudderParams.maxDeflection
    )
  } else {
    rudderParams.deflectionAngle *= GAME_CONSTANTS.RUDDER_RETURN_FACTOR
  }

  // Update physics
  updateSpeed(speedParams)

  // Update turn rate
  const turnRate = calcTurnRate(rudderParams.deflectionAngle, speedParams.speed)
  airplane.rotation.z += turnRate
  airplane.rotation.z = stabilizeAngle(airplane.rotation.z)

  // Update position
  const forwardX = Math.cos(airplane.rotation.z) * speedParams.speed
  const forwardY = Math.sin(airplane.rotation.z) * speedParams.speed
  airplane.position.x += forwardX
  airplane.position.y += forwardY

  // Screen wrapping
  if (airplane.position.x > worldBounds.right)
    airplane.position.x = worldBounds.left
  if (airplane.position.x < worldBounds.left)
    airplane.position.x = worldBounds.right
  if (airplane.position.y > worldBounds.top)
    airplane.position.y = worldBounds.bottom
  if (airplane.position.y < worldBounds.bottom)
    airplane.position.y = worldBounds.top
}

function stabilizeAngle(angle: number) {
  return Math.abs(angle) < GAME_CONSTANTS.ANGLE_EPSILON ? 0 : angle
}
