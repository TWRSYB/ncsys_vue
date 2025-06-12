/**
 * 
 * @param {*} app vue 实例
 * @description 扫描并注册 SVG 图标组件
 */
export function regSvg(app) {
    // Vite 魔法函数扫描仪文件 返回的是一个「路径→组件定义」的映射对象
    const components = import.meta.glob(
        '@/components/svg/**/*.vue', // 扫描文件夹路径
        { eager: true } // 立即加载所有匹配的组件（而不是按需加载）
    )

    // 2. 批量注册组件
    // Object.entries() 将映射对象转换为二维数组
    // path: 文件的绝对路径（如：/src/components/Button.vue）
    // definition: 组件导出对象（通过.default获取实际组件）
    Object.entries(components).forEach(([path, definition]) => {


        // 3. 提取组件名称（示例：将 './MyComponent.vue' 转为 'MyComponent'）
        const componentName = path
            .split('/')        // 按路径分隔符拆分
            .pop()             // 取出最后一部分（文件名）
            .replace(/\.\w+$/, '') // 去除文件扩展名（如.vue）
            .replace(/^\w/, c => c.toUpperCase()) // 首字母大写

        // 4. 全局注册组件
        app.component(componentName, definition.default)
    })
}