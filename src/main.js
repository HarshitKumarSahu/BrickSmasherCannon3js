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
const trees = new THREE.Group()

scene.add(arena, trees)

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
    }
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
        // Position randomization
        const angle = Math.random() * Math.PI * 2
        const radius =  Math.random() * 24
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius
        
        // Create a fresh instance of the tree group
        const tree = createTreeTemplateFn();
        
        // Apply position and slight random rotation for natural look
        tree.position.set(x, Math.random() * 0.15, z)
        tree.rotation.set(
            0,
            Math.random() * Math.PI * 2, // Rotate around Y axis randomly
            0
        )
        targetGroup.add(tree);
    }
}

GenerateTrees(CreateTreeType1Template, trees, 10);
GenerateTrees(CreateTreeType2Template, trees, 10);


// // type 1
// const treeTrunk = new THREE.Mesh(
//     new THREE.ConeGeometry(treeDimension.trunk.radius, treeDimension.trunk.height, treeDimension.trunk.radialSegment),
//     new THREE.MeshLambertMaterial({color: treeDimension.trunk.color})
// ) 
// treeTrunk.position.set(0, treeDimension.trunk.height * 0.5, 0)
// // trees.add()/

// const treeLeaves1 = new THREE.Mesh(
//      new THREE.IcosahedronGeometry(treeDimension.treeLeaves.radius * 2.25, treeDimension.treeLeaves.detail),
//     new THREE.MeshLambertMaterial({color: treeDimension.treeLeaves.color})
// ) 
// treeLeaves1.position.set(0, treeDimension.trunk.height * 0.7, 0)

// const treeLeaves2 = new THREE.Mesh(
//     new THREE.IcosahedronGeometry(treeDimension.treeLeaves.radius * 1.5, treeDimension.treeLeaves.detail),
//     new THREE.MeshLambertMaterial({color: treeDimension.treeLeaves.color})
// )
// treeLeaves2.position.set(0, treeDimension.trunk.height * 0.95, 0)

// // type2
// const treeTrunk1 = new THREE.Mesh(
//     new THREE.ConeGeometry(treeDimension.trunk.radius, treeDimension.trunk.height, treeDimension.trunk.radialSegment),
//     new THREE.MeshLambertMaterial({color: treeDimension.trunk.color})
// ) 
// treeTrunk1.position.set(0, treeDimension.trunk.height * 0.5, 0)

// const treeLeaves21 = new THREE.Mesh(
//     new THREE.ConeGeometry(treeDimension.treeLeaves2.radius, treeDimension.treeLeaves2.height, treeDimension.treeLeaves2.radialSegment),
//     new THREE.MeshLambertMaterial({color: treeDimension.treeLeaves.color})
// ) 
// treeLeaves21.position.set(0, treeDimension.trunk.height * 0.65, 0)

// const treeLeaves22 = new THREE.Mesh(
//     new THREE.ConeGeometry(treeDimension.treeLeaves2.radius * 0.75, treeDimension.treeLeaves2.height * 0.75, treeDimension.treeLeaves2.radialSegment),
//     new THREE.MeshLambertMaterial({color: treeDimension.treeLeaves.color})
// ) 
// treeLeaves22.position.set(0, treeDimension.trunk.height * 0.85, 0)

// const treeLeaves23 = new THREE.Mesh(
//     new THREE.ConeGeometry(treeDimension.treeLeaves2.radius * 0.5, treeDimension.treeLeaves2.height * 0.5, treeDimension.treeLeaves2.radialSegment),
//     new THREE.MeshLambertMaterial({color: treeDimension.treeLeaves.color})
// ) 
// treeLeaves23.position.set(0, treeDimension.trunk.height * 1, 0)
// // trees.add(treeTrunk1, treeLeaves21, treeLeaves22, treeLeaves23)

// const tree1 = new THREE.Group()
// const tree2 = new THREE.Group()
// const tree3 = new THREE.Group()
// const tree4 = new THREE.Group()

// trees.add(tree1, tree2)

// tree1.add(treeTrunk, treeLeaves1, treeLeaves2)
// tree1.position.set(0, 0, 0)

// tree2.add(treeTrunk1, treeLeaves21, treeLeaves22, treeLeaves23)
// tree2.position.set(1, 0, 0)









/**
 * Rocks
 */
const rocks = new THREE.Group()
scene.add(rocks)

const rockDimension = {
    radius: 0.5,
    detail: 0,
    color: "#95955f",
    count: 20
}

const rockGeo = new THREE.DodecahedronGeometry(rockDimension.radius * (Math.random() + 0.5), rockDimension.detail)
const rockMat = new THREE.MeshLambertMaterial( { color: rockDimension.color, metalness: 0.2 } )

const GenerateRocks = (geometer, material, n) => {
    for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius =  Math.random() * 24
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius
        // console.log(x, z);
        const rock = new THREE.Mesh(geometer, material)
        rock.position.set(x, Math.random() * 0.15, z)
        rock.rotation.set(
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.4
        )
        rocks.add(rock)
    }
}
GenerateRocks(rockGeo, rockMat, rockDimension.count)



// const rock1 = new THREE.Mesh(
//     new THREE.DodecahedronGeometry(rockDimension.radius * (Math.random() + 0.5), rockDimension.detail),
//     new THREE.MeshBasicMaterial( { color: "orange" } )
// )

// rocks.add(rock1)



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