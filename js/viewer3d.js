let scene, camera, renderer, controls;
const container3d = document.getElementById('container-3d');

function init3D(projectData) {
    const room = projectData.room;
    const furnitureList = projectData.furnitureList;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // カメラ（目線の高さ150cm、部屋の後ろから中を見る）
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 150, room.d / 2 - 30);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container3d.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 120, 0);
    controls.enableDamping = true;

    // ライト
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight.position.set(0, room.h - 10, 0);
    scene.add(dirLight);

    // --- 🏠 壁・床・天井（中心は 0, 0, 0） ---
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf3f4f6, side: THREE.DoubleSide });
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xd1d5db, side: THREE.DoubleSide });
    const ceilingMat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });

    // 床
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(room.w, room.d), floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // 天井
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(room.w, room.d), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = room.h;
    scene.add(ceiling);

    // 各壁の配置
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(room.w, room.h), wallMat);
    backWall.position.set(0, room.h / 2, -room.d / 2);
    scene.add(backWall);

    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(room.w, room.h), wallMat);
    frontWall.position.set(0, room.h / 2, room.d / 2);
    scene.add(frontWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(room.d, room.h), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-room.w / 2, room.h / 2, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(room.d, room.h), wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(room.w / 2, room.h / 2, 0);
    scene.add(rightWall);

    // 床の上のグリッド
    const grid = new THREE.GridHelper(Math.max(room.w, room.d), 20);
    grid.position.y = 1;
    scene.add(grid);

    // --- 🪑 家具の配置 ---
    furnitureList.forEach(item => {
        let geometry;
        if (item.type === 'cylinder') {
            geometry = new THREE.CylinderGeometry(item.w / 2, item.w / 2, 40, 32);
        } else {
            geometry = new THREE.BoxGeometry(item.w, 40, item.h);
        }

        const material = new THREE.MeshLambertMaterial({ color: parseInt(item.color) });
        const mesh = new THREE.Mesh(geometry, material);

        // 🌟 2Dの「部屋の左上(0,0)」からの位置を、3Dの「中心(0,0)からの位置」に超シンプルに変換！
        const threeX = item.x - room.w / 2;
        const threeZ = item.y - room.d / 2;

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
