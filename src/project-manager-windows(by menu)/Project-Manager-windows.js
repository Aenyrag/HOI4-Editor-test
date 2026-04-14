/**
 * Project-Manager-windows.js - 项目文件管理窗口控制模块
 * 处理项目相关操作弹窗的显示/隐藏、模式切换、路径输入等
 * 后端逻辑由 Rust 侧实现，本模块仅提供前端交互与事件分发
 */

class ProjectManagerWindow {
    constructor() {
        this.overlay = null;
        this.windowEl = null;
        this.titleEl = null;
        this.pathInput = null;
        this.actionBtn = null;
        this.cancelBtn = null;
        this.closeBtn = null;
        this.browseBtn = null;

        this.currentMode = null;
        this.isVisible = false;

        // 模式配置映射
        this.modeConfig = {
            'new-project': {
                title: '新建项目',
                actionText: '创建',
                placeholder: '请输入新项目路径...'
            },
            'open-project': {
                title: '打开项目',
                actionText: '打开',
                placeholder: '请选择现有项目路径...'
            },
            'close-project': {
                title: '关闭项目',
                actionText: '关闭',
                placeholder: '当前项目路径...'
            },
            'recent-projects': {
                title: '最近的项目',
                actionText: '打开',
                placeholder: '请选择项目路径...'
            }
        };

        this.init();
    }

    init() {
        // 等待 DOM 加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.waitForElementsAndSetup());
        } else {
            this.waitForElementsAndSetup();
        }
    }

    async waitForElementsAndSetup() {
        // 等待 HTML 加载完成（轮询检查）
        let attempts = 0;
        const maxAttempts = 50; // 最多等待 5 秒

        while (!document.getElementById('pmOverlay') && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        this.overlay = document.getElementById('pmOverlay');
        if (!this.overlay) {
            console.error('ProjectManagerWindow: 未找到 pmOverlay 元素');
            return;
        }

        this.windowEl = document.getElementById('pmWindow');
        this.titleEl = document.getElementById('pmTitle');
        this.pathInput = document.getElementById('pmPathInput');
        this.actionBtn = document.getElementById('pmActionBtn');
        this.cancelBtn = document.getElementById('pmCancelBtn');
        this.closeBtn = document.getElementById('pmCloseBtn');
        this.browseBtn = document.getElementById('pmBrowseBtn');

        this.bindEvents();
        console.log(`ProjectManagerWindow: 窗口控制已初始化（等待了 ${attempts * 100}ms）`);
    }

    bindEvents() {
        // 关闭按钮
        this.closeBtn.addEventListener('click', () => {
            this.hide();
            this.dispatchEvent('projectManagerCancel', { mode: this.currentMode });
        });

        // 取消按钮
        this.cancelBtn.addEventListener('click', () => {
            this.hide();
            this.dispatchEvent('projectManagerCancel', { mode: this.currentMode });
        });

        // 执行按钮
        this.actionBtn.addEventListener('click', () => {
            const path = this.pathInput.value.trim();
            this.dispatchEvent('projectManagerConfirm', {
                mode: this.currentMode,
                path: path
            });
            // 不自动隐藏，由外部决定隐藏时机（例如 Rust 处理完成后）
        });

        // 浏览按钮
        this.browseBtn.addEventListener('click', async () => {
            if (window.__TAURI__?.core?.invoke) {
                try {
                    const selected = await window.__TAURI__.core.invoke('plugin:dialog|open', {
                        options: { directory: true }
                    });
                    if (selected) {
                        this.pathInput.value = selected;
                    }
                } catch (err) {
                    console.error('ProjectManagerWindow: 调用 dialog 失败', err);
                    this.dispatchEvent('projectManagerBrowse', {
                        mode: this.currentMode,
                        currentPath: this.pathInput.value.trim()
                    });
                }
            } else {
                this.dispatchEvent('projectManagerBrowse', {
                    mode: this.currentMode,
                    currentPath: this.pathInput.value.trim()
                });
            }
        });

        // 窗口拖拽
        let isDragging = false;
        let startX = 0, startY = 0;
        let initialX = 0, initialY = 0;

        this.windowEl.style.setProperty('--pm-x', '0px');
        this.windowEl.style.setProperty('--pm-y', '0px');

        this.windowEl.querySelector('.pm-header').addEventListener('mousedown', (e) => {
            if (e.target.closest('.pm-close-btn')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = parseFloat(getComputedStyle(this.windowEl).getPropertyValue('--pm-x')) || 0;
            initialY = parseFloat(getComputedStyle(this.windowEl).getPropertyValue('--pm-y')) || 0;
            this.windowEl.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            this.windowEl.style.setProperty('--pm-x', (initialX + dx) + 'px');
            this.windowEl.style.setProperty('--pm-y', (initialY + dy) + 'px');
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.windowEl.style.transition = '';
            }
        });

        // 点击窗口外部（遮罩层）时不关闭窗口
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                // 不执行任何操作，保持窗口开启
            }
        });

        // 阻止点击窗口内部时冒泡到遮罩层
        this.windowEl.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // 键盘支持：Enter 确认，Esc 取消
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            if (e.key === 'Enter') {
                e.preventDefault();
                this.actionBtn.click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.cancelBtn.click();
            }
        });
    }

    dispatchEvent(eventName, detail) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
        console.log(`ProjectManagerWindow: 分发事件 ${eventName}`, detail);
    }

    /**
     * 显示窗口
     * @param {string} mode - 操作模式：'new-project' | 'open-project' | 'close-project' | 'recent-projects'
     * @param {string} [initialPath=''] - 初始路径
     */
    show(mode, initialPath = '') {
        const config = this.modeConfig[mode];
        if (!config) {
            console.warn(`ProjectManagerWindow: 未知的模式 - ${mode}`);
            return;
        }

        this.currentMode = mode;
        this.titleEl.textContent = config.title;
        this.actionBtn.textContent = config.actionText;
        this.pathInput.placeholder = config.placeholder;
        this.pathInput.value = initialPath;

        // 重置窗口位置
        this.windowEl.style.setProperty('--pm-x', '0px');
        this.windowEl.style.setProperty('--pm-y', '0px');

        this.overlay.classList.add('active');
        this.isVisible = true;

        // 聚焦到输入框
        setTimeout(() => {
            if (this.pathInput) this.pathInput.focus();
        }, 50);

        console.log(`ProjectManagerWindow: 显示窗口 - ${config.title}`);
    }

    /**
     * 隐藏窗口
     */
    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
        this.isVisible = false;
        console.log('ProjectManagerWindow: 隐藏窗口');
    }

    /**
     * 设置路径
     * @param {string} path
     */
    setPath(path) {
        if (this.pathInput) {
            this.pathInput.value = path;
        }
    }

    /**
     * 获取当前路径
     * @returns {string}
     */
    getPath() {
        return this.pathInput ? this.pathInput.value.trim() : '';
    }

    /**
     * 获取当前模式
     * @returns {string|null}
     */
    getMode() {
        return this.currentMode;
    }

    /**
     * 获取窗口可见状态
     * @returns {boolean}
     */
    getIsVisible() {
        return this.isVisible;
    }
}

// 初始化
const projectManagerWindow = new ProjectManagerWindow();

// 导出供其他模块使用
window.projectManagerWindow = projectManagerWindow;
