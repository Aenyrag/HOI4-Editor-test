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
        this.mainGrid.focusTree.style.transform = 
            getComputedStyle(this.mainGrid.gridContainer).transform;
        
        // 监听grid-container的transform变化
        const observer = new MutationObserver(() => {
            this.mainGrid.focusTree.style.transform = 
                getComputedStyle(this.mainGrid.gridContainer).transform;
        });

        observer.observe(this.mainGrid.gridContainer, {
            attributes: true,
            attributeFilter: ['style']
        });
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
