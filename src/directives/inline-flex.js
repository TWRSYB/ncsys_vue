export default {
    mounted(el, binding) {
        applyStyles(el, binding.value, binding.arg)
    },
    updated(el, binding) {
        applyStyles(el, binding.value, binding.arg)
    }
}

function applyStyles(el, value, arg) {
    // 解析宽度值
    const width = parseWidth(value, arg)

    //   const width = typeof value === 'string' ? value : '25%'
    el.style.setProperty('display', 'inline-flex', 'important')
    el.style.setProperty('width', width, 'important')

    //   // 保留element-plus原有样式
    //   el.style.removeProperty('margin-bottom')
    //   el.style.setProperty('margin-bottom', 'var(--el-form-item-margin-bottom)', 'important')
}

// 新增解析函数
function parseWidth(value, arg) {
    // 如果没有传入值，使用默认值
    if (!value) {
        return '25%' // 默认值
    }
    
    // 处理动态绑定的情况（:v-inline-flex）
    if (arg === undefined && typeof value === 'string') {
        return parseDynamicValue(value)
    }
    // 处理静态绑定的情况（v-inline-flex）
    if (typeof value === 'string') {
        return parseStaticValue(value)
    }

    // 处理数字类型
    if (typeof value === 'number') {
        return `${value}%`
    }

    return '25%' // 默认值
}

// 解析动态绑定值（:v-inline-flex）
function parseDynamicValue(value) {
    // 支持计算属性和方法调用
    if (value.includes(' ')) {
        return value.replace(/ /g, '') // 移除空格
    }
    return value
}

// 解析静态值（v-inline-flex）
function parseStaticValue(value) {
    // 自动追加%符号（如果只有数字）
    if (/^\d+$/.test(value)) {
        return `${value}%`
    }

    // 保留原有单位
    const unitMatch = value.match(/^\d+(px|em|rem|%|vw|vh)$/)
    return unitMatch ? value : '25%'
}