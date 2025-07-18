<script setup>

import ChinaAreas from '@/assets/json/ChinaAreas3465.json'
import { useLoginUserStore } from '@/stores/loginUser'
const loginUserStore = useLoginUserStore()



const TDS_Person = ref([])
const TDS_PersonWeighRecord = ref([])

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
    $TDS.setTableDesign(TDS_PersonWeighRecord, 'ts_corn_grain_purchase_weigh_record');
    // 获取人员列表
    ACT_GetList()
})

const OPT_clearingForm = computed(() => {
    try {
        return TDS_Person.value.filter(item => item.columnName === 'clearingForm')[0].types
    } catch (error) {
        return {}
    }
});

const OPT_tradeStatus = computed(() => {
    try {
        return TDS_Person.value.filter(item => item.columnName === 'tradeStatus')[0].types
    } catch (error) {
        return []
    }
});

const OPT_sex = computed(() => {
    try {
        return TDS_Person.value.filter(item => item.columnName === 'sex')[0].types
    } catch (error) {
        return []
    }
});

const OPT_YN = { "Y": "是", "N": "否" }



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
const ACT_SHOW_addPerson = () => {

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
        { validator: $VLD.validateChinese, trigger: 'blur' },
        // 姓名不能包含空格
        { pattern: /^[^\s]*$/, message: '姓名不能包含空格', trigger: 'change' }
    ],

}



const SBM_savePerson = () => {
    FORM_Person.value.clearValidate();        // 清除全部
    FORM_Person.value.validateField(['phoneNum', 'personName', 'grossWeight'], (valid, fields) => {
        if (!valid) {
            // 表单校验不通过
            ElMessage.warning('录入和检查必要的信息后再保存');
            return false;
        }


        // 提交保存收购
        $Requests.post('/person/savePerson', FD_Person.value, { showSuccessMsg: true })
            .then(response => {
                if (response.code === 200) {
                    SHOW_Drawer.value = false;
                    ACT_GetList();
                } else if (response.code === 555 && ['manager'].includes(loginUserStore.loginUser.roleCode)) {
                    ElMessageBox.confirm(
                        response.message,
                        '提示',
                        {
                            distinguishCancelAndClose: true,
                            confirmButtonText: `使用 ${response.message.split(' ')[1]} 提交`,
                            cancelButtonText: `更新姓名为 ${FD_Person.value.personName} 并提交`,
                            type: 'warning',
                        }
                    )
                        .then(() => {
                            // 使用已有姓名提交
                            FD_Person.value.personName = response.message.split(' ')[1];
                            SBM_savePerson()
                        })
                        .catch((action) => {
                            if (action === 'close') {
                                // 关闭提示
                                return;
                            }
                            // 更新姓名并提交
                            $Requests.post('/person/updateNameByPhoneNum', FD_Person.value, { showSuccessMsg: true })
                                .then((response) => {
                                    if (response.code === 200) {
                                        // 更新成功后再次提交
                                        SBM_savePerson();
                                    }
                                });
                        })
                }
            })
    });
};



const ACT_EditPerson = (row) => {
    // 查询人员详情
    $Requests.post('/person/getPersonDetail', row)
        .then(response => {
            if (response.code === 200) {
                if (response.data.tradeStatus !== '收购中') {
                    ElMessage.warning('只能编辑收购中的人员');
                    return;
                }
                init_FD_Person(); // 初始化表单数据
                // 显示抽屉
                SHOW_Drawer.value = true;
                TT_Drawer.value = '编辑人员'
                nextTick(() => {
                    // 重置表单数据
                    FORM_Person.value.resetFields();
                    // 成功获取人员详情
                    FD_Person.value = response.data;
                })
            }
        })
};

const ACT_detail = (row) => {

    // 成功获取人员详情
    SHOW_Drawer.value = true
    TT_Drawer.value = '人员详情'
    init_FD_Person(); // 初始化表单数据
    nextTick(() => {
        // 重置表单数据
        FORM_Person.value.resetFields();
        // 成功获取人员详情
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


const SHOW_Settle = ref(false) // 控制结算对话框显示状态
const TT_Settle = ref('结算') // 结算标题
const FD_Settle = ref({}) // 结算表单数据
const FORM_Settle = ref(null) // 人员表单

const rules_settle = {

    totalWeight: [
        { required: true, message: '请输入总重', trigger: 'change' }
    ],
    totalPrice: [
        { required: true, message: '请输入总价', trigger: 'change' },
        // 总价范围为0.01~100000
        { validator: $VLD.doubleRange(0.01, 100000), trigger: 'blur' }
    ],
    planClearingDate: [
        { required: true, message: '请选择计划结算日期', trigger: 'change' }
    ],

    actualClearingDate: [
        { required: true, message: '请选择实际结算日期', trigger: 'change' }
    ],
    premium: [
        { required: true, message: '请输入补价', trigger: 'change' },
        { validator: $VLD.doubleRange(-2000, 2000), trigger: 'blur' }
    ]
}

const calculateSettle = computed(() => {
    // 计算结算金额
    let { totalPrice, premium } = FD_Settle.value
    if (totalPrice && premium) {
        return { clearingAmount: (Number(totalPrice) + Number(premium)).toFixed(2) }
    } else {
        return { clearingAmount: Number(totalPrice) }
    }
})

const SBM_Settle = () => {
    FORM_Settle.value.validate((valid, fields) => {
        if (!valid) {
            // 表单校验不通过
            ElMessage.warning('请检查输入项');
            return false;
        }

        // 补价绝对值超过总价的30%则阻止, 超过10%则弹窗确认
        if (Math.abs(FD_Settle.value.premium) > FD_Settle.value.totalPrice * 0.3) {
            ElMessage.warning('补价超过总价的30%, 若继续结算请联系系统管理员');
            return false;
        } else if (Math.abs(FD_Settle.value.premium) > FD_Settle.value.totalPrice * 0.1) {
            ElMessageBox.confirm('补价超过总价的10%, 是否继续结算？', '提示', {
                confirmButtonText: '继续结算',
                cancelButtonText: '取消结算',
                type: 'warning'
            }).then(() => {
                // 继续结算
                settlePerson();
            }).catch(() => {
                // 取消结算
                return false;
            });
        } else {
            settlePerson()
        }

    });
}

const settlePerson = () => {
    // 计算结算金额
    FD_Settle.value.clearingAmount = calculateSettle.value.clearingAmount;
    // 提交结算
    $Requests.post('/person/settlePerson', FD_Settle.value, { showSuccessMsg: true })
        .then(response => {
            if (response.code === 200) {
                SHOW_Settle.value = false;
                ACT_GetList();
            }
        })
}


const likePersonList = ref([])

const getPersonLike = (queryString, cb, fieldName) => {


    if (!queryString) {
        return cb([])
    }
    if (fieldName === 'phoneNum' && queryString.length < 3) {
        return cb([])
    }
    if (fieldName === 'personName' && queryString.length < 1) {
        return cb([])
    }

    // 根据手机号模糊查询人员
    $Requests.post('/person/getPersonLike', { [fieldName]: queryString }, { showLoading: false, showErrorMsg: false })
        .then(response => {
            if (response.code === 200) {
                // 成功获取人员列表
                likePersonList.value = response.data
                return cb(response.data)
            } else {
                return cb([])
            }
        }).catch(error => {
            return cb([])
        })

}


const handleSelectPerson = (item) => {
    FD_Person.value = item
    // 判断地址列表是否是数组
    if (Array.isArray(item.addressList) && item.addressList.length > 0) {
        FD_Person.value.address = item.addressList[0]
    }
}

const getPersonAddressList = (queryString, cb) => {
    if (!likePersonList.value || likePersonList.value.length === 0) {
        return cb([])
    }
    // 获取手机号对应人员的地址列表
    for (const person of likePersonList.value) {
        if (person.phoneNum === FD_Person.value.phoneNum) {
            // 找到对应人员
            const addressList = []
            for (const address of person.addressList) {
                addressList.push({
                    value: address,
                    label: address
                })
            }
            return cb(addressList)
        }
    }
    return cb([])
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
                    <el-button type="primary" @click="ACT_SHOW_addPerson"
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

        {{ TDS_Person }}

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
                        <el-input v-model="FD_Person.idNum"></el-input>
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
            <el-card v-if="TT_Drawer == '人员详情' && FD_Person.list_address.length > 0">
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
            {{ FD_Person }}
        </el-drawer>
    </el-card>
    <el-dialog v-model="SHOW_Settle" :title="TT_Settle" width="1200">
        <el-form ref="FORM_Settle" :model="FD_Settle" label-width="110px" :rules="rules_settle">
            <el-row>

                <!-- 总重 -->
                <el-form-item label="总重" prop="totalWeight" v-inline-flex>
                    <el-input v-model="FD_Settle.totalWeight" disabled>
                        <template #append>kg</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="总价" prop="totalPrice" v-inline-flex>
                    <el-input v-model="FD_Settle.totalPrice" disabled>
                        <template #append>元</template>
                    </el-input>
                </el-form-item>
                <!-- 计划结算日期 -->
                <el-form-item v-if="FD_Settle.clearingForm == '延结'" label="计划结算日期" prop="planClearingDate"
                    v-inline-flex>
                    <el-date-picker v-model="FD_Settle.planClearingDate" value-format="YYYY-MM-DD"
                        disabled></el-date-picker>
                </el-form-item>
            </el-row>

            <el-row>
                <el-form-item label="实际结算日期" prop="actualClearingDate" v-inline-flex>
                    <el-date-picker v-model="FD_Settle.actualClearingDate" value-format="YYYY-MM-DD"></el-date-picker>
                </el-form-item>
                <el-form-item label="补价" prop="premium" v-inline-flex>
                    <el-input v-model="FD_Settle.premium" v-input-double="3">
                        <template #append>元</template>
                    </el-input>
                </el-form-item>
            </el-row>

            <el-form-item label="备注" prop="remark">
                <el-input v-model="FD_Settle.remark" type="textarea"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <div>
                    <!-- 最终结算金额 -->
                    <span>最终结算金额: {{ calculateSettle.clearingAmount }} 元</span>
                </div>
                <div>
                    <el-button type="primary" @click="SBM_Settle">结算</el-button>
                </div>
            </div>
        </template>
    </el-dialog>
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