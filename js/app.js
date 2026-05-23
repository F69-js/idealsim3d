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
    bounds.style.pointerEvents = 'auto'; 
    canvas2d.appendChild(bounds);

    // 🌟 ここで UI.js のズーム・パン機能を初期化！
    init2DUI();

    // 部屋の枠内でのドロップイベント
    bounds.addEventListener('dragover', (e) => e.preventDefault());
    bounds.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const rect = bounds.getBoundingClientRect();
        
        if (dragContext.mode === 'new' && dragContext.data) {
            // 🌟 ズーム状態を考慮してドロップ座標を逆算
            const x = (e.clientX - rect.left) / viewState.zoom;
            const y = (e.clientY - rect.top) / viewState.zoom;
            addFurnitureData(dragContext.data, x, y);
        } else if (dragContext.mode === 'move' && dragContext.targetId) {
            // 🌟 移動時もズーム状態を考慮
            const x = (e.clientX - rect.left) / viewState.zoom - dragContext.offsetX;
            const y = (e.clientY - rect.top) / viewState.zoom - dragContext.offsetY;
            updateFurniturePosition(dragContext.targetId, x, y);
        }
        dragContext.mode = null;
        dragContext.targetId = null;
    });

    // 部屋の枠内をクリックした時のイベント
    bounds.addEventListener('click', (e) => {
        if (e.target !== bounds) return; 

        if (dragContext.data) {
            const rect = bounds.getBoundingClientRect();
            // 🌟 クリック位置もズームに対応
            const x = (e.clientX - rect.left) / viewState.zoom;
            const y = (e.clientY - rect.top) / viewState.zoom;
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
    div.style.left = item.x + 'px';
    div.style.top = item.y + 'px';
    div.style.backgroundColor = item.color.replace('0x', '#');

    // 🌟 ドラッグイベントの設定を ui.js の関数に任せる
    setupFurnitureDragEvents(div, item);

    bounds.appendChild(div);
}

// 3D画面への遷移
document.getElementById('btn-go-3d').addEventListener('click', () => {
    s2d.classList.add('hidden');
    s3d.classList.remove('hidden');
    init3D(projectData);
});
