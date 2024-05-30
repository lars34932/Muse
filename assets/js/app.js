//THREE settings
const mainSection = document.getElementsByClassName("main__animation")[0];
const scene = new THREE.Scene();
const aspect = mainSection.clientWidth / mainSection.clientHeight;
const fov = 45; // Narrower field of view to reduce distortion
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
camera.position.z = 25;

//make wampum

function makeBead(x,y,z) {
    const geometry = new THREE.CylinderGeometry( 1, 1, 2, 32 ); 
    const material = new THREE.MeshBasicMaterial( {color: 0xEEEEEE} ); 
    const bead = new THREE.Mesh( geometry, material );
    bead.position.set(x,y,z);
    scene.add(bead);
}

function makeThread(x, y, z) {
    const geometry = new THREE.CylinderGeometry( 0.05, 0.05, 50, 32 ); 
    const material = new THREE.MeshBasicMaterial( {color: 0x808080} ); 
    const thread = new THREE.Mesh( geometry, material );
    thread.rotation.z = Math.PI / 2;
    thread.position.set(x,y,z);
    scene.add(thread);
}

function makeWampum() {
    for (let i=-5; i < 7.5; i=i+2.5) {
        makeThread(0,i,0);
        if (i < 5) {
            for (let i2=-25; i2 < 27.5; i2=i2+2.5) {
                makeBead(i2,i+1.25,0);
            }
        }  
    }

    
}

makeWampum();
//animate THREE

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = mainSection.clientWidth / mainSection.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mainSection.clientWidth, mainSection.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();