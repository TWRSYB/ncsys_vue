import './assets/main.scss'
import '@/assets/css/fonts.css' // 引入字体样式

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from '@/router'
import comUtils from './plugins/ComUtils'
import request from './plugins/Requests'
import tableDesign from './plugins/TableDesign'
import validate from './plugins/Validate'
import { regSvg } from './components/svg'
import { createPinia } from 'pinia' // 引入 Pinia
import { createPersistedState } from 'pinia-persistedstate-plugin' // 持久化插件
import highlightDirective from '@/directives/highlight';
import inputFilterDirective from '@/directives/input-filter'
import inputEnOnlyDirective from '@/directives/input-en-only'
import styleInlineFlex from '@/directives/inline-flex'
import inputInt from '@/directives/input-int'
import inputDouble from '@/directives/input-double'
import clickOutside from '@/directives/click-outside'
import print from 'vue3-print-nb'






// 挂载到全局对象（浏览器环境）
window.$Com = comUtils
window.$Requests = request
window.$TDS= tableDesign
window.$VLD = validate



const app = createApp(App)
// ElementPlus
app.use(ElementPlus, {
    locale: zhCn // 设置 ElementPlus 的语言为中文
})
// ElementPlus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

regSvg(app) // 注册SVG图标组件


const pinia = createPinia() // 创建 Pinia 实例
const persist = createPersistedState() // 创建持久化状态插件实例
pinia.use(persist)  // 持久化状态插件
app.use(pinia) // 使用 Pinia 状态管理 (挂载 Pinia 实例到 Vue 应用)
app.use(router) // 使用路由
app.use(print)


// 全局属性
app.config.globalProperties.$Com = comUtils // 挂载 ComUtils 到全局属性
app.config.globalProperties.$Requests = request // 挂载 request 到全局属性
app.config.globalProperties.$VLD = validate // 挂载 validate 到全局属性


// 1. 定义全局指令
app.directive('input-en-only', inputEnOnlyDirective); // 注册input仅英文指令
app.directive('input-filter', inputFilterDirective); // 注册input过滤指令
app.directive('highlight', highlightDirective); // 注册高亮指令
app.directive('inline-flex', styleInlineFlex); // 注册inline-flex指令
app.directive('input-int', inputInt)  // 注册input整数指令
app.directive('input-double', inputDouble) // 注册input双精度指令
app.directive('click-outside', clickOutside) // 注册点击外部指令
app.mount('#app')
