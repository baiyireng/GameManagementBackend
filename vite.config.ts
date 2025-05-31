import { defineConfig } from 'vite';
import { type ConfigEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { viteMockServe } from 'vite-plugin-mock';

export default defineConfig(({ mode, command }: ConfigEnv) => {
    const isMockMode = mode === 'mock'; // 判断是否为 mock 模式

    return {
        plugins: [
            vue(),
            AutoImport({ resolvers: [ElementPlusResolver()] }),
            Components({ resolvers: [ElementPlusResolver()] }),
            viteMockServe({
                mockPath: 'src/mock', // mock 文件目录（与实际路径一致）
                watchFiles: true, // 监听文件变化自动更新
                enable: command === 'serve', // 仅开发模式启用
            }),
        ],
        resolve: {
            alias: {
                '@': '/src', // 配置别名
                '@/utils': '/src/utils',
            },
        },
        server: {
            proxy: {
                '/api': {
                    // 修改此处：使用 IPv4 地址避免解析问题
                    target: '',
                    changeOrigin: true,
                    // rewrite: (path) => path.replace(/^\/api/, ''),
                },
            },
        },
    };
});
