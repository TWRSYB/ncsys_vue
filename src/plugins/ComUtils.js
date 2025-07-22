const isObject = (val) => val !== null && typeof val === 'object'
const isPrimitive = (val) => !isObject(val) && typeof val !== 'function'

const getType = (val) =>
    Object.prototype.toString.call(val).slice(8, -1).toLowerCase()

const tagMap = {
    [Symbol.toStringTag]: (val) => val[Symbol.toStringTag]
}

class ComUtils {
    /**
     * 深拷贝
     * @description 深拷贝函数，支持循环引用、特殊对象类型（Date、RegExp、Map、Set）和 Symbol 键
     * @description 该函数使用 WeakMap 来处理循环引用，避免无限递归。
     * @param {*} source 源对象
     * @param {*} map weakMap 用于存储已拷贝的对象，避免循环引用
     * @returns {*} 深拷贝后的对象
     */
    deepClone(source, map = new WeakMap()) {

        if (!isObject(source)) return source

        // 处理特殊对象类型
        const type = getType(source)


        if (type === 'date') return new Date(source)
        if (type === 'regexp') return new RegExp(source.source, source.flags)
        if (type === 'map') return new Map([...source])
        if (type === 'set') return new Set([...source])

        // 处理循环引用
        if (map.has(source)) return map.get(source)

        // 处理数组/对象
        const cloneTarget = Array.isArray(source) ? [] : {}
        map.set(source, cloneTarget)


        // 递归拷贝属性
        for (const key in source) {

            if (source.hasOwnProperty(key)) {
                const value = source[key]
                if (isObject(value)) {



                    cloneTarget[key] = this.deepClone(value, map)
                } else {
                    cloneTarget[key] = value
                }
            }
        }


        // 处理 Symbol 键
        const symbolKeys = Object.getOwnPropertySymbols(source)
        if (symbolKeys.length) {
            symbolKeys.forEach(sym => {
                const desc = Object.getOwnPropertyDescriptor(source, sym)
                if (desc.value && isObject(desc.value)) {
                    desc.value = this.deepClone(desc.value, map)
                }
                Object.defineProperty(cloneTarget, sym, desc)
            })
        }

        return cloneTarget
    }

    /**
    * 深拷贝对象属性（保留目标对象原有属性）
    * @param {Object} source 源对象
    * @param {Object} target 目标对象
    * @returns {Object} 深拷贝后的目标对象
    */
    deepCopy = (source, target = {}) => {
        const map = new WeakMap()

        const copy = (src, tgt) => {
            // 处理基本类型和null
            if (src === null || typeof src !== 'object') {
                return src
            }

            // 处理循环引用
            if (map.has(src)) {
                return map.get(src)
            }

            // 处理特殊对象类型
            const type = src.constructor
            switch (type) {
                case Date:
                    return new Date(src)
                case RegExp:
                    return new RegExp(src)
                case Array:
                    tgt = Array.isArray(tgt) ? tgt : []
                    map.set(src, tgt)
                    src.forEach((item, index) => {
                        tgt[index] = copy(item, tgt[index])
                    })
                    return tgt
                default:
                    tgt = tgt || {}
                    map.set(src, tgt)
                    Object.keys(src).forEach(key => {
                        tgt[key] = copy(src[key], tgt[key])
                    })
                    return tgt
            }
        }

        return copy(source, target)
    }


    /**
     * 数组比较
     * @description 比较两个数组是否相等，忽略顺序
     * @param {Array} arr1 第一个数组
     * @param {Array} arr2 第二个数组
     * @returns {boolean} 如果两个数组相等（忽略顺序），返回 true，否则返回 false
     */
    arraysEqual(arr1, arr2) {
        if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false
        if (arr1.length !== arr2.length) return false
        const sorted1 = [...arr1].sort();
        const sorted2 = [...arr2].sort();
        return sorted1.every((val, index) => val === sorted2[index]);
    }

    /**
     * @description 过滤表格设计
     * @param {TD} tableDesign 数据库设计
     * @param {Array} disabledFields 需要过滤掉的字段列表
     * @param {string[]} [disabledFields=['createUser', 'createTime', 'updateUser', 'updateTime']] 默认需要过滤的字段
     * @returns 过滤后的数据库设计
     * @description 过滤掉不需要的字段（如 createUser、createTime、updateUser、updateTime）
     * @description 该函数用于在表格设计中排除一些不需要的字段，以便于前端展示和操作。
     */
    TD_filter(tableDesign, disabledFields = ['createUser', 'createTime', 'updateUser', 'updateTime']) {
        return tableDesign.filter(field => !disabledFields.includes(field.columnName))
    }

    /**
     * @description 下划线转驼峰
     * @param {string} str 下划线格式的字符串
     */
    toCamelCase(str) {
        return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
    }

    getYM = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        return `${year}-${String(month).padStart(2, '0')}`
    }

}

// 创建实例（根据环境配置）
const comUtils = new ComUtils()

export default comUtils