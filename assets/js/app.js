const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x5ab2ff); // Set a base color for the background
document.body.appendChild(renderer.domElement);

// Create a gradient background
const gradientCanvas = document.createElement('canvas');
gradientCanvas.width = window.innerWidth;
gradientCanvas.height = window.innerHeight;
const gradientContext = gradientCanvas.getContext('2d');

const gradient = gradientContext.createLinearGradient(0, 0, 0, gradientCanvas.height);
gradient.addColorStop(0.4, 'rgba(90,178,255,1)');
gradient.addColorStop(0.9, 'rgba(202,244,255,1)');

gradientContext.fillStyle = gradient;
gradientContext.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);

document.body.style.background = `url(${gradientCanvas.toDataURL()})`;

// Shader material for the cube
const vertexShader = `
    varying vec3 vPosition;
    void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    varying vec3 vPosition;
    void main() {
        float mixFactor = (vPosition.y + 4.5) / 9.0;
        vec3 topColor = vec3(202.0 / 255.0, 244.0 / 255.0, 255.0 / 255.0);
        vec3 bottomColor = vec3(90.0 / 255.0, 178.0 / 255.0, 255.0 / 255.0);
        gl_FragColor = vec4(mix(bottomColor, topColor, mixFactor), 1.0);
    }
`;

const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
});

const cube = new THREE.Mesh(new THREE.BoxGeometry(9, 9, 9), material);
scene.add(cube);

// Add black edges to the cube
const edges = new THREE.EdgesGeometry(cube.geometry);
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const cubeEdges = new THREE.LineSegments(edges, edgeMaterial);
scene.add(cubeEdges);

// Sea plane shader
const seaVertexShader = `
    varying vec2 vUv;
    uniform float time;
    void main() {
        vUv = uv;
        vec3 pos = position;
        pos.z += sin(pos.y * 2.0 + time) * 0.5;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

const seaFragmentShader = `
    varying vec2 vUv;
    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.5 + 0.5 * vUv.y, 1.0);
    }
`;

const seaMaterial1 = new THREE.ShaderMaterial({
    vertexShader: seaVertexShader,
    fragmentShader: seaFragmentShader,
    uniforms: {
        time: { value: 0 }
    }
});

const seaMaterial2 = new THREE.ShaderMaterial({
    vertexShader: seaVertexShader,
    fragmentShader: seaFragmentShader,
    uniforms: {
        time: { value: 0 }
    }
});

const seaGeometry = new THREE.PlaneGeometry(9, 9, 50, 50);

const seaGroup = new THREE.Object3D();

const sea1 = new THREE.Mesh(seaGeometry, seaMaterial1);
sea1.position.set(0, -4.5, 4.5);
sea1.rotation.x = -Math.PI / 2;
seaGroup.add(sea1);

const sea2 = new THREE.Mesh(seaGeometry, seaMaterial2);
sea2.position.set(4.5, -4.5, 0);
sea2.rotation.x = -Math.PI / 2;
sea2.rotation.y = Math.PI / 2;
seaGroup.add(sea2);

const sea3 = new THREE.Mesh(seaGeometry, seaMaterial1);
sea3.position.set(-4.5, -4.5, 0);
sea3.rotation.x = -Math.PI / 2;
sea3.rotation.y = -Math.PI / 2;
seaGroup.add(sea3);

const sea4 = new THREE.Mesh(seaGeometry, seaMaterial2);
sea4.position.set(0, -4.5, -4.5);
sea4.rotation.x = -Math.PI / 2;
sea4.rotation.y = Math.PI;
seaGroup.add(sea4);

scene.add(seaGroup);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

camera.position.z = 20;

function animate() {
    requestAnimationFrame(animate);

    cube.rotation.y += 1 * 0.005;
    cubeEdges.rotation.y += 1 * 0.005; // Rotate the edges with the cube
    seaGroup.rotation.y += 1 * 0.005; // Rotate the sea group with the cube
    
    seaMaterial1.uniforms.time.value += 0.01;
    seaMaterial2.uniforms.time.value += 0.015; // Different speed for second sea plane
    
    renderer.render(scene, camera);
}
animate();