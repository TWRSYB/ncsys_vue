export default {
    mounted(el, binding) {
        const inputElement = el.querySelector('.el-input__wrapper .el-input__inner');
        if (!inputElement) return;
        // 获取参数 (1-正数 2-0和正数 其他-正数负数零均可)
        const type = binding.value || 2;
        const precision = 3; // 小数精度
        inputElement.addEventListener('input', () => {
            let newValue = inputElement.value;


            // 判断是否是负数
            let isNegative = newValue.startsWith('-') ? '-' : '';

            // 去除非数字和小数点的字符
            newValue = newValue.replace(/[^0-9.]/g, '');
            if (newValue != '') {
                let a = newValue.split('.');
                if (a.length == 1) {
                    // 如果没有小数点
                    if (type == 1) {
                        newValue = a[0].replace(/^0+/, '');
                    } else if (type == 2) {
                        newValue = /^0+$/.test(a[0]) ? '0' : a[0].replace(/^0+/, '');
                    } else {
                        newValue = isNegative + /^0+$/.test(a[0]) ? '0' : a[0].replace(/^0+/, '');
                    }
                } else {
                    // 如果有小数点
                    if (a[0] == '0' || a[0] == '') {
                        // 如果整数部分是0或者空
                        if (type == 1) {
                            newValue = '0.' + a[1].slice(0, precision);
                        } else if (type == 2) {
                            newValue = '0.' + a[1].slice(0, precision);
                        } else {
                            newValue = isNegative + '0.' + a[1].slice(0, precision);
                        }
                    } else {
                        // 如果整数部分不是0
                        if (type == 1) {
                            newValue = a[0].replace(/^0+/, '') + '.' + a[1].slice(0, precision);
                        } else if (type == 2) {
                            newValue = /^0+$/.test(a[0]) ? '0' : a[0].replace(/^0+/, '') + '.' + a[1].slice(0, precision);
                        } else {
                            newValue = isNegative + /^0+$/.test(a[0]) ? '0' : a[0].replace(/^0+/, '') + '.' + a[1].slice(0, precision);
                        }
                    }
                }
            }


            // 如果新值和原值不同，则更新输入框的值
            if (newValue !== inputElement.value) {
                inputElement.value = newValue;
                // 触发 input 事件更新 v-model
                inputElement.dispatchEvent(new Event('input'));
            }
        });

        inputElement.addEventListener('blur', () => {
            let newValue = inputElement.value;
            // 如果是空值则退出
            if (newValue === '') {
                return
            } else {
                // 如果是0.或者0.0...或者-0或者-0.或者-0.0...则设置为0
                if (/^0+\.?0*$/.test(newValue) || /^-0+\.?0*$/.test(newValue)) {
                    newValue = '0';
                }
                // 保留有效小数
                let a = newValue.split('.');
                if (a.length == 1) {
                    newValue = a[0];
                } else {
                    let decimalPart = a[1].replace(/0+$/, '');
                    // 如果小数部分为空则只保留整数部分
                    if (decimalPart == '') {
                        newValue = a[0];
                    } else {
                        newValue = a[0] + '.' + decimalPart;
                    }
                }
            }

            // 如果新值和原值不同，则更新输入框的值
            if (newValue !== inputElement.value) {
                inputElement.value = newValue;
                // 触发 input 事件更新 v-model
                inputElement.dispatchEvent(new Event('input'));
            }
        });
    }
}