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

const originalCameraPosition = new THREE.Vector3(0, 0, 70);
camera.position.copy(originalCameraPosition);
const cameraTarget = new THREE.Vector3(0, 0, 0);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.copy(cameraTarget);
controls.update();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableObjects = [];
const rotatingBeads = new Map();
const beadCount = 84;
const rotating = Array.from({ length: beadCount }, () => Math.random() > 0.60);
let inactivityTimer = null;

function createBead(x, y, z) {
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
    if (rotating[clickableObjects.length]) {
        bead.rotation.y = Math.PI;
    }
    scene.add(bead);
    clickableObjects.push(bead);
}

function createThread(x, y, z) {
    const geometry = new THREE.CylinderGeometry(0.05, 0.05, 50, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const thread = new THREE.Mesh(geometry, material);
    thread.rotation.z = Math.PI / 2;
    thread.position.set(x, y, z);
    scene.add(thread);
}

function createWampum() {
    for (let y = -5; y < 7.5; y += 2.5) {
        createThread(0, y, 0);
        if (y < 5) {
            for (let x = -25; x < 27.5; x += 2.5) {
                createBead(x, y + 1.25, 0);
            }
        }
    }
}

function onWindowResize() {
    camera.aspect = mainSection.clientWidth / mainSection.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mainSection.clientWidth, mainSection.clientHeight);
    resetInactivityTimer();
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
    resetInactivityTimer();
}

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

    controls.update();
    renderer.render(scene, camera);
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        controls.reset();
    }, 10000);
}

createWampum();
animate();
resetInactivityTimer();

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('click', onMouseClick, false);
renderer.domElement.addEventListener('mousedown', resetInactivityTimer, false);
renderer.domElement.addEventListener('mouseup', resetInactivityTimer, false);
renderer.domElement.addEventListener('mousemove', resetInactivityTimer, false);