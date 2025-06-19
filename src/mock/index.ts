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
    {
        url:'/api/addGame',
        method: 'post',
        response: 
        {
            "code": 200,
            "data": [{
                    id: 1,
                    name: '传奇霸业',
                    type: '角色扮演',
                    platform: 'PC',
                    status: '已发布',
                    cover: 'https://via.placeholder.com/80x60?text=Game+Cover',
                    updateTime: '2023-09-20 14:30:00'
                }, {
                    id: 2,
                    name: '全民枪战',
                    type: '射击游戏',
                    platform: '移动端',
                    status: '开发中',
                    cover: 'https://via.placeholder.com/80x60?text=Game+Cover',
                    updateTime: '2023-09-15 11:20:00'
                }, {
                    id: 3,
                    name: '天天农场',
                    type: '休闲益智',
                    platform: '移动端',
                    status: '下架',
                    cover: 'https://via.placeholder.com/80x60?text=Game+Cover',
                    updateTime: '2023-09-10 09:15:00'
                }],
            "message": "游戏新增成功",
        },
        statusCode: 200,
    }
] as MockMethod[];
