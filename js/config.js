/**
 * 配置文件 - 存储应用程序配置和敏感信息
 * 在实际生产环境中，API密钥应该由后端服务管理
 */

// API密钥直接存储 - 仅用于测试
// 注意：在实际生产环境中应该使用更安全的方式
const API_KEY = "sk-jmirqlbibocljnqsynelflyzupvuiijjaojtmxghlcvovdsf";

// 应用配置
const AppConfig = {
    // API配置
    api: {
        // 获取API密钥 - 简化版，确保GitHub Pages上可用
        getApiKey: function() {
            return API_KEY;
        },
        
        // API端点 - 确保使用HTTPS
        endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
        
        // 模型名称
        model: 'Pro/deepseek-ai/DeepSeek-R1',
        
        // 模型参数
        parameters: {
            temperature: 0.7,
            max_tokens: 800,
            stream: false
        }
    },
    
    // 本地存储键
    storage: {
        users: 'tucaoji_users',
        currentUser: 'tucaoji_current_user',
        rememberUser: 'tucaoji_remember_user'
    },
    
    // 消息批处理配置
    messaging: {
        batchDelay: 5000, // 5秒内的消息会被批处理
        maxBatchSize: 3   // 一次最多处理3条消息
    }
};

// 导出配置
window.AppConfig = AppConfig;
