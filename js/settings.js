/**
 * 设置功能
 * 处理用户设置和偏好
 */

// DOM元素
const settingsButton = document.getElementById('settings-button');
const settingsContainer = document.getElementById('settings-container');
const backButton = document.getElementById('back-button');
const logoutButton = document.getElementById('logout-button');
const autoClearHistoryToggle = document.getElementById('auto-clear-history');
const privacyModeToggle = document.getElementById('privacy-mode');

// 模态框元素
const modalContainer = document.getElementById('modal-container');
const changeUsernameItem = document.getElementById('change-username-item');
const changePasswordItem = document.getElementById('change-password-item');
const viewHistoryItem = document.getElementById('view-history-item');
const changeUsernameModal = document.getElementById('change-username-modal');
const changePasswordModal = document.getElementById('change-password-modal');
const viewHistoryModal = document.getElementById('view-history-modal');
const submitUsernameButton = document.getElementById('submit-username');
const submitPasswordButton = document.getElementById('submit-password');
const newUsernameInput = document.getElementById('new-username');
const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const confirmNewPasswordInput = document.getElementById('confirm-new-password');
const historyList = document.getElementById('history-list');

// 打开设置页面
settingsButton.addEventListener('click', () => {
    // 加载当前设置
    loadUserSettings();
    
    // 显示设置页面
    settingsContainer.classList.remove('hidden');
});

// 返回聊天页面
backButton.addEventListener('click', () => {
    // 隐藏设置页面
    settingsContainer.classList.add('hidden');
});

// 退出登录
logoutButton.addEventListener('click', () => {
    // 清除当前用户
    localStorage.removeItem('tucaoji_current_user');
    
    // 重载页面
    window.location.reload();
});

// 加载用户设置
function loadUserSettings() {
    const currentUser = JSON.parse(localStorage.getItem('tucaoji_current_user'));
    
    if (currentUser && currentUser.settings) {
        autoClearHistoryToggle.checked = currentUser.settings.autoClearHistory || false;
        privacyModeToggle.checked = currentUser.settings.privacyMode || false;
    }
}

// 更新自动清除历史记录设置
autoClearHistoryToggle.addEventListener('change', () => {
    updateUserSetting('autoClearHistory', autoClearHistoryToggle.checked);
});

// 更新隐私模式设置
privacyModeToggle.addEventListener('change', () => {
    updateUserSetting('privacyMode', privacyModeToggle.checked);
});

// 更新用户设置
function updateUserSetting(settingName, value) {
    const currentUser = JSON.parse(localStorage.getItem('tucaoji_current_user'));
    
    if (currentUser) {
        // 确保设置对象存在
        if (!currentUser.settings) {
            currentUser.settings = {};
        }
        
        // 更新设置
        currentUser.settings[settingName] = value;
        
        // 保存到本地存储
        localStorage.setItem('tucaoji_current_user', JSON.stringify(currentUser));
        
        // 更新用户列表中的当前用户
        updateUserInSettings();
    }
}

// 更新用户列表中的当前用户设置
function updateUserInSettings() {
    const currentUser = JSON.parse(localStorage.getItem('tucaoji_current_user'));
    const users = JSON.parse(localStorage.getItem('tucaoji_users')) || [];
    
    const index = users.findIndex(user => user.id === currentUser.id);
    
    if (index !== -1) {
        // 只更新设置部分
        users[index].settings = currentUser.settings;
        localStorage.setItem('tucaoji_users', JSON.stringify(users));
    }
}

// 删除历史记录
document.querySelector('.settings-item.danger').addEventListener('click', () => {
    if (confirm('确定要清除所有聊天记录吗？此操作不可撤销。')) {
        const currentUser = JSON.parse(localStorage.getItem('tucaoji_current_user'));
        
        if (currentUser) {
            // 清空聊天记录
            currentUser.chats = [];
            
            // 更新本地存储
            localStorage.setItem('tucaoji_current_user', JSON.stringify(currentUser));
            
            // 更新用户列表
            updateUserInSettings();
            
            // 更新聊天界面
            loadChatHistory();
            
            alert('聊天记录已清除');
        }
    }
});

// 模态框事件处理
// 关闭模态框的通用函数
function closeModal() {
    modalContainer.classList.add('hidden');
    changeUsernameModal.classList.add('hidden');
    changePasswordModal.classList.add('hidden');
    viewHistoryModal.classList.add('hidden');
    
    // 清空输入
    newUsernameInput.value = '';
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmNewPasswordInput.value = '';
}

// 打开更改用户名模态框
changeUsernameItem.addEventListener('click', () => {
    modalContainer.classList.remove('hidden');
    changeUsernameModal.classList.remove('hidden');
    
    const currentUser = JSON.parse(localStorage.getItem('tucaoji_current_user'));
    if (currentUser) {
        newUsernameInput.value = currentUser.username;
    }
});

// 打开修改密码模态框
changePasswordItem.addEventListener('click', () => {
    modalContainer.classList.remove('hidden');
    changePasswordModal.classList.remove('hidden');
});

// 打开查看历史记录模态框
viewHistoryItem.addEventListener('click', () => {
    modalContainer.classList.remove('hidden');
    viewHistoryModal.classList.remove('hidden');
    loadHistoryList();
});

// 关闭模态框按钮事件
document.querySelectorAll('.modal-close-btn').forEach(button => {
    button.addEventListener('click', closeModal);
});

// 点击模态框外部关闭模态框
modalContainer.addEventListener('click', event => {
    if (event.target === modalContainer) {
        closeModal();
    }
});

// 更改用户名
submitUsernameButton.addEventListener('click', () => {
    const newUsername = newUsernameInput.value.trim();
    
    if (!newUsername) {
        alert('用户名不能为空');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('tucaoji_current_user'));
    const users = JSON.parse(localStorage.getItem('tucaoji_users')) || [];
    
    // 检查新用户名是否已存在（除了当前用户）
    const isUsernameTaken = users.some(user => 
        user.id !== currentUser.id && user.username === newUsername
    );
    
    if (isUsernameTaken) {
        alert('此用户名已被使用');
        return;
    }
    
    // 更新用户名
    currentUser.username = newUsername;
    localStorage.setItem('tucaoji_current_user', JSON.stringify(currentUser));
    
    // 更新用户列表
    const index = users.findIndex(user => user.id === currentUser.id);
    if (index !== -1) {
        users[index].username = newUsername;
        localStorage.setItem('tucaoji_users', JSON.stringify(users));
    }
    
    // 更新UI
    document.getElementById('username-display').textContent = newUsername;
    
    alert('用户名已更改');
    closeModal();
});

// 修改密码
submitPasswordButton.addEventListener('click', () => {
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        alert('请填写所有密码字段');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        alert('两次输入的新密码不一致');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('tucaoji_current_user'));
    
    // 验证当前密码
    if (currentUser.password !== currentPassword) {
        alert('当前密码不正确');
        return;
    }
    
    // 更新密码
    currentUser.password = newPassword;
    localStorage.setItem('tucaoji_current_user', JSON.stringify(currentUser));
    
    // 更新用户列表
    const users = JSON.parse(localStorage.getItem('tucaoji_users')) || [];
    const index = users.findIndex(user => user.id === currentUser.id);
    if (index !== -1) {
        users[index].password = newPassword;
        localStorage.setItem('tucaoji_users', JSON.stringify(users));
    }
    
    alert('密码已更改');
    closeModal();
});

// 加载历史记录列表
function loadHistoryList() {
    const currentUser = JSON.parse(localStorage.getItem('tucaoji_current_user'));
    
    // 清空历史列表
    historyList.innerHTML = '';
    
    if (!currentUser || !currentUser.chats || currentUser.chats.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-history';
        emptyMessage.textContent = '暂无聊天记录';
        historyList.appendChild(emptyMessage);
        return;
    }
    
    // 按日期分组
    const chatsByDate = groupChatsByDate(currentUser.chats);
    
    // 为每一天创建历史记录项
    Object.keys(chatsByDate).sort().reverse().forEach(date => {
        const dateItem = document.createElement('div');
        dateItem.className = 'history-date';
        dateItem.textContent = formatDateDivider(date);
        historyList.appendChild(dateItem);
        
        // 添加当天的对话
        chatsByDate[date].forEach(chat => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const userMessage = document.createElement('div');
            userMessage.className = 'history-message';
            userMessage.innerHTML = '<span class="user-text">我：</span> ' + chat.userMessage;
            
            const aiMessage = document.createElement('div');
            aiMessage.className = 'history-message';
            aiMessage.innerHTML = '<span class="ai-text">小吐：</span> ' + chat.aiReply;
            
            historyItem.appendChild(userMessage);
            historyItem.appendChild(aiMessage);
            
            historyList.appendChild(historyItem);
        });
    });
}

// 按日期分组聊天记录
function groupChatsByDate(chats) {
    const chatsByDate = {};
    
    chats.forEach(chat => {
        const date = formatDate(chat.timestamp);
        
        if (!chatsByDate[date]) {
            chatsByDate[date] = [];
        }
        
        chatsByDate[date].push(chat);
    });
    
    return chatsByDate;
}

// 格式化日期
function formatDate(timestamp) {
    const date = new Date(timestamp);
    
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
}

// 格式化日期分隔符
function formatDateDivider(date) {
    return `${date} ${getWeekday(date)}`;
}

// 获取星期几
function getWeekday(date) {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    
    const dateObject = new Date(date);
    const weekday = dateObject.getDay();
    
    return weekdays[weekday];
}

// 补零
function padZero(number) {
    return (number < 10 ? '0' : '') + number;
}
