<script setup>

import SVG_WageList from '@/components/svg/SVG_WageList.vue'
import SVG_WageSettle from '@/components/svg/SVG_WageSettle.vue'
import { useLoginUserStore } from '@/stores/loginUser'
const loginUserStore = useLoginUserStore()



const TDS_Worker = ref([])

const DEALED_TDS_Worker = computed(() => {
    // 插入补充字段
    const newTDS = TDS_Worker.value.concat([
        {
            columnName: 'personName',
            columnComment: '姓名',
            type: 'text'
        },
        {
            columnName: 'phoneNum',
            columnComment: '手机号码',
            type: 'text'
        },
        {
            columnName: 'idNum',
            columnComment: '身份证号',
            type: 'text'
        },
        {
            columnName: 'totalDays',
            columnComment: '累计天数',
            type: 'text'
        },
        {
            columnName: 'totalPay',
            columnComment: '累计工资',
            type: 'text'
        },
        {
            columnName: 'settleDays',
            columnComment: '已结天数',
            type: 'text'
        },
        {
            columnName: 'settlePay',
            columnComment: '已结工资',
            type: 'text'
        },
        {
            columnName: 'unSettleDays',
            columnComment: '未结天数',
            type: 'text'
        },
        {
            columnName: 'unSettlePay',
            columnComment: '未结工资',
            type: 'text'
        },

    ])

    // 处理指定字段
    // newTDS.forEach(field => {})

    // 字段排序
    const orderedFields = ['workerId', 'personName', 'phoneNum', 'idNum', 'dailyPay', 'totalDays',
        'totalPay',
        'settleDays',
        'settlePay',
        'unSettleDays',
        'unSettlePay',]
    // 根据用户角色过滤禁用字段
    let disabledFields = orderedFields
    // 允许的字段
    let allowedFields = []
    if (loginUserStore.loginUser.roleCode == 'sysAdmin') { // 系统管理员
        disabledFields = []
    } else if (loginUserStore.loginUser.roleCode == 'manager') { // 管理员
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
const FLD_field = ref(['personName', 'phoneNum', 'unSettleDays',
    'unSettlePay',])



// 过滤表设计
const FLDTDS_Worker = computed(() => {
    if (loginUserStore.loginUser.roleCode == 'sysAdmin') {
        // 如果是系统管理员,则过滤掉敏感字段
        return DEALED_TDS_Worker.value.filter(field => FLD_field.value.includes(field.columnName))
    }
    if (loginUserStore.loginUser.roleCode == 'manager') {
        // 如果是管理员,则过滤掉敏感字段
        return DEALED_TDS_Worker.value.filter(field => FLD_field.value.includes(field.columnName))
    }
    if (loginUserStore.loginUser.roleCode == 'operator') {
        // 如果是操作人,则过滤掉敏感字段
        return DEALED_TDS_Worker.value.filter(field => FLD_field.value.includes(field.columnName))
    }
    return []
})

const FORM_Search = ref(null)

// 列表
const TD_List = ref([])
const QUERY_Main = ref({
    query: {},
    params: {
        personName: '',
        phoneNum: '',
        idNum: '',
    },
    pageNum: 1,
    pageSize: 10,
    sortField: '',
    sortOrder: '',
    total: 0
})

const ACT_PageQuery = () => {

    $Requests.post('/worker/pageQueryWageSettle', QUERY_Main.value)
        .then(response => {
            if (response.code === 200) {
                // 成功获取用户列表
                TD_List.value = response.list;
                QUERY_Main.value.total = response.total;
            }
        })

}

const TDS_WorkerPayClear = ref([])

// 列表
const TD_WorkerPayClear = ref([])
const QUERY_WorkerPayClear = ref({
    query: {},
    params: {
        workerId: '',
        personName: '',
        phoneNum: '',
        idNum: '',
    },
    pageNum: 1,
    pageSize: 10,
    sortField: '',
    sortOrder: '',
    total: 0
})

const DEALED_TDS_WorkerPayClear = computed(() => {
    // 插入补充字段
    const newTDS = TDS_WorkerPayClear.value.concat([])

    // 处理指定字段
    // newTDS.forEach(field => {})

    // 字段排序
    const orderedFields = ['clearId', 'clearDate', 'involveDayList', 'involveDays', 'involvePay',
        'premium', 'clearingAmount', 'remark',
        'dataStatus', 'createUser', 'createTime', 'updateUser', 'updateTime'
    ]
    // 根据用户角色过滤禁用字段
    let disabledFields = orderedFields
    // 允许的字段
    let allowedFields = []
    if (loginUserStore.loginUser.roleCode == 'sysAdmin') { // 系统管理员
        disabledFields = []
    } else if (loginUserStore.loginUser.roleCode == 'manager') { // 管理员
        disabledFields = ['dataStatus', 'createUser', 'createTime', 'updateUser', 'updateTime']
    }
    allowedFields = orderedFields.filter(item => !new Set(disabledFields).has(item))
    // 按照顺序过滤表设计
    return newTDS.filter(field => allowedFields.includes(field.columnName))
        .sort((a, b) => {
            return allowedFields.indexOf(a.columnName) - allowedFields.indexOf(b.columnName)
        })


})

const SHOW_fieldFilter_WorkerPayClear = ref(false) // 控制字段过滤器显示状态
const FLD_field_WorkerPayClear = ref(['clearDate', 'involveDays', 'involvePay'])



// 过滤表设计
const FLDTDS_WorkerPayClear = computed(() => {
    if (loginUserStore.loginUser.roleCode == 'sysAdmin') {
        // 如果是系统管理员,则过滤掉敏感字段
        return DEALED_TDS_WorkerPayClear.value.filter(field => FLD_field_WorkerPayClear.value.includes(field.columnName))
    }
    if (loginUserStore.loginUser.roleCode == 'manager') {
        // 如果是管理员,则过滤掉敏感字段
        return DEALED_TDS_WorkerPayClear.value.filter(field => FLD_field_WorkerPayClear.value.includes(field.columnName))
    }
    if (loginUserStore.loginUser.roleCode == 'operator') {
        // 如果是操作人,则过滤掉敏感字段
        return DEALED_TDS_WorkerPayClear.value.filter(field => FLD_field_WorkerPayClear.value.includes(field.columnName))
    }
    return []
})

onMounted(() => {
    // 页面加载时获取表设计
    $TDS.setTableDesign(TDS_Worker, 'm_worker');
    $TDS.setTableDesign(TDS_WorkerPayClear, 't_worker_pay_clear');
    // 获取工人列表
    ACT_PageQuery()
})





const Show_WageList = ref(false)

// 查看工资单
const ACT_ShowWageList = (row) => {
    QUERY_WorkerPayClear.value.params.workerId = row.workerId
    GET_workerPayClearListByWorkerId()


};

const GET_workerPayClearListByWorkerId = () => {
    // 查询工资单
    $Requests.post('/workerPayClear/pageQuery', QUERY_WorkerPayClear.value)
        .then((response) => {
            if (response.code === 200) {
                Show_WageList.value = true;
                TD_WorkerPayClear.value = response.list;
                QUERY_WorkerPayClear.value.total = response.total;
            }
        });
};


const ACT_ToSettle = (row) => { 
    ElMessage.warning('功能尚未开发, 请联系管理员');
};




</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <div class="title">
                    <div> 工钱结算 </div>
                    <el-icon class="field-filter-icon" @click.stop="SHOW_fieldFilter = !SHOW_fieldFilter"
                        v-if="['sysAdmin', 'manager'].includes(loginUserStore.loginUser.roleCode)">
                        <SVG_Table />
                    </el-icon>
                </div>

                <div class="extra">
                </div>
            </div>
            <div class="field-filter" v-if="SHOW_fieldFilter" v-click-outside="() => SHOW_fieldFilter = false">
                <el-checkbox-group v-model="FLD_field" style="display: flex; flex-wrap: wrap;">
                    <el-checkbox-button v-for="(field, index) in DEALED_TDS_Worker" :key="index"
                        :value="field.columnName">
                        {{ field.columnComment }}
                    </el-checkbox-button>
                </el-checkbox-group>
            </div>
        </template>


        <!-- 搜索表单 -->
        <el-form inline ref="FORM_Search" :model="QUERY_Main.params" label-width="100px" class="search-form">

            <el-form-item label="名字" prop="personName">
                <el-input v-model="QUERY_Main.params.personName"></el-input>
            </el-form-item>


            <el-form-item label="手机号" prop="phoneNum">
                <el-input v-model="QUERY_Main.params.phoneNum"></el-input>
            </el-form-item>

            <el-form-item label="身份证" prop="idNum"
                v-if="['sysAdmin', 'manager'].includes(loginUserStore.loginUser.roleCode)">
                <el-input v-model="QUERY_Main.params.idNum"></el-input>
            </el-form-item>

            <el-form-item class="search-btn">
                <el-button type="primary" @click="ACT_PageQuery">搜索</el-button>
                <el-button @click="FORM_Search.resetFields()">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 主表格 -->
        <el-table :data="TD_List" style="width: 100%">
            <el-table-column type="index" width="60" />
            <el-table-column v-for="field in FLDTDS_Worker" :key="field.columnName" :label="field.columnComment"
                :prop="field.columnName" align="center">
                <template #default="{ row }" v-if="field.type == 'lv'">
                    {{ field.lvs[row[field.columnName]] }}
                </template>
            </el-table-column>
            <el-table-column label="结算记录" align="center"
                v-if="['sysAdmin', 'manager', 'operator'].includes(loginUserStore.loginUser.roleCode)">
                <template #default="{ row }">
                    <el-button type="primary" text @click="ACT_ShowWageList(row)">
                        <el-icon>
                            <SVG_WageList />
                        </el-icon>
                        <el-text type="primary">查看</el-text>
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column label="结算" align="center"
                v-if="['sysAdmin', 'manager', 'operator'].includes(loginUserStore.loginUser.roleCode)">
                <template #default="{ row }">
                    <el-button type="warning" text @click="ACT_ToSettle(row)">
                        <el-icon>
                            <SVG_WageSettle />
                        </el-icon>
                        <el-text type="warning">去结算</el-text>
                    </el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>

        <!-- 分页条 -->
        <el-pagination v-model:current-page="QUERY_Main.pageNum" v-model:page-size="QUERY_Main.pageSize"
            :total="QUERY_Main.total" :page-sizes="[10, 20, 50, 100]" @change="ACT_PageQuery"
            layout="jumper, total, sizes, prev, pager, next" />




        <!-- 选择人员 -->
        <el-dialog v-model="Show_WageList" title="结算记录" width="50%">
            <el-table :data="TD_WorkerPayClear" style="width: 100%">
                <el-table-column type="index" width="60" />
                <el-table-column v-for="field in FLDTDS_WorkerPayClear" :key="field.columnName"
                    :label="field.columnComment" :prop="field.columnName" align="center">
                    <template #default="{ row }" v-if="field.type == 'lv'">
                        {{ field.lvs[row[field.columnName]] }}
                    </template>
                </el-table-column>
                <template #empty>
                    <el-empty description="没有数据" />
                </template>
            </el-table>

            <!-- 分页条 -->
            <el-pagination v-model:current-page="QUERY_WorkerPayClear.pageNum"
                v-model:page-size="QUERY_WorkerPayClear.pageSize" :total="QUERY_WorkerPayClear.total"
                :page-sizes="[10, 20, 50, 100]" @change="GET_workerPayClearListByWorkerId"
                layout="jumper, total, sizes, prev, pager, next" />
        </el-dialog>
    </el-card>
</template>
<style lang="scss" scoped></style>