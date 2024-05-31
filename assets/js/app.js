// THREE settings
const mainSection = document.getElementsByClassName("main__animation")[0];
const scene = new THREE.Scene();
const aspect = mainSection.clientWidth / mainSection.clientHeight;
const fov = 10;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.domElement.className = 'animation';
renderer.setSize(mainSection.clientWidth, mainSection.clientHeight);
renderer.setClearColor(0xE5CB9F);
mainSection.appendChild(renderer.domElement);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
camera.position.z = 70;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableObjects = [];
const rotatingBeads = new Map();

// make wampum
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
    for (let i = -5; i < 7.5; i = i + 2.5) {
        makeThread(0, i, 0);
        if (i < 5) {
            for (let i2 = -25; i2 < 27.5; i2 = i2 + 2.5) {
                makeBead(i2, i + 1.25, 0);
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
        const targetRotation = (rotatingBeads.get(bead) || 0) + Math.PI;
        rotatingBeads.set(bead, targetRotation);
    }
}

window.addEventListener('click', onMouseClick, false);

function animate() {
    requestAnimationFrame(animate);

    rotatingBeads.forEach((targetRotation, bead) => {
        if (bead.rotation.y < targetRotation) {
            bead.rotation.y += 0.05;
            if (bead.rotation.y >= targetRotation) {
                bead.rotation.y = targetRotation;
            }
        }
    });

    renderer.render(scene, camera);
}

animate();