// Import Three.js library if you're using a module bundler
// import * as THREE from 'three';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = 0;
camera.position.y = 100;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xadd8e6); // Set background color to white
document.body.appendChild(renderer.domElement);

// Ambient light for better visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white ambient light
scene.add(ambientLight);

// Create directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Soft white light
directionalLight.position.set(1, 1, 1); // Set light direction
scene.add(directionalLight);

// Create point light
const pointLight = new THREE.PointLight(0xffffff, 0.5); // Soft white light
pointLight.position.set(0, 200, 0); // Set light position
scene.add(pointLight);

// Create spot light
const spotLight = new THREE.SpotLight(0xffffff, 0.5); // Soft white light
spotLight.position.set(0, 400, 0); // Set light position
spotLight.target.position.set(0, 0, 0); // Set light target
scene.add(spotLight);
scene.add(spotLight.target);


// Variables to track mouse movement and click position
let mouseX = 0;
let mouseY = 0;
let mousePressed = false;
let clickX = 0;

// Function to update mouse position
function updateMousePosition(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
}

// Function to update mouse state and record click position
function updateMouseState(event) {
    mousePressed = event.buttons > 0;
    if (mousePressed) {
        clickX = mouseX; // Record click position
    }
}

// Add event listeners to update mouse position and state
document.addEventListener('mousemove', updateMousePosition, false);
document.addEventListener('mousedown', updateMouseState, false);
document.addEventListener('mouseup', updateMouseState, false);

// Load GLTF model
const loader = new THREE.GLTFLoader();
loader.load('assets/models/town/scene.gltf', function (gltf) {
    const model = gltf.scene;
    scene.add(model);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the model horizontally only when mouse button is pressed
    if (mousePressed) {
        const delta = mouseX - clickX; // Calculate rotation based on click position
        scene.rotation.y += delta * 0.05; // Adjust rotation speed if needed
    }

    renderer.render(scene, camera);
}
animate();
