const mainSection = document.getElementsByClassName("main__section")[0];
const fixedHeight = 1179;
const aspect = mainSection.clientWidth / fixedHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 2000);
camera.position.set(0, 100, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(mainSection.clientWidth, fixedHeight);
renderer.setClearColor(0xadd8e6);
renderer.domElement.className = 'animation';
mainSection.appendChild(renderer.domElement);
camera.updateProjectionMatrix();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(0, 200, 0);
scene.add(pointLight);

const spotLight = new THREE.SpotLight(0xffffff, 0.5);
spotLight.position.set(0, 400, 0);
spotLight.target.position.set(0, 0, 0);
scene.add(spotLight);
scene.add(spotLight.target);

let initialMouseX = 0;
let initialMouseY = 0;
let isMouseDown = false;
let mouseX = 0;
let mouseY = 0;

function onMouseMove(event) {
    if (isMouseDown) {
        mouseX = (event.clientX - initialMouseX) / window.innerWidth;
        mouseY = (event.clientY - initialMouseY) / window.innerHeight;
    }
}

function onMouseDown(event) {
    isMouseDown = true;
    initialMouseX = event.clientX;
    initialMouseY = event.clientY;
}

function onMouseUp() {
    isMouseDown = false;
}

renderer.domElement.addEventListener('mousemove', onMouseMove, false);
renderer.domElement.addEventListener('mousedown', onMouseDown, false);
renderer.domElement.addEventListener('mouseup', onMouseUp, false);

const loader = new THREE.GLTFLoader();
loader.load('assets/models/town/scene.gltf', function (gltf) {
    const model = gltf.scene;
    scene.add(model);
});

let yaw = 0;
let pitch = 0;

function animate() {
    requestAnimationFrame(animate);

    if (isMouseDown) {
        const sensitivity = 0.05;
        yaw -= mouseX * sensitivity;
        pitch -= mouseY * sensitivity;

        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

        const quaternionYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        const quaternionPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);

        camera.quaternion.copy(quaternionYaw).multiply(quaternionPitch);
    }

    renderer.render(scene, camera);
}

function moveCamera(i) {
    if (i == 1) {
        camera.position.set(0, 100, 0);
        yaw = Math.PI / 4;
        pitch = 0;
    } else if (i == 2) {
        camera.position.set(0, 100, -500);
        yaw = Math.PI / 2;
        pitch = 0;
    } else if (i == 3) {
        camera.position.set(0, 100, 500);
        yaw = Math.PI / 5;
        pitch = 0;
    } else if (i == 4) {
        camera.position.set(0, 1000, 0);
        yaw = 0;
        pitch = -1.5;
    }

    const quaternionYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const quaternionPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
    camera.quaternion.copy(quaternionYaw).multiply(quaternionPitch);
}

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    const aspect = mainSection.clientWidth / fixedHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(mainSection.clientWidth, fixedHeight);
}

animate();

const menu = document.getElementById("menu");
let visible = false;
function appear() {
    if (visible === false) {
        menu.style.display = "flex";
        visible = true;
    } else {
        menu.style.display = "none";
        visible = false;
    }
}