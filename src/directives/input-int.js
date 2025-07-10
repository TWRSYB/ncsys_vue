export default {
    mounted(el, binding) {
        const inputElement = el.querySelector('.el-input__wrapper .el-input__inner');
        if (!inputElement) return;
        // 1-正整数 2-0和正整数 其他-整数
        const type = binding.value || 2;
        const maxDigits = 5
        inputElement.addEventListener('input', () => {
            let newValue = inputElement.value;

            // 判断是否是负数
            let isNegative = newValue.startsWith('-') ? '-' : '';

            newValue = newValue.replace(/[^0-9]/g, '');

            if (newValue != '') {
                // 移除前导0
                newValue = newValue.replace(/^0+/, '')
                if (type == 1) {
                    // 保留位数
                    newValue = newValue.slice(0, maxDigits)
                } else if (type == 2) {
                    if (newValue == '') {
                        newValue = '0'
                    } else {
                        // 保留位数
                        newValue = newValue.slice(0, maxDigits);
                    }
                } else {
                    if (newValue == '') {
                        newValue = '0'
                    } else {
                        newValue = isNegative + newValue.slice(0, maxDigits);
                    }
                }

            }



            if (newValue !== inputElement.value) {
                // setTimeout(() => {
                inputElement.value = newValue;
                // 触发 input 事件更新 v-model
                inputElement.dispatchEvent(new Event('input'));
                // }, 0);
            }
        }
        );
    }
}