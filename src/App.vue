<script setup>
// import LoginVue from "@/views/Login.vue"
// import LayoutVue from "@/views/Layout.vue"
</script>

<template>
    <!-- <LoginVue/> -->
    <!-- <LayoutVue/> -->
    <router-view></router-view>
</template>

<style lang="scss">
.el-divider--horizontal {
    border-top: 2px var(--el-border-color) var(--el-border-style);
    margin: 35px 0;

    .el-divider__text {
        font-size: 20px;
        transform: translateY(-50%);
        font-weight: bold;
        color: #7c7f86;
    }
}

.search-form {
    .el-form-item {
        width: 270px;
    }

    .search-btn {
        float: right;
        width: 250px;

        .el-form-item__content {
            justify-content: flex-end;
        }
    }
}

.el-form-item.is-error {
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
.el-table {
    .el-form-item__content {
        margin-left: 0 !important;
        justify-content: center;
    }

    .el-form-item {
        display: flex;
        --font-size: 14px;
        margin-bottom: 0;
    }


}

.el-radio-button__original-radio:disabled:checked+.el-radio-button__inner {
    // background-color: var(--el-checkbox-button-checked-bg-color);
    // background-color: hsl(0, 59%, 45%);
    background-color: hsl(207, 100%, 80%);
    background-image: none;
    border-color: var(--el-button-disabled-border-color, var(--el-border-color-light));
    box-shadow: none;
    color: hsl(222, 6%, 100%);
    cursor: not-allowed;
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

.page-container {
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

        position: absolute;
        z-index: 1000;

        right: 20px;
        left: 20px;


        padding: 10px;
        background-color: var(--el-bg-color);
        border-radius: 4px;
        box-shadow: var(--el-box-shadow-light);
        margin: 10px 20px 20px;


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



.el-pagination {
    margin-top: 20px;
    justify-content: flex-end
}



.print-paper {
    width: 200mm;
    height: 287mm;
    padding: 4mm;
    box-sizing: border-box;
    margin: 0 auto;
    background: white;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);

    .biaoge {
        .biaoge-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;

            .biaoge-title {
                font-size: 16px;
                font-weight: bold;
                color: #303133;
            }
        }

        .biaoge-contain {

            .biaoge-row {
                display: flex;
                width: 100%;
                height: 10mm;
                align-items: center;
                justify-content: space-between;
                border: 1px solid #ebeef5;
                margin-bottom: -1px;
                /* 添加负外边距使边框重叠 */



                .biaoge-item {
                    flex-grow: 1;
                    display: flex;
                    height: 100%;
                    align-items: center;
                    border: 1px solid #ebeef5;
                    margin: 0 -1px;
                    /* 添加负外边距使边框重叠 */

                    .label {
                        min-width: 10mm;
                        height: 100%;
                        font-weight: bold;
                        background-color: #f5f7fa !important;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 1mm 1.5mm;
                        box-sizing: border-box;
                        /* 添加此行 */
                    }

                    .default {
                        flex-grow: 1;
                        min-width: 20mm;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                }
            }


        }
    }

    .weigh-table {
        width: 100%;
        margin-top: 20px;

        .weigh-header {
            font-weight: bold;
            background-color: #f5f7fa;
        }

        .table-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 10mm;
            border-bottom: 1px solid #ebeef5;

            &:last-child {
                border-bottom: none;
            }

            .table-cell {
                flex-grow: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 1mm 1.5mm;
                box-sizing: border-box;
                height: 100%;
                border-left: 1px solid #ebeef5;

                &:first-child {
                    border-left: none;
                }

                width: 10mm;
                /* 设置每个单元格的宽度 */
            }
        }
    }
}

.print-paper.landscape {
    width: 287mm !important;
    height: 200mm !important;
}
</style>
