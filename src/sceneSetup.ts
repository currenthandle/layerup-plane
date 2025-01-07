import * as THREE from 'three'
import { GAME_CONSTANTS } from './constants'

export function createScene() {
  const scene = new THREE.Scene()

  const gridSize = GAME_CONSTANTS.FRUSTUM_SIZE * 2
  const gridDivisions = 20
  const gridHelper = new THREE.GridHelper(
    gridSize,
    gridDivisions,
    0x444444,
    0x222222,
  )
  gridHelper.rotation.x = Math.PI / 2
  scene.add(gridHelper)

  const canvas = document.createElement('canvas')
  canvas.width = 2
  canvas.height = 2
  const context = canvas.getContext('2d')
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, 2)
    gradient.addColorStop(0, '#001833')
    gradient.addColorStop(1, '#000918')
    context.fillStyle = gradient
    context.fillRect(0, 0, 2, 2)
  }
  const backgroundTexture = new THREE.CanvasTexture(canvas)
  scene.background = backgroundTexture

  const ambientLight = new THREE.AmbientLight(0x222222)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
  dirLight.position.set(1, 1, 1)
  scene.add(dirLight)

  return scene
}

export function createCamera(
  frustumSize: number,
  aspectRatio: number,
): THREE.OrthographicCamera {
  const camera = new THREE.OrthographicCamera(
    (frustumSize * aspectRatio) / -2,
    (frustumSize * aspectRatio) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    1000,
  )
  camera.position.set(0, 0, 10)
  camera.lookAt(0, 0, 0)
  camera.updateProjectionMatrix()

  return camera
}

export function createRenderer(): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  document.body.appendChild(renderer.domElement)
  renderer.domElement.style.position = 'absolute'
  renderer.domElement.style.top = '0'
  renderer.domElement.style.left = '0'
  renderer.domElement.style.zIndex = '0'

  return renderer
}
