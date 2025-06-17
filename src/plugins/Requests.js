// src/utils/request.js
import axios from 'axios'
import { useTokenStore } from '@/stores/token'
import { useUserInfoStore } from '@/stores/userInfo'
import router from '@/router' // 导入路由实例

class Request {
    constructor(config) {
        // 创建axios实例
        this.instance = axios.create(config)
        this.pendingRequests = new Set() // 存储请求标识

        // 请求拦截器
        this.instance.interceptors.request.use(
            (config) => {

                const tokenStore = useTokenStore();

                if (!['/user/login', '/user/logout'].includes(config.url)) {
                    tokenStore.checkToken(); // 检查token是否需要刷新
                }

                // 添加token到headers
                const token = tokenStore.token
                if (token) {
                    config.headers.Authorization = token
                }

                // 添加请求唯一标识（用于取消重复请求）
                const requestId = `${config.url}_${JSON.stringify(config.params)}_${JSON.stringify(config.data)}`
                config.cancelToken = new axios.CancelToken((cancel) => {
                    this.pendingRequests.add(`${requestId}_${cancel}`)
                })

                return config
            },
            (error) => Promise.reject(error)
        )

        // 响应拦截器
        this.instance.interceptors.response.use(
            (response) => {
                // 移除请求标识
                const requestId = `${response.config.url}_${JSON.stringify(response.config.params)}_${JSON.stringify(response.config.data)}`
                this.pendingRequests.forEach((cancel, key) => {
                    if (key.startsWith(requestId)) {
                        this.pendingRequests.delete(key)
                    }
                })

                // 业务状态码判断（根据实际后端接口调整）
                if (response.data.code !== 200) {
                    // 统一错误处理
                    if (response.config.showErrorMsg !== false) {
                        ElMessage.error(response.data.message || '请求失败')
                    }
                    return Promise.reject(new Error(response.data.message || 'Error'))
                } else {
                    if (response.config.showSuccessMsg === true) {
                        ElMessage.success(response.data.message || '请求成功')
                    }
                }
                return response.data
            },
            (error) => {
                // 取消重复请求处理
                if (axios.isCancel(error)) {
                    return Promise.reject(error)
                }

                if (error.response && error.response.status === 401) {
                    ElMessage.error('请先登录')
                    const tokenStore = useTokenStore();
                    tokenStore.removeToken() // 清除token
                    router.push('/login') // 跳转到登录页
                } else {
                    // 统一错误处理
                    const message = error.response?.data?.message || '网络异常'
                    if (error.config.showErrorMsg !== false) {
                        ElMessage.error(message)
                    }
                }
                return Promise.reject(error)
            }
        )
    }

    // 通用请求方法
    request(config) {
        const { showLoading = true, ...restConfig } = config

        // 显示全局loading（需自行实现）
        if (showLoading) {
            // 例如：使用element-plus的loading服务
            const loading = ElLoading.service({ fullscreen: true })
            restConfig.cancelToken = new axios.CancelToken(cancel => {
                loading.close()
            })
        }

        return this.instance.request(restConfig)
    }

    // 快捷方法
    get(url, config) {
        return this.request({ ...config, url, method: 'GET' })
    }

    post(url, data, config) {
        return this.request({ ...config, url, method: 'POST', data })
    }

    put(url, data, config) {
        return this.request({ ...config, url, method: 'PUT', data })
    }

    delete(url, config) {
        return this.request({ ...config, url, method: 'DELETE' })
    }

    logout() {
        // 发送登出请求
        request.get('/user/logout')
        setTimeout(() => {
            // 跳转到登录页
            router.push('/login');
            const userInfoStore = useUserInfoStore();
            userInfoStore.removeInfo();// 清除用户信息
            const tokenStore = useTokenStore();
            tokenStore.removeToken() // 清除token
        }, 50);
    }

    // 取消所有请求
    cancelAllRequests() {
        this.pendingRequests.forEach((cancel) => cancel())
        this.pendingRequests.clear()
    }
}

// 创建实例（根据环境配置）
const request = new Request({
    //   baseURL: import.meta.env.VITE_API_BASE_URL || '/ncsys',
    baseURL: '/ncsys',
    timeout: 10000,
    withCredentials: true // 跨域携带cookie
})

export default request