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
        // inputElement.addEventListener(
        //     'input',
        //     () => {
        //         inputElement.type = 'password'; // 设置为密码输入框用于锁定英文输入法
        //         setTimeout(() => {
        //             inputElement.type = 'text'; // 设置为文本输入框以便显示明文
        //         }, 0);
        //     }
        // );
        inputElement.addEventListener(
            'focus',
            () => {
                inputElement.type = 'password'; // 设置为密码输入框用于锁定英文输入法
                setTimeout(() => {
                    inputElement.type = 'text'; // 设置为文本输入框以便显示明文
                }, 0);
            }
        );
    }
}