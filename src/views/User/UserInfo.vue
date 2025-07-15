<script setup>
import SVG_ChangeAccount from '@/components/svg/SVG_ChangeAccount.vue';
import SVG_ChangePassword from '@/components/svg/SVG_ChangePassword.vue';
import { useLoginUserStore } from '@/stores/loginUser';
import { ElMessage, ElMessageBox } from 'element-plus';
import { nextTick, ref } from 'vue';
const loginUserStore = useLoginUserStore()
const router = useRouter();

const OPT_roleCode = ref({}) // 角色选项
const INIT_getOPT = () => {
    // 获取选项
    $Requests.get('/tableDesignColumn/getOption', { params: { tableName: 'm_user', columnName: 'role_code' } })
        .then((response) => {
            if (response.code === 200) {
                OPT_roleCode.value = response.data;
            }
        })
}

const LIST_subAccount = ref([])

const INIT_getSubAccountList = () => { // 获取子账户列表
    $Requests.get('/user/getSubAccountList', { params: { userId: loginUserStore.loginUser.userId } })
        .then((response) => {
            if (response.code === 200) {
                LIST_subAccount.value = response.data;
            }
        })
}

onMounted(() => {
    // 页面加载时获取选项
    INIT_getOPT();
    // 页面加载时获取子账户列表
    INIT_getSubAccountList();
});

const SHOW_changePassword = ref(false);
const FD_changePassword = ref({});
const FORM_changePassword = ref(null);

const rules = {
    phoneNumber: [
        { required: true, message: '请输入手机号码', trigger: 'blur' },
        // 手机号格式校验
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],

    oldPwd: [
        { required: true, message: '请输入旧密码', trigger: 'blur' },
    ],
    newPwd: [
        { required: true, message: '请输入10~16位数字字母和指定符号', trigger: 'blur' },
        { min: 10, max: 16, message: '长度为10~16位', trigger: 'change' },
        // 必需同时包含数字,小写字母,大写字母和特殊符号
        { pattern: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*_-])[0-9a-zA-Z!@#$%^&*_-]+$/, message: '密码必须包含数字,小写字母,大写字母和特殊符号', trigger: 'blur' }
    ],
    confirmPwd: [
        { required: true, message: '请输入确认密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {

                if (value != FD_changePassword.value.newPwd) {
                    callback(new Error('两次密码不一致'))
                } else {
                    callback()
                }
            }, trigger: 'blur'
        },
    ],

};


const ACT_changePassword = (userInfo) => {
    SHOW_changePassword.value = true;
    nextTick(() => {
        FORM_changePassword.value.resetFields();
        FD_changePassword.value = $Com.deepClone(userInfo);
    })
}

const SBM_changePassword = () => {
    FORM_changePassword.value.validate(valid => {
        if (!valid) {
            ElMessage.warning('请检查输入项');
        }
        $Requests.post('/user/changePassword', FD_changePassword.value, { showSuccessMsg: true })
            .then((response) => {
                if (response.code === 200) {
                    SHOW_changePassword.value = false;
                }
            })
    })
}

const ACT_changeAccount = (userInfo) => {
    ElMessageBox.confirm(`确定要切换到账号 ${userInfo.loginCode} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        $Requests.post('/user/changeAccount', userInfo, { showSuccessMsg: true })
            .then((response) => {
                if (response.code === 200) {
                    // 将token存储到pinia中
                    useLoginUserStore().setToken(response.data);
                    // 跳转首页
                    router.push('/')
                }
            })
    })
}

const SHOW_changeAvatar = ref(false)
const UPLD_avatar = ref(null)
const changeAvatarUser = ref({})
const ACT_changeAvatar = (userInfo) => {
    SHOW_changeAvatar.value = true
    changeAvatarUser.value = $Com.deepClone(userInfo)
    nextTick(() => {
        // 清空数据
        UPLD_avatar.value.clearFiles()
        avatarBase64.value = '';
    })
}


const SBM_changeAvatar = () => {
    if (!avatarBase64.value) {
        ElMessage.warning('请选择图片')
        return
    }
    changeAvatarUser.value.avatar = avatarBase64.value
    $Requests.post('/user/updateAvatar', changeAvatarUser.value, { showSuccessMsg: true })
        .then((response) => {
            if (response.code === 200) {
                SHOW_changeAvatar.value = false
                // 刷新用户信息
                loginUserStore.refreshToken();
                // 刷新子账户列表
                INIT_getSubAccountList();
            }
        })
}





const avatarBase64 = ref('');

const handleFileChange = async (uploadFile) => {

    UPLD_avatar.value.clearFiles()
    avatarBase64.value = ''

    const file = uploadFile.raw;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        ElMessage.error('请选择图片文件');
        return;
    }

    // 验证文件大小
    if (file.size > 512000) {
        ElMessage.error('文件大小不能超过500KB');
        return;
    }

    // 验证图片比例
    const img = new Image();
    img.src = URL.createObjectURL(file);

    await new Promise((resolve) => {
        img.onload = () => {
            const ratio = img.width / img.height;
            if (ratio < 0.7 || ratio > 1.428) {
                ElMessage.error('图片宽高比需在10:7到7:10之间');
                return;
            }
            resolve();
        };
    });

    // 处理压缩
    let finalDataUrl = await compressImage(file, true);


    // 最终验证
    if (finalDataUrl.length > 102400) {
        ElMessage.error('图片处理后超过100KB，请选择更小的图片');
        return;
    }

    avatarBase64.value = finalDataUrl;




};

/**
 * 图片处理
 * @param file 图片文件
 * @param square 是否裁切为正方形
 */
const compressImage = (file, square) => new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    if (file.size > 81920 || square) {

        reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (square) {
                    // 新增裁切逻辑（强制正方形中间区域）
                    let cropWidth = img.width;
                    let cropHeight = img.height;
                    let offsetX = 0;
                    let offsetY = 0;

                    if (img.width > img.height) {
                        cropWidth = img.height;
                        offsetX = (img.width - cropWidth) / 2;
                    } else {
                        cropHeight = img.width;
                        offsetY = (img.height - cropHeight) / 2;
                    }

                    // 设置裁切后的画布尺寸为正方形
                    const squareSize = Math.min(img.width, img.height);
                    canvas.width = squareSize;
                    canvas.height = squareSize;

                    // 执行裁切并缩放
                    ctx.drawImage(img,
                        offsetX, offsetY, cropWidth, cropHeight,
                        0, 0, canvas.width, canvas.height
                    );
                } else {
                    // 保持原始比例设置画布尺寸
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                }



                // 动态质量调整（0.7为初始质量）
                let quality = 0.7;
                let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

                // 如果仍超过50KB，逐步降低质量
                while (compressedDataUrl.length > 51200 && quality > 0.2) {
                    quality -= 0.1;
                    compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                }

                resolve(compressedDataUrl);
            };
        };

    } else {
        reader.onload = (e) => resolve(e.target.result);
    }
    reader.readAsDataURL(file);

});


</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <div class="title">
                    <div> 用户信息 </div>
                </div>
            </div>
        </template>

        <el-card style="max-width: 600px; margin-bottom: 30px;">
            <template #header>
                <div class="header">
                    <div class="title">
                        <div> 主账号信息 </div>
                    </div>
                </div>
            </template>
            <div class="userInfoCard">
                <div class="userInfo">
                    <div class="userInfoItem">
                        <div class="userInfoItemName">用户名:</div>
                        <div class="userInfoItemValue">{{ loginUserStore.loginUser.userName }}</div>
                    </div>
                    <div class="userInfoItem">
                        <div class="userInfoItemName">账号:</div>
                        <div class="userInfoItemValue">{{ loginUserStore.loginUser.loginCode }}</div>
                    </div>
                    <div class="userInfoItem">
                        <div class="userInfoItemName">角色:</div>
                        <div class="userInfoItemValue">{{ OPT_roleCode[loginUserStore.loginUser.roleCode] }}</div>
                    </div>
                </div>
                <div class="avatar">
                    <!-- 头像 -->
                    <el-avatar :size="100" @click="ACT_changeAvatar(loginUserStore.loginUser)"
                        :src="loginUserStore.loginUser.avatar">
                    </el-avatar>
                </div>
                <div class="options">
                    <el-tooltip content="修改密码" placement="right" effect="light" :enterable="false">
                        <el-icon :size="30" color="#E6A23C" @click="ACT_changePassword(loginUserStore.loginUser)">
                            <SVG_ChangePassword />
                        </el-icon>
                    </el-tooltip>

                    <el-tooltip content="退出登录" placement="right" effect="light" :enterable="false">
                        <el-icon :size="30" color="#F56C6C" @click="$Requests.logout()">
                            <SwitchButton />
                        </el-icon>
                    </el-tooltip>
                </div>
            </div>
        </el-card>

        <el-card style="max-width: 600px" v-for="subUser in LIST_subAccount" :key="subUser.userId">
            <template #header>
                <div class="header">
                    <div class="title">
                        <div> 附属账号 </div>
                    </div>
                </div>
            </template>
            <div class="userInfoCard">
                <div class="userInfo">
                    <div class="userInfoItem">
                        <div class="userInfoItemName">用户名:</div>
                        <div class="userInfoItemValue">{{ subUser.userName }}</div>
                    </div>
                    <div class="userInfoItem">
                        <div class="userInfoItemName">账号:</div>
                        <div class="userInfoItemValue">{{ subUser.loginCode }}</div>
                    </div>
                    <div class="userInfoItem">
                        <div class="userInfoItemName">角色:</div>
                        <div class="userInfoItemValue">{{ OPT_roleCode[subUser.roleCode] }}</div>
                    </div>
                </div>
                <div class="avatar">
                    <!-- 头像 -->
                    <el-avatar :size="100" @click="ACT_changeAvatar(subUser)" :src="subUser.avatar">
                    </el-avatar>
                </div>
                <div class="options">
                    <el-tooltip content="修改密码" placement="right" effect="light" :enterable="false">
                        <el-icon :size="30" color="#E6A23C" @click="ACT_changePassword(subUser)">
                            <SVG_ChangePassword />
                        </el-icon>
                    </el-tooltip>
                    <el-tooltip content="切换至该账号" placement="right" effect="light" :enterable="false">
                        <el-icon :size="30" color="#409EFF" @click="ACT_changeAccount(subUser)">
                            <SVG_ChangeAccount />
                        </el-icon>
                    </el-tooltip>
                </div>
            </div>

        </el-card>




        <!-- 修改密码对话框 -->
        <el-dialog v-model="SHOW_changePassword" title="修改密码" width="500">
            <el-form ref="FORM_changePassword" :model="FD_changePassword" :rules="rules" label-width="80px">
                <el-form-item label="手机号码" prop="phoneNumber">
                    <el-input v-model="FD_changePassword.phoneNumber" placeholder="请输入手机号码" clearable></el-input>
                </el-form-item>
                <el-form-item label="原密码" prop="oldPwd">
                    <el-input v-model="FD_changePassword.oldPwd" placeholder="请输入原密码" show-password></el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="newPwd">
                    <el-input v-model="FD_changePassword.newPwd" placeholder="请输入新密码" show-password></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPwd">
                    <el-input v-model="FD_changePassword.confirmPwd" placeholder="请输入确认密码" show-password></el-input>
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="SHOW_changePassword = false">取 消</el-button>
                    <el-button type="primary" @click="SBM_changePassword">确 定</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 头像对话框 -->
        <el-dialog v-model="SHOW_changeAvatar" title="修改头像" width="300">

            <div class="avatar-container">
                <!-- 隐藏的上传组件 -->
                <el-upload ref="UPLD_avatar" action="#" :auto-upload="false" :on-change="handleFileChange"
                    accept="image/*">
                    <template #trigger>
                        <div class="preview-area">
                            <img v-if="avatarBase64" :src="avatarBase64" class="avatar-preview" />
                            <div v-else class="placeholder">请选择头像</div>
                        </div>
                    </template>
                </el-upload>
            </div>
            <template #footer>
                <div class="dialog-footer" style="text-align: center;">
                    <el-button @click="SHOW_changeAvatar = false">取 消</el-button>
                    <el-button type="primary" @click="SBM_changeAvatar">确 定</el-button>
                </div>
            </template>
        </el-dialog>



    </el-card>
</template>


<style lang="scss" scoped>
.userInfoCard {
    display: flex;
    justify-content: space-between;
    height: 100px;

    .userInfo {
        .userInfoItem {
            display: flex;
            align-items: center;
            font-size: 16px;

            height: 33px;
            line-height: 20px;
            color: #333;

            .userInfoItemName {
                margin-left: 10px;
                font-weight: 600;
                width: 75px;
            }

            .userInfoItemValue {
                margin-left: 10px;
            }
        }
    }

    .options {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        height: 100%;
    }
}

:deep().avatar-uploader {
    display: flex;
    align-items: center;
    justify-content: center;

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

.avatar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.preview-area {
    width: 200px;
    height: 200px;
    border: 2px dashed #dcdfe6;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.avatar-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.placeholder {
    color: #909399;
    font-size: 14px;
}
</style>