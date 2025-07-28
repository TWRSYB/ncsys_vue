import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import ElementPlus from 'unplugin-element-plus/vite'


// https://vite.dev/config/
export default defineConfig({
    // base: '/', // 默认使用绝对路径, 默认使用 /,
    base: '', // 此处使用相对路径, Springboot配置了context-path之后必须使用相对路径, 否则打包后不能访问
    // build: {
    //     assetsDir: './assets' // 相对路径资源, 使用默认就可
    // },
    plugins: [
        vue(),
        vueDevTools(),
        // Element Plus 组件自动导入
        ElementPlus({
            importStyle: 'sass', // 推荐使用 sass 变量
            useSource: true      // 使用 element-plus 源码版本（推荐）
        }),
        AutoImport({    // 通过 Vite 插件在编译时自动注入 API 导入语句, 省得在.vue中收到导入
            imports: [
                'vue',        // 自动导入 vue 相关函数
                'vue/macros',  // 支持 <script setup> 语法糖（Vue3.3+）
                'vue-router', // 确保包含 vue-router
                {
                    'element-plus': [
                        'ElMessage',
                        'ElMessageBox',
                        'ElNotification',
                        'ElLoading',
                        'ElNotification'
                    ],
                    'vue-router': [
                        'useRoute',      // 访问当前路由
                        'useRouter',     // 访问路由器实例
                        'onBeforeRouteLeave', // 导航守卫
                        'onBeforeRouteUpdate'
                    ]
                }
            ],
            dts: false,     // 纯JS项目可关闭类型声明生成
            eslintrc: {
                enabled: true, // 生成 ESLint 配置
                filepath: './.eslintrc-auto-import.json'
            }
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    server: {
        proxy: {
            '/ncsys': {
                target: 'http://localhost:8090',
                // target: 'http://localhost:8110',
                // target: 'http://192.168.31.62:8090',
                changeOrigin: true,
                // rewrite: (path) => path.replace(/^\/api/, '')
            }
        },
        // 允许其他设备访问
        host: '0.0.0.0',
        port: 5173
    }
})
