/**
 * Workpage Manager - 工作区状态管理模块
 * 负责管理四部分布局的所有状态和交互逻辑
 * 优先级：左工作区 > 底部工作区 > 右工作区 > 基础页面
 */

class Workpage_manager {
    constructor() {
        // DOM 元素引用
        this.elements = {
            leftWorkspace: null,
            bottomWorkspace: null,
            rightWorkspace: null,
            basePage: null,
            baseFrame: null,
            menuButton: null
        };

        // 状态管理
        this.state = {
            left: {
                collapsed: false,
                width: 250,
                defaultWidth: 250,      // 按钮展开时的默认尺寸
                minWidth: 100,
                maxWidth: 500,
                collapsedSize: 50       // 折叠后的尺寸
            },
            bottom: {
                collapsed: false,
                height: 200,
                defaultHeight: 200,     // 按钮展开时的默认尺寸
                minHeight: 30,
                maxHeight: 600,
                collapsedSize: 30       // 折叠后的尺寸
            },
            right: {
                collapsed: false,
                width: 250,
                defaultWidth: 250,      // 按钮展开时的默认尺寸
                minWidth: 100,
                maxWidth: 500,
                collapsedSize: 35       // 折叠后的尺寸
            }
        };

        // 拖动状态
        this.resizeState = {
            isResizing: false,
            type: null, // 'left', 'right', 'bottom'
            startPos: 0,
            startSize: 0
        };

        this.init();
    }

    init() {
        this.initElements();
        this.initToggleButtons();
        this.initResizeHandles();
        this.initEventListeners();
        console.log('Workpage_manager: 初始化完成');
    }

    // 初始化 DOM 元素引用
    initElements() {
        this.elements.leftWorkspace = document.getElementById('leftWorkspace');
        this.elements.bottomWorkspace = document.getElementById('bottomWorkspace');
        this.elements.rightWorkspace = document.getElementById('rightWorkspace');
        this.elements.basePage = document.getElementById('basePage');
        this.elements.baseFrame = document.getElementById('baseFrame');
        this.elements.menuButton = document.getElementById('menuButton');
    }

    // 初始化折叠按钮
    initToggleButtons() {
        // 左工作区折叠按钮
        if (this.elements.leftWorkspace) {
            const leftToggle = document.createElement('button');
            leftToggle.className = 'toggle-btn toggle-left';
            leftToggle.innerHTML = '◀';
            leftToggle.title = '折叠/展开左工作区';
            leftToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleWorkspace('left');
            });
            this.elements.leftWorkspace.appendChild(leftToggle);
        }

        // 底部工作区折叠按钮
        if (this.elements.bottomWorkspace) {
            const bottomToggle = document.createElement('button');
            bottomToggle.className = 'toggle-btn toggle-bottom';
            bottomToggle.innerHTML = '▼';
            bottomToggle.title = '折叠/展开底部工作区';
            bottomToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleWorkspace('bottom');
            });
            this.elements.bottomWorkspace.appendChild(bottomToggle);
        }

        // 右工作区折叠按钮
        if (this.elements.rightWorkspace) {
            const rightToggle = document.createElement('button');
            rightToggle.className = 'toggle-btn toggle-right';
            rightToggle.innerHTML = '▶';
            rightToggle.title = '折叠/展开右工作区';
            rightToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleWorkspace('right');
            });
            this.elements.rightWorkspace.appendChild(rightToggle);
        }
    }

    // 初始化调整大小手柄
    initResizeHandles() {
        // 左工作区 - 右侧拖动条
        if (this.elements.leftWorkspace) {
            const leftHandle = document.createElement('div');
            leftHandle.className = 'left-resize-handle';
            leftHandle.addEventListener('mousedown', (e) => this.startResize(e, 'left'));
            this.elements.leftWorkspace.appendChild(leftHandle);
        }

        // 底部工作区 - 顶部拖动条
        if (this.elements.bottomWorkspace) {
            const bottomHandle = document.createElement('div');
            bottomHandle.className = 'bottom-resize-handle';
            bottomHandle.addEventListener('mousedown', (e) => this.startResize(e, 'bottom'));
            this.elements.bottomWorkspace.appendChild(bottomHandle);
        }

        // 右工作区 - 左侧拖动条
        if (this.elements.rightWorkspace) {
            const rightHandle = document.createElement('div');
            rightHandle.className = 'right-resize-handle';
            rightHandle.addEventListener('mousedown', (e) => this.startResize(e, 'right'));
            this.elements.rightWorkspace.appendChild(rightHandle);
        }
    }

    // 开始调整大小
    startResize(e, type) {
        e.preventDefault();
        e.stopPropagation();

        this.resizeState.isResizing = true;
        this.resizeState.type = type;

        const ws = this.state[type];
        const element = this.elements[`${type}Workspace`];
        
        // 记录拖动开始时的折叠状态
        this.resizeState.wasCollapsed = ws.collapsed;
        
        // 添加 resizing 类到工作区以禁用过渡（必须先加，防止后续操作有动画）
        if (element) element.classList.add('resizing');
        
        // 如果当前是折叠状态，从折叠尺寸开始拖动（不要弹出到保存的尺寸）
        if (ws.collapsed) {
            // 移除 collapsed 类，但立即设置尺寸为折叠尺寸
            element.classList.remove('collapsed');
            if (type === 'bottom') {
                element.style.height = `${ws.collapsedSize}px`;
            } else {
                element.style.width = `${ws.collapsedSize}px`;
            }
        }
        
        if (type === 'bottom') {
            this.resizeState.startPos = e.clientY;
            // 折叠状态从 collapsedSize 开始，展开状态从当前高度开始
            this.resizeState.startSize = ws.collapsed ? ws.collapsedSize : element.offsetHeight;
        } else {
            this.resizeState.startPos = e.clientX;
            // 折叠状态从 collapsedSize 开始，展开状态从当前宽度开始
            this.resizeState.startSize = ws.collapsed ? ws.collapsedSize : element.offsetWidth;
        }

        // 添加拖动中样式
        const handle = type === 'left' 
            ? element.querySelector('.left-resize-handle')
            : type === 'right'
                ? element.querySelector('.right-resize-handle')
                : element.querySelector('.bottom-resize-handle');
        if (handle) handle.classList.add('resizing');

        // 创建遮罩层防止iframe拦截鼠标事件
        this.createOverlay();

        console.log(`WorkpageManager: 开始调整 ${type} 大小，起点: ${this.resizeState.startSize}px`);
    }

    // 处理拖动
    handleResize(e) {
        if (!this.resizeState.isResizing) return;

        const { type, startPos, startSize, wasCollapsed } = this.resizeState;
        const ws = this.state[type];

        if (type === 'bottom') {
            // 底部工作区：向上拖动增大高度，向下拖动减小高度
            const delta = startPos - e.clientY;
            // 拖动时允许小到 collapsedSize，这样才能拖入折叠状态
            const minSize = Math.min(ws.minHeight, ws.collapsedSize);
            const newHeight = Math.max(minSize, Math.min(ws.maxHeight, startSize + delta));
            this.elements.bottomWorkspace.style.height = `${newHeight}px`;
            ws.height = newHeight;
        } else if (type === 'left') {
            // 左工作区：向右拖动增大宽度，向左拖动减小宽度
            const delta = e.clientX - startPos;
            // 拖动时允许小到 collapsedSize，这样才能拖入折叠状态
            const minSize = Math.min(ws.minWidth, ws.collapsedSize);
            const newWidth = Math.max(minSize, Math.min(ws.maxWidth, startSize + delta));
            this.elements.leftWorkspace.style.width = `${newWidth}px`;
            ws.width = newWidth;
        } else if (type === 'right') {
            // 右工作区：向左拖动增大宽度，向右拖动减小宽度
            const delta = startPos - e.clientX;
            // 拖动时允许小到 collapsedSize，这样才能拖入折叠状态
            const minSize = Math.min(ws.minWidth, ws.collapsedSize);
            const newWidth = Math.max(minSize, Math.min(ws.maxWidth, startSize + delta));
            this.elements.rightWorkspace.style.width = `${newWidth}px`;
            ws.width = newWidth;
        }
    }

    // 结束调整大小
    endResize() {
        if (!this.resizeState.isResizing) return;

        const { type, wasCollapsed } = this.resizeState;
        const ws = this.state[type];
        
        // 获取当前尺寸
        let currentSize;
        if (type === 'bottom') {
            currentSize = this.elements.bottomWorkspace.offsetHeight;
        } else if (type === 'left') {
            currentSize = this.elements.leftWorkspace.offsetWidth;
        } else {
            currentSize = this.elements.rightWorkspace.offsetWidth;
        }
        
        // 根据拖动结果自动判断折叠/展开状态
        // 如果从折叠状态开始拖动
        if (wasCollapsed) {
            // 如果拖动后的尺寸仍然接近折叠尺寸，则保持折叠
            if (currentSize <= ws.collapsedSize + 5) {
                // 保持折叠状态，恢复折叠尺寸
                this.setCollapsedState(type, true, false); // 不保存尺寸
            } else {
                // 展开
                this.setCollapsedState(type, false, true);
            }
        } else {
            // 从展开状态开始拖动
            // 如果拖动到接近或小于折叠尺寸，则折叠
            if (currentSize <= ws.collapsedSize + 5) {
                this.setCollapsedState(type, true, true);
            } else {
                // 保持展开状态，保存新尺寸
                ws.width = currentSize;
                if (type === 'bottom') ws.height = currentSize;
            }
        }

        // 移除拖动中样式
        const handle = type === 'left' 
            ? this.elements.leftWorkspace.querySelector('.left-resize-handle')
            : type === 'right'
                ? this.elements.rightWorkspace.querySelector('.right-resize-handle')
                : this.elements.bottomWorkspace.querySelector('.bottom-resize-handle');
        if (handle) handle.classList.remove('resizing');
        
        // 移除 resizing 类以恢复过渡
        const workspace = this.elements[`${type}Workspace`];
        if (workspace) workspace.classList.remove('resizing');

        // 移除遮罩层
        this.removeOverlay();

        this.resizeState.isResizing = false;
        this.resizeState.type = null;
        this.resizeState.wasCollapsed = null;

        console.log(`WorkpageManager: 结束调整 ${type} 大小`);
    }
    
    // 设置折叠状态（供拖动操作使用）
    setCollapsedState(type, collapsed, saveSize = true) {
        const ws = this.state[type];
        const element = this.elements[`${type}Workspace`];
        
        // 如果状态没有变化，直接返回
        if (ws.collapsed === collapsed) {
            if (collapsed) {
                // 确保折叠尺寸正确
                if (type === 'bottom') {
                    element.style.height = `${ws.collapsedSize}px`;
                } else {
                    element.style.width = `${ws.collapsedSize}px`;
                }
            }
            return;
        }
        
        ws.collapsed = collapsed;
        
        if (element) {
            element.classList.toggle('collapsed', collapsed);
            
            if (collapsed) {
                // 折叠时：保存当前展开尺寸（用于下次拖动展开），然后设置为折叠尺寸
                if (saveSize) {
                    const currentSize = type === 'bottom' 
                        ? element.offsetHeight 
                        : element.offsetWidth;
                    // 只有当前尺寸大于折叠尺寸才保存（避免保存折叠尺寸本身）
                    if (type === 'bottom' && currentSize > ws.collapsedSize) {
                        ws.height = currentSize;
                    } else if (currentSize > ws.collapsedSize) {
                        ws.width = currentSize;
                    }
                }
                // 应用折叠尺寸
                if (type === 'bottom') {
                    element.style.height = `${ws.collapsedSize}px`;
                } else {
                    element.style.width = `${ws.collapsedSize}px`;
                }
            } else {
                // 拖动展开时：恢复到保存的尺寸（如果有效）或默认尺寸
                if (type === 'bottom') {
                    const targetHeight = ws.height > ws.collapsedSize ? ws.height : ws.defaultHeight;
                    ws.height = targetHeight;
                    element.style.height = `${targetHeight}px`;
                } else {
                    const targetWidth = ws.width > ws.collapsedSize ? ws.width : ws.defaultWidth;
                    ws.width = targetWidth;
                    element.style.width = `${targetWidth}px`;
                }
            }
        }
        
        // 更新按钮图标
        this.updateToggleButton(type);
        
        console.log(`WorkpageManager: ${type} 工作区 ${collapsed ? '折叠' : '展开'}`);
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('workspaceToggle', {
            detail: { type, collapsed: ws.collapsed }
        }));
    }

    // 创建遮罩层
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'resize-overlay';
        overlay.style.cursor = this.resizeState.type === 'bottom' ? 'ns-resize' : 'ew-resize';
        document.body.appendChild(overlay);
    }

    // 移除遮罩层
    removeOverlay() {
        const overlay = document.querySelector('.resize-overlay');
        if (overlay) overlay.remove();
    }

    // 切换工作区折叠状态（按钮操作）
    toggleWorkspace(type) {
        const ws = this.state[type];
        const willCollapse = !ws.collapsed;
        
        if (willCollapse) {
            // 折叠：保存当前尺寸，然后折叠
            this.setCollapsedState(type, true, true);
        } else {
            // 展开：使用默认尺寸展开（而不是保存的尺寸）
            this.expandToDefault(type);
        }
    }
    
    // 展开到默认尺寸（按钮操作使用）
    expandToDefault(type) {
        const ws = this.state[type];
        const element = this.elements[`${type}Workspace`];
        
        if (!element) return;
        
        // 更新状态
        ws.collapsed = false;
        element.classList.remove('collapsed');
        
        // 恢复到默认尺寸（不是保存的尺寸）
        if (type === 'bottom') {
            ws.height = ws.defaultHeight;
            element.style.height = `${ws.defaultHeight}px`;
        } else {
            ws.width = ws.defaultWidth;
            element.style.width = `${ws.defaultWidth}px`;
        }
        
        // 更新按钮图标
        this.updateToggleButton(type);
        
        console.log(`WorkpageManager: ${type} 工作区展开到默认尺寸`);
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('workspaceToggle', {
            detail: { type, collapsed: false }
        }));
    }

    // 更新折叠按钮图标
    updateToggleButton(type) {
        const btn = document.querySelector(`.toggle-${type}`);
        if (!btn) return;

        const icons = {
            left: this.state.left.collapsed ? '▶' : '◀',
            bottom: this.state.bottom.collapsed ? '▲' : '▼',
            right: this.state.right.collapsed ? '◀' : '▶'
        };
        btn.innerHTML = icons[type];
    }

    // 初始化事件监听
    initEventListeners() {
        // 全局鼠标事件
        document.addEventListener('mousemove', (e) => this.handleResize(e));
        document.addEventListener('mouseup', () => this.endResize());

        // 菜单按钮点击
        if (this.elements.menuButton) {
            this.elements.menuButton.addEventListener('click', () => {
                this.elements.menuButton.classList.toggle('active');
                this.handleMenuClick();
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch (e.key.toLowerCase()) {
                    case 'l':
                        e.preventDefault();
                        this.toggleWorkspace('left');
                        break;
                    case 'b':
                        e.preventDefault();
                        this.toggleWorkspace('bottom');
                        break;
                    case 'r':
                        e.preventDefault();
                        this.toggleWorkspace('right');
                        break;
                }
            }
        });
    }

    // 菜单点击处理
    handleMenuClick() {
        console.log('Workpage_manager: 菜单按钮被点击');
        window.dispatchEvent(new CustomEvent('menuClick'));
    }

    // 获取当前状态
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    // 设置状态
    setState(newState) {
        if (newState.left) {
            Object.assign(this.state.left, newState.left);
            this.elements.leftWorkspace.style.width = `${this.state.left.width}px`;
            this.elements.leftWorkspace.classList.toggle('collapsed', this.state.left.collapsed);
        }
        if (newState.bottom) {
            Object.assign(this.state.bottom, newState.bottom);
            this.elements.bottomWorkspace.style.height = `${this.state.bottom.height}px`;
            this.elements.bottomWorkspace.classList.toggle('collapsed', this.state.bottom.collapsed);
        }
        if (newState.right) {
            Object.assign(this.state.right, newState.right);
            this.elements.rightWorkspace.style.width = `${this.state.right.width}px`;
            this.elements.rightWorkspace.classList.toggle('collapsed', this.state.right.collapsed);
        }
        
        this.updateToggleButton('left');
        this.updateToggleButton('bottom');
        this.updateToggleButton('right');
    }

    // 重置所有工作区到默认状态
    reset() {
        this.setState({
            left: { collapsed: false, width: 250 },
            bottom: { collapsed: false, height: 200 },
            right: { collapsed: false, width: 250 }
        });
    }
}

// 导出
window.Workpage_manager = Workpage_manager;
