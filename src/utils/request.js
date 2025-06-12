//定制请求的实例

//导入axios  npm install axios
import axios from 'axios';
import { ElMessage } from 'element-plus'
// 导入token状态
import { useTokenStore } from '@/stores/token';

import router from '@/router'; // 导入路由实例




//定义一个变量,记录公共的前缀  ,  baseURL
// const baseURL = 'http://localhost:8090/ncsys';
const baseURL = '/ncsys';
const instance = axios.create({ baseURL })
instance.withCredentials = true


//添加请求拦截器
instance.interceptors.request.use(
    config => {
        //获取token状态
        const tokenStore = useTokenStore();
        //判断token是否存在
        if (tokenStore.token) {
            //设置请求头
            config.headers['Authorization'] = tokenStore.token;
        }
        return config;
    },
    err => {
        ElMessage.error('请求异常')
        return Promise.reject(err);
    }
)



//添加响应拦截器
instance.interceptors.response.use(
    result => {
        //判断业务状态码
        if (result.data.code === 200) {
            return result.data;
        }

        //操作失败
        ElMessage.error(result.data.message || '服务异常')
        //异步操作的状态转换为失败
        return Promise.reject(result.data)
    },
    err => {
        console.log('err=', err);
        if (err.response.status === 401) {
            // 如果是401未授权错误，清除token并跳转到登录页
            const tokenStore = useTokenStore();
            tokenStore.removeToken();
            ElMessage.error('请先登录');
            router.push('/login');

        } else {
            ElMessage.error('服务异常')
        }

        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;