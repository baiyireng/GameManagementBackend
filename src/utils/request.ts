import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { ElMessage, ElLoading } from 'element-plus'; // 新增：导入ElLoading
import { type InternalAxiosRequestConfig } from 'axios';
import mockData from '../mock/eventData.json'; // 假设有一个mock数据文件

interface ApiResponse<T> {
    code: number; // 业务状态码（200为成功）
    data: T; // 业务数据
    message: string; // 提示信息
    timestamp: number; // 服务端时间戳（可选）
}
const baseURL = import.meta.env.VITE_API_BASE_URL;
// 创建axios实例（可根据环境配置baseURL）
const service = axios.create({
    baseURL, // 动态基础URL
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

let loadingInstance: ReturnType<typeof ElLoading.service>;

// 请求拦截器
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 显示加载提示（排除上传/下载等特殊请求）
        if (!config.headers?.['No-Loading']) {
            loadingInstance = ElLoading.service({
                text: '加载中...',
                background: 'rgba(0, 0, 0, 0.05)',
            });
        }
        // 从localStorage获取token（登录后存储）
        const token = localStorage.getItem('mock-token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`; // 统一添加认证头
        }
        return config;
    },
    (error) => {
        loadingInstance?.close(); // 错误时关闭加载提示
        return Promise.reject(error);
    },
);

// 响应拦截器
service.interceptors.response.use(
    (response: AxiosResponse) => {
        loadingInstance?.close(); // 响应成功时关闭加载提示
        const res = response.data;

        // 统一接口规范：假设服务端返回结构 { code: 200, data: ..., message: '' }
        if (res.code !== 200) {
            ElMessage.error(res.message || '接口请求失败'); // 统一错误提示
            return Promise.reject(new Error(res.message || 'Error'));
        }
        return res.data; // 直接返回业务数据，简化调用
    },
    (error) => {
        loadingInstance?.close(); // 响应失败时关闭加载提示
        ElMessage.error(error.response?.data?.message || '网络请求异常');
        return Promise.reject(error);
    },
);

export default service;

// 获取事件数据
export const getEvent = (id: string): Promise<never> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const event = mockData.events.find((e) => e.id === id);
            if (event) {
                resolve(event);
            } else {
                reject(new Error(`未找到事件 ID 为 ${id} 的数据`));
            }
        }, 500);
    });
};

// export const getEvent = (id: string): Promise<never> => {
//     return fetch('/mock/eventData.json')
//         .then(response => response.json())
//         .then(data => {
//             const event = data.events.find((e: never) => e.id === id);
//             if (event) {
//                 return event;
//             } else {
//                 throw new Error(`未找到事件 ID 为 ${id} 的数据`);
//             }
//         });
// };

// 保存事件数据
export const saveEvent = (event: never): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockData.events.findIndex((e) => e.id === event.id);
            if (index !== -1) {
                mockData.events[index] = event;
            } else {
                mockData.events.push(event);
            }
            resolve();
        }, 500);
    });
};
