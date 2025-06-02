<script setup>
import { ref } from 'vue'
const list_tableDesign = ref([])

const tableDesign = ref([])

//获取主列表
import { getTableDesignListService, getTableDesignService } from '@/api/Db.js'
const getTableDesign = async (tableName) => {
    let result = await getTableDesignService(tableName);

    tableDesign.value = result.data;
}

getTableDesign('s_table_design')

const getTableDesignList = async () => {
    let result = await getTableDesignListService();

    list_tableDesign.value = result.data;
    getTableDesign('s_table_design')
}

getTableDesignList()


</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>数据库管理</span>
                <div class="extra">
                    <el-button type="primary" @click="getTableDesignList">刷新</el-button>
                    <el-button type="primary" @click="visibleDrawer = true">新增表</el-button>
                </div>
            </div>
        </template>
        <el-table :data="list_tableDesign" style="width: 100%"  v-if="list_tableDesign.length">
            <el-table-column width="55px" label="序号" type="index"> </el-table-column>
            <el-table-column v-for="field in tableDesign" :label="field.columnComment" :key="field.columnName" :prop="field.columnName"></el-table-column>
            <!-- <el-table-column label="表类型" prop="userId"></el-table-column>
            <el-table-column label="表名" prop="loginCode"></el-table-column>
            <el-table-column label="注释" prop="loginPassword"> </el-table-column>
            <el-table-column label="用户名" prop="userName"></el-table-column>
            <el-table-column label="手机号" prop="phoneNum"></el-table-column>
            <el-table-column label="角色" prop="roleCode"></el-table-column>
            <el-table-column label="数据状态" prop="dataStatus"></el-table-column>
            <el-table-column label="创建用户" prop="createUser"></el-table-column>
            <el-table-column label="创建时间" prop="createTime"></el-table-column>
            <el-table-column label="最后更新用户" prop="updateUser"></el-table-column>
            <el-table-column label="最后更新时间" prop="updateTime"></el-table-column> -->
            <!-- <el-table-column label="操作" width="100">
                <template #default="{ row }">
                    {{ row.tableName }}
                    <el-button :icon="Edit" circle plain type="primary"></el-button>
                    <el-button :icon="Delete" circle plain type="danger"></el-button>
                </template>
            </el-table-column> -->
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>
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
</style>