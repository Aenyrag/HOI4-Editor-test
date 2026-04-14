/**
 * menu-control.js - 菜单控制模块
 * 处理菜单的展开/折叠、点击事件等
 */

class MenuControl {
    constructor() {
        this.menuButton = null;
        this.dropdownMenu = null;
        this.isOpen = false;

        this.init();
    }

    init() {
        // 等待 DOM 加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.waitForMenuAndSetup());
        } else {
            this.waitForMenuAndSetup();
        }
    }

    async waitForMenuAndSetup() {
        // 获取菜单按钮
        this.menuButton = document.getElementById('menuButton');
        if (!this.menuButton) {
            console.error('MenuControl: 未找到 menuButton 元素');
            return;
        }

        // 等待 loader.js 加载完成（轮询检查）
        let attempts = 0;
        const maxAttempts = 50; // 最多等待 5 秒
        
        while (!document.getElementById('dropdownMenu') && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100)); // 等待 100ms
            attempts++;
        }

        // 获取下拉菜单
        this.dropdownMenu = document.getElementById('dropdownMenu');
        if (!this.dropdownMenu) {
            console.error('MenuControl: 未找到 dropdownMenu 元素，loader 可能加载失败');
            return;
        }

        console.log(`MenuControl: 等待了 ${attempts * 100}ms 后找到 dropdownMenu`);

        // 绑定菜单按钮点击事件
        this.menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // 绑定菜单项点击事件
        this.bindMenuItems();

        // 点击页面其他地方关闭菜单
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.dropdownMenu.contains(e.target)) {
                this.close();
            }
        });

        // 键盘支持：按 Esc 切换菜单展开/折叠
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.toggle();
            }
        });

        console.log('MenuControl: 菜单控制已初始化');
    }

    // 切换菜单展开/折叠
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    // 展开菜单
    open() {
        this.isOpen = true;
        this.dropdownMenu.classList.add('active');
        this.menuButton.classList.add('menu-active');

        // 触发菜单展开事件
        window.dispatchEvent(new CustomEvent('menuToggle', {
            detail: { isOpen: true }
        }));

        console.log('MenuControl: 菜单已展开');
    }

    // 折叠菜单
    close() {
        this.isOpen = false;
        this.dropdownMenu.classList.remove('active');
        this.menuButton.classList.remove('menu-active');

        // 触发菜单折叠事件
        window.dispatchEvent(new CustomEvent('menuToggle', {
            detail: { isOpen: false }
        }));

        console.log('MenuControl: 菜单已折叠');
    }

    // 绑定菜单项点击事件
    bindMenuItems() {
        const menuItems = this.dropdownMenu.querySelectorAll('.menu-item');

        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.getAttribute('data-action');
                this.handleMenuAction(action, item);
            });
        });
    }

    // 处理菜单项操作
    handleMenuAction(action, element) {
        console.log(`MenuControl: 点击菜单项 - ${action}`);

        // 触发菜单项点击事件，供外部处理
        window.dispatchEvent(new CustomEvent('menuItemClick', {
            detail: { action, element }
        }));

        // 根据 action 执行相应操作（预留功能）
        switch (action) {
            case 'new-project':
                if (window.projectManagerWindow) {
                    window.projectManagerWindow.show('new-project');
                } else {
                    console.error('MenuControl: projectManagerWindow 未初始化');
                }
                break;
            case 'open-project':
                if (window.projectManagerWindow) {
                    window.projectManagerWindow.show('open-project');
                } else {
                    console.error('MenuControl: projectManagerWindow 未初始化');
                }
                break;
            case 'recent-projects':
                // TODO: 最近的项目（功能待实现）
                console.log('MenuControl: 最近的项目（功能待实现）');
                break;
            case 'close-project':
                // TODO: 关闭项目
                console.log('MenuControl: 关闭项目（功能待实现）');
                break;
            case 'settings':
                // TODO: 设置
                console.log('MenuControl: 设置（功能待实现）');
                break;
            case 'local-history':
                // TODO: 本地历史记录
                console.log('MenuControl: 本地历史记录（功能待实现）');
                break;
            case 'save-all':
                // TODO: 保存全部
                console.log('MenuControl: 保存全部（功能待实现）');
                break;
            case 'export':
                // TODO: 导出
                console.log('MenuControl: 导出（功能待实现）');
                break;
            case 'exit':
                // TODO: 退出
                console.log('MenuControl: 退出（功能待实现）');
                break;
            default:
                console.warn(`MenuControl: 未知的菜单操作 - ${action}`);
        }

        // 点击后关闭菜单（除了某些可能需要保持展开的项）
        if (action !== 'recent-projects' && action !== 'export') {
            this.close();
        }
    }

    // 公共 API：获取菜单状态
    getState() {
        return {
            isOpen: this.isOpen
        };
    }

    // 公共 API：手动打开菜单
    openMenu() {
        this.open();
    }

    // 公共 API：手动关闭菜单
    closeMenu() {
        this.close();
    }
}

// 初始化菜单控制
const menuControl = new MenuControl();

// 导出供其他模块使用
window.menuControl = menuControl;
