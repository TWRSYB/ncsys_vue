<script setup>
import {
    Management,
    Promotion,
    UserFilled,
    User,
    Crop,
    EditPen,
    SwitchButton,
    CaretBottom
} from '@element-plus/icons-vue'
import avatar from '@/assets/default.png'

import { ref } from 'vue'
import {
    Document,
    Menu as IconMenu,
    Location,
    Setting,
    ArrowRightBold,
    ArrowLeftBold,
} from '@element-plus/icons-vue'

// 折叠导航栏
const isCollapse = ref(false)
// const handleOpen = (key, keyPath) => {
//     console.log(key, keyPath)
// }
// const handleClose = (key, keyPath) => {
//     console.log(key, keyPath)
// }

</script>

<template>
    <el-container class="layout-container">
        <!-- 左侧菜单 -->
        <div class="div_left">
            <div class="div_left_up">
                <div v-if="isCollapse">
                    <el-tooltip class="box-item" effect="light" content="展开导航栏" placement="right">
                        <el-button :icon="ArrowRightBold" plain @click="isCollapse = false" />
                    </el-tooltip>
                </div>
                <div v-else>
                    <el-button :icon="ArrowLeftBold" plain @click="isCollapse = true">收起导航栏</el-button>
                </div>
            </div>

            <el-menu default-active="2" class="el-menu-vertical-demo" :collapse="isCollapse" router>

                <el-sub-menu index="1">
                    <template #title>
                        <el-icon>
                            <Platform />
                        </el-icon>
                        <span>系统设计</span>
                    </template>
                    <el-menu-item index="/sys/UserManage">用户管理</el-menu-item>
                    <el-menu-item index="/sys/DbDesign">数据库设计</el-menu-item>
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

                <el-menu-item index="2">
                    <el-icon><icon-menu /></el-icon>
                    <template #title>Navigator Two</template>
                </el-menu-item>


                <el-menu-item index="3" disabled>
                    <el-icon>
                        <document />
                    </el-icon>
                    <template #title>Navigator Three</template>
                </el-menu-item>
                <el-menu-item index="4">
                    <el-icon>
                        <setting />
                    </el-icon>
                    <template #title>Navigator Four</template>
                </el-menu-item>
            </el-menu>
        </div>


        <!-- 右侧主区域 -->
        <el-container>
            <!-- 头部区域 -->
            <el-header>
                <div>黑马程序员：<strong>东哥</strong></div>
                <el-dropdown placement="bottom-end">
                    <span class="el-dropdown__box">
                        <el-avatar :src="avatar" />
                        <el-icon>
                            <CaretBottom />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="profile" :icon="User">基本资料</el-dropdown-item>
                            <el-dropdown-item command="avatar" :icon="Crop">更换头像</el-dropdown-item>
                            <el-dropdown-item command="password" :icon="EditPen">重置密码</el-dropdown-item>
                            <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-header>
            <!-- 中间区域 -->
            <el-main>
                <router-view></router-view>
            </el-main>
            <!-- 底部区域 -->
            <el-footer>大事件 ©2023 Created by 黑马程序员</el-footer>
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