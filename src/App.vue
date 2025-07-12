<script setup>
// import LoginVue from "@/views/Login.vue"
// import LayoutVue from "@/views/Layout.vue"
</script>

<template>
    <!-- <LoginVue/> -->
    <!-- <LayoutVue/> -->
    <router-view></router-view>
</template>

<style lang="scss" scoped>
:deep(.el-divider--horizontal) {
    border-top: 2px var(--el-border-color) var(--el-border-style);
    margin: 35px 0;

    .el-divider__text {
        font-size: 20px;
        transform: translateY(-50%);
        font-weight: bold;
        color: #7c7f86;
    }
}

:deep(.search-form) {
    .el-form-item {
        width: 22%;
    }

    .search-btn {
        float: right;

        .el-form-item__content {
            justify-content: flex-end;
        }
    }
}

:deep(.el-form-item.is-error) {
    .el-checkbox-group {
        border: 1px solid red;
        border-radius: 4px;
    }

    .el-radio-group {
        border: 1px solid red;
        border-radius: 4px;
    }

}

/* 穿透 scoped 作用域，直接修改子组件样式 */
:deep(.el-table) {
    .el-form-item__content {
        margin-left: 0 !important;
        justify-content: center;
    }

    .el-form-item {
        display: flex;
        --font-size: 14px;
        margin-bottom: 0;
    }

    .el-checkbox-button.is-disabled.is-checked .el-checkbox-button__inner {
        // background-color: var(--el-checkbox-button-checked-bg-color);
        // background-color: hsl(0, 59%, 45%);
        background-color: hsl(207, 100%, 80%);
        background-image: none;
        border-color: var(--el-button-disabled-border-color, var(--el-border-color-light));
        box-shadow: none;
        color: hsl(222, 6%, 100%);
        cursor: not-allowed;
    }
}

:deep(.page-container) {
    min-height: 100%;
    box-sizing: border-box;
    position: relative;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .title {
            display: flex;
            align-items: center;

            .field-filter-icon {
                margin-left: 10px;
                color: var(--el-text-color-secondary);
                cursor: pointer;
            }
        }
    }

    .field-filter {

        // position: absolute;
        z-index: 1000;

        right: 20px;
        left: 20px;


        padding: 10px;
        background-color: var(--el-bg-color);
        border-radius: 4px;
        box-shadow: var(--el-box-shadow-light);
        margin-bottom: 20px;


        .el-checkbox-group {

            .el-checkbox-button {
                margin: 2px;
                .el-checkbox-button__inner {
                    border-bottom-left-radius: var(--el-border-radius-base);
                    border-left: var(--el-border);
                    border-top-left-radius: var(--el-border-radius-base);
                    box-shadow: none !important;
                    border-bottom-right-radius: var(--el-border-radius-base);
                    border-top-right-radius: var(--el-border-radius-base);
                }

            }
        }
    }
}
</style>
