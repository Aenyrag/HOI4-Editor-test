/**
 * main.js - 应用程序主入口
 * 仅负责显示层面的初始化和 Workpage_manager 的协调
 * 所有状态管理由 Workpage_manager 处理
 */

class Main {
    constructor() {
        this.workpageManager = null;
        this.init();
    }

    init() {
        // 等待 DOM 加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // 初始化 Workpage_manager
        this.initWorkpageManager();
        
        // 初始化显示内容
        this.initContent();
        
        console.log('Main: 显示层初始化完成');
    }

    // 初始化 Workpage_manager
    initWorkpageManager() {
        if (typeof Workpage_manager !== 'undefined') {
            this.workpageManager = new Workpage_manager();
            
            // 监听工作区变化事件
            window.addEventListener('workspaceToggle', (e) => {
                this.onWorkspaceToggle(e.detail);
            });
            
            window.addEventListener('menuClick', () => {
                this.onMenuClick();
            });
            
            console.log('Main: Workpage_manager 已连接');
        } else {
            console.error('Main: Workpage_manager 未找到，请确保 workpage_manager.js 已加载');
        }
    }

    // 初始化各工作区内容显示
    initContent() {
        this.initLeftContent();
        this.initBottomContent();
        this.initRightContent();
    }

    // 初始化左工作区内容
    initLeftContent() {
        const content = document.querySelector('.left-content');
        if (!content) return;

        content.innerHTML = `
            <h3>📁 文件资源管理器(示例)</h3>
            <div class="file-tree" style="margin-top: 10px;">
                <div class="tree-item" style="padding: 4px 0; cursor: pointer;">📁 common</div>
                <div class="tree-item" style="padding: 4px 0; padding-left: 15px; cursor: pointer;">📄 focuses</div>
                <div class="tree-item" style="padding: 4px 0; padding-left: 15px; cursor: pointer;">📄 events</div>
                <div class="tree-item" style="padding: 4px 0; cursor: pointer;">📁 history</div>
                <div class="tree-item" style="padding: 4px 0; cursor: pointer;">📁 map</div>
            </div>
        `;
    }

    // 初始化底部工作区内容
    initBottomContent() {
        const content = document.querySelector('.bottom-content');
        if (!content) return;

        content.innerHTML = `
            <h3>🖥️ 控制台(示例)</h3>
            <div class="console-output" style="margin-top: 10px; font-family: monospace; font-size: 12px; color: #7ee787;">
                <div>> 系统初始化完成...</div>
                <div>> 等待用户操作...</div>
            </div>
        `;
    }

    // 初始化右工作区内容
    initRightContent() {
        const content = document.querySelector('.right-content');
        if (!content) return;

        content.innerHTML = `
            <h3>⚙️ 属性面板(示例)</h3>
            <div class="properties" style="margin-top: 10px;">
                <div class="prop-item" style="padding: 8px 0; border-bottom: 1px solid #30363d;">
                    <label style="color: #8b949e; font-size: 12px;">名称</label>
                    <div style="color: #d2d2d2; margin-top: 4px;">未选择</div>
                </div>
                <div class="prop-item" style="padding: 8px 0; border-bottom: 1px solid #30363d;">
                    <label style="color: #8b949e; font-size: 12px;">类型</label>
                    <div style="color: #d2d2d2; margin-top: 4px;">-</div>
                </div>
            </div>
        `;
    }

    // 工作区折叠/展开回调
    onWorkspaceToggle(detail) {
        const { type, collapsed } = detail;
        console.log(`Main: ${type} 工作区 ${collapsed ? '折叠' : '展开'}`);
        
        // 可以在这里添加显示层的响应逻辑
        // 例如：保存布局偏好、触发动画等
    }

    // 菜单点击回调
    onMenuClick() {
        console.log('Main: 处理菜单点击');
        // 可以在这里添加菜单展开逻辑
    }
}

// 初始化
const main = new Main();

// 导出供其他模块使用
window.mainApp = main;
