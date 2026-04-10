// 等待页面加载完毕再执行
document.addEventListener('DOMContentLoaded', () => {
    // 自动加载所有 data-load 模块
    document.querySelectorAll('[data-load]').forEach(async (el) => {
        try {
            const url = el.dataset.load;
            console.log('正在加载：', url); // 能在控制台看到加载路径

            const res = await fetch(url);
            if (!res.ok) throw new Error(`加载失败！状态：${res.status}`);

            const html = await res.text();
            el.innerHTML = html;

            console.log(url, '✅ 加载成功！');
        } catch (err) {
            // 显示错误信息，方便你看
            el.innerHTML = `<div style="color:red;">❌ 加载失败：<br>${err.message}</div>`;
            console.error('❌ 加载失败：', err);
        }
    });
});

// 手动调用函数
async function loadHTML(containerId, url) {
    try {
        const res = await fetch(url);
        const html = await res.text();
        document.getElementById(containerId).innerHTML = html;
    } catch (err) {
        console.error('加载失败', err);
    }
}