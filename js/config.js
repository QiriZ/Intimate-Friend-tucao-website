/**
 * 配置文件 - 存储应用程序配置和敏感信息
 * 在实际生产环境中，API密钥应该由后端服务管理
 */

// 使用简单的编码方式存储API密钥，提供基本的混淆
// 注意：这不是真正的加密，只是增加了一点获取难度
const _0x5a8e=['a2V5','c2staG1p','cnFsYmli','b2NsampucQ==','c3luZWxm','bHl6dXB2','dWlpampb','b2p0bXhn','aGxjdm92','ZHNm'];
(function(_0x44f9d1,_0x5a8ee5){const _0x41b2dd=function(_0x1b8802){while(--_0x1b8802){_0x44f9d1['push'](_0x44f9d1['shift']());}};_0x41b2dd(++_0x5a8ee5);}(_0x5a8e,0x156));
const _0x41b2=function(_0x44f9d1,_0x5a8ee5){_0x44f9d1=_0x44f9d1-0x0;let _0x41b2dd=_0x5a8e[_0x44f9d1];if(_0x41b2['initialized']===undefined){(function(){let _0x402d31;try{const _0x1ec0b0=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x402d31=_0x1ec0b0();}catch(_0x502894){_0x402d31=window;}const _0x408cf5='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x402d31['atob']||(_0x402d31['atob']=function(_0x4da91e){const _0x57b280=String(_0x4da91e)['replace'](/=+$/,'');let _0x29b571='';for(let _0x39d0d5=0x0,_0x39d6f5,_0x56dff9,_0x4a0cae=0x0;_0x56dff9=_0x57b280['charAt'](_0x4a0cae++);~_0x56dff9&&(_0x39d6f5=_0x39d0d5%0x4?_0x39d6f5*0x40+_0x56dff9:_0x56dff9,_0x39d0d5++%0x4)?_0x29b571+=String['fromCharCode'](0xff&_0x39d6f5>>(-0x2*_0x39d0d5&0x6)):0x0){_0x56dff9=_0x408cf5['indexOf'](_0x56dff9);}return _0x29b571;});}());_0x41b2['base64DecodeUnicode']=function(_0x42ea73){const _0x376183=atob(_0x42ea73);let _0x5dba87='';for(let _0x207222=0x0,_0x365c31=_0x376183['length'];_0x207222<_0x365c31;_0x207222++){_0x5dba87+='%'+('00'+_0x376183['charCodeAt'](_0x207222)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x5dba87);};_0x41b2['data']={};_0x41b2['initialized']=!![];}const _0x1b8802=_0x41b2['data'][_0x44f9d1];if(_0x1b8802===undefined){_0x41b2dd=_0x41b2['base64DecodeUnicode'](_0x41b2dd);_0x41b2['data'][_0x44f9d1]=_0x41b2dd;}else{_0x41b2dd=_0x1b8802;}return _0x41b2dd;};

// 应用配置
const AppConfig = {
    // API配置
    api: {
        // 获取API密钥
        getApiKey: function() {
            // 简单的解码
            try {
                let parts = [];
                for(let i = 1; i < 10; i++) {
                    parts.push(_0x41b2('0x' + i));
                }
                return parts.join('');
            } catch(e) {
                console.error('配置错误:', e);
                return '';
            }
        },
        
        // API端点
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
