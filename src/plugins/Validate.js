/**
 * 验证类
 */
class Validate {

    /**
     * 数值范围验证器
     * @param {*} param 
     * @returns 
     */
    doubleRange(min, max) {

        if (typeof min !== 'number' && typeof max !== 'number') {
            return;
        }

        return (rule, value, callback) => {

            console.log(111);

            // 如果值为空或未定义，直接通过验证
            if (value === undefined || value === null || value === '') {
                callback();
                return;
            }

            // 检查值是否为数字
            const num = parseFloat(value);
            if (isNaN(num)) {
                callback(new Error('请输入有效的数值'));
                return;
            }

            // 检查值是否在指定范围内
            if (typeof min == 'number' && typeof max == 'number') {
                if (num < min || num > max) {
                    callback(new Error(`数值必须在 ${min} 和 ${max} 之间`));
                } else {
                    callback();
                }
                return;
            }

            // 检查值是否大于最小值
            if (typeof min == 'number') {
                if (num < min) {
                    callback(new Error(`数值必须大于 ${min}`));
                } else {
                    callback();
                }
                return;
            }

            // 检查值是否小于最大值
            if (typeof max == 'number') {
                if (num > max) {
                    callback(new Error(`数值必须小于 ${max}`));
                } else {
                    callback();
                }
                return;
            }


        }
    }

    // 中文姓名校验规则
    validateChinese(rule, value, callback) {
        if (!value) {
            callback()
        }

        // 中文正则：匹配一个或多个中文字符
        const chineseRegex = /^[\u4e00-\u9fa5]+$/

        if (!chineseRegex.test(value)) {
            callback(new Error('只能包含中文'))
        } else {
            callback()
        }
    }


    // ======================================================== 以下为表格内表单验证方法VIT ========================================================
    /**     
     * 必填验证器
     * @param {*} param 
     * @returns 
     */
    VIT_required(param) {
        return {
            validator: (rule, value, callback) => {

                if (Array.isArray(param) && param.length === 0) {
                    callback(new Error('请至少选择一项'));
                    return;
                }

                if (!param && !param===0) {
                    callback(new Error());
                } else {
                    callback();
                }
            }
        }
    }

}

// 创建实例（根据环境配置）
const validate = new Validate()

export default validate