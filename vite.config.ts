import { defineConfig } from 'vite';
import { type ConfigEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { viteMockServe } from 'vite-plugin-mock';
import path from 'path';

const pathSrc = path.resolve(__dirname, 'src');
export default defineConfig(({ mode, command }: ConfigEnv) => {
    const isMockMode = mode === 'mock'; // 判断是否为 mock 模式

    return {
        plugins: [
            vue(),
            AutoImport({ 
                resolvers: [
                    ElementPlusResolver()
                ],
                dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
            }),
            Components({ 
                resolvers: [
                    ElementPlusResolver()
                ] ,
                dts: 'src/components.d.ts', // 生成组件类型声明文件
            }),
            viteMockServe({
                mockPath: 'src/mock', // mock 文件目录（与实际路径一致）
                watchFiles: true, // 监听文件变化自动更新
                enable: command === 'serve', // 仅开发模式启用
            })
        ],
        resolve: {
            alias: {
                '@': '/src', // 配置别名
                '@/utils': '/src/utils',
                'vue': 'vue/dist/vue.esm-bundler.js', // 支持运行时编译
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