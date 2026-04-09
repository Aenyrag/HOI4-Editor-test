class FocusManager {
    constructor(mainGrid) {
        this.mainGrid = mainGrid;
        this.focusElements = new Set();
        this.initStyles();

        this.getCellRect = (row, col) => ({
            x: col * mainGrid.cellWidth + mainGrid.container.scrollLeft,
            y: row * mainGrid.cellHeight + mainGrid.container.scrollTop,
            width: mainGrid.cellWidth,
            height: mainGrid.cellHeight
        });
    }

    

    syncFocusTreeTransform() {
        const transform = getComputedStyle(this.mainGrid.gridContainer).transform;
        if (transform && transform !== 'none') {
            this.mainGrid.focusTree.style.transform = transform;
        }
    }

    initStyles() {
        Object.assign(this.mainGrid.focusTree.style, {
            position: 'absolute',
            left: '50px',
            top: '30px',
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
        });

        // 同步初始transform
        this.syncFocusTreeTransform();
        
        // 监听grid-container的transform变化，使用 RAF 节流优化性能
        let rafId = null;
        const observer = new MutationObserver(() => {
            if (rafId) return; // 如果已经安排了更新，跳过
            rafId = requestAnimationFrame(() => {
                this.syncFocusTreeTransform();
                rafId = null;
            });
        });

        observer.observe(this.mainGrid.gridContainer, {
            attributes: true,
            attributeFilter: ['style']
        });
        
        // 保存 observer 引用以便后续清理
        this._transformObserver = observer;
    }

    createFocusAtSelectedCells() {
        if (this.mainGrid.selectedCells.size === 0) return;
        
        this.mainGrid.selectedCells.forEach(cellKey => {
            const [col, row] = cellKey.split('_').map(Number);
            this.createFocus({
                col,
                row,
                icon: 'pictrue/focus_goals/goal_unknown.dds'
            });
        });
    }

    createFocus({col, row, icon}) {
        const focusElement = document.createElement('div');
        focusElement.className = 'focus';
        
        const left = col * this.mainGrid.cellWidth;
        const top = row * this.mainGrid.cellHeight;
        
        Object.assign(focusElement.style, {
            left: `${left}px`,
            top: `${top}px`,
            backgroundImage: `url('${icon}')`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
        });

        this.mainGrid.focusTree.appendChild(focusElement);
        this.focusElements.add(focusElement);
    }


}
