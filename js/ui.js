// --- 2Dエディタのズーム・パン（平行移動）管理 ---
let viewState = {
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    startX: 0,
    startY: 0
};

// UIの初期化
function init2DUI() {
    const canvas2d = document.getElementById('canvas-2d');
    const bounds = document.getElementById('room-boundary-2d');

    if (!canvas2d || !bounds) return;

    // 初期位置を中心に設定
    updateTransform();

    // 🔍 ホイールでズーム（拡大・縮小）
    canvas2d.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomIntensity = 0.05;
        
        // マウス位置を中心にズームするための計算
        const rect = canvas2d.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const beforeZoomX = (mouseX - viewState.panX) / viewState.zoom;
        const beforeZoomY = (mouseY - viewState.panY) / viewState.zoom;

        if (e.deltaY < 0) {
            viewState.zoom += zoomIntensity;
        } else {
            viewState.zoom -= zoomIntensity;
        }
        // ズームの下限・上限を設定
        viewState.zoom = Math.max(0.2, Math.min(viewState.zoom, 3));

        // ズーム後の位置補正
        viewState.panX = mouseX - beforeZoomX * viewState.zoom;
        viewState.panY = mouseY - beforeZoomY * viewState.zoom;

        updateTransform();
    }, { passive: false });

    // ✋ マウスドラッグでの画面平行移動（ホイールクリック、またはShift＋左クリックで移動）
    canvas2d.addEventListener('mousedown', (e) => {
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) { // ホイールクリック or Shift+左クリック
            viewState.isPanning = true;
            viewState.startX = e.clientX - viewState.panX;
            viewState.startY = e.clientY - viewState.panY;
            canvas2d.style.cursor = 'grabbing';
            e.preventDefault();
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!viewState.isPanning) return;
        viewState.panX = e.clientX - viewState.startX;
        viewState.panY = e.clientY - viewState.startY;
        updateTransform();
    });

    window.addEventListener('mouseup', () => {
        if (viewState.isPanning) {
            viewState.isPanning = false;
            canvas2d.style.cursor = 'default';
        }
    });
}

// 画面の表示状態（ズーム・位置）をCSSで反映
function updateTransform() {
    const bounds = document.getElementById('room-boundary-2d');
    if (!bounds) return;
    // left:50%, top:50%, transform:translate(-50%,-50%) だった元のスタイルを上書き結合
    bounds.style.transform = `translate(-50%, -50%) translate(${viewState.panX}px, ${viewState.panY}px) scale(${viewState.zoom})`;
}

// 🪑 配置済み家具のドラッグ移動イベントを設定する関数
function setupFurnitureDragEvents(div, item) {
    div.draggable = true;

    div.addEventListener('dragstart', (e) => {
        e.stopPropagation();
        dragContext.mode = 'move';
        dragContext.targetId = item.id;
        
        const rect = div.getBoundingClientRect();
        // ズーム倍率を考慮して掴んだ位置のズレを計算
        dragContext.offsetX = (e.clientX - rect.left) / viewState.zoom - (parseInt(div.style.width) / 2);
        dragContext.offsetY = (e.clientY - rect.top) / viewState.zoom - (parseInt(div.style.height) / 2);
    });
}
