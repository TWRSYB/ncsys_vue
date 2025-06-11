const isObject = (val) => val !== null && typeof val === 'object'
const isPrimitive = (val) => !isObject(val) && typeof val !== 'function'

const getType = (val) => 
  Object.prototype.toString.call(val).slice(8, -1).toLowerCase()

const tagMap = {
  [Symbol.toStringTag]: (val) => val[Symbol.toStringTag]
}

class ComUtils {
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
}

// 创建实例（根据环境配置）
const comUtils = new ComUtils()

export default comUtils