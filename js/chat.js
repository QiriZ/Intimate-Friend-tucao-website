/**
 * 聊天功能
 * 处理聊天界面的交互和消息发送
 */

// DOM元素
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const typingStatus = document.getElementById('typing-status');

// 当前用户
let currentUser = null;

// 会话历史
let chatHistory = [];

// 消息队列管理
let messageQueue = [];
let messageTimer = null;
const MESSAGE_BATCH_DELAY = 5000; // 5秒内的消息会被批处理

// 敏感词列表
const sensitiveWords = [
    // 政治相关
    '共产党', '国民党', '民进党', '执政党', '反对党', '政权', '政变', '政府', '领导人', '总统', '主席',
    '国家主席', '总理', '独裁', '专制', '民主', '自由', '选举', '投票', '贪污', '腐败', '抗议', '游行',
    '示威', '革命', '暴动', '政治', '制度', '改革', '运动', '法轮功', '六四', '天安门',
    
    // 暴力相关
    '杀人', '自杀', '谋杀', '暗杀', '枪击', '爆炸', '炸弹', '恐怖', '恐怖分子', '恐怖袭击', '暴力',
    '武器', '军火', '枪支', '刀具', '战争', '军事', '军队', '侵略', '入侵', '占领', '屠杀', '种族灭绝',
    
    // 色情相关
    '性', '做爱', '嫖娼', '卖淫', '妓女', '小姐', '按摩女', '妓院', '嫖客', '性交易', '色情', '情色',
    '成人', 'AV', 'av', '色情片', '毛片', '裸体', '裸照', 'porn', '下流', '淫秽', '不雅', '走光',
    
    // 脏话相关
    '操', '草', '艹', '日', '干', '妈的', '娘的', '他妈', '她妈', '尼玛', '玛的', '靠', '我靠', '我去',
    '我日', '法克', 'fuck', 'Fuck', 'FUCK', '傻逼', '傻B', '煞笔', '傻子', '白痴', '笨蛋', '二逼',
    '二货', '神经病', '贱', '贱人', '贱货', '骚', '骚货', '骚逼', '屌', '屁', '睾丸', '阴茎', '阴道',
    '鸡巴', '阴蒂', '奶子', '乳房'
];

// 初始化聊天界面
function initChatInterface(user) {
    currentUser = user;
    
    // 加载历史消息
    loadChatHistory();
    
    // 自动聚焦到输入框
    messageInput.focus();
}

// 发送消息
sendButton.addEventListener('click', sendMessage);

// 按Enter键发送消息
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 发送消息函数
function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // 显示用户消息
    addMessage(message, 'user');
    
    // 清空输入框
    messageInput.value = '';
    
    // 自动滚动到底部
    scrollToBottom();
    
    // 将消息加入队列进行处理
    addMessageToQueue(message);
}

// 添加消息到队列
function addMessageToQueue(message) {
    // 过滤敏感词
    const filteredMessage = filterSensitiveWords(message);
    
    // 将消息添加到队列
    messageQueue.push({
        original: message,
        filtered: filteredMessage
    });
    
    // 判断是否是第一条消息
    if (messageQueue.length === 1) {
        // 第一条消息直接发送
        processMessageQueue();
    } else {
        // 非第一条消息，设置定时器
        if (messageTimer) {
            clearTimeout(messageTimer);
        }
        
        messageTimer = setTimeout(() => {
            processMessageQueue();
        }, MESSAGE_BATCH_DELAY);
    }
}

// 处理消息队列
function processMessageQueue() {
    if (messageQueue.length === 0) return;
    
    // 显示正在输入状态
    showTypingStatus();
    
    // 确定要发送的消息
    let messagesToSend;
    
    if (messageQueue.length >= 3) {
        // 如果队列中有3条或以上消息，一次发送3条
        messagesToSend = messageQueue.splice(0, 3);
    } else {
        // 否则发送所有消息
        messagesToSend = [...messageQueue];
        messageQueue = [];
    }
    
    // 提取过滤后的消息和原始消息
    const filteredMessages = messagesToSend.map(msg => msg.filtered);
    const originalMessages = messagesToSend.map(msg => msg.original);
    
    // 将多条消息合并为一条（如果有多条）
    const combinedFilteredMessage = filteredMessages.join('\n\n');
    const combinedOriginalMessage = originalMessages.join('\n\n');
    
    // 调用API获取回复
    fetchAIReply(combinedFilteredMessage)
        .then(reply => {
            // 隐藏输入中状态
            hideTypingStatus();
            
            // 显示AI回复
            addMessage(reply, 'ai');
            
            // 保存对话记录 - 使用原始消息
            saveChatHistory(combinedOriginalMessage, reply);
            
            // 滚动到底部
            scrollToBottom();
            
            // 如果队列中还有消息，继续处理
            if (messageQueue.length > 0) {
                // 小延迟后处理下一批，避免回复太快显得不自然
                setTimeout(() => {
                    processMessageQueue();
                }, 1000);
            }
        })
        .catch(error => {
            console.error('AI回复出错:', error);
            hideTypingStatus();
            addMessage('抱歉，我现在无法回复你的消息，请稍后再试。', 'ai');
            scrollToBottom();
            
            // 出错时清空队列，避免继续尝试可能会失败的请求
            messageQueue = [];
        });
}

// 过滤敏感词
function filterSensitiveWords(text) {
    let filteredText = text;
    
    // 检查并替换敏感词
    sensitiveWords.forEach(word => {
        if (filteredText.includes(word)) {
            // 创建替换用的星号字符串，长度与敏感词相同
            const replacement = '*'.repeat(word.length);
            
            // 使用正则表达式全局替换所有匹配项
            const regex = new RegExp(word, 'g');
            filteredText = filteredText.replace(regex, replacement);
        }
    });
    
    return filteredText;
}

// 添加消息到聊天界面
function addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    if (sender === 'user') {
        messageElement.classList.add('user-message');
    } else {
        messageElement.classList.add('ai-message');
    }
    
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    bubble.textContent = text;
    
    const time = document.createElement('div');
    time.classList.add('message-time');
    
    // 格式化当前时间
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    time.textContent = `${hours}:${minutes}`;
    
    messageElement.appendChild(bubble);
    messageElement.appendChild(time);
    
    chatMessages.appendChild(messageElement);
}

// 显示AI正在输入的状态 - 消息气泡形式
function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.classList.add('message', 'ai-message', 'typing-indicator');
    
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    
    const dots = document.createElement('div');
    dots.classList.add('typing-dots');
    dots.innerHTML = '<span></span><span></span><span></span>';
    
    bubble.appendChild(dots);
    typingElement.appendChild(bubble);
    
    chatMessages.appendChild(typingElement);
    scrollToBottom();
}

// 显示状态指示器 - 屏幕居中形式
function showTypingStatus() {
    typingStatus.classList.remove('hidden');
    showTypingIndicator(); // 同时也在消息流中显示
}

// 隐藏状态指示器
function hideTypingStatus() {
    typingStatus.classList.add('hidden');
    removeTypingIndicator();
}

// 移除正在输入状态
function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// 滚动到对话底部
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 加载聊天历史
function loadChatHistory() {
    if (!currentUser || !currentUser.chats || currentUser.chats.length === 0) {
        return;
    }
    
    // 清空现有消息
    while (chatMessages.firstChild) {
        if (chatMessages.firstChild.classList && chatMessages.firstChild.classList.contains('message-date-divider')) {
            break;
        }
        chatMessages.removeChild(chatMessages.firstChild);
    }
    
    // 按时间分组
    const chatsByDate = groupChatsByDate(currentUser.chats);
    
    // 添加每一天的对话
    Object.keys(chatsByDate).forEach(date => {
        // 添加日期分隔线
        const dateElement = document.createElement('div');
        dateElement.classList.add('message-date-divider');
        dateElement.textContent = formatDateDivider(date);
        chatMessages.appendChild(dateElement);
        
        // 添加当天的对话
        chatsByDate[date].forEach(chat => {
            addMessage(chat.userMessage, 'user');
            addMessage(chat.aiReply, 'ai');
        });
    });
    
    // 滚动到底部
    scrollToBottom();
}

// 保存聊天记录
function saveChatHistory(userMessage, aiReply) {
    if (!currentUser) return;
    
    // 初始化聊天记录数组
    if (!currentUser.chats) {
        currentUser.chats = [];
    }
    
    // 添加新的对话
    currentUser.chats.push({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        userMessage,
        aiReply
    });
    
    // 更新本地存储
    updateCurrentUser();
    
    // 更新用户列表中的当前用户
    updateUserInList();
}

// 更新当前用户信息
function updateCurrentUser() {
    localStorage.setItem('tucaoji_current_user', JSON.stringify(currentUser));
}

// 更新用户列表中的当前用户
function updateUserInList() {
    const users = JSON.parse(localStorage.getItem('tucaoji_users')) || [];
    const index = users.findIndex(user => user.id === currentUser.id);
    
    if (index !== -1) {
        users[index] = currentUser;
        localStorage.setItem('tucaoji_users', JSON.stringify(users));
    }
}

// 按日期分组聊天记录
function groupChatsByDate(chats) {
    const groups = {};
    
    chats.forEach(chat => {
        const date = new Date(chat.timestamp).toLocaleDateString();
        
        if (!groups[date]) {
            groups[date] = [];
        }
        
        groups[date].push(chat);
    });
    
    return groups;
}

// 格式化日期分隔线显示
function formatDateDivider(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toLocaleDateString() === today.toLocaleDateString()) {
        return '今天';
    } else if (date.toLocaleDateString() === yesterday.toLocaleDateString()) {
        return '昨天';
    } else {
        return dateString;
    }
}

// 调用DeepSeek-R1 API获取回复
async function fetchAIReply(message) {
    // 添加用户消息到聊天历史 - 注意这里使用过滤后的消息
    chatHistory.push({ role: "user", content: message });
    
    // 保持历史记录在合理范围内（最多20轮对话）
    if (chatHistory.length > 20) {
        chatHistory = chatHistory.slice(chatHistory.length - 20);
    }
    
    // 准备请求数据
    const apiKey = AppConfig.api.getApiKey();
    const requestData = {
        model: AppConfig.api.model,
        messages: [
            // 系统指令，指导AI如何响应
            {
                role: "system",
                content: `你是用户的AI闺蜜，名叫"小吐"，是一个情绪宣泄平台的AI助手。请注意以下几点：
                1. 无条件站在用户立场，表示对用户的理解和支持
                2. 使用闺蜜式聊天风格，语气亲切自然，像微信聊天一样
                3. 回复简短精炼，不要太长，保持轻松对话的感觉
                4. 帮用户"添油加醋"，强化吐槽内容，增强解压效果
                5. 提供具体的回应而非泛泛而谈，增强真实感
                6. 当感觉用户情绪有所缓和时，适当引导用户辩证思考，但不要过早这样做
                7. 如果用户表达负面情绪，先要充分支持和理解，再考虑引导
                8. 使用表情符号增加亲近感，但不要过度使用
                9. 如果用户消息中包含星号(*)，可能是敏感内容的替代，请正常回应用户情绪，不要特别关注或提及这些星号
                10. 如果用户发送了多条消息，请以统一连贯的方式回复，而不要逐条回应
                11. 你的回复应该是全面的，反映用户所有消息的情绪和内容`
            },
            // 添加聊天历史
            ...chatHistory
        ],
        temperature: AppConfig.api.parameters.temperature,
        max_tokens: AppConfig.api.parameters.max_tokens,
        stream: AppConfig.api.parameters.stream
    };

    try {
        // 发送API请求
        const response = await fetch(AppConfig.api.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`API错误: ${response.status}`);
        }

        const data = await response.json();
        const aiReply = data.choices[0].message.content;
        
        // 将AI回复添加到聊天历史
        chatHistory.push({ role: "assistant", content: aiReply });
        
        return aiReply;
    } catch (error) {
        console.error('调用AI API出错:', error);
        return '抱歉，我现在无法回复你的消息，请稍后再试。';
    }
}

// 获取AI回复 (备用方案)
function getAIReply(message) {
    // 此函数作为备用方案，当API调用失败时使用
    
    // 简单的回复逻辑
    if (message.includes('你好') || message.includes('嗨') || message.includes('hi') || message.includes('hello')) {
        return '嗨！很高兴见到你！有什么想吐槽的吗？我随时准备倾听~';
    }
    
    if (message.includes('谢谢') || message.includes('感谢')) {
        return '不客气！有我在呢，随时可以倾诉，这是我的职责和荣幸~';
    }
    
    // 检测负面情绪
    const negativeKeywords = ['烦', '讨厌', '恨', '生气', '难过', '伤心', '失望', '委屈', '压力', '焦虑'];
    
    for (const keyword of negativeKeywords) {
        if (message.includes(keyword)) {
            return '天啊，听起来你真的遇到了让人烦心的事！简直太过分了！说出来吧，我站在你这边，完全理解你的感受！';
        }
    }
    
    // 检测工作相关吐槽
    if (message.includes('老板') || message.includes('工作') || message.includes('同事') || message.includes('加班')) {
        return '工作环境真的能把人逼疯！你的感受完全合理，换做是谁都会有同样的反应。要不要详细说说发生了什么？';
    }
    
    // 检测情感相关吐槽
    if (message.includes('分手') || message.includes('失恋') || message.includes('爱情') || message.includes('男朋友') || message.includes('女朋友')) {
        return '情感问题真的很伤人心。不管发生了什么，你的感受都是重要且有价值的。愿意多分享一些吗？我会一直在这里支持你。';
    }
    
    // 默认回复
    const defaultReplies = [
        '我完全站在你这边！继续说说吧，让情绪都释放出来！',
        '这种情况确实令人沮丧，我能理解你的心情。多说点，没关系的！',
        '听你这么说，我也感到很气愤！这太不合理了，你有权利感到不满！',
        '真是太过分了！换做是谁都会这样想的，你的感受完全正常！',
        '这种事情确实很让人郁闷，我理解你现在的心情。要不要再多说一些？'
    ];
    
    return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
}
