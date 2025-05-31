import { type MockMethod } from 'vite-plugin-mock';
import loginMock from './login.json'; // 导入登录模拟数据
import gameMock from './games.json'; // 导入游戏管理模拟数据

export default [
    {
        url: '/api/get',
        method: 'get',
        response: {
            code: 0,
            data: {
                name: 'vben',
            },
        },
    },
    {
        url: '/api/post',
        method: 'post',
        timeout: 2000, // 模拟延迟
        response: {
            code: 0,
            data: {
                name: 'vben',
                time: new Date().toISOString(), // 示例：返回当前时间
            },
        },
    },
    {
        url: '/api/login', // 新增：登录接口 mock
        method: 'post',
        response: loginMock,
    },
    {
        url: '/api/games',
        method: 'get',
        response: gameMock,
    },
    {
        url: '/api/text',
        method: 'post',
        rawResponse: async (req, res) => {
            let reqbody = '';
            await new Promise((resolve) => {
                req.on('data', (chunk) => (reqbody += chunk));
                req.on('end', () => resolve(undefined));
            });
            res.setHeader('Content-Type', 'text/plain');
            res.statusCode = 200;
            res.end(`hello, ${reqbody}`);
        },
    },
] as MockMethod[];
