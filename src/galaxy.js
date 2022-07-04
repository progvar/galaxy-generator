import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
    Color,
    Scene,
    Clock,
    Points,
    WebGLRenderer,
    BufferGeometry,
    PointsMaterial,
    BufferAttribute,
    AdditiveBlending,
    PerspectiveCamera,
} from 'three';

const canvas = document.querySelector('canvas.webgl');
const scene = new Scene();
const parameters = {
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 3,
    spin: 1,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#2c50dd',
};
const gui = new GUI();

gui.add(parameters, 'count')
    .min(100)
    .max(1000000)
    .step(10)
    .onFinishChange(generateGalaxy);
gui.add(parameters, 'size')
    .min(0.001)
    .max(0.1)
    .step(0.001)
    .onFinishChange(generateGalaxy);
gui.add(parameters, 'radius')
    .min(0.01)
    .max(20)
    .step(0.01)
    .onFinishChange(generateGalaxy);
gui.add(parameters, 'branches')
    .min(2)
    .max(20)
    .step(1)
    .onFinishChange(generateGalaxy);
gui.add(parameters, 'spin')
    .min(-5)
    .max(5)
    .step(0.001)
    .onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower')
    .min(2)
    .max(10)
    .step(0.001)
    .onFinishChange(generateGalaxy);
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);

let geometry = null;
let material = null;
let points = null;

function generateGalaxy() {
    if (points) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const colorInside = new Color(parameters.insideColor);
    const colorOutside = new Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle =
            ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

        const randomX =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1);
        const randomY =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1);
        const randomZ =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1);

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] =
            Math.sin(branchAngle + spinAngle) * radius + randomZ;

        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geometry = new BufferGeometry()
        .setAttribute('position', new BufferAttribute(positions, 3))
        .setAttribute('color', new BufferAttribute(colors, 3));

    material = new PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: AdditiveBlending,
        vertexColors: true,
    });

    points = new Points(geometry, material);
    scene.add(points);
}

generateGalaxy();

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setAnimationLoop(onLoop);

const clock = new Clock();

function onLoop() {
    if (points) {
        points.rotateY(clock.getDelta() / 10);
    }

    controls.update();

    renderer.render(scene, camera);
}
