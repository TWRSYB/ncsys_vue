//导入request.js请求工具
import request from '@/utils/request.js'

//提供调用登录接口的函数
export const userLoginService = (loginData)=>{

    let result = request.post('/user/login',loginData)
    console.log(result);

    return result
}