<script setup>

import { useLoginUserStore } from '@/stores/loginUser';

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
const loginUserStore = useLoginUserStore()
// 折叠导航栏
const isCollapse = ref(false)

const ACT_logout = () => {
    $Requests.logout()
}





onMounted(() => {
    // 页面加载时获取选项
    INIT_getOPT();
});


// 系统设计菜单
const sysMenuItems = [
    { path: '/sys/UserManage', title: '用户列表', icon: 'SVG_User', allowedRoles: ['sysAdmin'] },
    { path: '/sys/DbDesign', title: '数据库设计', icon: 'SVG_DataDesign', allowedRoles: ['sysAdmin'] },
    { path: '/sys/SqlScript', title: 'SQL脚本', icon: 'SVG_SqlScript', allowedRoles: ['sysAdmin'] },
];

// 粮食买卖菜单
const grainMenuItems = [
    { path: '/Grain/CornCobPurchase', title: '玉米棒收购', icon: 'SVG_CornCob_1', allowedRoles: ['sysAdmin', 'manager', 'operator'] },
    { path: '/Grain/CornGrainPurchase', title: '玉米粒收购', icon: 'SVG_CornGrain_1', allowedRoles: ['sysAdmin', 'manager', 'operator'] },
    { path: '/Grain/CornXinPurchase', title: '玉米芯收购', icon: 'SVG_CornXin', allowedRoles: ['sysAdmin', 'manager', 'operator'] },
    { path: '/Grain/CornGrainSell', title: '玉米粒出售', icon: 'SVG_CornGrain_2', allowedRoles: ['sysAdmin', 'manager', 'operator'] },
    { path: '/Grain/CornXinSell', title: '玉米芯出售', icon: 'SVG_CornXin', allowedRoles: ['sysAdmin', 'manager', 'operator'] },
];

// 农资交易菜单
const nongziMenuItems = [
    { path: '/Nongzi/NongziStock', title: '农资进货', icon: 'SVG_NongziStock', allowedRoles: ['sysAdmin', 'manager', 'operator'] },
    { path: '/Nongzi/NongziSell', title: '农资销售', icon: 'SVG_NongziSell', allowedRoles: ['sysAdmin', 'manager', 'operator'] },
]

// 工人管理菜单
const workerMenuItems = [
    { path: '/Worker/WorkerAttendance', title: '出工记录', icon: 'SVG_Attendance', allowedRoles: ['sysAdmin', 'manager'] },
    { path: '/Worker/WageSettle', title: '工钱结算', icon: 'SVG_WageSettle', allowedRoles: ['sysAdmin', 'manager'] },
]

// 数据维护菜单
const dataMaintainMenuItems = [
    { path: '/Person/PersonInfo', title: '人员信息', icon: 'SVG_PersonInfo', allowedRoles: ['sysAdmin', 'manager'] },
    { path: '/Worker/WorkerInfo', title: '工人信息', icon: 'SVG_WorkerManage', allowedRoles: ['sysAdmin', 'manager'] },
]

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

                <el-sub-menu v-if="['sysAdmin'].includes(loginUserStore.loginUser.roleCode)" index="1">
                    <template #title>
                        <el-icon>
                            <Platform />
                        </el-icon>
                        <span>系统设计</span>
                    </template>
                    <template v-for="menu in sysMenuItems" :key="menu.path">
                        <el-menu-item :index="menu.path"
                            v-if="menu.allowedRoles.includes(loginUserStore.loginUser.roleCode)">
                            <el-icon>
                                <component :is="menu.icon" />
                            </el-icon>
                            <span>{{ menu.title }}</span>
                        </el-menu-item>
                    </template>
                </el-sub-menu>
                <el-sub-menu v-if="['sysAdmin', 'manager', 'operator'].includes(loginUserStore.loginUser.roleCode)"
                    index="2">
                    <template #title>
                        <el-icon>
                            <SVG_GrainTrade />
                        </el-icon>
                        <span>粮食买卖</span>
                    </template>
                    <template v-for="menu in grainMenuItems" :key="menu.path">
                        <el-menu-item :index="menu.path"
                            v-if="menu.allowedRoles.includes(loginUserStore.loginUser.roleCode)">
                            <el-icon>
                                <component :is="menu.icon" />
                            </el-icon>
                            <span>{{ menu.title }}</span>
                        </el-menu-item>
                    </template>
                </el-sub-menu>

                <el-sub-menu v-if="['sysAdmin', 'manager', 'operator'].includes(loginUserStore.loginUser.roleCode)"
                    index="3">
                    <template #title>
                        <el-icon>
                            <SVG_NongziTrade />
                        </el-icon>
                        <span>农资交易</span>
                    </template>
                    <template v-for="menu in nongziMenuItems" :key="menu.path">
                        <el-menu-item :index="menu.path"
                            v-if="menu.allowedRoles.includes(loginUserStore.loginUser.roleCode)">
                            <el-icon>
                                <component :is="menu.icon" />
                            </el-icon>
                            <span>{{ menu.title }}</span>
                        </el-menu-item>
                    </template>
                </el-sub-menu>
                <el-sub-menu v-if="['sysAdmin', 'manager', 'operator'].includes(loginUserStore.loginUser.roleCode)"
                    index="4">
                    <template #title>
                        <el-icon>
                            <SVG_Worker />
                        </el-icon>
                        <span>工人管理</span>
                    </template>
                    <template v-for="menu in workerMenuItems" :key="menu.path">
                        <el-menu-item :index="menu.path"
                            v-if="menu.allowedRoles.includes(loginUserStore.loginUser.roleCode)">
                            <el-icon>
                                <component :is="menu.icon" />
                            </el-icon>
                            <span>{{ menu.title }}</span>
                        </el-menu-item>
                    </template>
                </el-sub-menu>
                <el-menu-item v-if="['sysAdmin', 'manager', 'operator'].includes(loginUserStore.loginUser.roleCode)"
                    index="5" disabled>
                    <el-icon>
                        <SVG_Farm />
                    </el-icon>
                    <template #title>耕种</template>
                </el-menu-item>
                <el-sub-menu v-if="['sysAdmin', 'manager'].includes(loginUserStore.loginUser.roleCode)" index="6">
                    <template #title>
                        <el-icon>
                            <SVG_MainData />
                        </el-icon>
                        <span>信息维护</span>
                    </template>
                    <template v-for="menu in dataMaintainMenuItems" :key="menu.path">
                        <el-menu-item :index="menu.path"
                            v-if="menu.allowedRoles.includes(loginUserStore.loginUser.roleCode)">
                            <el-icon>
                                <component :is="menu.icon" />
                            </el-icon>
                            <span>{{ menu.title }}</span>
                        </el-menu-item>
                    </template>
                </el-sub-menu>

            </el-menu>
        </div>


        <!-- 右侧主区域 -->
        <el-container>
            <!-- 头部区域 -->
            <el-header class="left-header">
                <div>
                    {{ OPT_roleCode[loginUserStore.loginUser.roleCode] }}：
                    <strong>
                        {{ loginUserStore.loginUser.userName }}
                    </strong>
                </div>
                <el-dropdown placement="bottom-end">
                    <span class="el-dropdown__box">
                        <el-avatar :src="loginUserStore.loginUser.avatar" />
                        <el-icon>
                            <CaretBottom />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu class="user-dropdown">
                            <el-dropdown-item command="userInfo" icon="User" @click="router.push('/User/UserInfo')"
                                v-if="['sysAdmin', 'manager'].includes(loginUserStore.loginUser.roleCode)">
                                用户信息
                            </el-dropdown-item>
                            <el-dropdown-item command="logout" icon="SwitchButton" @click="ACT_logout">
                                退出登录
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-header>
            <!-- 中间区域 -->
            <el-main>
                <router-view></router-view>
            </el-main>
            <!-- 底部区域 -->
            <el-footer>
                <span style="font-family: 'Font_xinshu';font-size: 20px;">祁县东城</span>
                &nbsp;&nbsp;©2025 Created by 黑牛程序员
            </el-footer>
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

        // 文本不可选
        user-select: none;
        -webkit-user-select: none;
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

.left-header {
    user-select: none;
    -webkit-user-select: none;
}

.user-dropdown {
    user-select: none !important;
    -webkit-user-select: none !important;
}
</style>