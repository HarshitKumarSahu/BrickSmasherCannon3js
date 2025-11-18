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
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



/**
 * Groups
 */
const arena = new THREE.Group()
const trees = new THREE.Group()
const rocks = new THREE.Group()
const car = new THREE.Group()

scene.add(arena, trees, rocks, car)

/**
 * Arena
 */
const arenaDimension = {
    floor: {
        width: 50,
        height: 50,
        color: "#ffd886"
    },
    walls: {
        width: 50,
        height: 5,
        depth: 0.25,
        // color: '#F5883B',
        color: "#d9a152"
    }
}

// Arena Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(arenaDimension.floor.width, arenaDimension.floor.height),
    // new THREE.MeshLambertMaterial({ color: '#FE9F56' })
    new THREE.MeshLambertMaterial({ color: arenaDimension.walls.color })
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

const wall2 =new THREE.Mesh(
    new THREE.BoxGeometry(arenaDimension.walls.width, arenaDimension.walls.height, arenaDimension.walls.depth ),
    new THREE.MeshLambertMaterial({ color: arenaDimension.walls.color })
)
wall2.position.set(0, 1.5, 25)

const wall3 =new THREE.Mesh(
    new THREE.BoxGeometry(arenaDimension.walls.width, arenaDimension.walls.height, arenaDimension.walls.depth ),
    new THREE.MeshLambertMaterial({ color: arenaDimension.walls.color })
)
wall3.position.set(25, 1.5, 0)
wall3.rotation.y = Math.PI * 0.5

const wall4 =new THREE.Mesh(
    new THREE.BoxGeometry(arenaDimension.walls.width, arenaDimension.walls.height, arenaDimension.walls.depth ),
    new THREE.MeshLambertMaterial({ color: arenaDimension.walls.color })
)
wall4.position.set(-25, 1.5, 0)
wall4.rotation.y = Math.PI * 0.5

arena.add(
    floor, 
    wall1, 
    wall2, 
    wall3, 
    wall4
)


/**
 * 
 *
 * ENVIRONMENT
 * 
 * 
 */

/**
 * Trees
 */
const treeDimension = {
    trunk: {
        radius: 0.175,
        height: 2,
        radialSegment: 5,
        color1: '#9e6e1f',
        color2: '#825600'
    },
    treeLeaveType1: {
        radius: 0.25,
        detail: 0,
        color: '#228B22',
        color2: "#228B22"
    },
    treeLeaveType2: {
        radius: 0.75,
        height: 0.75,
        radialSegment: 5,
        color: "#8CAE26",
        // color1: "#d2bf53",
        // color2: "#86a62f",
        // color3: "#228b22"
        color1: "#228b22",
        color2: "#007101",
        color3: "#005700"
    },
    count: 20,
}

// --- Tree Type 1 Definition (Icosahedron leaves) 
const CreateTreeType1Template = () => {
    const treeGroup = new THREE.Group();

    // Trunk
    const treeTrunk = new THREE.Mesh(
        new THREE.ConeGeometry(treeDimension.trunk.radius, treeDimension.trunk.height, treeDimension.trunk.radialSegment),
        new THREE.MeshLambertMaterial({color: treeDimension.trunk.color1})
    ) 
    treeTrunk.position.set(0, treeDimension.trunk.height * 0.5, 0)

    // Leaves 1
    const treeLeavesOne = new THREE.Mesh(
        new THREE.IcosahedronGeometry(treeDimension.treeLeaveType1.radius * 2.25, treeDimension.treeLeaveType1.detail),
        new THREE.MeshLambertMaterial({ color: treeDimension.treeLeaveType1.color })
    );
    treeLeavesOne.position.set(0, treeDimension.trunk.height * 0.7, 0);

    // Leaves 2
    const treeLeavesTwo = new THREE.Mesh(
        new THREE.IcosahedronGeometry(treeDimension.treeLeaveType1.radius * 1.5, treeDimension.treeLeaveType1.detail),
        new THREE.MeshLambertMaterial({ color: treeDimension.treeLeaveType1.color2 })
    );
    treeLeavesTwo.position.set(0, treeDimension.trunk.height * 0.95, 0);
    
    treeGroup.add(treeTrunk, treeLeavesOne, treeLeavesTwo);

    return treeGroup;
}

// --- Tree Type 2 Definition (Cone leaves) 
const CreateTreeType2Template = () => {
    const treeGroup = new THREE.Group();

    // Trunk
    const treeTrunkOne = new THREE.Mesh(
        new THREE.ConeGeometry(treeDimension.trunk.radius, treeDimension.trunk.height, treeDimension.trunk.radialSegment),
        new THREE.MeshLambertMaterial({ color: treeDimension.trunk.color2 })
    );
    treeTrunkOne.position.set(0, treeDimension.trunk.height * 0.5, 0);
    treeGroup.add(treeTrunkOne);
    
    // Leaves 1
    const treeLeaveTwoType1 = new THREE.Mesh(
        new THREE.ConeGeometry(treeDimension.treeLeaveType2.radius, treeDimension.treeLeaveType2.height, treeDimension.treeLeaveType2.radialSegment),
        new THREE.MeshLambertMaterial({ color: treeDimension.treeLeaveType2.color3 })
    );
    treeLeaveTwoType1.position.set(0, treeDimension.trunk.height * 0.65, 0);
    treeGroup.add(treeLeaveTwoType1);

    // Leaves 2
    const treeLeaveTwoType2 = new THREE.Mesh(
        new THREE.ConeGeometry(treeDimension.treeLeaveType2.radius * 0.75, treeDimension.treeLeaveType2.height * 0.75, treeDimension.treeLeaveType2.radialSegment),
        new THREE.MeshLambertMaterial({ color: treeDimension.treeLeaveType2.color2 })
    );
    treeLeaveTwoType2.position.set(0, treeDimension.trunk.height * 0.85, 0);
    treeGroup.add(treeLeaveTwoType2);

    // Leaves 3
    const treeLeaveTwoType3 = new THREE.Mesh(
        new THREE.ConeGeometry(treeDimension.treeLeaveType2.radius * 0.5, treeDimension.treeLeaveType2.height * 0.5, treeDimension.treeLeaveType2.radialSegment),
        new THREE.MeshLambertMaterial({ color: treeDimension.treeLeaveType2.color1 })
    );
    treeLeaveTwoType3.position.set(0, treeDimension.trunk.height * 1, 0);
    treeGroup.add(treeLeaveTwoType3);

    return treeGroup;
};


const GenerateTrees = (createTreeTemplateFn, targetGroup, n) => {
    for (let i = 0; i < n; i++) {
        // Create a fresh instance of the tree group
        const tree = createTreeTemplateFn();
        
        // Apply position and slight random rotation for natural look
        tree.position.set(
            (Math.random()-0.5) * 48.5, 
            0, 
            (Math.random()-0.5) * 48.5  // Inside 50x50 arena
        )
        tree.rotation.set(
            0,
            Math.random() * Math.PI * 2, // Rotate around Y axis randomly
            0
        )
        targetGroup.add(tree);
    }
}


/**
 * Rocks
 */
const rockDimension = {
    radius: 0.5,
    detail: 0,
    color: "#95955f",
    count: 20
}

const rockGeo = new THREE.DodecahedronGeometry(rockDimension.radius * (Math.random() + 0.5), rockDimension.detail)
const rockMat = new THREE.MeshLambertMaterial( { color: rockDimension.color} )

const GenerateRocks = (geometer, material, n) => {
    for (let i = 0; i < n; i++) {
        const rock = new THREE.Mesh(geometer, material)
        rock.position.set(
            (Math.random()-0.5) * 48.5, 
            Math.random() * 0.15, 
            (Math.random()-0.5) * 48.5  // Inside 50x50 arena
        )
        rock.rotation.set(
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.4
        )
        rocks.add(rock)
    }
}

GenerateTrees(CreateTreeType1Template, trees, treeDimension.count);
GenerateTrees(CreateTreeType2Template, trees, treeDimension.count);
GenerateRocks(rockGeo, rockMat, rockDimension.count)










/**
 * Car
 */
const carDimension = {
    mainBody: {
        width: 1.5,
        height: 0.25,
        depth: 0.75,
        color: "#FF4444"
    },
    roofBody: {
        width: 1,
        height: 0.35,
        depth: 0.7,
        color: "#CC3333"
    },
    roofBodyGlass : {
        LROne : {
            width: 0.45,
            height: 0.3,
            depth: 0.725,
        },
        LRTwo : {
            width: 0.45,
            height: 0.3,
            depth: 0.725,
        },
        TB : {
            width: 1.025,
            height: 0.3,
            depth: 0.65,
        },
        color: "#d4f4ff"
    },
    doorHandle: {
        width: 0.075,
        height: 0.025,
        depth: 0.775,
        color: "#000000"
    },
    mirror: {
        width: 0.025,
        height: 0.0575,
        depth: 0.0775,
        color: "#000000"
    },
    headLight: {
        radius: 0.05,
        height: 1.475,
        capSeg: 6,
        radSeg: 6,
        color: "#ffd886"
    },
    bumper: {
        width: 1.525,
        height: 0.025,
        depth: 0.7525,
        color: "#000000"
    },
    wheel: {
        tyre: {
            radius: 0.15, 
            height: 0.0725, 
            radSeg: 10,
            color: "#3f4a3c"
        },
        rims: {
            radius: 0.075, 
            tube: 0.015, 
            tubeSeg: 128, 
            radSeg: 16, 
            p: 8, 
            q: 9,
            color: "#a2af9f"
        }
    }
}

//Main Body
const mainBody = new THREE.Mesh(
    new THREE.BoxGeometry(carDimension.mainBody.width, carDimension.mainBody.height, carDimension.mainBody.depth),
    // new THREE.MeshLambertMaterial({ color: 0xFF4444})
    new THREE.MeshLambertMaterial({ color: carDimension.mainBody.color})
)

// roof
const roof = new THREE.Mesh(
    new THREE.BoxGeometry(carDimension.roofBody.width, carDimension.roofBody.height, carDimension.roofBody.depth),
    // new THREE.MeshLambertMaterial({ color: 0xCC3333})
    new THREE.MeshLambertMaterial({ color: carDimension.roofBody.color})
)
roof.position.set(carDimension.mainBody.width * 0.1125, (carDimension.mainBody.height * 0.5) + (carDimension.roofBody.height * 0.5), 0)

// roof Glass left-right One
const roofGlassLROne = new THREE.Mesh(
    new THREE.BoxGeometry(carDimension.roofBodyGlass.LROne.width, carDimension.roofBodyGlass.LROne.height, carDimension.roofBodyGlass.LROne.depth),
    // new THREE.MeshLambertMaterial({ color: "#f8f8f8"})
    new THREE.MeshLambertMaterial({ color: carDimension.roofBodyGlass.color})
)
roofGlassLROne.position.set(-carDimension.mainBody.width * 0.05, (carDimension.mainBody.height * 0.5) + (carDimension.roofBody.height * 0.5), 0)

// roof Glass left-right Two
const roofGlassLRTwo = new THREE.Mesh(
    new THREE.BoxGeometry(carDimension.roofBodyGlass.LRTwo.width, carDimension.roofBodyGlass.LRTwo.height, carDimension.roofBodyGlass.LRTwo.depth),
    // new THREE.MeshLambertMaterial({ color: "#f8f8f8"})
    new THREE.MeshLambertMaterial({ color: carDimension.roofBodyGlass.color})
)
roofGlassLRTwo.position.set(carDimension.mainBody.width * 0.275, (carDimension.mainBody.height * 0.5) + (carDimension.roofBody.height * 0.5), 0)

// roof Glass top-bottom
const roofGlassTB = new THREE.Mesh(
    new THREE.BoxGeometry(carDimension.roofBodyGlass.TB.width, carDimension.roofBodyGlass.TB.height, carDimension.roofBodyGlass.TB.depth),
    // new THREE.MeshLambertMaterial({ color: "#f8f8f8"})
    new THREE.MeshLambertMaterial({ color: carDimension.roofBodyGlass.color})
)
roofGlassTB.position.set(carDimension.mainBody.width * 0.1125, (carDimension.mainBody.height * 0.5) + (carDimension.roofBody.height * 0.5), 0)

// Door Handle
const doorHandel = new THREE.Mesh(
    new THREE.BoxGeometry(carDimension.doorHandle.width, carDimension.doorHandle.height, carDimension.doorHandle.depth),
    // new THREE.MeshLambertMaterial({ color: "#000"})
    new THREE.MeshLambertMaterial({ color: carDimension.doorHandle.color})
)
doorHandel.position.set(carDimension.mainBody.width * 0.1125, carDimension.mainBody.height * 0.25, 0)

// Left Mirror
const leftMirror = new THREE.Mesh(
    new THREE.BoxGeometry(carDimension.mirror.width, carDimension.mirror.height, carDimension.mirror.depth),
    // new THREE.MeshLambertMaterial({ color: "#000"})
    new THREE.MeshLambertMaterial({ color: carDimension.mirror.color})
)
leftMirror.position.set(- carDimension.mainBody.width * 0.2 , carDimension.mainBody.height * 0.6, carDimension.mainBody.depth * 0.5425)

// Right Mirror
const rightMirror = new THREE.Mesh(
    new THREE.BoxGeometry(carDimension.mirror.width, carDimension.mirror.height, carDimension.mirror.depth),
    // new THREE.MeshLambertMaterial({ color: "#000"})
    new THREE.MeshLambertMaterial({ color: carDimension.mirror.color})
)
rightMirror.position.set(- carDimension.mainBody.width * 0.2 , carDimension.mainBody.height * 0.6, - carDimension.mainBody.depth * 0.5425)

// Left Head Light
const leftHeadLight = new THREE.Mesh(
    new THREE.CapsuleGeometry( carDimension.headLight.radius, carDimension.headLight.height, carDimension.headLight.capSeg, carDimension.headLight.radSeg, 1 ),
    // new THREE.MeshLambertMaterial({ color: "#ffd886"})
    new THREE.MeshLambertMaterial({ color: carDimension.headLight.color})
)
leftHeadLight.rotation.z = Math.PI * 0.5
leftHeadLight.position.set(0, 0, carDimension.mainBody.depth * 0.35)

// Right Head Light
const rightHeadLight = new THREE.Mesh(
    new THREE.CapsuleGeometry( carDimension.headLight.radius, carDimension.headLight.height, carDimension.headLight.capSeg, carDimension.headLight.radSeg, 1 ),
    // new THREE.MeshLambertMaterial({ color: "#ffd886"})
    new THREE.MeshLambertMaterial({ color: carDimension.headLight.color})
)
rightHeadLight.rotation.z = Math.PI * 0.5
rightHeadLight.position.set(0, 0, -carDimension.mainBody.depth * 0.35)

// bumper
const bumper = new THREE.Mesh(
    new THREE.BoxGeometry(carDimension.bumper.width, carDimension.bumper.height, carDimension.bumper.depth),
    // new THREE.MeshLambertMaterial({ color: "#000"})
    new THREE.MeshLambertMaterial({ color: carDimension.bumper.color})
)
bumper.position.set(0, - carDimension.mainBody.height * 0.5, 0)

// wheel = tye + rims
const wheelOne = new THREE.Group()
const wheelTwo = new THREE.Group()
const wheelThree = new THREE.Group()
const wheelFour = new THREE.Group()

const tyreOne = new THREE.Mesh( 
    new THREE.CylinderGeometry( carDimension.wheel.tyre.radius, carDimension.wheel.tyre.radius, carDimension.wheel.tyre.height, carDimension.wheel.tyre.radSeg), 
    // new THREE.MeshLambertMaterial( { color: "#3f4a3c" } )
    new THREE.MeshLambertMaterial( { color: carDimension.wheel.tyre.color } )
);
const rimsOne = new THREE.Mesh(
    new THREE.TorusKnotGeometry( carDimension.wheel.rims.radius, carDimension.wheel.rims.tube, carDimension.wheel.rims.tubeSeg, carDimension.wheel.rims.radSeg, carDimension.wheel.rims.p, carDimension.wheel.rims.q),
    // new THREE.MeshLambertMaterial( { color: "#96afb8" } )
    new THREE.MeshLambertMaterial( { color: carDimension.wheel.rims.color } )
)
rimsOne.rotation.x = Math.PI * 0.5
wheelOne.rotation.x = Math.PI * 0.5
wheelOne.position.set(carDimension.mainBody.width * 0.30, -carDimension.mainBody.height * 0.5, carDimension.mainBody.depth * 0.55)
wheelOne.add(tyreOne, rimsOne)

const tyreTwo = new THREE.Mesh( 
    new THREE.CylinderGeometry( carDimension.wheel.tyre.radius, carDimension.wheel.tyre.radius, carDimension.wheel.tyre.height, carDimension.wheel.tyre.radSeg), 
    // new THREE.MeshLambertMaterial( { color: "#3f4a3c" } )
    new THREE.MeshLambertMaterial( { color: carDimension.wheel.tyre.color } )
);
const rimsTwo = new THREE.Mesh(
    new THREE.TorusKnotGeometry( carDimension.wheel.rims.radius, carDimension.wheel.rims.tube, carDimension.wheel.rims.tubeSeg, carDimension.wheel.rims.radSeg, carDimension.wheel.rims.p, carDimension.wheel.rims.q),
    // new THREE.MeshLambertMaterial( { color: "#96afb8" } )
    new THREE.MeshLambertMaterial( { color: carDimension.wheel.rims.color } )
)
rimsTwo.rotation.x = Math.PI * 0.5
wheelTwo.rotation.x = Math.PI * 0.5
wheelTwo.position.set(carDimension.mainBody.width * 0.30, -carDimension.mainBody.height * 0.5, -carDimension.mainBody.depth * 0.55)
wheelTwo.add(tyreTwo, rimsTwo)

const tyreThree = new THREE.Mesh( 
    new THREE.CylinderGeometry( carDimension.wheel.tyre.radius, carDimension.wheel.tyre.radius, carDimension.wheel.tyre.height, carDimension.wheel.tyre.radSeg), 
    // new THREE.MeshLambertMaterial( { color: "#3f4a3c" } )
    new THREE.MeshLambertMaterial( { color: carDimension.wheel.tyre.color } )
);
const rimsThree = new THREE.Mesh(
    new THREE.TorusKnotGeometry( carDimension.wheel.rims.radius, carDimension.wheel.rims.tube, carDimension.wheel.rims.tubeSeg, carDimension.wheel.rims.radSeg, carDimension.wheel.rims.p, carDimension.wheel.rims.q),
    // new THREE.MeshLambertMaterial( { color: "#96afb8" } )
    new THREE.MeshLambertMaterial( { color: carDimension.wheel.rims.color } )
)
rimsThree.rotation.x = Math.PI * 0.5
wheelThree.rotation.x = Math.PI * 0.5
wheelThree.position.set( -carDimension.mainBody.width * 0.30, -carDimension.mainBody.height * 0.5, carDimension.mainBody.depth * 0.55)
wheelThree.add(tyreThree, rimsThree)

const tyreFour = new THREE.Mesh( 
    new THREE.CylinderGeometry( carDimension.wheel.tyre.radius, carDimension.wheel.tyre.radius, carDimension.wheel.tyre.height, carDimension.wheel.tyre.radSeg), 
    // new THREE.MeshLambertMaterial( { color: "#3f4a3c" } )
    new THREE.MeshLambertMaterial( { color: carDimension.wheel.tyre.color } )
);
const rimsFour = new THREE.Mesh(
    new THREE.TorusKnotGeometry( carDimension.wheel.rims.radius, carDimension.wheel.rims.tube, carDimension.wheel.rims.tubeSeg, carDimension.wheel.rims.radSeg, carDimension.wheel.rims.p, carDimension.wheel.rims.q),
    // new THREE.MeshLambertMaterial( { color: "#96afb8" } )
    new THREE.MeshLambertMaterial( { color: carDimension.wheel.rims.color } )
)
rimsFour.rotation.x = Math.PI * 0.5
wheelFour.rotation.x = Math.PI * 0.5
wheelFour.position.set( -carDimension.mainBody.width * 0.30, -carDimension.mainBody.height * 0.5, -carDimension.mainBody.depth * 0.55)
wheelFour.add(tyreFour, rimsFour)

car.add(
    mainBody, 
    roof, 
    roofGlassLROne, 
    roofGlassLRTwo, 
    roofGlassTB, 
    doorHandel, 
    leftMirror, 
    rightMirror, 
    leftHeadLight, 
    rightHeadLight, 
    bumper, 
    wheelOne, 
    wheelTwo, 
    wheelThree, 
    wheelFour
)
car.position.set(0, (carDimension.mainBody.height * 0.5) + (carDimension.wheel.tyre.radius), 0)


































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