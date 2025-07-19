<script setup>

import ChinaAreas from '@/assets/json/ChinaAreas3465.json'
import { useLoginUserStore } from '@/stores/loginUser'
const loginUserStore = useLoginUserStore()



const TDS_Person = ref([])

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

const ACT_GetList = () => {

    $Requests.post('/person/pageQuery', QUERY_Main.value)
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
    $TDS.setTableDesign(TDS_Person, 'm_person');
    // 获取人员列表
    ACT_GetList()
})


const OPT_sex = computed(() => {
    try {
        return TDS_Person.value.filter(item => item.columnName === 'sex')[0].types
    } catch (error) {
        return []
    }
});




const DEALED_TDS_Person = computed(() => {
    // 插入补充字段
    const newTDS = TDS_Person.value.concat([
        {
            columnName: 'provinceName',
            columnComment: '省',
            type: 'text'
        },
        {
            columnName: 'cityName',
            columnComment: '市',
            type: 'text'
        },
        {
            columnName: 'areaName',
            columnComment: '区/县',
            type: 'text'
        },
    ])

    // 处理指定字段
    newTDS.forEach(field => {
        if (field.columnName === 'province') {
            field.columnComment = '省编码'
        }
        if (field.columnName === 'city') {
            field.columnComment = '市编码'
        }
        if (field.columnName === 'area') {
            field.columnComment = '区/县编码'
        }
    })



    // 字段排序
    const orderedFields = ['personId', 'personName', 'phoneNum', 'sex', 'idNum',
        'province', 'city', 'area', 'provinceName', 'cityName', 'areaName',
        'address', 'remark', 'alias',
        'dataStatus', 'createUser', 'createTime', 'updateUser', 'updateTime']
    // 根据用户角色过滤禁用字段
    let disabledFields = orderedFields
    // 允许的字段
    let allowedFields = []
    if (loginUserStore.loginUser.roleCode == 'sysAdmin') { // 系统管理员
        disabledFields = []
    } else if (loginUserStore.loginUser.roleCode == 'manager') { // 管理员
        disabledFields = ['personId', 'dataStatus']
    }
    allowedFields = orderedFields.filter(item => !new Set(disabledFields).has(item))
    // 按照顺序过滤表设计
    return newTDS.filter(field => allowedFields.includes(field.columnName))
        .sort((a, b) => {
            return allowedFields.indexOf(a.columnName) - allowedFields.indexOf(b.columnName)
        })


})

const SHOW_fieldFilter = ref(false) // 控制字段过滤器显示状态
const FLD_field = ref(['personName', 'phoneNum', 'address', 'alias'])



// 过滤表设计
const FLDTDS_Person = computed(() => {
    if (loginUserStore.loginUser.roleCode == 'sysAdmin') {
        // 如果是系统管理员,则过滤掉敏感字段
        return DEALED_TDS_Person.value.filter(field => FLD_field.value.includes(field.columnName))
    }
    if (loginUserStore.loginUser.roleCode == 'manager') {
        // 如果是管理员,则过滤掉敏感字段
        return DEALED_TDS_Person.value.filter(field => FLD_field.value.includes(field.columnName))
    }
    if (loginUserStore.loginUser.roleCode == 'operator') {
        // 如果是操作人,则过滤掉敏感字段
        return DEALED_TDS_Person.value.filter(field => FLD_field.value.includes(field.columnName))
    }
    return []
})







//控制抽屉是否显示
const SHOW_Drawer = ref(false)
const TT_Drawer = ref('人员详情')
const FORM_Person = ref(null)
const ACT_addPerson = () => {

    // 显示抽屉
    SHOW_Drawer.value = true;
    TT_Drawer.value = '新增人员'
    init_FD_Person(); // 初始化表单数据
    nextTick(() => {
        // 重置表单数据
        FORM_Person.value.resetFields();
    })
}
//添加表单数据模型
const FD_Person = ref({})

const init_FD_Person = () => {
    // 初始化表单数据
    FD_Person.value = {
        personId: '', // 人员ID
        personName: '', // 人员名称
        phoneNum: '', // 手机号
        idNum: '',  // 身份证号码
        sex: '', // 性别
        province: '',    // 省
        city: '', // 市
        area: '', // 区/县
        provinceCityArea: [],
        address: '', // 地址
        alias: '', // 别名
        aliasArray: [], // 别名列表
        remark: '', // 备注
        list_address: [], // 地址列表
    }
}

const CHG_provinceCityArea = (value) => {
    // 置空省市区
    FD_Person.value.province = ''
    FD_Person.value.city = ''
    FD_Person.value.area = ''
    // 判断是否是数组
    if (!Array.isArray(value)) {
        return
    }
    // 获取省市区
    FD_Person.value.province = value[0] || ''
    FD_Person.value.city = value[1] || ''
    FD_Person.value.area = value[2] || ''
}

const CHG_aliasArray = (value) => {
    // 置空别名
    FD_Person.value.alias = ''
    // 获取别名
    FD_Person.value.alias = value.join(',')
}

const CHG_idNum = (value) => {
    if (value && value.length === 18) {
        const sexDigit = value.substr(16, 1)
        // 判断第17位是否是数字
        if (/^\d$/.test(sexDigit)) {
            if (sexDigit % 2 == 1) { // 奇数为男
                FD_Person.value.sex = '男'
            } else { // 女
                FD_Person.value.sex = '女'
            }
        }
    }
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
    sex: [
        { validator: (rule, value, callback) => $VLD.VP_SexMatchIdNum(rule, value, callback, FD_Person.value.idNum), trigger: 'change' }
    ],

}



const SBM_savePerson = () => {
    FORM_Person.value.validate((valid, fields) => {
        if (!valid) {
            // 表单校验不通过
            ElMessage.warning('录入和检查必要的信息后再保存');
            return false;
        }

        if (TT_Drawer.value == '新增人员') {
            // 提交保存
            $Requests.post('/person/savePerson', FD_Person.value, { showSuccessMsg: true })
                .then(response => {
                    if (response.code === 200) {
                        SHOW_Drawer.value = false;
                        ACT_GetList();
                    }
                })
        } else if (TT_Drawer.value == '编辑人员') {
            // 提交更新
            $Requests.post('/person/updatePerson', FD_Person.value, { showSuccessMsg: true })
                .then(response => {
                    if (response.code === 200) {
                        SHOW_Drawer.value = false;
                        ACT_GetList();
                    }
                })

        }


    });
};


const ACT_EditPerson = (row) => {
    // 显示抽屉
    SHOW_Drawer.value = true;
    TT_Drawer.value = '编辑人员'
    init_FD_Person(); // 初始化表单数据
    nextTick(() => {
        // 重置表单数据
        FORM_Person.value.resetFields();
        FD_Person.value = row;
        FD_Person.value.provinceCityArea = [row.province, row.city, row.area]
        if (row.alias) {
            FD_Person.value.aliasArray = row.alias.split(',')
        }
    })
};

const ACT_detail = (row) => {

    SHOW_Drawer.value = true
    TT_Drawer.value = '人员详情'
    init_FD_Person(); // 初始化表单数据
    nextTick(() => {
        // 重置表单数据
        FORM_Person.value.resetFields();
        FD_Person.value = row;
        FD_Person.value.provinceCityArea = [row.province, row.city, row.area]
        if (row.alias) {
            FD_Person.value.aliasArray = row.alias.split(',')
        }
        // 获取地址列表
        $Requests.post('/person/getPersonAddressList', row)
            .then(response => {
                if (response.code === 200) {
                    FD_Person.value.list_address = response.data;
                }
            })
    })

}









</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <div class="title">
                    <div> 人员信息 </div>
                    <el-icon class="field-filter-icon" @click.stop="SHOW_fieldFilter = !SHOW_fieldFilter"
                        v-if="['sysAdmin', 'manager'].includes(loginUserStore.loginUser.roleCode)">
                        <SVG_Table />
                    </el-icon>
                </div>

                <div class="extra">
                    <el-button type="primary" @click="ACT_addPerson"
                        v-if="['sysAdmin', 'manager'].includes(loginUserStore.loginUser.roleCode)">新增人员</el-button>
                </div>
            </div>
            <div class="field-filter" v-if="SHOW_fieldFilter" v-click-outside="() => SHOW_fieldFilter = false">
                <el-checkbox-group v-model="FLD_field" style="display: flex; flex-wrap: wrap;">
                    <el-checkbox-button v-for="(field, index) in DEALED_TDS_Person" :key="index"
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
                <el-button type="primary" @click="ACT_GetList">搜索</el-button>
                <el-button @click="FORM_Search.resetFields()">重置</el-button>
            </el-form-item>
        </el-form>


        <el-table :data="TD_List" style="width: 100%">
            <el-table-column type="index" width="60" />
            <el-table-column v-for="field in FLDTDS_Person" :key="field.columnName" :label="field.columnComment"
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
                    <el-icon color="#409EFF" style="margin: 0 3px;" @click="ACT_EditPerson(row)">
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
            :total="QUERY_Main.total" :page-sizes="[10, 20, 50, 100]" @change="ACT_GetList"
            layout="jumper, total, sizes, prev, pager, next" />


        <!-- 新增 -->
        <el-drawer v-model="SHOW_Drawer" :title="TT_Drawer" direction="rtl" size="50%">
            <el-form ref="FORM_Person" :model="FD_Person" label-width="110px" :rules="rules"
                :disabled="TT_Drawer == '人员详情'">



                <el-form-item label="手机号" prop="phoneNum" v-inline-flex="50">
                    <el-input v-model="FD_Person.phoneNum"></el-input>
                </el-form-item>

                <el-form-item label="姓名" prop="personName" v-inline-flex="50">
                    <el-input v-model="FD_Person.personName"></el-input>
                </el-form-item>

                <el-row>
                    <el-form-item label="身份证号" prop="idNum" v-inline-flex="50">
                        <el-input v-model="FD_Person.idNum"
                            v-input-filter="{ regex: /[^0-9xX]/g, maxLength: 18, upOrLower: 'up' }" @change="CHG_idNum">
                        </el-input>
                    </el-form-item>

                    <el-form-item label="性别" prop="sex" v-inline-flex="50">
                        <el-radio-group v-model="FD_Person.sex">
                            <el-radio-button v-for="(item, index) in OPT_sex" :key="index" :value="item"
                                :label="item"></el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </el-row>


                <el-form-item label="省/市/区县" prop="provinceCityArea">
                    <el-cascader style="width: 100%;" v-model="FD_Person.provinceCityArea" :options="ChinaAreas"
                        :props="{ label: 'name', value: 'code', checkStrictly: true }" @Change="CHG_provinceCityArea"
                        clearable></el-cascader>
                </el-form-item>

                <el-form-item label="地址" prop="address">
                    <el-input v-model="FD_Person.address"></el-input>
                </el-form-item>

                <el-form-item label="别名" prop="aliasArray">
                    <el-input-tag v-model="FD_Person.aliasArray" :max="5" tag-type="warning" tag-effect="plain"
                        :delimiter="/[,\s]/" @change="CHG_aliasArray" />
                </el-form-item>

                <el-form-item label="备注" prop="remark">
                    <el-input v-model="FD_Person.remark" type="textarea" :autosize="{ minRows: 2 }"></el-input>
                </el-form-item>

            </el-form>

            <!-- 地址列表 -->
            <el-card v-if="TT_Drawer == '人员详情' && FD_Person.list_address && FD_Person.list_address.length">
                <template #header>
                    <div>地址列表</div>
                </template>
                <el-table :data="FD_Person.list_address" style="width: 100%">
                    <el-table-column type="index" label="序号" width="60" />
                    <el-table-column label="地址" prop="address"></el-table-column>
                    <el-table-column label="最后使用时间" prop="createTime"></el-table-column>"
                </el-table>
            </el-card>

            <template #footer>
                <div>
                    <el-button type="primary" @click="SBM_savePerson" v-if="TT_Drawer != '人员详情'">保存</el-button>
                </div>
            </template>
        </el-drawer>
    </el-card>
</template>
<style lang="scss" scoped>
.dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #7d8087;
    font-size: 18px;
}
</style>