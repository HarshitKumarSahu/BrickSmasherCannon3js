import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/src/core/Timer.js'

import GUI from 'lil-gui'
import { gsap } from 'gsap'

/**
 * 1 unit = 1 meter
 */


/**
 * Base
 */
const gui = new GUI()
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})




/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 90)
camera.position.set(1, 2, 3)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// camera.position.set(15, 15, 15)  // Good overview
// controls.target.set(0, 2, 0)  // Look at arena center



/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



/**
 * Groups
 */
const arena = new THREE.Group()

scene.add(arena)

/**
 * Arena
 */
const arenaDimension = {
    floor: {
        width: 50,
        height: 50,
    },
    walls: {
        width: 50,
        height: 5,
        depth: 0.25,
        color: '#F5883B'
    }
}

// Arena Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(arenaDimension.floor.width, arenaDimension.floor.height),
    new THREE.MeshLambertMaterial({ color: '#FE9F56' })
)
floor.rotation.x = -Math.PI / 2
 // Catches shadows from flying bricks!
floor.position.y = 0

// Arena walls
const wall1 =new THREE.Mesh(
    new THREE.BoxGeometry(arenaDimension.walls.width, arenaDimension.walls.height, arenaDimension.walls.depth ),
    new THREE.MeshLambertMaterial({ color: arenaDimension.walls.color })
)
wall1.position.set(0, 1.5, -25)
arena.add(floor, wall1)

const wall2 =new THREE.Mesh(
    new THREE.BoxGeometry(arenaDimension.walls.width, arenaDimension.walls.height, arenaDimension.walls.depth ),
    new THREE.MeshLambertMaterial({ color: arenaDimension.walls.color })
)
wall2.position.set(0, 1.5, 25)
arena.add(floor, wall1)

const wall3 =new THREE.Mesh(
    new THREE.BoxGeometry(arenaDimension.walls.width, arenaDimension.walls.height, arenaDimension.walls.depth ),
    new THREE.MeshLambertMaterial({ color: arenaDimension.walls.color })
)
wall3.position.set(25, 1.5, 0)
wall3.rotation.y = Math.PI * 0.5
arena.add(floor, wall1)

const wall4 =new THREE.Mesh(
    new THREE.BoxGeometry(arenaDimension.walls.width, arenaDimension.walls.height, arenaDimension.walls.depth ),
    new THREE.MeshLambertMaterial({ color: arenaDimension.walls.color })
)
wall4.position.set(-25, 1.5, 0)
wall4.rotation.y = Math.PI * 0.5

arena.add(floor, wall1, wall2, wall3, wall4)



/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)  // Soft fill
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.975)
directionalLight.position.set(10, 20, 5)
directionalLight.shadow.mapSize.width = 2048  // Crisp shadows
const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x228B22, 0.6)  // Sky/ground bounce

scene.add(ambientLight, directionalLight, hemisphereLight)

/**
 * Shadows
 */
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

directionalLight.castShadow = true

wall1.castShadow = true
wall2.castShadow = true
wall3.castShadow = true
wall4.castShadow = true

floor.receiveShadow = true 


/**
 * Animate
 */
const timer = new Timer()

const tick = () => {
    timer.update()
    const elapsedTime = timer.getElapsed()
    // console.log(elapsedTime)

    controls.update()

    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()