const mainSection = document.getElementsByClassName("main__animation")[0];
const scene = new THREE.Scene();
const aspect = mainSection.clientWidth / mainSection.clientHeight;
const fov = 11;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.domElement.className = 'animation';
renderer.setSize(mainSection.clientWidth, mainSection.clientHeight);
renderer.setClearColor(0xEEEEEE);
mainSection.appendChild(renderer.domElement);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
camera.position.set(0, 0, 70);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableObjects = [];
const rotatingBeads = new Map();
const beadCount = 84;
const rotating = Array.from({ length: beadCount }, () => Math.random() > 0.60);
let theta = 0;
let phi = Math.acos(camera.position.y / 70);
let targetCameraPosition = new THREE.Vector3(0, 0, 70);
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
const cameraDistance = 70;

// make wampum
let beadIndex = 0;
function makeBead(x, y, z) {
    const geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
    const material = new THREE.ShaderMaterial({
        vertexShader: `
        varying vec3 vPosition;
        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `,
        fragmentShader: `
            varying vec3 vPosition;
            void main() {
                if (vPosition.z < 0.0) {
                    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); // Blue
                } else {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White
                }
            }
        `
    });

    const bead = new THREE.Mesh(geometry, material);
    bead.position.set(x, y, z);
    if (rotating[beadIndex]) {
        bead.rotation.y = Math.PI;
    }
    beadIndex++;
    scene.add(bead);
    clickableObjects.push(bead);
}

function makeThread(x, y, z) {
    const geometry = new THREE.CylinderGeometry(0.05, 0.05, 50, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const thread = new THREE.Mesh(geometry, material);
    thread.rotation.z = Math.PI / 2;
    thread.position.set(x, y, z);
    scene.add(thread);
}

function makeWampum() {
    for (let y = -5; y < 7.5; y = y + 2.5) {
        makeThread(0, y, 0);
        if (y < 5) {
            for (let x = -25; x < 27.5; x = x + 2.5) {
                makeBead(x, y + 1.25, 0);
            }
        }
    }
}

makeWampum();

// animate THREE
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = mainSection.clientWidth / mainSection.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mainSection.clientWidth, mainSection.clientHeight);
}

function onMouseClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        const bead = intersects[0].object;
        const currentRotation = bead.rotation.y % (2 * Math.PI);
        const targetRotation = currentRotation === 0 ? Math.PI : 0;
        rotatingBeads.set(bead, targetRotation);
    }
}

window.addEventListener('click', onMouseClick, false);

mainSection.addEventListener('mousedown', (event) => {
    isDragging = true;
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
});

mainSection.addEventListener('mouseup', () => {
    isDragging = false;
});

mainSection.addEventListener('mousemove', (event) => {
    if (!isDragging) return;

    const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
    };

    theta += deltaMove.x * 0.005;
    phi -= deltaMove.y * 0.005;

    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));

    targetCameraPosition.x = cameraDistance * Math.sin(phi) * Math.cos(theta);
    targetCameraPosition.y = cameraDistance * Math.cos(phi);
    targetCameraPosition.z = cameraDistance * Math.sin(phi) * Math.sin(theta);

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
});

function animate() {
    requestAnimationFrame(animate);

    rotatingBeads.forEach((targetRotation, bead) => {
        const rotationStep = 0.05;
        const direction = (targetRotation - bead.rotation.y > 0) ? 1 : -1;
        bead.rotation.y += direction * rotationStep;

        if (Math.abs(targetRotation - bead.rotation.y) < rotationStep) {
            bead.rotation.y = targetRotation;
            rotatingBeads.delete(bead);
        }
    });

    camera.position.lerp(targetCameraPosition, 0.1);
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

animate();