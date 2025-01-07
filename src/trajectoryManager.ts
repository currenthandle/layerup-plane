import * as THREE from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { WorldBounds } from './types'
import { GAME_CONSTANTS } from './constants'

interface TrajectorySegment {
  line: Line2
  geometry: LineGeometry
  points: number[]
}

export class TrajectoryManager {
  private segments: TrajectorySegment[] = []
  private readonly material: LineMaterial
  private previousPosition = new THREE.Vector2()
  private readonly maxPoints: number
  private totalPoints: number = 0
  private readonly maxSegments: number = 50

  constructor(private readonly scene: THREE.Scene) {
    try {
      this.maxPoints = GAME_CONSTANTS.TRAJECTORY_MAX_POINTS

      this.material = new LineMaterial({
        color: 0xff0000,
        linewidth: 3.0,
        vertexColors: false,
        dashed: false,
        alphaToCoverage: false,
      })

      this.material.resolution.set(window.innerWidth, window.innerHeight)
      this.material.needsUpdate = true

      this.startNewSegment()
    } catch (error) {
      console.error('Failed to initialize TrajectoryManager:', error)
      throw new Error('TrajectoryManager initialization failed')
    }
  }

  private startNewSegment() {
    try {
      // Enforce segment limit
      if (this.segments.length >= this.maxSegments) {
        this.removeOldestSegment()
      }

      const geometry = new LineGeometry()
      const line = new Line2(geometry, this.material)

      const segment: TrajectorySegment = {
        line,
        geometry,
        points: [
          this.previousPosition.x,
          this.previousPosition.y,
          0,
          this.previousPosition.x,
          this.previousPosition.y,
          0,
        ],
      }

      geometry.setPositions(new Float32Array(segment.points))

      this.segments.push(segment)
      this.scene.add(line)
      this.totalPoints += 2
    } catch (error) {
      console.error('Failed to start new segment:', error)
      this.attemptRecovery()
    }
  }

  private removeOldestSegment() {
    try {
      const oldest = this.segments[0]
      if (oldest) {
        this.scene.remove(oldest.line)
        oldest.geometry.dispose()
        this.totalPoints -= oldest.points.length / 3
        this.segments.shift()
      }
    } catch (error) {
      console.error('Failed to remove oldest segment:', error)
    }
  }

  private removeOldestPoint() {
    try {
      const oldest = this.segments[0]
      if (!oldest) return

      oldest.points.splice(0, 3)
      this.totalPoints--

      if (oldest.points.length < 6) {
        this.removeOldestSegment()
      } else {
        this.updateSegmentGeometry(oldest)
      }
    } catch (error) {
      console.error('Failed to remove oldest point:', error)
      this.attemptRecovery()
    }
  }

  private ensurePointCapacity() {
    try {
      while (this.totalPoints >= this.maxPoints) {
        this.removeOldestPoint()
      }
    } catch (error) {
      console.error('Failed to ensure point capacity:', error)
      this.attemptRecovery()
    }
  }

  private updateSegmentGeometry(segment: TrajectorySegment) {
    try {
      if (segment.points.length >= 6) {
        const newGeometry = new LineGeometry()
        newGeometry.setPositions(new Float32Array(segment.points))

        segment.line.geometry.dispose()
        segment.line.geometry = newGeometry
        segment.geometry = newGeometry
        segment.line.computeLineDistances()
        segment.line.visible = true
      }
    } catch (error) {
      console.error('Failed to update segment geometry:', error)
      this.attemptRecovery()
    }
  }

  private attemptRecovery() {
    try {
      // Clear all segments
      this.dispose()
      // Reinitialize with a clean state
      this.startNewSegment()
      console.log('TrajectoryManager recovered from error state')
    } catch (error) {
      console.error('Failed to recover TrajectoryManager:', error)
      throw new Error('TrajectoryManager recovery failed')
    }
  }

  update(position: THREE.Vector2, bounds: WorldBounds, minDistance: number) {
    try {
      // Validate inputs
      if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) {
        throw new Error('Invalid position coordinates')
      }

      if (this.segments.length === 0) {
        this.previousPosition.copy(position)
        this.startNewSegment()
        return
      }

      this.ensurePointCapacity()

      // Check for boundary wrapping
      const wrappedX =
        Math.abs(position.x - this.previousPosition.x) >
        Math.min((bounds.right - bounds.left) / 2, 10000) // Reasonable maximum
      const wrappedY =
        Math.abs(position.y - this.previousPosition.y) >
        Math.min((bounds.top - bounds.bottom) / 2, 10000)

      const currentSegment = this.segments[this.segments.length - 1]
      const distance = position.distanceTo(this.previousPosition)

      if (distance >= minDistance) {
        if (wrappedX || wrappedY) {
          this.previousPosition.copy(position)
          this.startNewSegment()
        } else {
          const lastIndex = currentSegment.points.length - 3
          currentSegment.points[lastIndex] = position.x
          currentSegment.points[lastIndex + 1] = position.y
          currentSegment.points[lastIndex + 2] = 0

          this.ensurePointCapacity()

          currentSegment.points.push(position.x, position.y, 0)
          this.totalPoints++
          this.updateSegmentGeometry(currentSegment)
          this.previousPosition.copy(position)
        }
      }
    } catch (error) {
      console.error('Error in trajectory update:', error)
      this.attemptRecovery()
    }
  }

  updateResolution(width: number, height: number) {
    try {
      if (width > 0 && height > 0) {
        this.material.resolution.set(width, height)
      }
    } catch (error) {
      console.error('Failed to update resolution:', error)
    }
  }

  dispose() {
    try {
      this.segments.forEach((segment) => {
        this.scene.remove(segment.line)
        segment.geometry.dispose()
      })
      this.segments = []
      this.totalPoints = 0
    } catch (error) {
      console.error('Failed to dispose TrajectoryManager:', error)
    }
  }
}
