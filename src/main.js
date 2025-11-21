import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/src/core/Timer.js'

import * as CANNON from 'cannon-es'

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

// Create physics world
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase()
world.solver.iterations = 10;


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
        color: "#ffd886",
        mass: 0
    },
    walls: {
        width: 50,
        height: 50,
        depth: 0.25,
        // color: '#F5883B',
        color: "#d9a152",
        mass: 0
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

// Floor physics (holds everything)
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
    mass: arenaDimension.floor.mass
})
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);  // Rotate flat
floorBody.position.set(0, 0, 0);

// Wall 1 (North)
const wall1Shape = new CANNON.Box(new CANNON.Vec3(arenaDimension.walls.width * 0.5, arenaDimension.walls.height * 0.5, arenaDimension.walls.depth * 0.5));  // Half-extents
const wall1Body = new CANNON.Body({ mass: 0 });
wall1Body.addShape(wall1Shape);
wall1Body.position.set(0, 1.5, -25);

// Wall 2 (South)
const wall2Shape = new CANNON.Box(new CANNON.Vec3(arenaDimension.walls.width * 0.5, arenaDimension.walls.height * 0.5, arenaDimension.walls.depth * 0.5));
const wall2Body = new CANNON.Body({ mass: 0 });
wall2Body.addShape(wall2Shape);
wall2Body.position.set(0, 1.5, 25);

// Wall 3 (East) - rotated
const wall3Shape = new CANNON.Box(new CANNON.Vec3(arenaDimension.walls.width * 0.5, arenaDimension.walls.height * 0.5, arenaDimension.walls.depth * 0.5));
const wall3Body = new CANNON.Body({ mass: 0 });
wall3Body.addShape(wall3Shape);
wall3Body.position.set(25, 1.5, 0);
wall3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);

// Wall 4 (West) - rotated
const wall4Shape = new CANNON.Box(new CANNON.Vec3(arenaDimension.walls.width * 0.5, arenaDimension.walls.height * 0.5, arenaDimension.walls.depth * 0.5));
const wall4Body = new CANNON.Body({ mass: 0 });
wall4Body.addShape(wall4Shape);
wall4Body.position.set(-25, 1.5, 0);
wall4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);

// === SYNC VISUAL MESHES TO PHYSICS (in tick loop) ===
function syncArena() {
    floor.position.copy(floorBody.position);
    floor.quaternion.copy(floorBody.quaternion);
    
    wall1.position.copy(wall1Body.position);
    wall1.quaternion.copy(wall1Body.quaternion);
    
    wall2.position.copy(wall2Body.position);
    wall2.quaternion.copy(wall2Body.quaternion);
    
    wall3.position.copy(wall3Body.position);
    wall3.quaternion.copy(wall3Body.quaternion);
    
    wall4.position.copy(wall4Body.position);
    wall4.quaternion.copy(wall4Body.quaternion);
}



world.addBody(
    floorBody,
    wall1Body,
    wall2Body,
    wall3Body,
    wall4Body
);









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
    count: 25,
    mass: 0,
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

const fixedTrees = [
    { x: -23.543, y: 0.000, z: -11.237, rotY: 4.936 },
    { x: 19.877, y: 0.000, z: 10.360, rotY: 1.336 },
    { x: 7.621, y: 0.000, z: 7.142, rotY: 5.236 },
    { x: 17.699, y: 0.000, z: -10.112, rotY: 5.219 },
    { x: -16.836, y: 0.000, z: -5.560, rotY: 5.049 },
    { x: 12.376, y: 0.000, z: -11.986, rotY: 5.592 },
    { x: 2.681, y: 0.000, z: 9.414, rotY: 5.911 },
    { x: -13.454, y: 0.000, z: 2.336, rotY: 2.920 },
    { x: -1.742, y: 0.000, z: 21.303, rotY: 5.357 },
    { x: 1.740, y: 0.000, z: 4.939, rotY: 5.096 },
    { x: 9.986, y: 0.000, z: -5.879, rotY: 5.817 },
    { x: -22.955, y: 0.000, z: 16.822, rotY: 2.552 },
    { x: 11.787, y: 0.000, z: 8.789, rotY: 0.906 },
    { x: 22.926, y: 0.000, z: -15.366, rotY: 5.269 },
    { x: -1.177, y: 0.000, z: -6.949, rotY: 6.099 },
    { x: -1.617, y: 0.000, z: 7.199, rotY: 4.056 },
    { x: -5.024, y: 0.000, z: -7.833, rotY: 2.151 },
    { x: -16.541, y: 0.000, z: 21.151, rotY: 0.541 },
    { x: -23.565, y: 0.000, z: 8.038, rotY: 5.635 },
    { x: 11.337, y: 0.000, z: 5.224, rotY: 5.430 },
    { x: 6.894, y: 0.000, z: -14.969, rotY: 0.712 },
    { x: -20.350, y: 0.000, z: -17.312, rotY: 4.857 },
    { x: -8.245, y: 0.000, z: -17.388, rotY: 2.303 },
    { x: 6.639, y: 0.000, z: 5.944, rotY: 5.805 },
    { x: -6.000, y: 0.000, z: 3.087, rotY: 2.650 },
    { x: 3.472, y: 0.000, z: 4.718, rotY: 6.123 },
    { x: -8.104, y: 0.000, z: 2.431, rotY: 1.646 },
    { x: -13.279, y: 0.000, z: -7.193, rotY: 1.420 },
    { x: 14.147, y: 0.000, z: -2.708, rotY: 0.659 },
    { x: 20.468, y: 0.000, z: 4.384, rotY: 4.550 },
    { x: 21.582, y: 0.000, z: 0.212, rotY: 2.964 },
    { x: 10.132, y: 0.000, z: 22.861, rotY: 1.880 },
    { x: -22.637, y: 0.000, z: -2.349, rotY: 4.205 },
    { x: -10.063, y: 0.000, z: -21.639, rotY: 6.115 },
    { x: -3.684, y: 0.000, z: -10.782, rotY: 2.440 },
    { x: 13.811, y: 0.000, z: -6.136, rotY: 4.516 },
    { x: 14.168, y: 0.000, z: 18.518, rotY: 2.644 },
    { x: 12.623, y: 0.000, z: -23.618, rotY: 4.726 },
    { x: -1.739, y: 0.000, z: 7.059, rotY: 4.111 },
    { x: -20.480, y: 0.000, z: -16.075, rotY: 0.204 },
    { x: -2.649, y: 0.000, z: -6.100, rotY: 3.404 },
    { x: 20.197, y: 0.000, z: -10.453, rotY: 2.987 },
    { x: -1.532, y: 0.000, z: 8.394, rotY: 0.371 },
    { x: 5.512, y: 0.000, z: -9.133, rotY: 3.928 },
    { x: -13.147, y: 0.000, z: -18.664, rotY: 1.877 },
    { x: 11.166, y: 0.000, z: 19.076, rotY: 2.456 },
    { x: -1.336, y: 0.000, z: 14.635, rotY: 3.185 },
    { x: -0.171, y: 0.000, z: -21.113, rotY: 6.191 },
    { x: 12.305, y: 0.000, z: 2.382, rotY: 6.013 },
    { x: 10.132, y: 0.000, z: -22.580, rotY: 2.731 },
  ];
  
fixedTrees.forEach(pos => {
    const tree = Math.random() < 0.5 ? CreateTreeType1Template() : CreateTreeType2Template();
    tree.position.set(pos.x, pos.y, pos.z);
    tree.rotation.y = pos.rotY;
    trees.add(tree);
});
  
// Tree Physics
trees.children.forEach(tree => {
    // Each tree is a Group → we make a simple cylinder for trunk + sphere for leaves
    const trunkShape = new CANNON.Cylinder(0.18, 0.18, 2, 8);           // radiusTop, radiusBottom, height, segments
    const leavesShape = new CANNON.Sphere(1.2);                        // radius big enough for leaves

    const treeBody = new CANNON.Body({ mass: treeDimension.mass });  // Static
    treeBody.addShape(trunkShape, new CANNON.Vec3(0, 1, 0));           // trunk offset up
    treeBody.addShape(leavesShape, new CANNON.Vec3(0, 2.8, 0));        // leaves at top

    // Copy position & rotation from visual tree
    treeBody.position.copy(tree.position);
    treeBody.quaternion.copy(tree.quaternion);

    world.addBody(treeBody);

    // Optional: store reference so we can sync later (not needed for static)
    tree.userData.physicsBody = treeBody;
});




/**
 * Rocks
 */
const rockDimension = {
    radius: 0.5,
    detail: 0,
    color: "#95955f",
    count: 25,
    mass: 0
}

const rockGeo = new THREE.DodecahedronGeometry(rockDimension.radius * (Math.random() + 0.5), rockDimension.detail)
const rockMat = new THREE.MeshLambertMaterial( { color: rockDimension.color} )

const fixedRocks = [
    { x: -12.649, y: 0.114, z: -14.998, rotX: -0.161, rotY: 0.198, rotZ: 0.098 },
    { x: 0.592, y: 0.122, z: 17.238, rotX: 0.059, rotY: -0.037, rotZ: -0.184 },
    { x: 13.511, y: 0.065, z: 3.047, rotX: 0.041, rotY: -0.074, rotZ: 0.083 },
    { x: 5.066, y: 0.064, z: 8.441, rotX: -0.196, rotY: 0.153, rotZ: -0.145 },
    { x: -16.585, y: 0.074, z: 9.855, rotX: 0.174, rotY: 0.020, rotZ: -0.116 },
    { x: 8.038, y: 0.108, z: 14.577, rotX: -0.160, rotY: -0.082, rotZ: -0.032 },
    { x: 7.775, y: 0.146, z: -16.327, rotX: -0.052, rotY: -0.128, rotZ: -0.058 },
    { x: -24.230, y: 0.034, z: 17.235, rotX: -0.046, rotY: -0.081, rotZ: -0.106 },
    { x: 18.939, y: 0.027, z: 15.687, rotX: 0.189, rotY: 0.132, rotZ: 0.069 },
    { x: 2.403, y: 0.039, z: 19.388, rotX: -0.132, rotY: 0.126, rotZ: -0.188 },
    { x: -5.213, y: 0.054, z: 4.087, rotX: 0.180, rotY: 0.121, rotZ: 0.047 },
    { x: 19.761, y: 0.019, z: -17.028, rotX: -0.197, rotY: 0.034, rotZ: 0.186 },
    { x: -18.665, y: 0.128, z: 17.291, rotX: -0.105, rotY: 0.016, rotZ: 0.196 },
    { x: -10.498, y: 0.071, z: 14.440, rotX: -0.162, rotY: 0.163, rotZ: -0.009 },
    { x: -22.261, y: 0.114, z: -6.482, rotX: -0.122, rotY: -0.135, rotZ: 0.124 },
    { x: -23.441, y: 0.034, z: -17.148, rotX: 0.087, rotY: 0.143, rotZ: -0.073 },
    { x: -10.328, y: 0.065, z: 3.859, rotX: 0.031, rotY: -0.104, rotZ: -0.090 },
    { x: -7.612, y: 0.076, z: -15.163, rotX: 0.020, rotY: -0.151, rotZ: -0.144 },
    { x: 15.152, y: 0.146, z: -10.894, rotX: -0.190, rotY: -0.128, rotZ: -0.050 },
    { x: -5.591, y: 0.145, z: 3.850, rotX: -0.099, rotY: 0.172, rotZ: 0.172 },
    { x: 19.566, y: 0.094, z: 13.983, rotX: -0.030, rotY: -0.130, rotZ: 0.088 },
    { x: 5.071, y: 0.059, z: 10.230, rotX: -0.092, rotY: -0.066, rotZ: -0.107 },
    { x: 5.420, y: 0.123, z: -11.357, rotX: -0.004, rotY: 0.035, rotZ: 0.120 },
    { x: -14.674, y: 0.140, z: 18.216, rotX: 0.017, rotY: 0.132, rotZ: -0.147 },
    { x: -0.492, y: 0.009, z: -19.967, rotX: -0.161, rotY: 0.032, rotZ: 0.009 },
];
  
fixedRocks.forEach(pos => {
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(pos.x, pos.y, pos.z);
    rock.rotation.set(pos.rotX, pos.rotY, pos.rotZ);
    rock.castShadow = true;
    rocks.add(rock);
});

rocks.children.forEach(rock => {
    const radius = rock.geometry.parameters.radius * rock.scale.x * 1.075; // slightly bigger
    const rockShape = new CANNON.Sphere(radius);

    const rockBody = new CANNON.Body({ mass: rockDimension.mass });
    rockBody.addShape(rockShape);
    rockBody.position.copy(rock.position);
    rockBody.quaternion.copy(rock.quaternion);

    world.addBody(rockBody);
    rock.userData.physicsBody = rockBody;
});




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
            q: 5,
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

// === INPUT KEYS (WASD + Space) ===
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false
};

// Key down
window.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'KeyW': case 'ArrowUp':    keys.w = true; break;
        case 'KeyS': case 'ArrowDown':  keys.s = true; break;
        case 'KeyA': case 'ArrowLeft':  keys.a = true; break;
        case 'KeyD': case 'ArrowRight': keys.d = true; break;
        case 'Space': keys.space = true; e.preventDefault(); break;
    }
});

// Key up
window.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'KeyW': case 'ArrowUp':    keys.w = false; break;
        case 'KeyS': case 'ArrowDown':  keys.s = false; break;
        case 'KeyA': case 'ArrowLeft':  keys.a = false; break;
        case 'KeyD': case 'ArrowRight': keys.d = false; break;
        case 'Space': keys.space = false; break;
    }
});


// === CAR PHYSICS: RaycastVehicle (FINAL FIXED VERSION) ===

// Chassis physics body
const chassisShape = new CANNON.Box(new CANNON.Vec3(
    carDimension.mainBody.width / 2,
    carDimension.mainBody.height / 2,
    carDimension.mainBody.depth / 2
));

const chassisBody = new CANNON.Body({
    mass: 800,
    shape: chassisShape,
    position: new CANNON.Vec3(0, 1, 0)  // Start above ground
});
world.addBody(chassisBody);

// Create RaycastVehicle
const vehicle = new CANNON.RaycastVehicle({
    chassisBody: chassisBody
});

// Wheel options
const wheelOptions = {
    radius: carDimension.wheel.tyre.radius + 0.02,
    height: carDimension.wheel.tyre.height,
    suspensionStiffness: 45,
    suspensionRestLength: 0.4,
    frictionSlip: 6,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 200000,
    rollInfluence: 0.01,
    axleLocal: new CANNON.Vec3(-1, 0, 0),     // Left-right
    directionLocal: new CANNON.Vec3(0, -1, 0), // Down
    chassisConnectionPointLocal: new CANNON.Vec3(),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true
};

// Add 4 wheels with correct positions
const wheelMeshes = [wheelOne, wheelTwo, wheelThree, wheelFour];

[
    [ carDimension.mainBody.width * 0.35,  -carDimension.mainBody.depth * 0.45],  // Front Left
    [-carDimension.mainBody.width * 0.35,  -carDimension.mainBody.depth * 0.45],  // Front Right
    [ carDimension.mainBody.width * 0.35,   carDimension.mainBody.depth * 0.45],  // Rear Left
    [-carDimension.mainBody.width * 0.35,   carDimension.mainBody.depth * 0.45]   // Rear Right
].forEach((pos, i) => {
    vehicle.addWheel(wheelOptions);
    vehicle.wheelInfos[i].chassisConnectionPointLocal.set(pos[0], -0.3, pos[1]);
});

vehicle.addToWorld(world);

// === INPUT KEYS (already in your code) — keep it exactly as is ===
// (You already have this — perfect)

// === CAR CONTROLS ===
const MAX_STEER = 0.6;
const ENGINE_POWER = 1400;
const BRAKE_POWER = 100;

function updateCarControls() {
    const forwardForce = keys.w ? ENGINE_POWER : 0;
    const reverseForce = keys.s ? -ENGINE_POWER * 0.6 : 0;
    const brakeForce = keys.s ? BRAKE_POWER : 0;

    // Speed-based steering
    const speed = chassisBody.velocity.length();
    const steerAmount = MAX_STEER * Math.max(0.3, 1 - speed / 60);

    const steerLeft  = keys.a ? steerAmount : 0;
    const steerRight = keys.d ? -steerAmount : 0;

    // Apply forces
    vehicle.applyEngineForce(forwardForce + reverseForce, 2);
    vehicle.applyEngineForce(forwardForce + reverseForce, 3); // Rear wheels
    vehicle.setBrake(brakeForce, 0);
    vehicle.setBrake(brakeForce, 1);
    vehicle.setBrake(brakeForce, 2);
    vehicle.setBrake(brakeForce, 3);

    vehicle.setSteeringValue(steerLeft + steerRight, 0);  // Front wheels
    vehicle.setSteeringValue(steerLeft + steerRight, 1);

    // JUMP (Space)
    if (keys.space && vehicle.numWheelsOnGround >= 3) {
        chassisBody.applyImpulse(new CANNON.Vec3(0, 1200, 0), chassisBody.position);
        keys.space = false; // Prevent spam
    }
}

// === SYNC CAR + WHEELS ===
function syncCar() {
    // Sync main car body
    car.position.copy(chassisBody.position);
    car.quaternion.copy(chassisBody.quaternion);

    // Sync each wheel
    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
        const wheelInfo = vehicle.wheelInfos[i];
        const wheelMesh = wheelMeshes[i];

        vehicle.updateWheelTransform(i);
        const t = wheelInfo.worldTransform;

        wheelMesh.position.copy(t.position);
        wheelMesh.quaternion.copy(t.quaternion);

        // Spin tyre visually
        wheelMesh.children[0].rotation.x -= wheelInfo.engineForce * 0.02;
    }
}









/**
 * Bricks – Now with GROUPS! Rotate once, all bricks follow
 */
const BRICK = {
    w: 0.575,
    h: 0.275,
    d: 0.2775,
    color: 0xc1440e,
    roughness: 0.8,
    metalness: 0.1,
    mass: 8,           // Heavy enough to fly nicely when hit
    friction: 0.6,
    restitution: 0.3 // Bounciness
};

const brickGeo = new THREE.BoxGeometry(BRICK.w, BRICK.h, BRICK.d);
const brickMat = new THREE.MeshStandardMaterial({
    color: BRICK.color,
    roughness: BRICK.roughness,
    metalness: BRICK.metalness
});

/**
 * Helper: Add brick to a group (no randomness on group level)
 */
function addBrickToGroup(group, localX, localY, localZ) {
    const brick = new THREE.Mesh(brickGeo, brickMat);
    
    brick.position.set(
        localX + (Math.random() - 0.5) * 0.03,
        localY + BRICK.h / 2,
        localZ + (Math.random() - 0.5) * 0.03
    );
    
    brick.rotation.y = (Math.random() - 0.5) * 0.2;
    brick.rotation.x = (Math.random() - 0.5) * 0.05;
    brick.rotation.z = (Math.random() - 0.5) * 0.05;
    
    brick.castShadow = true;
    brick.receiveShadow = true;
    
    group.add(brick);
    return brick;
}

/**
 * PYRAMID – Now returns a rotatable group!
 */
export function createPyramid(scene, centerX = 0, centerZ = 0, rotationY = 0) {
    const pyramidGroup = new THREE.Group();
    const steps = 7;
    let currentStep = steps;

    for (let row = 0; row < steps; row++) {
        const y = row * BRICK.h;
        const brickCount = currentStep;
        const totalWidth = brickCount * BRICK.w;
        const startX = -totalWidth / 2 + BRICK.w / 2;
        const stagger = (row % 2 === 1) ? BRICK.w / 2 : 0;

        for (let i = 0; i < brickCount; i++) {
            const localX = startX + i * BRICK.w + stagger;
            const localZ = 0;
            addBrickToGroup(pyramidGroup, localX, y, localZ);
        }
        currentStep--;
    }

    // Position + rotate the entire group
    pyramidGroup.position.set(centerX, 0, centerZ);
    pyramidGroup.rotation.y = rotationY;

    scene.add(pyramidGroup);
    return pyramidGroup; // You can now rotate/move it anytime!
}

/**
 * TALL TOWER – Group version
 */
export function createTower(scene, centerX = 0, centerZ = 0, rotationY = 0) {
    const towerGroup = new THREE.Group();
    const width = 4;
    const height = 12;

    for (let row = 0; row < height; row++) {
        const isOdd = row % 2 === 1;
41;
        const offset = isOdd ? BRICK.w / 2 : 0;

        for (let i = 0; i < width; i++) {
            const localX = -((width - 1) * BRICK.w / 2) + i * BRICK.w + offset;
            const localZ = 0;
            addBrickToGroup(towerGroup, localX, row * BRICK.h, localZ);
        }
    }

    towerGroup.position.set(centerX, 0, centerZ);
    towerGroup.rotation.y = rotationY;
    scene.add(towerGroup);
    return towerGroup;
}

/**
 * ZIGZAG – Group version
 */
export function createZigzag(scene, startX = 0, startZ = 0, rotationY = 0) {
    const zigzagGroup = new THREE.Group();
    const segments = 7;
    let x = 0;
    let z = 0;
    let dir = 1;

    for (let s = 0; s < segments; s++) {
        const height = 4 + (s % 3);
        for (let h = 0; h < height; h++) {
            for (let w = 0; w < 2; w++) {
                addBrickToGroup(zigzagGroup, x + w * BRICK.w, h * BRICK.h, z);
            }
        }
        x += dir * 2 * BRICK.w;
        z += BRICK.d * 3;
        dir *= -1;
    }

    zigzagGroup.position.set(startX, 0, startZ);
    zigzagGroup.rotation.y = rotationY;
    scene.add(zigzagGroup);
    return zigzagGroup;
}

createPyramid(scene, 1, -15); 
createZigzag(scene, 15, -20, Math.PI / 6);
createTower(scene, -8, 10); 
createPyramid(scene, -9, -3, Math.PI / 4);
createZigzag(scene, 14, 11, -Math.PI * 0.25); 
createTower(scene, -17.5, -19, Math.PI * 0.15);
createZigzag(scene, -19, 13, Math.PI * 0.25); 


// Bricks Physics
// Helper: Convert one visual brick → physics body
function makeBrickPhysical(visualBrick) {
    const shape = new CANNON.Box(
        new CANNON.Vec3(BRICK.w/2, BRICK.h/2, BRICK.d/2)  // half-extents!
    );

    const body = new CANNON.Body({
        mass: BRICK.mass,
        shape: shape,
        material: new CANNON.Material({
            friction: BRICK.friction,
            restitution: BRICK.restitution
        })
    });

    // Copy position + rotation from visual mesh
    body.position.copy(visualBrick.position);
    body.quaternion.copy(visualBrick.quaternion);

    world.addBody(body);
    visualBrick.userData.physicsBody = body;  // Link them!
}

// Loop through ALL bricks (pyramids, towers, zigzags) and make them physical
scene.traverse((object) => {
    if (object.isMesh && object.geometry === brickGeo) {  // Only our bricks!
        makeBrickPhysical(object);
    }
});

function syncBricks() {
    scene.traverse((object) => {
        if (object.isMesh && object.geometry === brickGeo && object.userData.physicsBody) {
            const body = object.userData.physicsBody;
            object.position.copy(body.position);
            object.quaternion.copy(body.quaternion);
        }
    });
}









/**
 * LOG CURRENT POSITIONS — Run once, copy output, then delete this function!
 */
function logCurrentLayout() {
    console.log("%c=== PERMANENT LAYOUT DATA (Copy this!) ===", "color: cyan; font-weight: bold;");
  
    // Log Trees
    console.log("%cTREES:", "color: green; font-weight: bold;");
    trees.children.forEach((tree, i) => {
      console.log(`{ x: ${tree.position.x.toFixed(3)}, y: ${tree.position.y.toFixed(3)}, z: ${tree.position.z.toFixed(3)}, rotY: ${tree.rotation.y.toFixed(3)} },`);
    });
  
    // Log Rocks
    console.log("%cROCKS:", "color: orange; font-weight: bold;");
    rocks.children.forEach((rock, i) => {
      console.log(`{ x: ${rock.position.x.toFixed(3)}, y: ${rock.position.y.toFixed(3)}, z: ${rock.position.z.toFixed(3)}, rotX: ${rock.rotation.x.toFixed(3)}, rotY: ${rock.rotation.y.toFixed(3)}, rotZ: ${rock.rotation.z.toFixed(3)} },`);
    });
  
    // Log Brick Walls (Pyramid, Tower, Zigzag)
    console.log("%cBRICK WALLS (call positions):", "color: red; font-weight: bold;");
    console.log(`createPyramid(scene, -5, 0);`);
    console.log(`createTower(scene, -8, 10);`);
    console.log(`createZigzag(scene, 10, 5);`);
    console.log(`createPyramid(scene, -15, -5);`);
    console.log(`createTower(scene, 1, -15);`);
    console.log(`createZigzag(scene, 18, -10);`);
  
    console.log("%c=== COPY EVERYTHING ABOVE AND REPLACE RANDOM GENERATION ===", "color: cyan; font-weight: bold;");
}
// logCurrentLayout()  














/**
 * Fog
 */
scene.fog = new THREE.FogExp2(0xe8b923, 0.0975);


/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)  // Soft fill
const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
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
mainBody.castShadow = true
roof.castShadow = true




// physics optimizations
world.addEventListener('postStep', () => {
    world.bodies.forEach(body => {
        if (body.sleepState !== CANNON.Body.SLEEPING && 
            body.velocity.lengthSquared() < 0.1 && 
            body.angularVelocity.lengthSquared() < 0.1) {
            body.sleep();
        }
    });
});













/**
 * Animate
 */
const timer = new Timer()

const tick = () => {
    timer.update()
    const elapsedTime = timer.getElapsed()
    const deltaTime = timer.getDelta();  // Use your timer!

    updateCarControls();  // Apply inputs

    // Physics
    world.step(1/60, deltaTime, 3);  // Fixed timeStep
    syncArena();  // Sync arena meshes
    syncBricks(); // Sync bricks meshes
    syncCar(); // Sync car meshes

    // orbit control
    controls.update()

    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()