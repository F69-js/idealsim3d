// --- 状態管理 ---
let projectData = {
    name: "",
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
    document.getElementById('room-title').innerText = projectData.name;
    sCfg.classList.add('hidden');
    s2d.classList.remove('hidden');
});

// --- ドラッグ＆ドロップ ---
const sidebarItems = document.querySelectorAll('.furniture-item');

sidebarItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        dragContext.mode = 'new';
        dragContext.data = {
            name: e.target.innerText,
            type: e.target.dataset.type,
            color: e.target.dataset.color,
            w: parseInt(e.target.dataset.w),
            h: parseInt(e.target.dataset.h)
        };
    });
});

canvas2d.addEventListener('dragover', (e) => {
    e.preventDefault();
});

canvas2d.addEventListener('drop', (e) => {
    e.preventDefault();
    const rect = canvas2d.getBoundingClientRect();
    
    if (dragContext.mode === 'new' && dragContext.data) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newFurniture = {
            id: Date.now(),
            ...dragContext.data,
            x: x,
            y: y
        };
        projectData.furnitureList.push(newFurniture);
        render2DFurniture(newFurniture);

    } else if (dragContext.mode === 'move' && dragContext.targetId) {
        const x = e.clientX - rect.left - dragContext.offsetX;
        const y = e.clientY - rect.top - dragContext.offsetY;

        const furniture = projectData.furnitureList.find(f => f.id === dragContext.targetId);
        if (furniture) {
            furniture.x = x;
            furniture.y = y;
        }

        const element = document.getElementById(`f-${dragContext.targetId}`);
        if (element) {
            element.style.left = x + 'px';
            element.style.top = y + 'px';
        }
    }
    dragContext.mode = null;
    dragContext.targetId = null;
});

function render2DFurniture(item) {
    const div = document.createElement('div');
    div.className = 'placed-furniture';
    div.id = `f-${item.id}`;
    div.innerText = item.name;
    div.style.width = item.w + 'px';
    div.style.height = item.h + 'px';
    div.style.left = item.x + 'px';
    div.style.top = item.y + 'px';
    div.style.backgroundColor = item.color.replace('0x', '#');
    div.draggable = true;

    div.addEventListener('dragstart', (e) => {
        dragContext.mode = 'move';
        dragContext.targetId = item.id;
        const rect = div.getBoundingClientRect();
        dragContext.offsetX = e.clientX - rect.left - (rect.width / 2);
        dragContext.offsetY = e.clientY - rect.top - (rect.height / 2);
    });

    canvas2d.appendChild(div);
}

// 3D画面への遷移トリガー
document.getElementById('btn-go-3d').addEventListener('click', () => {
    s2d.classList.add('hidden');
    s3d.classList.remove('hidden');
    init3D(projectData.furnitureList, canvas2d.getBoundingClientRect());
});
