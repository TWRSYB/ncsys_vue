<script setup>

import { useUserInfoStore } from '@/stores/userInfo';
const userInfoStore = useUserInfoStore()



const TDS_User = ref([])
const INIT_getTableDesign = () => {
    // 获取表设计
    $Requests.get('/tableDesign/getTableDesign', { params: { tableName: 'm_user' } })
        .then((response) => {
            if (response.code === 200) {
                TDS_User.value = response.data;
            }
        })

}

onMounted(() => {
    // 页面加载时获取表设计
    INIT_getTableDesign();
    // 获取用户列表
    ACT_getUserList()
})

const OPT_roleCode = computed(() => {
    try {
        return TDS_User.value.filter(item => item.columnName === 'roleCode')[0].lvs
    } catch (error) {
        return {}
    }
});

// 过滤表设计
const FLDTDS_User = computed(() => {
    if (userInfoStore.info.roleCode == 'sysAdmin') {
        // 如果不是管理员,则过滤掉敏感字段
        return TDS_User.value.filter(field => !['loginPassword', 'createUser', 'createTime', 'updateUser', 'updateTime'].includes(field.columnName))
    }
    if (userInfoStore.info.roleCode == 'manager') {
        // 如果是普通用户,则过滤掉敏感字段
        return TDS_User.value.filter(field => !['userId', 'loginPassword', 'phoneNum', 'createUser', 'createTime', 'updateUser', 'updateTime'].includes(field.columnName))
    }
    return []
})


//文章列表数据模型
const TD_userList = ref([])



const ACT_getUserList = () => {

    $Requests.get('/sys/getUserList')
        .then(result => {
            if (result.code === 200) {
                // 成功获取用户列表
                TD_userList.value = result.data;
            }
        })

}


//控制抽屉是否显示
const SHOW_addUser = ref(false)
const FORM_user = ref(null)
const ACT_SHOW_addUser = () => {

    // 显示抽屉
    SHOW_addUser.value = true;
    nextTick(() => {
        // 重置表单数据
        FORM_user.value.resetFields();
    })
}
//添加表单数据模型
const FD_user = ref({
    loginCode: '',
    loginPassword: '',
    userName: '',
    phoneNum: '',
    roleCode: ''
})


//定义表单校验规则
const rules = {
    loginCode: [
        { required: true, message: '请输入登录码, 8-10位数字字母组成', trigger: 'blur' },
        { min: 8, max: 10, message: '长度为8~10位', trigger: 'change' },
        // 必需同时包含数字和字母
        { pattern: /^(?=.*[0-9])(?=.*[a-zA-Z])[0-9a-zA-Z]+$/, message: '登录码必须包含数字和字母', trigger: 'blur' }
    ],
    loginPassword: [
        { required: true, message: '请输入初始密码, 10~16位数字字母和指定符号', trigger: 'blur' },
        { min: 10, max: 16, message: '长度为10~16位', trigger: 'change' },
        // 必需同时包含数字,小写字母,大写字母和特殊符号
        { pattern: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*_-])[0-9a-zA-Z!@#$%^&*_-]+$/, message: '初始密码必须包含数字,小写字母,大写字母和特殊符号', trigger: 'blur' }
    ],
    userName: [
        { required: true, message: '请输入用户名', trigger: 'change' },
        { min: 2, max: 10, message: '长度为2~10位', trigger: 'change' },
        // 用户名不能包含空格
        { pattern: /^[^\s]*$/, message: '用户名不能包含空格', trigger: 'change' }
    ],
    phoneNum: [
        { required: true, message: '请输入手机号', trigger: 'change' },
        // 手机号格式校验
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    roleCode: [
        { required: true, message: '请选择角色', trigger: 'change' }
    ]
}


const SBM_addUser = () => {
    // 提交新增用户前先校验表单
    FORM_user.value.validate((valid, fields) => {
        if (!valid) {
            // 表单校验不通过
            ElMessage.warning('请检查输入项');
            return false;
        }
        // 提交新增用户
        $Requests.post('/sys/addUser', FD_user.value, { showSuccessMsg: true })
            .then(result => {
                if (result.code === 200) {
                    // 成功新增用户
                    SHOW_addUser.value = false;
                    ACT_getUserList(); // 刷新用户列表
                }
            })
    });

}

const showPassword = ref(false)





</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>用户列表</span>
                <div class="extra">
                    <el-button type="primary" @click="ACT_getUserList">刷新</el-button>
                    <el-button type="primary" @click="ACT_SHOW_addUser" v-if="userInfoStore.info.roleCode=='sysAdmin'">新增用户</el-button>
                </div>
            </div>
            
        </template>

        <!-- 用户列表 -->
        <el-table :data="TD_userList" style="width: 100%">
            <el-table-column v-for="field in FLDTDS_User" :key="field.columnName" :label="field.columnComment"
                :prop="field.columnName">
                <template #default="{ row }" v-if="field.type == 'lv'">
                    {{ field.lvs[row[field.columnName]] }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100" v-if="userInfoStore.info.roleCode=='sysAdmin'">
                <template #default="{ row }">
                    <el-button icon="Edit" circle plain type="primary"></el-button>
                    <el-button icon="Delete" circle plain type="danger"></el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>
        {{ TDS_User }}
        <br />
        {{ OPT_roleCode }}
        <!-- 分页条 -->
        <!-- <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[3, 5, 10, 15]"
            layout="jumper, total, sizes, prev, pager, next" background :total="total" @size-change="onSizeChange"
            @current-change="onCurrentChange" style="margin-top: 20px; justify-content: flex-end" /> -->

        <!-- 新增用户 -->
        <el-drawer v-model="SHOW_addUser" title="新增用户" direction="rtl" size="50%">
            <!-- 新增用户表单 -->
            <el-form ref="FORM_user" :model="FD_user" label-width="100px" :rules="rules">
                <el-form-item label="登录码" prop="loginCode">
                    <el-input v-model="FD_user.loginCode" placeholder="登录码"
                        v-input-filter="{ regex: /[^0-9a-zA-Z]/g, maxLength: 10 }" v-input-en-only></el-input>
                </el-form-item>
                <el-form-item label="初始密码" prop="loginPassword">
                    <el-input v-model="FD_user.loginPassword" placeholder="初始密码"
                        v-input-filter="{ regex: /[^0-9a-zA-Z!@#$%^&*_-]/g, maxLength: 16 }"
                        :type="showPassword ? 'text' : 'password'">
                        <template #suffix>
                            <el-icon @click="showPassword = !showPassword">
                                <View v-if="showPassword" />
                                <Hide v-else />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="用户名" prop="userName">
                    <el-input v-model="FD_user.userName" placeholder="用户名"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phoneNum">
                    <el-input v-model="FD_user.phoneNum" placeholder="手机号"></el-input>
                </el-form-item>
                <el-form-item label="角色" prop="roleCode">
                    <el-radio-group placeholder="请选择" v-model="FD_user.roleCode">
                        <el-radio-button v-for="(value, key, index) in OPT_roleCode" :value="key" :key="key">
                            {{ value }}
                        </el-radio-button>
                    </el-radio-group>
                </el-form-item>
            </el-form>

            <template #footer>
                <div style="flex: auto">
                    <el-button type="primary" @click="SBM_addUser('已发布')">新增</el-button>
                </div>
            </template>
            {{ FD_user }}
        </el-drawer>
    </el-card>
</template>
<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}

/* 抽屉样式 */
.avatar-uploader {
    :deep() {
        .avatar {
            width: 178px;
            height: 178px;
            display: block;
        }

        .el-upload {
            border: 1px dashed var(--el-border-color);
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);
        }

        .el-upload:hover {
            border-color: var(--el-color-primary);
        }

        .el-icon.avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 178px;
            height: 178px;
            text-align: center;
        }
    }
}

.editor {
    width: 100%;

    :deep(.ql-editor) {
        min-height: 200px;
    }
}
</style>