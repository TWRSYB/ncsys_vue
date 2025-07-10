class Validate {
    VIT_required(param) {
        return {
            validator: (rule, value, callback) => {

                if (Array.isArray(param) && param.length === 0) {
                    callback(new Error('请至少选择一项'));
                    return;
                }

                if (!param) {
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