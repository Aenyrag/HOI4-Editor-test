class Main {
    constructor() {
        // 获取侧边栏和菜单按钮的引用
        this.sidebar = document.querySelector('.sidebar');
        this.menuButton = document.querySelector('.menu-button');
        this.isSidebarOpen = false;

        this.initSidebarEvents();
    }

    // 初始化侧边栏事件监听
    initSidebarEvents() {
        // 监听菜单按钮的点击事件以切换侧边栏状态
        this.menuButton.addEventListener('click', () => {
            this.toggleSidebar();
        });
    }

    // 切换侧边栏的显示状态
    toggleSidebar() {
        if (this.isSidebarOpen) {
            this.sidebar.classList.remove('show');
            this.isSidebarOpen = false;
        } else {
            this.sidebar.classList.add('show');
            this.isSidebarOpen = true;
        }
    }
}

const main = new Main();