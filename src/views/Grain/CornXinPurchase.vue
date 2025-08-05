<script setup>

import { useLoginUserStore } from '@/stores/loginUser'
const loginUserStore = useLoginUserStore()



const TDS_CornXinPurchase = ref([])
const TDS_CornXinPurchaseWeighRecord = ref([])

const FORM_Search = ref(null)

// 列表
const TD_List = ref([])
const QUERY_Main = ref({
    query: {
        tradeDate: ''
    },
    params: {
        tradeDate: '',
        seller: '',
        tradeStatus: ''
    },
    pageNum: 1,
    pageSize: 10,
    sortField: '',
    sortOrder: '',
    total: 0
})

const ACT_pageQuery = () => {

    $Requests.post('/cornXinPurchase/pageQuery', QUERY_Main.value)
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
    $TDS.setTableDesign(TDS_CornXinPurchase, 't_corn_xin_purchase');
    $TDS.setTableDesign(TDS_CornXinPurchaseWeighRecord, 'ts_corn_xin_purchase_weigh_record');
    // 获取交易列表
    ACT_pageQuery()
})

const OPT_clearingForm = computed(() => {
    try {
        return TDS_CornXinPurchase.value.filter(item => item.columnName === 'clearingForm')[0].types
    } catch (error) {
        return {}
    }
});

const OPT_tradeStatus = computed(() => {
    try {
        return TDS_CornXinPurchase.value.filter(item => item.columnName === 'tradeStatus')[0].types
    } catch (error) {
        return []
    }
});

const OPT_impurity = computed(() => {
    try {
        return TDS_CornXinPurchase.value.filter(item => item.columnName === 'impurity')[0].types
    } catch (error) {
        return []
    }
});

const OPT_YN = { "Y": "是", "N": "否" }

const OPT_carrier = computed(() => {
    try {
        return TDS_CornXinPurchaseWeighRecord.value.filter(item => item.columnName === 'carrier')[0].types
    } catch (error) {
        return {}
    }
});

const DEALED_TDS_CornXinPurchase = computed(() => {
    // 插入补充字段
    const newTDS = TDS_CornXinPurchase.value.concat([
        {
            columnName: 'sellerName',
            columnComment: '出售人',
            type: 'text'
        }
    ])

    // 字段排序
    const orderedFields = ['serno', 'tradeDate', 'sellerId', 'sellerName', 'qualityMouldRate',
        'qualityHumidity', 'impurity', 'clearingForm', 'planClearingDate', 'actualClearingDate', 'clearingAmount',
        'unitPrice', 'totalWeight', 'totalPrice', 'premium', 'tradeStatus', 'remark',
        'dataStatus', 'createUser', 'createTime', 'updateUser', 'updateTime']
    // 根据用户角色过滤禁用字段
    let disabledFields = orderedFields
    // 允许的字段
    let allowedFields = []
    if (loginUserStore.loginUser.roleCode == 'sysAdmin') { // 系统管理员
        disabledFields = []
    } else if (loginUserStore.loginUser.roleCode == 'manager') { // 管理员
        disabledFields = ['dataStatus']
    } else if (loginUserStore.loginUser.roleCode == 'operator') { // 操作员
        disabledFields = ['sellerId', 'dataStatus', 'createUser', 'createTime', 'updateUser', 'updateTime']
    }
    allowedFields = orderedFields.filter(item => !new Set(disabledFields).has(item))
    // 按照顺序过滤表设计
    return newTDS.filter(field => allowedFields.includes(field.columnName))
        .sort((a, b) => {
            return allowedFields.indexOf(a.columnName) - allowedFields.indexOf(b.columnName)
        })


})

const SHOW_fieldFilter = ref(false) // 控制字段过滤器显示状态
const FLD_field = ref(['tradeDate', 'sellerName', 'tradeStatus', 'clearingForm', 'actualClearingDate', 'clearingAmount'])



// 过滤表设计
const FLDTDS_CornXinPurchase = computed(() => {
    if (loginUserStore.loginUser.roleCode == 'sysAdmin') {
        // 如果是系统管理员,则过滤掉敏感字段
        return DEALED_TDS_CornXinPurchase.value.filter(field => FLD_field.value.includes(field.columnName))
    }
    if (loginUserStore.loginUser.roleCode == 'manager') {
        // 如果是管理员,则过滤掉敏感字段
        return DEALED_TDS_CornXinPurchase.value.filter(field => FLD_field.value.includes(field.columnName))
    }
    if (loginUserStore.loginUser.roleCode == 'operator') {
        // 如果是操作人,则过滤掉敏感字段
        return DEALED_TDS_CornXinPurchase.value.filter(field => FLD_field.value.includes(field.columnName))
    }
    return []
})







//控制抽屉是否显示
const SHOW_Drawer = ref(false)
const TT_Drawer = ref(`${BIZ_name}详情`)
const FORM_Trade = ref(null)
const ACT_SHOW_addTrade = () => {

    // 显示抽屉
    SHOW_Drawer.value = true;
    TT_Drawer.value = `新增${BIZ_name}`
    init_FD_Trade(); // 初始化表单数据
    nextTick(() => {
        // 重置表单数据
        FORM_Trade.value.resetFields();
        FD_Trade.value.tradeDate = new Date().toISOString().slice(0, 10); // 设置交易日期为今天
    })
}
//添加表单数据模型
const FD_Trade = ref({})

const init_FD_Trade = () => {
    // 初始化表单数据
    FD_Trade.value = {
        tradeDate: '', // 交易日期
        sellerId: '', // 出售人ID
        sellerInfo: { // 出售人信息
            personId: '', // 出售人ID
            personName: '', // 出售人姓名
            phoneNum: '', // 出售人手机号
        },
        qualityMouldRate: '',  // 霉菌率
        qualityHumidity: '',    // 湿度
        impurity: '', // 杂质
        clearingForm: '', // 结算方式
        unitPrice: '', // 单价
        totalWeight: '', // 总重量
        totalPrice: '', // 总价
        premium: '', // 溢价
        remark: '', // 备注
        tradeStatus: '', // 交易状态
        address: '', // 出售人地址
        list_weigh: [], // 称重列表
        sum_weight: {
            weightCount: 0, // 称重次数
            grossWeight: 0, // 毛重
            tareWeight: 0, // 皮重
            netWeight: 0, // 净重
        },
    }
}

const calculateTrade2 = computed(() => {
    let { unitPrice, sum_weight } = FD_Trade.value
    if (unitPrice && sum_weight) {
        return {
            totalWeight: sum_weight.netWeight,
            totalPrice: (sum_weight.netWeight * 2 * unitPrice).toFixed(2)
        }
    }
    return {
        totalWeight: 0,
        totalPrice: 0
    }
})


//定义表单校验规则
const rules = {
    tradeDate: [
        { required: true, message: '请选择交易日期', trigger: 'blur' }
    ],

    clearingForm: [
        { required: true, message: '请选择结算方式', trigger: 'change' }
    ],
    planClearingDate: [
        { required: true, message: '请选择计划结单日期', trigger: 'change' }
    ],

    unitPrice: [
        { required: true, message: '请输入单价', trigger: 'change' },
        // 单价法为0.4~1.7
        { validator: $VLD.doubleRange(0.2, 1.5), trigger: 'blur' }
    ],



    sellerInfo: {
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
    },

}





const ACT_addWeight = () => {
    FD_Trade.value.list_weigh.push({})
};



// 计算交易
const calculateTrade = () => {
    FD_Trade.value.sum_weight = {};
    calculateTrade1(FD_Trade.value.list_weigh, FD_Trade.value.sum_weight)
};

const calculateTrade1 = (list, sum) => {

    Object.assign(sum, {
        weightCount: 0,
        grossWeight: 0,
        tareWeight: 0,
        netWeight: 0
    });

    if (list.length > 0) {
        list.forEach((row) => {
            if (row.grossWeight && (row.tareWeight || row.tareWeight === 0)) {

                if (Number(row.tareWeight) >= Number(row.grossWeight)) {
                    row.netWeight = '毛重必须大于皮重'
                    return
                } else {
                    row.netWeight = row.grossWeight - row.tareWeight
                    sum.weightCount += 1
                    sum.grossWeight = sum.grossWeight + Number(row.grossWeight)
                    sum.tareWeight = sum.tareWeight + Number(row.tareWeight)
                    sum.netWeight = sum.netWeight + Number(row.netWeight)
                }
            } else {
                row.netWeight = ''
            }
        });
    }
};


const SBM_saveTrade = () => {
    FORM_Trade.value.clearValidate();        // 清除全部
    FORM_Trade.value.validateField(['tradeDate', 'sellerInfo.phoneNum', 'sellerInfo.personName', 'grossWeight'], (valid, fields) => {
        if (!valid) {
            // 表单校验不通过
            ElMessage.warning('录入和检查必要的信息后再保存');
            return false;
        }

        FD_Trade.value.totalWeight = calculateTrade2.value.totalWeight; // 设置总重量
        FD_Trade.value.totalPrice = calculateTrade2.value.totalPrice; // 设置总价

        // 提交保存收购
        $Requests.post('/cornXinPurchase/saveTrade', FD_Trade.value, { showSuccessMsg: true })
            .then(response => {
                if (response.code === 200) {
                    SHOW_Drawer.value = false;
                    ACT_pageQuery();
                } else if (['manager'].includes(loginUserStore.loginUser.roleCode)) {
                    if (response.code === 555) {
                        ElMessageBox.confirm(
                            response.message,
                            '提示',
                            {
                                distinguishCancelAndClose: true,
                                confirmButtonText: `使用 ${response.data} 提交`,
                                cancelButtonText: `更新姓名为 ${FD_Trade.value.sellerInfo.personName} 并提交`,
                                type: 'warning',
                            }
                        )
                            .then(() => {
                                // 使用已有姓名提交
                                FD_Trade.value.sellerInfo.personName = response.data;
                                SBM_saveTrade()
                            })
                            .catch((action) => {
                                if (action === 'close') {
                                    // 关闭提示
                                    return;
                                }
                                // 更新姓名并提交
                                $Requests.post('/person/updateNameByPhoneNum', FD_Trade.value.sellerInfo, { showSuccessMsg: true })
                                    .then((response) => {
                                        if (response.code === 200) {
                                            // 更新成功后再次提交
                                            SBM_saveTrade();
                                        }
                                    });
                            })
                    }
                }
            })
    });
};

const SBM_purchaseComplete = () => {
    // 确认提交提示
    ElMessageBox.confirm('提交完成前请仔细核对录入内容, 提交后数据将进入待结算状态？', '提示', {
        confirmButtonText: '确认完成',
        cancelButtonText: '再次检查',
        type: 'warning'
    }).then(() => {
        FORM_Trade.value.validate((valid, fields) => {
            if (!valid) {
                // 表单校验不通过
                ElMessage.warning('请检查输入项');
                return false;
            }

            FD_Trade.value.totalWeight = calculateTrade2.value.totalWeight; // 设置总重量
            FD_Trade.value.totalPrice = calculateTrade2.value.totalPrice; // 设置总价

            $Requests.post('/cornXinPurchase/purchaseComplete', FD_Trade.value, { showSuccessMsg: true })
                .then(response => {
                    if (response.code === 200) {
                        SHOW_Drawer.value = false;
                        ACT_pageQuery();
                    }
                })
        });
    })

};

const ACT_EditTrade = (row) => {
    // 查询交易详情
    $Requests.post('/cornXinPurchase/getTradeDetail', row)
        .then(response => {
            if (response.code === 200) {
                if (response.data.tradeStatus !== '收购中') {
                    ElMessage.warning('只能编辑收购中的交易');
                    return;
                }
                init_FD_Trade(); // 初始化表单数据
                // 显示抽屉
                SHOW_Drawer.value = true;
                TT_Drawer.value = `编辑${BIZ_name}`
                nextTick(() => {
                    // 重置表单数据
                    FORM_Trade.value.resetFields();
                    // 成功获取交易详情
                    FD_Trade.value = response.data;
                    calculateTrade();
                })
            }
        })
};

const ACT_detail = (row) => {
    // 查询交易详情
    $Requests.post('/cornXinPurchase/getTradeDetail', row)
        .then(response => {
            if (response.code === 200) {
                // 成功获取交易详情
                SHOW_Drawer.value = true
                TT_Drawer.value = `${BIZ_name}详情`
                init_FD_Trade(); // 初始化表单数据
                nextTick(() => {
                    // 重置表单数据
                    FORM_Trade.value.resetFields();
                    // 成功获取交易详情
                    FD_Trade.value = response.data;
                    calculateTrade();
                })
            }
        })
}


const SHOW_Settle = ref(false) // 控制结算对话框显示状态
const TT_Settle = ref(`结算${BIZ_name}`) // 结算标题
const FD_Settle = ref({}) // 结算表单数据
const FORM_Settle = ref(null) // 交易表单
const ACT_SettleTrade = (row) => {
    // 查询交易详情
    $Requests.post('/cornXinPurchase/getTradeDetail', row)
        .then(response => {
            if (response.code === 200) {
                if (response.data.tradeStatus !== '待结算') {
                    ElMessage.warning('只能结算待结算的交易');
                    return;
                }
                // 成功获取交易详情
                SHOW_Settle.value = true
                TT_Settle.value = `结算${BIZ_name}`
                init_FD_Trade(); // 初始化表单数据
                nextTick(() => {
                    // 重置表单数据
                    FORM_Settle.value.resetFields();
                    // 成功获取交易详情
                    FD_Settle.value = response.data;
                    FD_Settle.value.actualClearingDate = new Date().toISOString().slice(0, 10); // 设置实际结算日期为今天
                })
            }
        })
}

const rules_settle = {
    tradeDate: [
        { required: true, message: '请选择交易日期', trigger: 'change' }
    ],
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
                settleTrade();
            }).catch(() => {
                // 取消结算
                return false;
            });
        } else {
            settleTrade()
        }

    });
}

const settleTrade = () => {
    // 计算结算金额
    FD_Settle.value.clearingAmount = calculateSettle.value.clearingAmount;
    // 提交结算
    $Requests.post('/cornXinPurchase/settleTrade', FD_Settle.value, { showSuccessMsg: true })
        .then(response => {
            if (response.code === 200) {
                SHOW_Settle.value = false;
                ACT_pageQuery();
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
    FD_Trade.value.sellerInfo = item
    // 判断地址列表是否是数组
    if (Array.isArray(item.addressList) && item.addressList.length > 0) {
        FD_Trade.value.address = item.addressList[0].address
    }
}

const getPersonAddressList = (queryString, cb) => {
    if (!likePersonList.value || likePersonList.value.length === 0) {
        return cb([])
    }
    // 获取手机号对应人员的地址列表
    for (const person of likePersonList.value) {
        if (person.phoneNum === FD_Trade.value.sellerInfo.phoneNum) {
            // 找到对应人员
            const addressList = []
            for (const item of person.addressList) {
                addressList.push({
                    value: item.address,
                    label: item.address
                })
            }
            return cb(addressList)
        }
    }
    return cb([])
}

const ACT_deleteTrade = (trade) => {
    ElMessage.warning('删除交易功能暂未开放, 请联系管理员');
}


const BIZ_name = '玉米芯收购'
const SHOW_print = ref(false);
const printConfig = {
    id: 'printArea',
    popTitle: `${BIZ_name}模板`, // 空标题避免浏览器默认标题
    originalTitle: document.title, // 保存原始标题
    extraHead: ` 
    <style>
      /* 设置横向布局 */
      @page {
        size: A4; /* landscape 表示横向 */
        margin: 0;
      }
      
      body {
        /* 横向尺寸：297mm宽 x 210mm高 */
        width: 200mm !important;
        max-width: 200mm !important;
        min-width: 200mm !important;
        height: 287mm !important;
        max-height: 287mm !important;
        min-height: 287mm !important;
        padding: 5mm;
        box-sizing: border-box; /* 确保padding不影响尺寸 */
        font-size: 14px !important;
      }

        /* 强制打印背景色 */
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

        
      /* 隐藏不需要的元素 */
      .no-print {
        display: none !important;
      }


    </style>
  `,
    beforeOpenCallback: () => {
        // console.log('开始打印前准备');
        // 打印前修改页面标题（用于PDF文件名）
        document.title = printConfig.popTitle;
    },
    closeCallback: () => {
        // console.log('打印窗口已关闭');
        // 打印后恢复原始标题
        document.title = printConfig.originalTitle;
    }
};





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
                    <el-button type="success" @click="SHOW_print = true">模板打印</el-button>
                    <el-button type="primary" @click="ACT_SHOW_addTrade"
                        v-if="['sysAdmin', 'manager', 'operator'].includes(loginUserStore.loginUser.roleCode)">新增交易</el-button>
                </div>
            </div>
            <div class="field-filter" v-if="SHOW_fieldFilter" v-click-outside="() => SHOW_fieldFilter = false">
                <el-checkbox-group v-model="FLD_field" style="display: flex; flex-wrap: wrap;">
                    <el-checkbox-button v-for="(field, index) in DEALED_TDS_CornXinPurchase" :key="index"
                        :value="field.columnName">
                        {{ field.columnComment }}
                    </el-checkbox-button>
                </el-checkbox-group>
            </div>
        </template>


        <!-- 搜索表单 -->
        <el-form inline ref="FORM_Search" :model="QUERY_Main.params" label-width="100px" class="search-form">

            <el-form-item label="交易日期" prop="tradeDate">
                <el-date-picker v-model="QUERY_Main.params.tradeDate" value-format="YYYY-MM-DD" />
            </el-form-item>


            <el-form-item label="出售人" prop="seller">
                <el-input v-model="QUERY_Main.params.seller"></el-input>
            </el-form-item>

            <el-form-item label="交易状态" prop="tradeStatus">
                <el-select v-model="QUERY_Main.params.tradeStatus" clearable>
                    <el-option v-for="(item) in OPT_tradeStatus" :key="item" :label="item" :value="item"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item class="search-btn">
                <el-button type="primary" @click="ACT_pageQuery">搜索</el-button>
                <el-button @click="FORM_Search.resetFields()">重置</el-button>
            </el-form-item>
        </el-form>


        <el-table :data="TD_List" style="width: 100%">
            <el-table-column type="index" width="60" />
            <!-- <el-table-column label="交易日期" prop="tradeDate" width="120"></el-table-column>
            <el-table-column label="出售人" prop="sellerName" width="120"></el-table-column> -->
            <el-table-column v-for="field in FLDTDS_CornXinPurchase" :key="field.columnName"
                :label="field.columnComment" :prop="field.columnName">
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
                    <el-icon color="#409EFF" style="margin: 0 3px;"
                        v-if="row.dataStatus == 0 && row.tradeStatus == '收购中'" @click="ACT_EditTrade(row)">
                        <Edit />
                    </el-icon>
                    <el-icon color="#F56C6C" style="margin: 0 3px;" @click="ACT_deleteTrade(row)"
                        v-if="row.dataStatus == 0 && row.tradeStatus == '收购中' && ['manager'].includes(loginUserStore.loginUser.roleCode)">
                        <Delete />
                    </el-icon>
                    <el-icon color="#E6A23C" style="margin: 0 3px;" @click="ACT_SettleTrade(row)"
                        v-if="['manager'].includes(loginUserStore.loginUser.roleCode) && row.tradeStatus == '待结算'">
                        <SVG_Settle />
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

        <!-- 新增 -->
        <el-drawer v-model="SHOW_Drawer" :title="TT_Drawer" direction="rtl" size="80%">
            <el-form ref="FORM_Trade" :model="FD_Trade" label-width="110px" :rules="rules"
                :disabled="TT_Drawer == `${BIZ_name}详情`">
                <el-row>
                    <el-form-item label="交易日期" prop="tradeDate" v-inline-flex>
                        <el-date-picker v-model="FD_Trade.tradeDate" value-format="YYYY-MM-DD">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="单价" prop="unitPrice" v-inline-flex>
                        <el-input v-model="FD_Trade.unitPrice" v-input-double @paste.prevent>
                            <template #append>元/斤</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="结算方式" prop="clearingForm" v-inline-flex>
                        <el-radio-group v-model="FD_Trade.clearingForm">
                            <el-radio-button v-for="(value, index) in OPT_clearingForm" :value="value" :key="value">
                                {{ value }}
                            </el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="计划结算日期" prop="planClearingDate" v-inline-flex
                        v-if="FD_Trade.clearingForm == '延结'">
                        <el-date-picker v-model="FD_Trade.planClearingDate" value-format="YYYY-MM-DD">
                        </el-date-picker>
                    </el-form-item>
                </el-row>



                <el-row>

                    <el-form-item label="霉菌率" prop="qualityMouldRate" v-inline-flex>
                        <el-input v-model="FD_Trade.qualityMouldRate"></el-input>
                    </el-form-item>
                    <el-form-item label="湿度" prop="qualityHumidity" v-inline-flex>
                        <el-input v-model="FD_Trade.qualityHumidity"></el-input>
                    </el-form-item>
                    <el-form-item label="杂质" prop="impurity" v-inline-flex="50">
                        <el-radio-group v-model="FD_Trade.impurity">
                            <el-radio-button v-for="(item) in OPT_impurity" :key="item" :label="item"
                                :value="item"></el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </el-row>


                <el-row v-if="TT_Drawer === `${BIZ_name}详情`">
                    <el-form-item label="总重量" prop="totalWeight" v-inline-flex>
                        <el-input v-model="FD_Trade.totalWeight" v-input-double disabled>
                            <template #append>kg</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="总价" prop="totalPrice" v-inline-flex>
                        <el-input v-model="FD_Trade.totalPrice" v-input-double disabled>
                            <template #append>元</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="交易状态" prop="tradeStatus" v-inline-flex>
                        <el-select v-model="FD_Trade.tradeStatus" clearable>
                            <el-option v-for="(item) in OPT_tradeStatus" :key="item" :label="item"
                                :value="item"></el-option>
                        </el-select>
                    </el-form-item>
                </el-row>
                <el-row v-if="TT_Drawer === `${BIZ_name}详情`">
                    <el-form-item label="实际结算日期" prop="actualClearingDate" v-inline-flex>
                        <el-date-picker v-model="FD_Trade.actualClearingDate" value-format="YYYY-MM-DD">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="补价" prop="premium" v-inline-flex>
                        <el-input v-model="FD_Trade.premium" v-input-double @paste.prevent>
                            <template #append>元</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="实际结算金额" prop="clearingAmount">
                        <el-input v-model="FD_Trade.clearingAmount"></el-input>
                    </el-form-item>
                </el-row>



                <el-form-item label="备注" prop="remark">
                    <el-input v-model="FD_Trade.remark" type="textarea" autosize></el-input>
                </el-form-item>

                <el-divider content-position="left" style="margin-top: 70px;">出售人</el-divider>

                <!-- <el-form-item label="手机号" prop="sellerInfo.phoneNum" style="width: 25%;display: inline-flex;">
                    <el-input v-model="FD_Trade.sellerInfo.phoneNum" v-input-int></el-input>
                </el-form-item> -->
                <el-form-item label="手机号" prop="sellerInfo.phoneNum" v-inline-flex>
                    <el-autocomplete v-model="FD_Trade.sellerInfo.phoneNum"
                        :fetch-suggestions="(queryString, cb) => getPersonLike(queryString, cb, 'phoneNum')"
                        @select="handleSelectPerson" :trigger-on-focus="false" :hide-loading="true">
                        <template #default="{ item }">
                            <div style="display: flex; width: 500px;">
                                <div style="width: 200px;">{{ item.phoneNum }}</div>
                                <div style="width: 200px;">{{ item.personName }}</div>
                            </div>
                        </template>
                    </el-autocomplete>
                </el-form-item>
                <!-- <el-form-item label="姓名" prop="sellerInfo.personName" style="width: 25%;display: inline-flex;">
                    <el-input v-model="FD_Trade.sellerInfo.personName"></el-input>
                </el-form-item> -->
                <el-form-item label="姓名" prop="sellerInfo.personName" v-inline-flex>
                    <el-autocomplete v-model="FD_Trade.sellerInfo.personName" placement="bottom-end"
                        :fetch-suggestions="(queryString, cb) => getPersonLike(queryString, cb, 'personName')"
                        @select="handleSelectPerson" :trigger-on-focus="false" :hide-loading="true">
                        <template #default="{ item }">
                            <div style="display: flex; width: 500px;">
                                <div style="width: 200px;">{{ item.phoneNum }}</div>
                                <div style="width: 200px;">{{ item.personName }}</div>
                            </div>
                        </template>
                    </el-autocomplete>
                </el-form-item>
                <!-- <el-form-item label="地址" prop="address" style="width: 40%;display: inline-flex;">
                    <el-input v-model="FD_Trade.address"></el-input>
                </el-form-item> -->
                <el-form-item label="地址" prop="address" v-inline-flex="50">
                    <el-autocomplete v-model="FD_Trade.address" placement="bottom-end"
                        :fetch-suggestions="getPersonAddressList">
                    </el-autocomplete>
                </el-form-item>

                <el-divider content-position="left" style="margin-top: 70px;">过磅记录</el-divider>
                <el-card>
                    <template #header>
                        <div class="header">
                            <span>过磅记录</span>
                            <div class="extra">
                                <el-button type="primary" size="small" @click="ACT_addWeight">添加</el-button>
                            </div>
                        </div>
                    </template>
                    <el-table :data="FD_Trade.list_weigh" style="width: 100%" border>
                        <el-table-column type="index" width="60" />
                        <el-table-column label="承运方" prop="carrier">
                            <template #default="{ row }">
                                <el-form-item prop="carrier" :rules="$VLD.VIT_required(row.carrier)">
                                    <el-radio-group v-model="row.carrier">
                                        <el-radio-button v-for="(value, index) in OPT_carrier" :key="value"
                                            :value="value">
                                            {{ value }}
                                        </el-radio-button>
                                    </el-radio-group>
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column label="车牌号" prop="verhicleNum">
                            <template #default="{ row }">
                                <el-input v-model="row.verhicleNum" />
                            </template>
                        </el-table-column>
                        <el-table-column label="毛重(kg)" prop="grossWeight">
                            <template #default="{ row }">
                                <el-form-item prop="grossWeight" :rules="$VLD.VIT_required(row.grossWeight)">
                                    <el-input v-model="row.grossWeight" v-input-int="1" @change="calculateTrade" />
                                </el-form-item>
                            </template>
                        </el-table-column>

                        <el-table-column label="皮重(kg)" prop="tareWeight">
                            <template #default="{ row }">
                                <el-form-item prop="tareWeight" :rules="$VLD.VIT_required(row.tareWeight)">
                                    <el-input v-model="row.tareWeight" v-input-int @change="calculateTrade" />
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column label="净重(kg)" prop="netWeight">
                            <template #default="{ row }">
                                <span :style="row.netWeight == '毛重必须大于皮重' ? { color: 'red' } : {}">
                                    {{ row.netWeight }}
                                </span>
                            </template>
                        </el-table-column>
                        <el-table-column label="备注" prop="remark">
                            <template #default="{ row }">
                                <el-input v-model="row.remark" autosize type="textarea"></el-input>
                            </template>
                        </el-table-column>
                    </el-table>
                    <template #footer>
                        <div style="display: flex; justify-content: space-between; color: #7d8087; font-size: 18px;"
                            v-if="FD_Trade.sum_weight">
                            <span>合计</span>
                            <div>
                                <span>毛重:</span>&nbsp;
                                <span>{{ FD_Trade.sum_weight.grossWeight }}</span>&nbsp;
                                <span>kg</span>
                                &nbsp;&nbsp;&nbsp;
                                <span>皮重:</span>&nbsp;
                                <span>{{ FD_Trade.sum_weight.tareWeight }}</span>&nbsp;
                                <span>kg</span>
                                &nbsp;&nbsp;&nbsp;
                                <span>净重:</span>&nbsp;
                                <span>{{ FD_Trade.sum_weight.netWeight }}</span>&nbsp;
                                <span>kg</span>
                            </div>
                        </div>
                    </template>
                </el-card>
            </el-form>

            <template #footer>
                <div
                    style="display: flex; justify-content: space-between; color: #7d8087; font-size: 18px; align-items: center;">
                    <div>
                        <span>总重量:</span>&nbsp;<span>{{ calculateTrade2.totalWeight }}&nbsp;</span><span>kg</span>
                        &nbsp;&nbsp;&nbsp;
                        <span>总价:</span>&nbsp;<span>{{ calculateTrade2.totalPrice }}&nbsp;</span><span>元</span>
                    </div>
                    <div>
                        <el-button type="primary" @click="SBM_saveTrade"
                            v-if="TT_Drawer != `${BIZ_name}详情`">保存</el-button>
                        <el-button type="primary" @click="SBM_purchaseComplete"
                            v-if="TT_Drawer != `${BIZ_name}详情`">收购完成</el-button>
                    </div>
                </div>
            </template>
        </el-drawer>
    </el-card>
    <el-dialog v-model="SHOW_Settle" :title="TT_Settle" width="1200">
        <el-form ref="FORM_Settle" :model="FD_Settle" label-width="110px" :rules="rules_settle">
            <el-row>
                <!-- 交易日期 -->
                <el-form-item label="交易日期" prop="tradeDate" v-inline-flex>
                    <el-date-picker v-model="FD_Settle.tradeDate" value-format="YYYY-MM-DD" disabled></el-date-picker>
                </el-form-item>
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

    <el-dialog v-model="SHOW_print" title="打印预览" width="70%" :show-close="false" top="0vh">
        <template #header>
            <div class="header"
                style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 12px;">
                <div class="title">
                    <el-text type="info" size="large" tag="b">
                        打印预览
                    </el-text>
                </div>
                <div class="extra">
                    <el-button type="success" v-print="printConfig">打印</el-button>
                    <el-button @click="SHOW_print = false">关闭</el-button>
                </div>
            </div>
        </template>
        <div id="printArea" class="print-paper">

            <div class="biaoge">
                <div class="biaoge-header">
                    <div class="biaoge-title">{{ BIZ_name }}模板</div>
                </div>
                <div class="biaoge-contain">
                    <div class="biaoge-row">
                        <div class="biaoge-item">
                            <div class="label">交易日期</div>
                            <div class="default"></div>
                        </div>
                        <div class="biaoge-item">
                            <div class="label">单价(元/斤)</div>
                            <div class="default"></div>
                        </div>

                        <div class="biaoge-item">
                            <div class="label">计划结算日期</div>
                            <div class="default"></div>
                        </div>
                    </div>
                    <div class="biaoge-row">

                        <div class="biaoge-item">
                            <div class="label">霉菌率</div>
                            <div class="default"></div>
                        </div>
                        <div class="biaoge-item">
                            <div class="label">湿度</div>
                            <div class="default"></div>
                        </div>
                        <div class="biaoge-item">
                            <div class="label">杂质</div>
                            <div class="default">
                                <el-radio-group>
                                    <el-radio-button v-for="(item) in OPT_impurity" :key="item" :label="item"
                                        :value="item"></el-radio-button>
                                </el-radio-group>
                            </div>
                        </div>

                    </div>
                    <div class="biaoge-row" style="height: 20mm;">
                        <div class="biaoge-item">
                            <div class="label">备注</div>
                            <div class="default"></div>
                        </div>
                    </div>
                    <el-divider content-position="left" style="margin-top: 50px;">出售人</el-divider>
                    <div class="biaoge-row">
                        <div class="biaoge-item">
                            <div class="label">手机号</div>
                            <div class="default"></div>
                        </div>
                        <div class="biaoge-item">
                            <div class="label">姓名</div>
                            <div class="default"></div>
                        </div>
                        <div class="biaoge-item">
                            <div class="label">地址</div>
                            <div class="default" style="width: 60mm;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <el-divider content-position="left" style="margin-top: 50px;">过磅记录</el-divider>

            <div class="weigh-table">
                <div class="table-row weigh-header">
                    <div class="table-cell" style="width: 5mm;">序号</div>
                    <div class="table-cell" style="width: 14mm;">承运方</div>
                    <div class="table-cell">车牌号</div>
                    <div class="table-cell">毛重(kg)</div>
                    <div class="table-cell">皮重(kg)</div>
                    <div class="table-cell">净重(kg)</div>
                    <div class="table-cell">备注</div>
                </div>
                <div class="table-row" v-for="i in 10" :key="i">
                    <div class="table-cell" style="width: 5mm;">{{ i }}</div>
                    <div class="table-cell" style="width: 14mm; color: #7d8087">
                        {{ OPT_carrier.join(' | ') }}
                    </div>
                    <div class="table-cell"></div>
                    <div class="table-cell"></div>
                    <div class="table-cell"></div>
                    <div class="table-cell"></div>
                    <div class="table-cell"></div>
                </div>
            </div>


        </div>
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