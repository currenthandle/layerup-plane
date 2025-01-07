import * as THREE from 'three'

export function createAirplane() {
  const vertices = new Float32Array([
    // Nose
    0.5, 0, 0,
    
    // Main wings 
    -0.2, 0.4, 0,  // Left wing tip
    -0.1, 0.1, 0,  // Left wing root
    -0.1, -0.1, 0, // Right wing root
    -0.2, -0.4, 0, // Right wing tip
    
    // Tail section
    -0.4, 0.15, 0, // Left stabilizer
    -0.3, 0, 0,    // Tail base
    -0.4, -0.15, 0 // Right stabilizer
  ])

  const indices = new Uint16Array([
    0, 1, 2, // Left wing
    0, 2, 3, // Center body
    0, 3, 4, // Right wing
    0, 5, 6, // Left stabilizer
    0, 6, 7  // Right stabilizer
  ])

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))
  geometry.computeVertexNormals()

  // Create material with better visibility
  const material = new THREE.MeshBasicMaterial({
    color: 0x4444ff,
    side: THREE.DoubleSide,
    wireframe: false
  })

  const airplane = new THREE.Mesh(geometry, material)

  return airplane
}

