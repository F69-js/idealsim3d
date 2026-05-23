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

    // UI.js のズーム・パン機能を初期化
    init2DUI();

    // 部屋の枠内でのドロップイベント
    bounds.addEventListener('dragover', (e) => e.preventDefault());
    bounds.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const rect = bounds.getBoundingClientRect();
        
        if (dragContext.mode === 'new' && dragContext.data) {
            // ドラッグ＆ドロップ時は、マウスを離した位置（ズーム考慮）に追加
            const x = (e.clientX - rect.left) / viewState.zoom;
            const y = (e.clientY - rect.top) / viewState.zoom;
            addFurnitureData(dragContext.data, x, y);
        } else if (dragContext.mode === 'move' && dragContext.targetId) {
            // 移動時
            const x = (e.clientX - rect.left) / viewState.zoom - dragContext.offsetX;
            const y = (e.clientY - rect.top) / viewState.zoom - dragContext.offsetY;
            updateFurniturePosition(dragContext.targetId, x, y);
        }
        dragContext.mode = null;
        dragContext.targetId = null;
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

// --- サイドバーの家具ボタンのイベント設定 ---
const sidebarItems = document.querySelectorAll('.furniture-item');
sidebarItems.forEach(item => {
    
    // 1. ドラッグ開始時の処理（ドラッグ＆ドロップ用）
    item.addEventListener('dragstart', (e) => {
        dragContext.mode = 'new';
        dragContext.data = getFurnitureTemplate(e.target);
    });

    // 2. 🌟 ボタンをクリックした時の処理（クリックで即追加用）
    item.addEventListener('click', (e) => {
        const template = getFurnitureTemplate(e.target);
        
        // 部屋の真ん中の座標を初期位置にする（部屋の幅 / 2, 奥行き / 2）
        const defaultX = projectData.room.w / 2;
        const defaultY = projectData.room.d / 2;
        
        // 即座に部屋データと画面に追加
        addFurnitureData(template, defaultX, defaultY);
    });
});

// ボタンのカスタムデータ属性から家具のテンプレートを作る共通関数
function getFurnitureTemplate(targetElement) {
    return {
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

    // ドラッグ移動イベント（ui.jsの関数を呼び出し）
    setupFurnitureDragEvents(div, item);

    bounds.appendChild(div);
}

// 3D画面への遷移
document.getElementById('btn-go-3d').addEventListener('click', () => {
    s2d.classList.add('hidden');
    s3d.classList.remove('hidden');
    init3D(projectData);
});
