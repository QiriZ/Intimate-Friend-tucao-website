/**
 * 认证相关功能
 * 处理用户登录和注册功能
 */

// DOM元素
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');

// 切换登录/注册表单
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
});

// 模拟用户数据存储
let users = JSON.parse(localStorage.getItem('tucaoji_users')) || [];

// 注册功能
registerButton.addEventListener('click', () => {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // 简单验证
    if (!username || !password) {
        showNotification('请填写完整的注册信息', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }
    
    // 检查用户名是否已存在
    if (users.some(user => user.username === username)) {
        showNotification('用户名已存在', 'error');
        return;
    }
    
    // 创建用户
    const newUser = {
        id: Date.now().toString(),
        username,
        password, // 注意：实际应用中应该对密码进行加密处理
        createdAt: new Date().toISOString(),
        settings: {
            autoClearHistory: false,
            privacyMode: false
        },
        chats: []
    };
    
    // 保存用户
    users.push(newUser);
    localStorage.setItem('tucaoji_users', JSON.stringify(users));
    localStorage.setItem('tucaoji_current_user', JSON.stringify(newUser));
    
    showNotification('注册成功', 'success');
    
    // 延迟后跳转到聊天界面
    setTimeout(() => {
        switchToChatInterface(newUser);
    }, 1000);
});

// 登录功能
loginButton.addEventListener('click', () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // 简单验证
    if (!username || !password) {
        showNotification('请填写用户名和密码', 'error');
        return;
    }
    
    // 查找用户
    const user = users.find(user => user.username === username && user.password === password);
    
    if (!user) {
        showNotification('用户名或密码错误', 'error');
        return;
    }
    
    // 登录成功
    localStorage.setItem('tucaoji_current_user', JSON.stringify(user));
    
    if (rememberMe) {
        localStorage.setItem('tucaoji_remember_user', JSON.stringify({
            id: user.id,
            timestamp: Date.now()
        }));
    }
    
    showNotification('登录成功', 'success');
    
    // 延迟后跳转到聊天界面
    setTimeout(() => {
        switchToChatInterface(user);
    }, 1000);
});

// 切换到聊天界面
function switchToChatInterface(user) {
    authContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    document.getElementById('username-display').textContent = user.username;
    
    // 初始化聊天界面
    initChatInterface(user);
}

// 检查是否已登录
function checkLoggedInStatus() {
    const currentUser = JSON.parse(localStorage.getItem('tucaoji_current_user'));
    
    if (currentUser) {
        // 用户已登录，直接显示聊天界面
        switchToChatInterface(currentUser);
    } else {
        // 检查记住登录
        const rememberedUser = JSON.parse(localStorage.getItem('tucaoji_remember_user'));
        
        if (rememberedUser) {
            const user = users.find(user => user.id === rememberedUser.id);
            
            // 检查记住登录是否过期（30天）
            const isExpired = Date.now() - rememberedUser.timestamp > 30 * 24 * 60 * 60 * 1000;
            
            if (user && !isExpired) {
                localStorage.setItem('tucaoji_current_user', JSON.stringify(user));
                switchToChatInterface(user);
            } else {
                // 过期则清除记住登录
                localStorage.removeItem('tucaoji_remember_user');
            }
        }
    }
}

// 显示通知（简单实现，实际使用时可替换为更完善的通知组件）
function showNotification(message, type = 'info') {
    alert(message);
}

// 检查登录状态
window.addEventListener('DOMContentLoaded', checkLoggedInStatus);
