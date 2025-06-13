/**
 * @description: 自定义指令，用于过滤输入框内容
 * @param {Object} el - 指令绑定的元素
 * @param {Object} binding - 指令的绑定值，包含过滤规则
 * @property {RegExp|string} [binding.value.regex] - 正则表达式，用于过滤输入内容
 * @param {number} [binding.value.maxLength] - 最大长度限制
 * @param {string} [binding.value.upOrLower] - 'up' 转为大写，'lower' 转为小写
 * @param {Array<string>} [binding.value.notAlloweList] - 不允许出现的字符串列表
 * @param {Object} [binding.value.replaceMap] - 替换映射对象，键为要替换的内容，值为替换后的内容
 * @param {Function} [binding.value.otherMothed] - 其他自定义处理方法
 * @description: 该指令会在输入框内容变化时应用过滤规则，并更新输入框的值
 */
export default {
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
}