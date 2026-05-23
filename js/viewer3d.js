let scene, camera, renderer, controls;
const container3d = document.getElementById('container-3d');

function init3D(projectData, rect2d) {
    const room = projectData.room;
    const furnitureList = projectData.furnitureList;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // 部屋の外は暗くする

    // 🌟 カメラを「部屋の中（少し後ろ寄り、人間の目線の高さ）」に配置
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 150, room.d / 2 - 30); // 高さ150cm、部屋の後ろ寄りに配置

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container3d.appendChild(renderer.domElement);

    // カメラ操作。部屋の中から見渡すので、ターゲットを部屋の中心（高さ120cm付近）にする
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 120, 0);
    controls.enableDamping = true;

    // ライト（部屋全体を照らす）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight.position.set(0, room.h - 10, 0);
    scene.add(dirLight);

    // --- 🏠 3Dの壁・床・天井の自動配置 ---
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf3f4f6, side: THREE.DoubleSide }); // 両面描画
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xd1d5db, side: THREE.DoubleSide });
    const ceilingMat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });

    // 床
    const floorGeo = new THREE.PlaneGeometry(room.w, room.d);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    // 天井
    const ceilingGeo = new THREE.PlaneGeometry(room.w, room.d);
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = room.h;
    scene.add(ceiling);

    // 奥の壁
    const backWallGeo = new THREE.PlaneGeometry(room.w, room.h);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, room.h / 2, -room.d / 2);
    scene.add(backWall);

    // 手前の壁
    const frontWallGeo = new THREE.PlaneGeometry(room.w, room.h);
    const frontWall = new THREE.Mesh(frontWallGeo, wallMat);
    frontWall.position.set(0, room.h / 2, room.d / 2);
    scene.add(frontWall);

    // 左の壁
    const leftWallGeo = new THREE.PlaneGeometry(room.d, room.h);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-room.w / 2, room.h / 2, 0);
    scene.add(leftWall);

    // 右の壁
    const rightWallGeo = new THREE.PlaneGeometry(room.d, room.h);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(room.w / 2, room.h / 2, 0);
    scene.add(rightWall);

    // 簡易的なグリッド線（床用）
    const grid = new THREE.GridHelper(Math.max(room.w, room.d), 20);
    grid.position.y = 1;
    scene.add(grid);

    // --- 🪑 家具の配置 ---
    const offsetX = rect2d.width / 2;
    const offsetY = rect2d.height / 2;
    const roomLeft2D = rect2d.width / 2 - room.w / 2;
    const roomTop2D = rect2d.height / 2 - room.d / 2;

furnitureList.forEach(item => {
        let geometry;
        if (item.type === 'cylinder') {
            geometry = new THREE.CylinderGeometry(item.w / 2, item.w / 2, 40, 32);
        } else {
            geometry = new THREE.BoxGeometry(item.w, 40, item.h);
        }

        const material = new THREE.MeshLambertMaterial({ color: parseInt(item.color) });
        const mesh = new THREE.Mesh(geometry, material);

        // 2Dの部屋の左上からの位置（＝部屋の中でのローカル座標）を計算
        const localX = item.x - roomLeft2D;
        const localZ = item.y - roomTop2D;

        // それを3D空間（部屋の中心が0,0）の座標に変換
        const threeX = localX - room.w / 2;
        const threeZ = localZ - room.d / 2;

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
