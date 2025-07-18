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

    /**
     * 验证性别与身份证号是否匹配
     * @param rules 
     * @param value 性别值(男/女)
     * @param callback 回调函数
     * @param idNum 身份证号
     * @returns 验证结果
     */
    VP_SexMatchIdNum = (rules, value, callback, idNum) => {
        if (!value) {
            callback()
        }

        if (!idNum || idNum.length != 18) {
            return callback();
        }
        const sexDigit = idNum.substr(16, 1)
        // 判断第17位是否是数字
        if (!/^\d$/.test(sexDigit)) {
            return callback();
        }

        if (sexDigit % 2 == 1) { // 奇数为男
            if (value == '男') {
                return callback();
            }
        } else { // 女
            if (value == '女') {
                return callback();
            }
        }
        callback(new Error('性别与身份证号不符'));
    }

    // 中文姓名校验规则
    V_Chinese = (rule, value, callback) => {
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

    // 身份证号校验规则
    V_IdCard = (rule, value, callback) => {

        if (!value) {
            callback()
        }

        if (!this.validateIdCard(value)) {
            callback(new Error('身份证号不符合规则'))
        } else {
            callback()
        }
    }

    /**
     * 验证中国大陆身份证号码
     * @param {string} idCard 身份证号码
     * @returns {boolean} 是否有效
     */
    validateIdCard = (idCard) => {
        // 基本格式校验
        if (typeof idCard !== 'string') return false;
        const cleanId = idCard.toUpperCase();
        if (!/(^\d{15}$)|(^\d{17}(\d|X)$)/.test(cleanId)) return false;

        // 长度判断
        const is18 = cleanId.length === 18;

        // 地区码校验（前6位）
        const areaCode = cleanId.substring(0, 6);
        const areaCodes = [
            '11', '12', '13', '14', '15',  // 华北
            '21', '22', '23',              // 东北
            '31', '32', '33', '34',        // 华东
            '35', '36', '37',              // 华中
            '41', '42', '43', '44', '45', '46',  // 华南
            '50', '51', '52', '53', '54',  // 西南
            '61', '62', '63', '64', '65'   // 西北
        ];
        if (!areaCodes.includes(areaCode.substring(0, 2))) {
            return false;
        }

        // 出生日期校验
        let birthDate;
        if (is18) {
            birthDate = `${cleanId.substring(6, 10)}-${cleanId.substring(10, 12)}-${cleanId.substring(12, 14)}`;
        } else {
            birthDate = `19${cleanId.substring(6, 8)}-${cleanId.substring(8, 10)}-${cleanId.substring(10, 12)}`;
        }

        if (isNaN(Date.parse(birthDate))) {
            return false;
        }
        const [year, month, day] = birthDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        if (
            date.getFullYear() !== year ||
            date.getMonth() + 1 !== month ||
            date.getDate() !== day
        ) {
            return false;
        }

        // 18位身份证需要校验码
        if (is18) {
            const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
            const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

            let sum = 0;
            for (let i = 0; i < 17; i++) {
                sum += parseInt(cleanId[i]) * weights[i];
            }

            const mod = sum % 11;
            if (cleanId[17] !== checkCodes[mod]) {
                return false;
            }
        }

        return true;
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

                if (!param && param !== 0) {
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