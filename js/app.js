// --- 状態管理 ---
let projectData = {
    name: "",
    room: { w: 400, d: 400, h: 250 },
    furnitureList: [] 
};

let dragContext = {
    mode: null,
    data: null,
    targetId: null,
    offsetX: 0,
    offsetY: 0
};

// --- 画面遷移 ---
const sMenu = document.getElementById('screen-menu');
const sCfg = document.getElementById('screen-project-cfg');
const s2d = document.getElementById('screen-2d');
const s3d = document.getElementById('screen-3d');
const canvas2d = document.getElementById('canvas-2d');

document.getElementById('btn-new-project').addEventListener('click', () => {
    sMenu.classList.add('hidden');
    sCfg.classList.remove('hidden');
});

document.getElementById('btn-create-project').addEventListener('click', () => {
    projectData.name = document.getElementById('project-name').value;
    projectData.room.w = parseInt(document.getElementById('room-width').value) || 400;
    projectData.room.d = parseInt(document.getElementById('room-depth').value) || 400;
    projectData.room.h = parseInt(document.getElementById('room-height').value) || 250;
    
    document.getElementById('room-title').innerText = projectData.name;
    sCfg.classList.add('hidden');
    s2d.classList.remove('hidden');

    createRoomBoundary2D();
});

// 2Dの部屋の枠（壁）を作成
function createRoomBoundary2D() {
    const oldBounds = document.getElementById('room-boundary-2d');
    if (oldBounds) oldBounds.remove();

    const bounds = document.createElement('div');
    bounds.id = 'room-boundary-2d';
    bounds.style.width = projectData.room.w + 'px';
    bounds.style.height = projectData.room.d + 'px';
    
    // 🌟 枠線の pointer-events を有効にして、ここでクリックやドロップイベントを受け取る
    bounds.style.pointerEvents = 'auto'; 
    canvas2d.appendChild(bounds);

    // 部屋の枠内でのドロップイベント
    bounds.addEventListener('dragover', (e) => e.preventDefault());
    bounds.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation(); // キャンバス側のイベント発火を防ぐ
        
        const rect = bounds.getBoundingClientRect();
        
        if (dragContext.mode === 'new' && dragContext.data) {
            // 部屋の左上からの純粋な座標を計算
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            addFurnitureData(dragContext.data, x, y);
        } else if (dragContext.mode === 'move' && dragContext.targetId) {
            // 移動時も部屋の左上基準で計算
            const x = e.clientX - rect.left - dragContext.offsetX;
            const y = e.clientY - rect.top - dragContext.offsetY;
            updateFurniturePosition(dragContext.targetId, x, y);
        }
        dragContext.mode = null;
        dragContext.targetId = null;
    });

    // 🌟 【新規機能】部屋の枠内をクリックした時のイベント
    bounds.addEventListener('click', (e) => {
        // 家具自体をクリックした時は無視する（すり抜け防止）
        if (e.target !== bounds) return; 

        if (dragContext.data) {
            const rect = bounds.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            addFurnitureData(dragContext.data, x, y);
        } else {
            alert("右のメニューから家具を1回クリックして選択してから、部屋の中をクリックしてね！");
        }
    });
}

// --- 家具のデータ追加と描画 ---
function addFurnitureData(template, x, y) {
    const newFurniture = {
        id: Date.now(),
        ...template,
        x: x,
        y: y
    };
    projectData.furnitureList.push(newFurniture);
    render2DFurniture(newFurniture);
}

function updateFurniturePosition(id, x, y) {
    const furniture = projectData.furnitureList.find(f => f.id === id);
    if (furniture) {
        furniture.x = x;
        furniture.y = y;
    }
    const element = document.getElementById(`f-${id}`);
    if (element) {
        element.style.left = x + 'px';
        element.style.top = y + 'px';
    }
}

// --- サイドバーのイベント設定 ---
const sidebarItems = document.querySelectorAll('.furniture-item');
sidebarItems.forEach(item => {
    // ドラッグ開始
    item.addEventListener('dragstart', (e) => {
        setSelectFurniture(e.target);
    });
    // 🌟 クリックでも選択できるようにする
    item.addEventListener('click', (e) => {
        setSelectFurniture(e.target);
        // 選択中であることが分かりやすいようにちょっと目立たせる
        sidebarItems.forEach(i => i.style.border = '2px dashed #4f46e5');
        e.target.style.border = '2px solid #10b981'; 
    });
});

function setSelectFurniture(targetElement) {
    dragContext.mode = 'new';
    dragContext.data = {
        name: targetElement.innerText,
        type: targetElement.dataset.type,
        color: targetElement.dataset.color,
        w: parseInt(targetElement.dataset.w),
        h: parseInt(targetElement.dataset.h)
    };
}

function render2DFurniture(item) {
    const bounds = document.getElementById('room-boundary-2d');
    const div = document.createElement('div');
    div.className = 'placed-furniture';
    div.id = `f-${item.id}`;
    div.innerText = item.name;
    div.style.width = item.w + 'px';
    div.style.height = item.h + 'px';
    
    // 🌟 部屋の枠（bounds）の中に直接入れるので、座標は部屋の左上からの距離だけでOKに！
    div.style.left = item.x + 'px';
    div.style.top = item.y + 'px';
    div.style.backgroundColor = item.color.replace('0x', '#');
    div.draggable = true;

    div.addEventListener('dragstart', (e) => {
        e.stopPropagation();
        dragContext.mode = 'move';
        dragContext.targetId = item.id;
        const rect = div.getBoundingClientRect();
        dragContext.offsetX = e.clientX - rect.left - (rect.width / 2);
        dragContext.offsetY = e.clientY - rect.top - (rect.height / 2);
    });

    bounds.appendChild(div); // キャンバスではなく、部屋の枠線の中に追加する
}

// 3D画面への遷移
document.getElementById('btn-go-3d').addEventListener('click', () => {
    s2d.classList.add('hidden');
    s3d.classList.remove('hidden');
    init3D(projectData);
});
