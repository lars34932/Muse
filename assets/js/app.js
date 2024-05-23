const mainSection = document.getElementsByClassName("main__animation")[0];
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, mainSection.clientWidth / mainSection.clientHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.domElement.className = 'animation';
renderer.setSize(mainSection.clientWidth, mainSection.clientHeight);
renderer.setClearColor(0xE5CB9F);
mainSection.appendChild(renderer.domElement);

const vertexShader = `
    varying vec3 vPosition;
    varying vec3 worldPosition;
    varying vec2 vUv;
    void main() {
        vUv = uv;
        vPosition = position;
        worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    varying vec3 vPosition;
    varying vec3 worldPosition;
    varying vec2 vUv;
    uniform float time;
    void main() {
        float wave1 = sin(worldPosition.x * 1.5 + time * 0.5) * 0.5;
        float wave2 = sin(worldPosition.x * 2.0 - time * 0.3) * 0.35;
        
        vec3 darkBlue = vec3(0.0, 0.2, 0.5);
        vec3 darkGreen = vec3(0.0, 0.4, 0.2); 
        vec3 lightBlue = vec3(0.2, 0.4, 0.7);
        vec3 lightGreen = vec3(0.2, 0.6, 0.4);

        float waveHeight1 = vPosition.y + wave1;
        float waveHeight2 = vPosition.y + wave2 - 0.1;

        float gradientFactor1 = smoothstep(-0.5, 0.5, waveHeight1);
        float gradientFactor2 = smoothstep(-0.5, 0.5, waveHeight2);

        vec3 waveColor1 = mix(darkBlue, darkGreen, gradientFactor1);
        vec3 waveColor2 = mix(lightBlue, lightGreen, gradientFactor2);

        vec3 topColor = vec3(1.0, 1.0, 1.0);
        float mixFactor1 = step(0.0, waveHeight1);
        float mixFactor2 = step(0.0, waveHeight2);

        vec3 finalColor = mix(waveColor1, topColor, mixFactor1) * 0.5 + mix(waveColor2, topColor, mixFactor2) * 0.5;
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        time: { value: 0 }
    }
});

const cube = new THREE.Mesh(new THREE.BoxGeometry(9, 9, 9), material);
scene.add(cube);
const edges = new THREE.EdgesGeometry(cube.geometry);
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const cubeEdges = new THREE.LineSegments(edges, edgeMaterial);
scene.add(cubeEdges);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

camera.position.z = 13;

const loader = new THREE.GLTFLoader();
let boat;
loader.load('assets/models/ship/scene.gltf', function (gltf) {
    boat = gltf.scene;
    boat.scale.set(0.25, 0.25, 0.25);
    boat.position.set(-4.5, 0, 5);
    scene.add(boat);
    console.log('Boat loaded successfully', boat);
}, undefined, function (error) {
    console.error('An error happened', error);
});

let boatSpeed = 0.01;
let rotating = false;
let rotationProgress = 0;
const rotationDuration = 300;
const rotationAngle = -Math.PI / 2;
let initialBoatPosition = new THREE.Vector3();

function animate() {
    requestAnimationFrame(animate);

    material.uniforms.time.value += 0.02;

    if (boat && !rotating) {
        const time = material.uniforms.time.value;
        const wave1 = Math.sin(boat.position.x * 1.5 + time * 0.5) * 0.2;
        const wave2 = Math.sin(boat.position.x * 2.0 - time * 0.3) * 0.14 - 0.04;
        boat.position.y = wave1 + wave2;
        boat.rotation.z = Math.sin(time * 0.5) * 0.05;
        boat.rotation.x = Math.cos(time * 0.3) * 0.05;

        boat.position.x += boatSpeed;
        if (boat.position.x >= 4.5) {
            boat.position.x = 4.5;
            startRotation();
        }
    }

    if (rotating) {
        rotationProgress += 1;
        const rotationFraction = rotationProgress / rotationDuration;
        const currentRotationAngle = rotationFraction * rotationAngle;

        cube.rotation.y = currentRotationAngle;
        cubeEdges.rotation.y = currentRotationAngle;

        const cosAngle = Math.cos(currentRotationAngle);
        const sinAngle = Math.sin(currentRotationAngle);
        const newX = initialBoatPosition.x * cosAngle + initialBoatPosition.z * sinAngle;
        const newZ = -initialBoatPosition.x * sinAngle + initialBoatPosition.z * cosAngle;
        boat.position.set(newX, boat.position.y, newZ);

        if (rotationProgress >= rotationDuration) {
            rotating = false;
            cube.rotation.y = 0;
            cubeEdges.rotation.y = 0;
            resetBoatPosition();
        }
    }

    renderer.render(scene, camera);
}
animate();

function startRotation() {
    rotating = true;
    rotationProgress = 0;
    initialBoatPosition.copy(boat.position);
}

function resetBoatPosition() {
    boat.position.set(-4.5, 0, 4.5);
    boat.rotation.set(0, 0, 0);
    cube.rotation.y = 0;
    cubeEdges.rotation.y = 0;
}

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = mainSection.clientWidth / mainSection.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mainSection.clientWidth, mainSection.clientHeight);
}

// Add Sun as a flat circle with the top half removed
const sunGeometry = new THREE.CircleGeometry(1, 32, Math.PI, Math.PI); // A circle with the top half removed
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFA500 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 4.5, 4.51);
cube.add(sun);

// Function to create sun rays with variable width pointing to the bottom 50% and transparent
function createSunRay() {
    const length = Math.random() * 5 + 2;
    const angle = Math.random() * Math.PI - Math.PI; // Angle restricted to bottom 50%
    const x = Math.cos(angle) * length;
    const y = Math.sin(angle) * length;
    const width = Math.random() * 0.2 + 0.05; // Random width between 0.05 and 0.25

    const rayGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        -width / 2, 0, 0,
        width / 2, 0, 0,
        width / 2, y, 0,
        -width / 2, y, 0,
    ]);
    rayGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    rayGeometry.setIndex([0, 1, 2, 2, 3, 0]); // Indices to draw two triangles to form a rectangle

    const rayMaterial = new THREE.MeshBasicMaterial({ color: 0xFFA500, transparent: true, opacity: 0.6 }); // Semi-transparent rays
    const ray = new THREE.Mesh(rayGeometry, rayMaterial);
    ray.position.copy(sun.position);

    cube.add(ray);

    setTimeout(() => {
        cube.remove(ray);
    }, 1000); // Remove the ray after 1 second
}

// Spawn sun rays periodically
setInterval(createSunRay, 2000);