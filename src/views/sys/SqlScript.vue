<script setup>

import { useLoginUserStore } from '@/stores/loginUser'
const loginUserStore = useLoginUserStore()

const BIZ_name = 'SQL脚本'


const TDS_TableDesignSql = ref([])



const OPT_sqlType = computed(() => {
    try {
        return TDS_TableDesignSql.value.filter(item => item.columnName === 'sqlType')[0].lvs
    } catch (error) {
        return {}
    }
});

onMounted(() => {
    // 页面加载时获取表设计
    $TDS.setTableDesign(TDS_TableDesignSql, 's_table_design_sql');
    // 获取表设计列表
    ACT_pageQuery();
})

const DEALED_TDS_TableDesignSql = computed(() => {
    // 插入补充字段
    const newTDS = TDS_TableDesignSql.value.concat([
        {
            columnName: 'tableName',
            columnComment: '表名',
            type: 'text'
        },
        {
            columnName: 'tableComment',
            columnComment: '表描述',
        }
    ])

    // 字段排序
    const orderedFields = ['tableId', 'tableName', 'tableComment', 'sqlType', 'createTime', 'executeOrder',
        'executeSql', 'lastCreateSql',
        'dataStatus', 'createUser', 'updateUser', 'updateTime']
    // 根据用户角色过滤禁用字段
    let disabledFields = orderedFields
    // 允许的字段
    let allowedFields = []
    if (loginUserStore.loginUser.roleCode == 'sysAdmin') { // 系统管理员
        disabledFields = []
    }
    allowedFields = orderedFields.filter(item => !new Set(disabledFields).has(item))
    // 按照顺序过滤表设计
    return newTDS.filter(field => allowedFields.includes(field.columnName))
        .sort((a, b) => {
            return allowedFields.indexOf(a.columnName) - allowedFields.indexOf(b.columnName)
        })
})


const SHOW_fieldFilter = ref(false) // 控制字段过滤器显示状态
const FLD_field = ref(['tableName', 'sqlType', 'createTime', 'executeSql'])

// 过滤表设计
const FLDTDS_TableDesignSql = computed(() => {
    return DEALED_TDS_TableDesignSql.value.filter(field => FLD_field.value.includes(field.columnName))
})

const ACT_pageQuery = () => {

    // 获取表设计列表
    $Requests.post('/tableDesignSql/pageQuery', QUERY_Main.value)

        .then((response) => {
            if (response.code === 200) {
                TD_List.value = response.list;
                QUERY_Main.value.total = response.total;
            }
        })
}


const FORM_Search = ref(null)

// 列表
const TD_List = ref([])
const QUERY_Main = ref({
    query: {
    },
    params: {
        tableLike: '',
        tableType: '',
        dataStatus: '',
    },
    pageNum: 1,
    pageSize: 10,
    sortField: '',
    sortOrder: '',
    total: 0
})





//控制抽屉是否显示
const SHOW_Drawer = ref(false)
const title_Drawer = ref(`${BIZ_name}详情`)

const FD_tableDesignSql = ref({})

const init_FD_tableDesignSql = () => {
    FD_tableDesignSql.value = {}
}

const ACT_showDetail = (row) => {
    SHOW_Drawer.value = true
    title_Drawer.value = `${BIZ_name}详情`
    init_FD_tableDesignSql()
    FD_tableDesignSql.value = row
}



// 核心复制逻辑
const ACT_copySql = async (sql) => {
    // 现代浏览器方案（优先使用）
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(sql);
        ElMessage.success('SQL已复制到剪贴板');
    }
};


const get_width = (columnName) => {
    switch (columnName) {
        case 'tableName':
            return 260;
        case 'tableComment':
            return 180;
        case 'executeSql':
            return 500;
        case 'createTime':
            return 120;
        default:
            return '';
    }
}




</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <div class="title">
                    <div> {{ BIZ_name }} </div>
                    <el-icon class="field-filter-icon" @click.stop="SHOW_fieldFilter = !SHOW_fieldFilter"
                        v-if="['sysAdmin', 'manager'].includes(loginUserStore.loginUser.roleCode)">
                        <SVG_Table />
                    </el-icon>
                </div>
                <div class="extra">
                    <el-button type="primary" @click="ACT_pageQuery">刷新</el-button>
                </div>
            </div>
            <div class="field-filter" v-if="SHOW_fieldFilter" v-click-outside="() => SHOW_fieldFilter = false">
                <el-checkbox-group v-model="FLD_field" style="display: flex; flex-wrap: wrap;">
                    <el-checkbox-button v-for="(field, index) in DEALED_TDS_TableDesignSql" :key="index"
                        :value="field.columnName">
                        {{ field.columnComment }}
                    </el-checkbox-button>
                </el-checkbox-group>
            </div>
        </template>
        <!-- show-overflow-tooltip -->

        <!-- 搜索表单 -->
        <el-form inline ref="FORM_Search" :model="QUERY_Main.params" label-width="100px" class="search-form">

            <el-form-item label="表名" prop="tableLike">
                <el-input v-model="QUERY_Main.params.tableLike" placeholder="请输入关键字"></el-input>
            </el-form-item>

            <el-form-item label="脚本类型" prop="sqlType">
                <el-select placeholder="请选择" v-model="QUERY_Main.params.sqlType" clearable>
                    <el-option v-for="(value, key) in OPT_sqlType" :key="key" :label="value" :value="key"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item class="search-btn">
                <el-button type="primary" @click="ACT_pageQuery">搜索</el-button>
                <el-button @click="FORM_Search.resetFields()">重置</el-button>
            </el-form-item>
        </el-form>

        <el-table :data="TD_List" border style="width: 100%">
            <el-table-column width="55px" label="序号" type="index" align="center"></el-table-column>

            <el-table-column v-for="field in FLDTDS_TableDesignSql" :key="field.columnName" :label="field.columnComment"
                :prop="field.columnName" header-align="center" :width="get_width(field.columnName)"
                show-overflow-tooltip>
                <template #default="{ row }" v-if="field.type == 'lv'">
                    {{ field.lvs[row[field.columnName]] }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center" fixed="right">
                <template #default="{ row }">
                    <el-icon style="margin: 0 3px;" @click="ACT_showDetail(row)">
                        <Tickets />
                    </el-icon>
                    <el-icon color="#409eff" style="margin: 0 3px;" @click="ACT_copySql(row.executeSql)">
                        <DocumentCopy />
                    </el-icon>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>

        <!-- 分页条 -->
        <el-pagination v-model:current-page="QUERY_Main.pageNum" v-model:page-size="QUERY_Main.pageSize"
            :total="QUERY_Main.total" :page-sizes="[10, 20, 50, 100]" @change="ACT_pageQuery"
            layout="jumper, total, sizes, prev, pager, next" />

    </el-card>

    <!-- 抽屉 -->
    <el-drawer v-model="SHOW_Drawer" :title="title_Drawer" direction="rtl" size="90%">


        <div class="biaoge">
            <div class="biaoge-header">
                <div class="biaoge-title"> {{ BIZ_name }}模板</div>
            </div>
            <div class="biaoge-contain">
                <div class="biaoge-row">
                    <div class="biaoge-item">
                        <div class="label">tableId</div>
                        <div class="default">{{ FD_tableDesignSql.tableId }}</div>
                    </div>
                    <div class="biaoge-item">
                        <div class="label">tableName</div>
                        <div class="default">{{ FD_tableDesignSql.tableName }}</div>
                    </div>
                    <div class="biaoge-item">
                        <div class="label">tableComment</div>
                        <div class="default">{{ FD_tableDesignSql.tableComment }}</div>
                    </div>
                </div>
                <div class="biaoge-row">
                    <div class="biaoge-item">
                        <div class="label">sqlType</div>
                        <div class="default">
                            <el-radio-group v-model="FD_tableDesignSql.sqlType">
                                <el-radio-button v-for="(value, key) in OPT_sqlType" :key="key" :label="value"
                                    :value="key"></el-radio-button>
                            </el-radio-group>
                        </div>
                    </div>
                </div>
                <div class="biaoge-row">
                    <div class="biaoge-item">
                        <div class="label">createTime</div>
                        <div class="default">{{ FD_tableDesignSql.createTime }}</div>
                    </div>

                    <div class="biaoge-item">
                        <div class="label">createUser</div>
                        <div class="default">{{ FD_tableDesignSql.createUser }}</div>
                    </div>
                    <div class="biaoge-item">
                        <div class="label">executeOrder</div>
                        <div class="default">{{ FD_tableDesignSql.executeOrder }}</div>
                    </div>

                </div>
                <div class="biaoge-row">
                    <div class="biaoge-item">
                        <div class="label">updateTime</div>
                        <div class="default">{{ FD_tableDesignSql.updateTime }}</div>
                    </div>
                    <div class="biaoge-item">
                        <div class="label">updateUser</div>
                        <div class="default">{{ FD_tableDesignSql.updateUser }}</div>
                    </div>
                    <div class="biaoge-item">
                        <div class="label">dataStatus</div>
                        <div class="default">{{ FD_tableDesignSql.dataStatus }}</div>
                    </div>

                </div>


                <el-divider content-position="left" style="margin-top: 70px;">
                    执行SQL
                    <el-icon color="#409eff" style="margin: 0 3px;" @click="ACT_copySql(FD_tableDesignSql.executeSql)">
                        <DocumentCopy />
                    </el-icon>
                </el-divider>
                <pre v-highlight="FD_tableDesignSql.executeSql" class="sql-display"></pre>

                <el-divider content-position="left" style="margin-top: 70px;">
                    最新建表SQL
                    <el-icon color="#409eff" style="margin: 0 3px;"
                        @click="ACT_copySql(FD_tableDesignSql.lastCreateSql)">
                        <DocumentCopy />
                    </el-icon>
                </el-divider>
                <pre v-highlight="FD_tableDesignSql.lastCreateSql" class="sql-display"></pre>

            </div>
        </div>

        <template #footer>
            <div style="flex: auto">
                <el-button type="primary" @click="SHOW_Drawer = false">关闭</el-button>
            </div>
        </template>
    </el-drawer>

    <el-dialog v-model="DLG_lastSql" title="最新建表SQL" width="1200">
        <pre v-highlight="FD_mixedTableDesign.last_tableDesignSql.lastCreateSql" class="sql-display"></pre>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="DLG_lastSql = false">关闭</el-button>
                <el-button type="primary" @click="handleCopy">
                    复制
                </el-button>
            </div>
        </template>
    </el-dialog>


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


.el-form-item.is-error .el-checkbox-group {
    border: 1px solid red;
    border-radius: 4px;
}

.sql-display {
    font-family: 'Fira Code', monospace;
    padding: 15px;
    border-radius: 5px;
    background-color: #f8f8f8;
    white-space: pre-wrap;
    overflow-x: auto;
}
</style>