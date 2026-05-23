let scene, camera, renderer, controls;
const container3d = document.getElementById('container-3d');

function init3D(furnitureList, rect2d) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 300, 400);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container3d.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(200, 400, 200);
    scene.add(dirLight);

    const floorGeo = new THREE.PlaneGeometry(600, 600);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xe5e7eb });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const grid = new THREE.GridHelper(600, 30);
    grid.position.y = 1;
    scene.add(grid);

    const offsetX = rect2d.width / 2;
    const offsetY = rect2d.height / 2;

    furnitureList.forEach(item => {
        let geometry;
        if (item.type === 'cylinder') {
            geometry = new THREE.CylinderGeometry(item.w / 2, item.w / 2, 40, 32);
        } else {
            geometry = new THREE.BoxGeometry(item.w, 40, item.h);
        }

        const material = new THREE.MeshLambertMaterial({ color: parseInt(item.color) });
        const mesh = new THREE.Mesh(geometry, material);

        const threeX = item.x - offsetX;
        const threeZ = item.y - offsetY;

        mesh.position.set(threeX, 20, threeZ);
        scene.add(mesh);
    });

    animate();
}

function animate() {
    if (!scene) return;
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

document.getElementById('btn-back-to-2d').addEventListener('click', () => {
    document.getElementById('screen-3d').classList.add('hidden');
    document.getElementById('screen-2d').classList.remove('hidden');
    if(renderer) {
        renderer.dispose();
        container3d.innerHTML = '';
        scene = null;
    }
});

window.addEventListener('resize', () => {
    const s3d = document.getElementById('screen-3d');
    if (camera && renderer && !s3d.classList.contains('hidden')) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
