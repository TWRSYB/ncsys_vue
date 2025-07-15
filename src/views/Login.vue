<script setup>
import { useLoginUserStore } from '@/stores/loginUser';

const formData_login = ref({
    loginCode: '',
    loginPassword: ''
});

const form_login = ref(null);

//定义表单校验规则
const rules = {
    loginCode: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 5, max: 16, message: '长度为5~16位非空字符', trigger: 'blur' }
    ],
    loginPassword: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 5, max: 16, message: '长度为5~16位非空字符', trigger: 'blur' }
    ]
}

const router = useRouter();

const login = () => {
    
    // 校验表单
    form_login.value.validate((valid, fields) => {
        if (!valid) {
            ElMessage.warning('请检查输入项');
            return false
        }
        // 调用接口,完成登录
        $Requests.post('/user/login', formData_login.value, { showSuccessMsg: true })
            .then(result => {
                // 将token存储到pinia中
                useLoginUserStore().setToken(result.data);
                // 跳转首页
                router.push('/')
            })
    })

}



</script>

<template>
    <el-row class="login-page">
        <el-col :span="12" class="bg"></el-col>
        <el-col :span="6" :offset="3" class="form">
            <!-- 登录表单 -->
            <el-form ref="form_login" size="large" autocomplete="off" :model="formData_login" :rules="rules">
                <el-form-item>
                    <h1>登录</h1>
                </el-form-item>
                <el-form-item prop="loginCode">
                    <el-input v-model="formData_login.loginCode" prefix-icon="User" placeholder="请输入账号" v-input-en-only></el-input>
                </el-form-item>
                <el-form-item prop="loginPassword">
                    <el-input v-model="formData_login.loginPassword" prefix-icon="Lock" type="password"
                        placeholder="请输入密码"></el-input>
                </el-form-item>
                <!-- 登录按钮 -->
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="login">登录</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<style lang="scss" scoped>
/* 样式 */
.login-page {
    height: 100vh;
    background-color: #fff;

    .bg {
        background: url('@/assets/login_bg.jpg') no-repeat center / cover;
        border-radius: 0 20px 20px 0;
    }

    .form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        user-select: none;

        .title {
            margin: 0 auto;
        }

        .button {
            width: 100%;
        }

        .flex {
            width: 100%;
            display: flex;
            justify-content: space-between;
        }
    }
}
</style>