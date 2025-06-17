//定义store
import { defineStore } from 'pinia'
/* 
    第一个参数:名字,唯一性
    第二个参数:函数,函数的内部可以定义状态的所有内容

    返回值: 函数
*/
export const useTokenStore = defineStore('token', () => {
    //定义状态的内容

    //1.响应式变量
    const token = ref('')
    const expires = ref(0)
    const refreshing = ref(false) // 是否正在刷新token
    let Timer_expire = null // 定义一个变量来存储定时器


    //2.定义一个函数,修改token的值
    const setToken = (newToken, expiresIn = 50 ) => {
        token.value = newToken
        expires.value = Date.now() + expiresIn * 60 * 1000;
        refreshing.value = false; // 重置刷新标志

        // 清除旧定时器
        if (Timer_expire) clearTimeout(Timer_expire);

        // 设置新定时器
        Timer_expire = setTimeout(() => {
            $Requests.logout()
        }, expiresIn * 60 * 1000); // 在expiresIn秒后执行

    }

    //3.函数,移除token的值
    const removeToken = () => {
        token.value = ''
    }

    //4.函数,检查是否需要刷新token
    const needRefresh = () => {
        return token.value && (expires.value - Date.now()) < 20 * 60 * 1000
    }

    //5.函数,检查token是否需要刷新
    const checkToken = () => {
        
        if (needRefresh() && !refreshing.value) {
            refreshing.value = true;
            $Requests.get('/user/refreshToken')
                .then(response => {
                    setToken(response.data);
                })
        } 
    }

    return {
        token, refreshing, setToken, removeToken, checkToken
    }
}, {
    persist: true//持久化存储
});