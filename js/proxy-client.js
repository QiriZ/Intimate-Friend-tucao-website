/**
 * API代理客户端 - 用于解决GitHub Pages上的跨域请求问题
 */

// 代理客户端类
class ApiProxyClient {
    constructor() {
        this.proxyFrame = null;
        this.isReady = false;
        this.requestQueue = [];
        this.callbacks = new Map();
        this.requestId = 1;
        
        // 初始化事件监听
        this._setupEventListener();
    }
    
    // 初始化代理iframe
    init(proxyUrl = 'proxy.html') {
        return new Promise((resolve, reject) => {
            // 如果已经初始化，直接返回
            if (this.proxyFrame) {
                resolve();
                return;
            }
            
            console.log('初始化API代理...');
            
            // 创建iframe元素
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none'; // 隐藏iframe
            iframe.src = proxyUrl;
            
            // 设置超时
            const timeout = setTimeout(() => {
                reject(new Error('API代理初始化超时'));
            }, 5000);
            
            // 等待代理就绪
            this._onceReady = () => {
                clearTimeout(timeout);
                this.isReady = true;
                console.log('API代理已就绪');
                
                // 处理队列中的请求
                while (this.requestQueue.length > 0) {
                    const request = this.requestQueue.shift();
                    this._sendRequest(request.endpoint, request.apiKey, request.data, request.callback);
                }
                
                resolve();
            };
            
            // 添加到文档中
            document.body.appendChild(iframe);
            this.proxyFrame = iframe;
        });
    }
    
    // 设置事件监听器
    _setupEventListener() {
        window.addEventListener('message', (event) => {
            // 验证消息来源
            const iframe = this.proxyFrame;
            if (iframe && (event.source === iframe.contentWindow)) {
                // 处理代理就绪消息
                if (event.data && event.data.type === 'proxy_ready') {
                    if (this._onceReady) {
                        this._onceReady();
                        this._onceReady = null;
                    }
                    return;
                }
                
                // 处理API响应
                if (event.data && event.data.type === 'api_response') {
                    const { id, success, data, error } = event.data;
                    const callback = this.callbacks.get(id);
                    
                    if (callback) {
                        if (success) {
                            callback.resolve(data);
                        } else {
                            callback.reject(new Error(error || '未知错误'));
                        }
                        
                        // 删除回调
                        this.callbacks.delete(id);
                    }
                }
            }
        });
    }
    
    // 发送API请求
    sendRequest(endpoint, apiKey, data) {
        return new Promise((resolve, reject) => {
            // 如果代理尚未就绪，添加到队列
            if (!this.isReady) {
                this.requestQueue.push({
                    endpoint,
                    apiKey,
                    data,
                    callback: { resolve, reject }
                });
                
                // 如果没有初始化，尝试初始化
                if (!this.proxyFrame) {
                    this.init().catch(reject);
                }
                
                return;
            }
            
            this._sendRequest(endpoint, apiKey, data, { resolve, reject });
        });
    }
    
    // 发送请求到代理iframe
    _sendRequest(endpoint, apiKey, data, callback) {
        const id = this.requestId++;
        
        // 存储回调
        this.callbacks.set(id, callback);
        
        // 发送消息到代理iframe
        this.proxyFrame.contentWindow.postMessage({
            type: 'api_request',
            id,
            payload: {
                endpoint,
                apiKey,
                data
            }
        }, '*');
    }
}

// 创建全局实例
window.apiProxy = new ApiProxyClient();
