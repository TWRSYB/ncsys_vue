<script setup>

import { useLoginUserStore } from '@/stores/loginUser'
const loginUserStore = useLoginUserStore()



const TDS_Worker = ref([])

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

    $Requests.post('/worker/pageQuery', QUERY_Main.value)
        .then(response => {
            if (response.code === 200) {
                // 成功获取用户列表
                TD_List.value = response.list;
                QUERY_Main.value.total = response.total;
            }
        })

}

onMounted(() => {
    // 页面加载时获取表设计
    $TDS.setTableDesign(TDS_Worker, 'm_worker');
    // 获取工人列表
    ACT_PageQuery()
})



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
            columnName: 'sex',
            columnComment: '性别',
            type: 'text'
        },
        {
            columnName: 'alias',
            columnComment: '别名',
            type: 'text'
        },
        {
            columnName: 'address',
            columnComment: '地址',
            type: 'text'
        },
    ])

    // 处理指定字段
    // newTDS.forEach(field => {})

    // 字段排序
    const orderedFields = ['personName', 'phoneNum', 'sex', 'idNum',
        'address', 'alias', 'dailyPay']
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
const FLD_field = ref(['personName', 'phoneNum', 'alias'])



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







//控制抽屉是否显示
const SHOW_Drawer = ref(false)
const TT_Drawer = ref('工人详情')
const FORM_Worker = ref(null)
//添加表单数据模型
const FD_Worker = ref({})
const init_FD_Worker = () => {
    // 初始化表单数据
    FD_Worker.value = {
        personId: '', // 工人ID
        personName: '', // 人员名称
        phoneNum: '', // 手机号
        idNum: '',  // 身份证号码
        sex: '', // 性别
        address: '', // 地址
        alias: '', // 别名
        remark: '', // 备注
    }
}
const ACT_addWorker = () => {

    // 显示抽屉
    SHOW_Drawer.value = true;
    TT_Drawer.value = '添加工人'
    init_FD_Worker(); // 初始化表单数据
    nextTick(() => {
        // 重置表单数据
        FORM_Worker.value.resetFields();
    })
}


const SHOW_Dialog = ref(false)
const FORM_SearchPerson = ref(null)

// 列表
const TD_ListPerson = ref([])
const QUERY_Person = ref({
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

const ACT_showSelectPerson = () => {

    SHOW_Dialog.value = true
    TD_ListPerson.value = []
    QUERY_Person.value.params = {}
    ACT_GetPersonList()

}

const ACT_selectPerson = (row) => {
    SHOW_Dialog.value = false
    FD_Worker.value.personId = row.personId
    FD_Worker.value.personName = row.personName
    FD_Worker.value.phoneNum = row.phoneNum
    FD_Worker.value.idNum = row.idNum
    FD_Worker.value.alias = row.alias
    FD_Worker.value.sex = row.sex
    FD_Worker.value.address = row.address
}

const ACT_GetPersonList = () => {
    $Requests.post('/person/getPersonNotInWorker', QUERY_Person.value)
        .then(response => {
            if (response.code === 200) {
                // 获取成功
                TD_ListPerson.value = response.list;
                QUERY_Person.value.total = response.total;
            }
        })
}





//定义表单校验规则
const rules = {
    phoneNum: [
        { required: true, message: '请输入手机号', trigger: 'change' },
        // 手机号格式校验
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    personName: [
        { required: true, message: '请输入姓名', trigger: 'change' },
        { min: 2, max: 10, message: '长度为2~5位', trigger: 'change' },
        { validator: $VLD.V_Chinese, trigger: 'blur' },
        // 姓名不能包含空格
        { pattern: /^[^\s]*$/, message: '姓名不能包含空格', trigger: 'change' }
    ],
    idNum: [
        { validator: $VLD.V_IdCard, message: '身份证号不符合规则', trigger: 'change' }
    ],

}



const SBM_saveWorker = () => {
    FORM_Worker.value.validate((valid, fields) => {
        if (!valid) {
            // 表单校验不通过
            ElMessage.warning('录入和检查必要的信息后再保存');
            return false;
        }

        if (TT_Drawer.value == '添加工人') {
            // 提交保存
            $Requests.post('/worker/saveWorker', FD_Worker.value, { showSuccessMsg: true })
                .then(response => {
                    if (response.code === 200) {
                        SHOW_Drawer.value = false;
                        ACT_PageQuery();
                    }
                })
        } else if (TT_Drawer.value == '编辑工人') {
            // 提交更新
            $Requests.post('/worker/updateWorker', FD_Worker.value, { showSuccessMsg: true })
                .then(response => {
                    if (response.code === 200) {
                        SHOW_Drawer.value = false;
                        ACT_PageQuery();
                    }
                })

        }


    });
};


const ACT_EditWorker = (row) => {
    // 显示抽屉
    SHOW_Drawer.value = true;
    TT_Drawer.value = '编辑工人'
    init_FD_Worker(); // 初始化表单数据
    nextTick(() => {
        // 重置表单数据
        FORM_Worker.value.resetFields();
        FD_Worker.value = row;
    })
};

const ACT_detail = (row) => {

    SHOW_Drawer.value = true
    TT_Drawer.value = '工人详情'
    init_FD_Worker(); // 初始化表单数据
    nextTick(() => {
        // 重置表单数据
        FORM_Worker.value.resetFields();
        FD_Worker.value = row;
    })

}









</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <div class="title">
                    <div> 工人信息 </div>
                    <el-icon class="field-filter-icon" @click.stop="SHOW_fieldFilter = !SHOW_fieldFilter"
                        v-if="['sysAdmin', 'manager'].includes(loginUserStore.loginUser.roleCode)">
                        <SVG_Table />
                    </el-icon>
                </div>

                <div class="extra">
                    <el-button type="primary" @click="ACT_addWorker"
                        v-if="['sysAdmin', 'manager'].includes(loginUserStore.loginUser.roleCode)">添加工人</el-button>
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
                :prop="field.columnName">
                <template #default="{ row }" v-if="field.type == 'lv'">
                    {{ field.lvs[row[field.columnName]] }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100"
                v-if="['sysAdmin', 'manager', 'operator'].includes(loginUserStore.loginUser.roleCode)">
                <template #default="{ row }">
                    <el-icon style="margin: 0 3px;" @click="ACT_detail(row)">
                        <Tickets />
                    </el-icon>
                    <el-icon color="#409EFF" style="margin: 0 3px;" @click="ACT_EditWorker(row)">
                        <Edit />
                    </el-icon>
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


        <!-- 新增 -->
        <el-drawer v-model="SHOW_Drawer" :title="TT_Drawer" direction="rtl" size="50%">


            <el-form ref="FORM_Worker" :model="FD_Worker" label-width="110px" :rules="rules"
                :disabled="TT_Drawer == '工人详情'">
                <el-form-item label="工人名称" prop="personName">
                    <el-input v-model="FD_Worker.personName" disabled></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phoneNum">
                    <el-input v-model="FD_Worker.phoneNum" disabled></el-input>
                </el-form-item>
                <el-form-item label="身份证号" prop="idNum">
                    <el-input v-model="FD_Worker.idNum" disabled></el-input>
                </el-form-item>
                <!-- 日工资 -->
                <el-form-item label="日工资" prop="dailyPay">
                    <el-input v-model="FD_Worker.dailyPay" v-input-int="1"></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="FD_Worker.remark" type="textarea" :autosize="{ minRows: 2 }"></el-input>
                </el-form-item>
            </el-form>

            <template #footer v-if="TT_Drawer != '工人详情'">
                <div>
                    <!-- 选择人员按钮 -->
                    <el-button type="primary" @click="ACT_showSelectPerson" v-if="TT_Drawer == '添加工人'">选择人员</el-button>
                    <el-button type="primary" @click="SBM_saveWorker">保存</el-button>
                </div>
            </template>
        </el-drawer>

        <!-- 选择人员 -->
        <el-dialog v-model="SHOW_Dialog" title="双击选择人员" width="50%">
            <!-- 搜索表单 -->
            <el-form inline ref="FORM_SearchPerson" :model="QUERY_Person.params" label-width="100px"
                class="search-form">

                <el-form-item label="名字" prop="personName">
                    <el-input v-model="QUERY_Person.params.personName"></el-input>
                </el-form-item>

                <el-form-item label="手机号" prop="phoneNum">
                    <el-input v-model="QUERY_Person.params.phoneNum"></el-input>
                </el-form-item>

                <el-form-item label="身份证" prop="idNum">
                    <el-input v-model="QUERY_Person.params.idNum"></el-input>
                </el-form-item>

                <el-form-item class="search-btn">
                    <el-button type="primary" @click="ACT_GetPersonList">搜索</el-button>
                    <el-button @click="FORM_SearchPerson.resetFields()">重置</el-button>
                </el-form-item>
            </el-form>


            <el-table :data="TD_ListPerson" style="width: 100%" @row-dblclick="ACT_selectPerson">
                <el-table-column type="index" width="60" />
                <el-table-column prop="personName" label="姓名" />
                <el-table-column prop="phoneNum" label="手机号" />
                <el-table-column prop="idNum" label="身份证号" />
                <template #empty>
                    <el-empty description="没有数据" />
                </template>
            </el-table>

            <!-- 分页条 -->
            <el-pagination v-model:current-page="QUERY_Person.pageNum" v-model:page-size="QUERY_Person.pageSize"
                :total="QUERY_Person.total" :page-sizes="[10, 20, 50, 100]" @change="ACT_GetPersonList"
                layout="jumper, total, sizes, prev, pager, next" />
        </el-dialog>
    </el-card>
</template>
<style lang="scss" scoped>
</style>