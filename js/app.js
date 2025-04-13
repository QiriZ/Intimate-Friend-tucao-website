/**
 * 应用主文件
 * 初始化应用并处理全局事件
 */

// 添加CSS样式以支持SF Symbols的样式类
document.addEventListener('DOMContentLoaded', () => {
    // 给所有带有sf-symbol类的元素添加图标
    // 由于我们使用的是自定义的SF Symbols模拟，这里做一些处理确保图标正确显示
    const sfSymbols = document.querySelectorAll('.sf-symbol');
    
    sfSymbols.forEach(symbol => {
        // 获取图标名称
        const iconName = symbol.textContent.trim();
        
        // 由于实际部署时可能不能使用真实的SF Symbols，这里使用其他图标库或emoji替代
        // 这是一个映射表，将SF Symbols图标名映射到emoji或其他可用图标
        const iconMap = {
            'bubble.left.and.bubble.right.fill': '💬',
            'person.circle.fill': '👤',
            'gear': '⚙️',
            'arrow.right.square': '🚪',
            'chevron.left': '◀️',
            'chevron.right': '▶️',
            'arrow.up.circle.fill': '⬆️'
        };
        
        // 替换为对应的emoji或图标
        if (iconMap[iconName]) {
            symbol.textContent = iconMap[iconName];
            symbol.style.fontFamily = 'system-ui';
        }
    });
    
    // 添加自定义CSS以改善移动设备上的体验
    if (window.innerWidth <= 768) {
        const style = document.createElement('style');
        style.textContent = `
            .auth-card {
                max-width: 100%;
                border-radius: 12px;
            }
            .primary-button {
                padding: 14px 20px;
            }
        `;
        document.head.appendChild(style);
    }
});

// 修复iOS设备上的一些特殊问题
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    document.documentElement.style.setProperty('--input-background', '#FFFFFF');
    
    // 修复iOS设备上输入框聚焦时的样式问题
    document.addEventListener('focusin', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            document.documentElement.classList.add('keyboard-open');
        }
    });
    
    document.addEventListener('focusout', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            document.documentElement.classList.remove('keyboard-open');
        }
    });
}

// 处理设备旋转
window.addEventListener('resize', () => {
    setTimeout(scrollToBottom, 100);
});

// 全局错误处理
window.onerror = function(message, source, lineno, colno, error) {
    console.error('发生错误:', error);
    
    // 在实际应用中，可以将错误发送到服务器进行记录
    // sendErrorToServer(message, source, lineno, colno, error);
    
    return true; // 防止显示默认的错误提示
};

// 检测并处理离线状态
window.addEventListener('offline', () => {
    showOfflineNotification();
});

window.addEventListener('online', () => {
    hideOfflineNotification();
});

// 显示离线通知
function showOfflineNotification() {
    const notification = document.createElement('div');
    notification.id = 'offline-notification';
    notification.textContent = '您当前处于离线状态';
    notification.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: #FF3B30;
        color: white;
        text-align: center;
        padding: 8px;
        z-index: 9999;
    `;
    
    document.body.appendChild(notification);
}

// 隐藏离线通知
function hideOfflineNotification() {
    const notification = document.getElementById('offline-notification');
    if (notification) {
        notification.remove();
    }
}

// 初始检查网络状态
if (!navigator.onLine) {
    showOfflineNotification();
}
