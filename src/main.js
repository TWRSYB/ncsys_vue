import './assets/main.scss'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from '@/router'
// import deepClone from './utils/deepClone'
import comUtils from './plugins/ComUtils'
import { regSvg } from './components/svg'

// 挂载到全局对象（浏览器环境）
// window.$deepClone = deepClone
window.$Com = comUtils



const app = createApp(App)
// ElementPlus
app.use(ElementPlus)
// ElementPlus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

regSvg(app) // 注册SVG图标组件

app.use(router)
// 全局属性
// app.config.globalProperties.$deepClone = deepClone
// 输入框绑定过滤
app.directive('input-filter', {
    mounted(el, binding) {
        const inputElement = el.querySelector('.el-input__wrapper .el-input__inner');
        if (!inputElement) return;
        const { regex, maxLength, upOrLower, notAlloweList, replaceMap, otherMothed } = binding.value || {};
        inputElement.addEventListener('input', () => {
            let newValue = inputElement.value;
            // 应用正则过滤
            if (regex) {
                const pattern = typeof regex === 'string' ? new RegExp(regex) : regex;
                newValue = newValue.replace(pattern, '');
            }

            // 应用长度限制
            if (typeof maxLength == 'number' && maxLength > 0 && maxLength % 1 === 0) {
                newValue = newValue.slice(0, maxLength);
            }

            // 大小写转换
            if (upOrLower == 'up') {
                newValue = newValue.toUpCase();
            } else if (upOrLower == 'lower') {
                newValue = newValue.toLowerCase();
            }


            // 去除不允许出现的内容: 1. 先确保是数组 2. 再验证所有元素类型为字符串
            if (Array.isArray(notAlloweList) && notAlloweList.every(item => typeof item === 'string')) {
                for (const item of notAlloweList) {
                    newValue = newValue.replace(item, '');
                }
            }

            // 替换元素
            if (replaceMap) {
                Object.entries(replaceMap).forEach(([key, value]) => {
                    newValue = newValue.replace(key, value);
                });
            }

            // 其他自定义方法
            if (otherMothed) {
                newValue = otherMothed(newValue);
            }

            if (newValue !== inputElement.value) {
                // 使用 Vue.nextTick 确保 DOM 更新后重置值
                setTimeout(() => {
                    inputElement.value = newValue;
                    // 触发 input 事件更新 v-model
                    inputElement.dispatchEvent(new Event('input'));
                }, 0);
            }
        }
        );
    }
});
app.mount('#app')
