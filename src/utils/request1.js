// src/utils/request.js
import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus' // 按需引入你的UI库提示组件

class Request {
  constructor(config) {
    // 创建axios实例
    this.instance = axios.create(config)
    this.pendingRequests = new Set() // 存储请求标识

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加token到headers（示例）
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
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
          if (response.config.showErrorToast !== false) {
            ElMessage.error(response.data.message || '请求失败')
          }
          return Promise.reject(new Error(response.data.message || 'Error'))
        }
        return response.data
      },
      (error) => {
        // 取消重复请求处理
        if (axios.isCancel(error)) {
          console.log('重复请求已取消:', error.message)
          return Promise.reject(error)
        }

        // console.log(error);
        

        // 统一错误处理
        const message = error.response?.data?.message || '网络异常'
        if (error.config.showErrorToast !== false) {
          ElMessage.error(message)
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