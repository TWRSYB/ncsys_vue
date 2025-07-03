<script setup>
import avatar from '@/assets/default.png'
import { useTokenStore } from '@/stores/token';
import { useUserInfoStore } from '@/stores/userInfo';

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

const router = useRouter();
const userInfoStore = useUserInfoStore()
const tokenStore = useTokenStore()
// 折叠导航栏
const isCollapse = ref(false)
// const handleOpen = (key, keyPath) => {
//     console.log(key, keyPath)
// }
// const handleClose = (key, keyPath) => {
//     console.log(key, keyPath)
// }
const ACT_logout = () => {
    $Requests.logout()
}



const ASK_getUserInfo = async () => {
    // 获取用户信息
    $Requests.get('/user/getUserInfo')
        .then(res => {
            if (res.code === 200) {
                // 成功获取用户信息
                userInfoStore.setInfo(res.data);
            }
        })

}

onMounted(() => {
    // 页面加载时获取用户信息
    ASK_getUserInfo();
    // 页面加载时获取选项
    INIT_getOPT();
});


</script>

<template>
    <el-container class="layout-container">
        <!-- 左侧菜单 -->
        <div class="div_left">
            <div class="div_left_up">
                <div v-if="isCollapse">
                    <el-tooltip class="box-item" effect="light" content="展开导航栏" placement="right">
                        <el-button icon="ArrowRightBold" plain @click="isCollapse = false" />
                    </el-tooltip>
                </div>
                <div v-else>
                    <el-button icon="ArrowLeftBold" plain @click="isCollapse = true">收起导航栏</el-button>
                </div>
            </div>

            <el-menu :default-active="router.currentRoute.value.path" class="el-menu-vertical-demo"
                :collapse="isCollapse" router>


                <el-sub-menu index="1">
                    <template #title>
                        <el-icon>
                            <Platform />
                        </el-icon>
                        <span>系统设计</span>
                    </template>
                    <el-menu-item index="/sys/UserManage">
                        <el-icon>
                            <SVG_User />
                        </el-icon>
                        <span>用户列表</span>
                    </el-menu-item>
                    <el-menu-item index="/sys/DbDesign">
                        <el-icon>
                            <SVG_DataDesign />
                        </el-icon>
                        <span>数据库表设计</span>
                    </el-menu-item>
                    <!-- <el-menu-item-group title="功能分组1">
                        <template #title><span>系统设计</span></template>
                    </el-menu-item-group>
                    <el-menu-item-group title="功能分组2">
                        <el-menu-item index="1-3">item three</el-menu-item>
                    </el-menu-item-group>
                    <el-sub-menu index="1-4">
                        <template #title><span>item four</span></template>
                        <el-menu-item index="1-4-1">item one</el-menu-item>
                    </el-sub-menu> -->
                </el-sub-menu>

                <el-sub-menu index="2">
                    <template #title>
                        <el-icon>
                            <SVG_GrainTrade />
                        </el-icon>
                        <span>粮食买卖</span>
                    </template>
                    <el-menu-item index="/Grain/CornCobPurchase">
                        <el-icon>
                            <SVG_CornCob_1 />
                        </el-icon>
                        <span>玉米棒收购</span>
                    </el-menu-item>
                    <el-menu-item index="/Grain/CornGrainPurchase">
                        <el-icon>
                            <SVG_CornGrain_1 />
                        </el-icon>
                        <span>玉米粒收购</span>
                    </el-menu-item>
                    <el-menu-item index="/Grain/CornGrainSell">
                        <el-icon>
                            <SVG_CornGrain_2 />
                        </el-icon>
                        <span>玉米粒出售</span>
                    </el-menu-item>
                </el-sub-menu>
                <el-sub-menu index="3">
                    <template #title>
                        <el-icon>
                            <SVG_NongziTrade />
                        </el-icon>
                        <span>农资交易</span>
                    </template>
                    <el-menu-item index="/Nongzi/NongziStock">
                        <el-icon>
                            <SVG_NongziStock />
                        </el-icon>
                        <span>农资进货</span>
                    </el-menu-item>
                    <el-menu-item index="/Nongzi/NongziSell">
                        <el-icon>
                            <SVG_NongziSell />
                        </el-icon>
                        <span>农资销售</span>
                    </el-menu-item>
                </el-sub-menu>
                <el-menu-item index="/Worker/WorkerAttendance">
                    <el-icon>
                        <SVG_Attendance />
                    </el-icon>
                    <template #title>工人出工</template>
                </el-menu-item>
                <el-menu-item index="5" disabled>
                    <el-icon>
                        <SVG_Farm />
                    </el-icon>
                    <template #title>耕种</template>
                </el-menu-item>
                <el-sub-menu index="6">
                    <template #title>
                        <el-icon>
                            <SVG_MainData />
                        </el-icon>
                        <span>信息维护</span>
                    </template>
                    <el-menu-item index="/Person/PersonInfo">
                        <el-icon>
                            <SVG_PersonInfo />
                        </el-icon>
                        <template #title>人员信息</template>
                    </el-menu-item>
                    <el-menu-item index="/Person/WorkerInfo">
                        <el-icon>
                            <SVG_WorkerManage />
                        </el-icon>
                        <template #title>工人信息</template>
                    </el-menu-item>
                </el-sub-menu>

            </el-menu>
        </div>


        <!-- 右侧主区域 -->
        <el-container>
            <!-- 头部区域 -->
            <el-header>
                <div>{{ OPT_roleCode[userInfoStore.info.roleCode] }}：<strong>{{ userInfoStore.info.userName }}</strong>
                </div>
                <el-dropdown placement="bottom-end">
                    <span class="el-dropdown__box">
                        <el-avatar :src="avatar" />
                        <el-icon>
                            <CaretBottom />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="userInfo" icon="User"
                                @click="router.push('/User/UserInfo')">基本资料</el-dropdown-item>
                            <!-- <el-dropdown-item command="avatar" icon="Crop">更换头像</el-dropdown-item> -->
                            <el-dropdown-item command="changePassword" icon="Lock">修改密码</el-dropdown-item>
                            <el-dropdown-item command="logout" icon="SwitchButton"
                                @click="ACT_logout">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-header>
            <!-- 中间区域 -->
            <el-main>
                <router-view></router-view>
            </el-main>
            <!-- 底部区域 -->
            <el-footer><span style="font-family: 'Font_xinshu';font-size: 20px;">祁县东城</span>&nbsp;&nbsp;©2025 Created by
                黑牛程序员</el-footer>
        </el-container>
    </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
    height: 100vh;

    .div_left {
        display: flex;
        flex-direction: column;

        .div_left_up {
            background-color: #ffffff;
            height: 56px;
            align-items: center;
            display: flex;
            justify-content: center;
            border-right: 1px solid var(--el-menu-border-color);
        }

        .el-menu-vertical-demo {
            height: 100%;
        }
    }


    .el-header {
        background-color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .el-dropdown__box {
            display: flex;
            align-items: center;

            .el-icon {
                color: #999;
                margin-left: 10px;
            }

            &:active,
            &:focus {
                outline: none;
            }
        }
    }

    .el-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #666;
    }
}
</style>