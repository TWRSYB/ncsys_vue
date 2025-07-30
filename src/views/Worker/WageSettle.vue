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
            columnComment: '未结金额',
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
    const newTDS = TDS_WorkerPayClear.value.concat([
        { columnName: 'personName', columnComment: '姓名' },
        { columnName: 'phoneNum', columnComment: '手机号' },
    ])

    // 处理指定字段
    // newTDS.forEach(field => {})

    // 字段排序
    const orderedFields = ['clearId', 'personName', 'phoneNum', 'clearDate', 'involveDayList', 'involveDays', 'involvePay',
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
const FLD_field_WorkerPayClear = ref(['personName', 'phoneNum', 'clearDate', 'involveDays', 'involvePay'])



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



const SHOW_settleWorker = ref(false);
const FORM_settleWorker = ref(null)
const FD_settleWorker = ref({});
const Map_workerYmAttendance = ref({});



const INIT_settleWorker = () => {
    // 初始化表单
    FD_settleWorker.value = {
        workerId: '', // 工人ID
        personName: '', // 工人姓名
        phoneNum: '', // 工人手机号
        dailyPay: '', // 日工资
        lastAttendanceDate: '', // 最后出工日期
        settleDays: 0,
        settlePay: 0,
        totalDays: 0,
        totalPay: 0,
        unSettleDays: 0,
        unSettlePay: 0,
        // // 以上来自于工人信息, 以下为表单数据
        // settleRange: [],
        // clearDate: '', // 结算日期
        // involveDayList: '', // 涉及日期列表
        // involveDays: 0, // 涉及天数
        // involvePay: 0, // 涉及金额
        // premium: 0, // 补价
        // clearingAmount: 0, // 结算金额
        // remark: '' // 备注
    }
};

const ACT_ToSettle = (row) => {
    if (row.unSettleDays === 0) {
        return ElMessage.warning('该工人没有可结算的天数');
    }
    INIT_settle()
    INIT_settleWorker()
    FD_settleWorker.value = $Com.deepCopy(row);
    FD_settleWorker.value.remark = ''
    // FD_Settle.value.workerId = row.workerId
    // FD_Settle.value.clearDate = $Com.getYMD()
    // // 查询员工所有的出工记录
    // $Requests.post('/workerAttendance/getWorkerAllAttendance', FD_settleWorker.value)
    //     .then((response) => {
    //         if (response.code === 200) {
    //             // 获取员工所有的出勤记录成功, 显示结算页面
    //             SHOW_settleWorker.value = true;
    //             LIST_workerAllAttendance.value = response.data;
    //         }
    //     })
    // 查询员工按月分组的出工记录
    $Requests.post('/workerAttendance/getWorkerAllAttendanceGroupByYm2', FD_settleWorker.value)
        .then((response) => {
            if (response.code === 200) {
                // 获取员工所有的出勤记录成功, 显示结算页面
                SHOW_settleWorker.value = true;
                Map_workerYmAttendance.value = response.data;
            }
        })
};


// const isIndeterminate = (attendanceMap) => {
//     // 判断是否有选中的
//     let hasSelected = false;
//     for (let key in attendanceMap) {
//         if (attendanceMap[key].selected) {
//             hasSelected = true;
//             break;
//         }
//     }

//     // 判断是否有未选中的
//     let hasUnSelected = false;
//     for (let key in attendanceMap) {
//         if (['待结算', '记录中'].includes(attendanceMap[key].tradeStatus) && !attendanceMap[key].selected) {

//             hasUnSelected = true;
//             break;
//         }
//     }

//     return hasSelected && hasUnSelected;

// };


// const ACT_selectAll = (attendanceMap) => {

//     // 判断有没有记录中的数据
//     let hasRecording = false;
//     Object.keys(attendanceMap).forEach((key) => {
//         if (attendanceMap[key].tradeStatus == '记录中') {
//             hasRecording = true;
//         }
//     });

//     // 判断有没有待结算的数据
//     let hasUnSettle = false;
//     Object.keys(attendanceMap).forEach((key) => {
//         if (attendanceMap[key].tradeStatus == '待结算') {
//             hasUnSettle = true;
//         }
//     });
//     // 全选
//     if (attendanceMap.selectAll) {

//         // 将待结算的数据选中
//         if (hasUnSettle) {
//             Object.keys(attendanceMap).forEach((key) => {
//                 if (attendanceMap[key].tradeStatus == '待结算') {
//                     attendanceMap[key].selected = true;
//                 }
//             });
//         }

//         // 如果有记录中的数据则提示
//         if (hasRecording) {
//             ElMessage.warning('有记录中的数据, 请先完成记录')
//         }

//     } else {

//         Object.keys(attendanceMap).forEach((key) => {
//             if (attendanceMap[key].selected) {
//                 attendanceMap[key].selected = false;
//             }
//         });
//     }

// };

const ACT_selectAll = (attendanceMap) => {

    // 如果当前为全选则改换为全不选
    if (attendanceMap.selectStatus == 'selectAll') {
        Object.keys(attendanceMap).forEach((key) => {
            if (attendanceMap[key].selected) {
                attendanceMap[key].selected = false;
            }
        });
    } else {
        Object.keys(attendanceMap).forEach((key) => {
            // 将待结算的数据选中
            if (attendanceMap[key].tradeStatus == '待结算') {
                attendanceMap[key].selected = true;
            }
            // 如果有记录中的数据则提示
            if (attendanceMap[key].tradeStatus == '记录中') {
                ACT_warnAttendance(attendanceMap[key])
                ElMessage.warning('有记录中的数据, 请先完成记录')
            }
        });
    }

};

const ACT_warnAttendance = (attendance) => {
    attendance.warning = true;
    setTimeout(() => {
        attendance.warning = false;
    }, 500);
    setTimeout(() => {
        attendance.warning = true;
    }, 1000);
    setTimeout(() => {
        attendance.warning = false;
    }, 1500);
    setTimeout(() => {
        attendance.warning = true;
    }, 2000);
    setTimeout(() => {
        attendance.warning = false;
    }, 2500);
};

const CCLT_sum = (attendanceMap) => {
    let sum = 0;
    Object.keys(attendanceMap).forEach((key) => {
        if (attendanceMap[key].tradeStatus == '待结算' && attendanceMap[key].selected) {
            sum += Number(attendanceMap[key].dayPay);
        }
    });
    return sum;
};

// 计算选中状态
const CCLT_selectStatus = (attendanceMap) => {
    // 如果没有待结算的数据则禁止选中
    if (!Object.keys(attendanceMap).some((key) => attendanceMap[key].tradeStatus == '待结算')) {
        attendanceMap.selectStatus = false;
        return attendanceMap.selectStatus;
    }

    // 判断是否有选中的
    let hasSelected = false;
    for (let key in attendanceMap) {
        if (attendanceMap[key].selected) {
            hasSelected = true;
            break;
        }
    }

    // 判断是否有未选中的
    let hasUnSelected = false;
    for (let key in attendanceMap) {
        if (['待结算', '记录中'].includes(attendanceMap[key].tradeStatus) && !attendanceMap[key].selected) {
            hasUnSelected = true;
            break;
        }
    }

    // 如果既有选中的又有未选中的则返回selectHalf
    if (hasUnSelected && hasSelected) {
        attendanceMap.selectStatus = 'selectHalf';
        return attendanceMap.selectStatus;
    }
    // 如果只有未选中的则返回selectNone
    if (hasUnSelected) {
        attendanceMap.selectStatus = 'selectNone';
        return attendanceMap.selectStatus;
    }
    // 如果只有选中的则返回selectAll
    if (hasSelected) {
        attendanceMap.selectStatus = 'selectAll';
        return attendanceMap.selectStatus;
    }
    attendanceMap.selectStatus = false;
    return attendanceMap.selectStatus;

};

const ACT_selectAllAll = () => {
    // 判断是否有记录中数据
    let hasRecording = false;
    Object.keys(Map_workerYmAttendance.value).forEach((ym) => {
        const attendanceMap = Map_workerYmAttendance.value[ym];

        Object.keys(attendanceMap).forEach((key) => {

            if (attendanceMap[key].tradeStatus == '记录中') {
                ACT_warnAttendance(attendanceMap[key])
                hasRecording = true;
            }
        });
    });
    if (hasRecording) {
        return ElMessage.warning('有记录中的数据，请先完成记录！');
    }
    Object.keys(Map_workerYmAttendance.value).forEach((ym) => {
        const attendanceMap = Map_workerYmAttendance.value[ym];
        Object.keys(attendanceMap).forEach((key) => {
            attendanceMap[key].selected = true;
        });
    });
};

const SHOW_Settle = ref(false);
const FORM_Settle = ref(null)
const FD_Settle = ref({});



const INIT_settle = () => {
    // 初始化表单
    FD_Settle.value = {
        workerId: '', // 工人ID
        clearDate: '', // 结算日期
        involveDayList: '', // 涉及日期列表
        involveDays: 0, // 涉及天数
        involvePay: 0, // 涉及金额
        premium: 0, // 补价
        clearingAmount: 0, // 结算金额
        remark: '', // 备注
        LIST_settleAttendance: [], // 结算考勤列表
        LIST_settleYmd: [], // 涉及日期列表
    }
};

const ACT_ToSettle2 = () => {

    const LIST_settleAttendance = [];
    const LIST_settleYmd = [];


    for (let ym in Map_workerYmAttendance.value) {
        const attendanceMap = Map_workerYmAttendance.value[ym];
        for (let ymd in attendanceMap) {
            if ($Com.isDateStr(ymd)) {
                const attendance = attendanceMap[ymd]
                if (attendance.tradeStatus == '待结算' && attendance.selected) {
                    LIST_settleAttendance.push(attendance)
                    LIST_settleYmd.push(ymd)
                }
            }
        }
    }

    if (LIST_settleYmd.length == 0) {
        return ElMessage.warning('请选择待结算数据')
    }


    // 获取结算日期中的最大值和最小值
    let minOfRange = LIST_settleYmd[0];
    let maxOfRange = LIST_settleYmd[0];

    for (let i = 1; i < LIST_settleYmd.length; i++) {
        if (LIST_settleYmd[i] < minOfRange) minOfRange = LIST_settleYmd[i];
        if (LIST_settleYmd[i] > maxOfRange) maxOfRange = LIST_settleYmd[i];
    }

    // 区间不能有记录中或未选中的待结算数据
    let hasRecordingInRange = false;
    let hasUnSelectInRange = false;
    if (minOfRange != maxOfRange) {
        for (let ym in Map_workerYmAttendance.value) {
            const attendanceMap = Map_workerYmAttendance.value[ym];
            for (let ymd in attendanceMap) {
                if ($Com.isDateStr(ymd)) {
                    if (ymd >= minOfRange && ymd <= maxOfRange) {
                        const attendance = attendanceMap[ymd]
                        if (attendance.tradeStatus == '记录中') {
                            ACT_warnAttendance(attendance)
                            hasRecordingInRange = true;
                        }
                        if (attendance.tradeStatus == '待结算' && !attendance.selected) {
                            ACT_warnAttendance(attendance)
                            hasUnSelectInRange = true;
                        }
                    }
                }
            }
        }
    }

    if (hasRecordingInRange || hasUnSelectInRange) {
        return ElMessage.warning('请在区间内连续选择, 且区间内不呢有未记录完成的出工记录！');
    }

    INIT_settle();
    FD_Settle.value.workerId = FD_settleWorker.value.workerId;
    FD_Settle.value.personName = FD_settleWorker.value.personName;
    FD_Settle.value.phoneNum = FD_settleWorker.value.phoneNum;
    FD_Settle.value.clearDate = $Com.getYMD();
    FD_Settle.value.LIST_settleAttendance = LIST_settleAttendance;
    FD_Settle.value.LIST_settleYmd = LIST_settleYmd;

    FD_Settle.value.involveDayList = LIST_settleYmd.join(',');
    // 计算涉及的天数
    let involveDays = 0;
    LIST_settleAttendance.forEach(attendance => {
        if (attendance.morningYn) {
            involveDays += 0.5
        }
        if (attendance.afternoonYn) {
            involveDays += 0.5
        }
    });
    FD_Settle.value.involveDays = involveDays;
    // 计算涉及金额
    let involvePay = 0;
    LIST_settleAttendance.forEach(attendance => {
        if (attendance.morningYn) {
            involvePay += Number(attendance.morningPay)
        }
        if (attendance.afternoonYn) {
            involvePay += Number(attendance.afternoonPay)
        }
    });
    FD_Settle.value.involvePay = involvePay

    SHOW_Settle.value = true;

};

const SBM_Settle = () => {
    // 表单验证
    FORM_Settle.value.validate((valid, fields) => {
        if (!valid) {
            // 表单校验不通过
            ElMessage.warning('录入和检查必要的信息后再保存');
            return false;
        }
        $Requests.post('/workerPayClear/clear', { worker: FD_settleWorker.value, settle: FD_Settle.value }, { showSuccessMsg: true })
            .then(response => {
                if (response.code === 200) {
                    SHOW_Settle.value = false;
                    SHOW_settleWorker.value = false;
                    ACT_PageQuery()
                } S
            })
    })
};

// 监听涉及金额和补价
watch(() => [FD_Settle.value.involvePay, FD_Settle.value.premium],
    (newVal, oldVal) => {
        if (FD_Settle.value.premium / FD_Settle.value.involvePay > 0.2) {
            FD_Settle.value.premium = 0
            return ElMessage.warning('补价不能超过20%');
        }
        FD_Settle.value.clearingAmount = FD_Settle.value.involvePay + FD_Settle.value.premium
    }
)



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

        <el-dialog v-model="SHOW_settleWorker" title="结算" width="1300">
            <el-form ref="FORM_settleWorker" :model="FD_settleWorker" label-width="100px" style="margin: 15px 0;">
                <el-row>
                    <el-form-item label="工人名称" prop="personName" v-inline-flex="25" required>
                        <el-input v-model="FD_settleWorker.personName" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="手机号" prop="phoneNum" v-inline-flex="25" required>
                        <el-input v-model="FD_settleWorker.phoneNum" disabled></el-input>
                    </el-form-item>

                    <el-form-item label="未结天数" prop="unSettleDays" v-inline-flex="25" required>
                        <el-input v-model="FD_settleWorker.unSettleDays" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="未结金额" prop="unSettlePay" v-inline-flex="25" required>
                        <el-input v-model="FD_settleWorker.unSettlePay" disabled></el-input>
                    </el-form-item>
                </el-row>
                <!-- <el-row>
                    <el-form-item label="结算范围" prop="settleRange" v-inline-flex="50">
                        <el-date-picker v-model="FD_settleWorker.settleRange" type="daterange" value-format="YYYY-MM-DD"
                            range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
                        </el-date-picker>
                    </el-form-item>
                </el-row> -->


            </el-form>

            <el-alert :closable="false" type="info" show-icon style="margin: 15px 0;">
                <template #default>
                    请在下面出工日历中选择连续的 <el-text type="primary">待结算</el-text> 日期, 然后点击去结算,
                    若有 <el-text type="warning">记录中</el-text> 的出工, 先完成记录
                </template>
            </el-alert>


            <div class="workerYmAttendance" style="margin: 15px 0;">
                <div class="ymRow headerRow">
                    <div class="ym">
                        <el-button @click="ACT_selectAllAll()" size="small">全选</el-button>
                    </div>
                    <div class="day" v-for="(day, index) in 31">{{ day }}</div>
                    <div class="sum">汇总</div>
                </div>
                <template v-for="(attendanceMap, ym, index) in Map_workerYmAttendance">
                    <div class="ymRow">
                        <div class="ym">
                            {{ ym }}
                            <div v-if="CCLT_selectStatus(attendanceMap)">
                                <label class="el-checkbox">
                                    <span class="el-checkbox__input" @click="ACT_selectAll(attendanceMap)" :class="{
                                        'is-checked': CCLT_selectStatus(attendanceMap) === 'selectAll',
                                        'is-indeterminate': CCLT_selectStatus(attendanceMap) === 'selectHalf'
                                    }">
                                        <span class="el-checkbox__inner">
                                        </span>
                                    </span>
                                </label>
                            </div>
                            <!-- <el-checkbox v-model="attendanceMap.selectAll" :indeterminate="isIndeterminate(attendanceMap)"
                            @change="ACT_selectAll(attendanceMap)">
                        </el-checkbox> -->
                        </div>

                        <div v-for="(day, index) in 31">
                            <div class="day" v-if="$Com.isDateStr(`${ym}-${String(day).padStart(2, '0')}`)">
                                <div v-if="attendanceMap[`${ym}-${String(day).padStart(2, '0')}`]">
                                    <div
                                        v-if="attendanceMap[`${ym}-${String(day).padStart(2, '0')}`].tradeStatus == '已结算'">
                                        <el-button class="abcd" type="info" text disabled>
                                            {{ attendanceMap[`${ym}-${String(day).padStart(2, '0')}`].dayPay }}
                                        </el-button>
                                    </div>
                                    <div
                                        v-if="attendanceMap[`${ym}-${String(day).padStart(2, '0')}`].tradeStatus == '记录中'">
                                        <el-button class="abcd" :class="{
                                            'warning': attendanceMap[`${ym}-${String(day).padStart(2, '0')}`].warning
                                        }" type="warning" style="color: #E6A23C" text disabled>
                                            {{ attendanceMap[`${ym}-${String(day).padStart(2, '0')}`].dayPay }}
                                        </el-button>
                                    </div>
                                    <div
                                        v-if="attendanceMap[`${ym}-${String(day).padStart(2, '0')}`].tradeStatus == '待结算'">
                                        <el-button class="abcd" :class="{
                                            'warning': attendanceMap[`${ym}-${String(day).padStart(2, '0')}`].warning
                                        }" type="primary"
                                            :text="!attendanceMap[`${ym}-${String(day).padStart(2, '0')}`].selected"
                                            @click="attendanceMap[`${ym}-${String(day).padStart(2, '0')}`].selected = !attendanceMap[`${ym}-${String(day).padStart(2, '0')}`].selected">
                                            {{ attendanceMap[`${ym}-${String(day).padStart(2, '0')}`].dayPay }}
                                        </el-button>
                                    </div>
                                </div>

                                <div v-else class="empty-day">无</div>
                            </div>
                            <div class="day" v-else></div>
                        </div>
                        <div class="sum">
                            {{ CCLT_sum(attendanceMap) }}
                        </div>
                    </div>
                </template>

            </div>

            <template #footer>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center;">
                        <div style="margin-right: 15px;">
                            <el-text size="large">注释 : </el-text>
                        </div>
                        <div class="item-content">
                            <el-text type="warning" size="large">
                                记录中
                            </el-text>
                            <el-text type="primary" size="large">
                                待结算
                            </el-text>
                            <el-text size="large">
                                已结算
                            </el-text>
                        </div>
                    </div>
                    <div>
                        <el-button @click="SHOW_settleWorker = false">关闭</el-button>
                        <el-button type="primary" @click="ACT_ToSettle2()">去结算</el-button>
                    </div>
                </div>
            </template>

        </el-dialog>

        <el-dialog title="结算" v-model="SHOW_Settle" width="600px">
            <el-form ref="FORM_Settle" :model="FD_Settle" label-width="100px">
                <el-form-item label="工人名称" prop="personName" v-inline-flex="50" required>
                    <el-input v-model="FD_Settle.personName" disabled></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phoneNum" v-inline-flex="50" required>
                    <el-input v-model="FD_Settle.phoneNum" disabled></el-input>
                </el-form-item>
                <el-form-item label="结算天数" prop="involveDays" v-inline-flex="50" required>
                    <el-input v-model.number="FD_Settle.involveDays" disabled></el-input>
                </el-form-item>
                <el-form-item label="结算金额" prop="involvePay" v-inline-flex="50" required>
                    <el-input v-model.number="FD_Settle.involvePay" disabled></el-input>
                </el-form-item>
                <el-form-item label="补价" prop="premium" v-inline-flex="50" required>
                    <el-input v-model.number="FD_Settle.premium"></el-input>
                </el-form-item>
                <el-form-item label="最终金额" prop="clearingAmount" v-inline-flex="50" required>
                    <el-input v-model.number="FD_Settle.clearingAmount" disabled></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="FD_Settle.remark" type="textarea" :autosize="{ minRows: 2 }"></el-input>
                </el-form-item>
            </el-form>
            {{ FD_Settle }}
            <template #footer>
                <el-button @click="SHOW_Settle = false">取消</el-button>
                <el-button type="primary" @click="SBM_Settle()">提交结算</el-button>
            </template>
        </el-dialog>


    </el-card>
</template>
<style lang="scss" scoped>
.ymRow {
    display: flex;
    height: 36px;
    // justify-content: space-between;
    align-items: center;

    .ym {
        width: 80px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        color: #777;
        // 文本不可选
        user-select: none;
        -webkit-user-select: none;
    }



    .day {
        width: 36px;
        display: flex;
        justify-content: center;
        align-items: center;

        .empty-day {
            color: #ccc;
            // 文本不可选
            user-select: none;
            -webkit-user-select: none;
        }
    }

    .sum {
        width: 60px;
        display: flex;
        justify-content: right;
        align-items: center;
    }
}

.headerRow {
    font-weight: bold;
    color: #777;
    // 文本不可选
    user-select: none;
    -webkit-user-select: none;
}

.abcd {
    min-width: 30px;
    max-width: 30px;
    min-height: 30px;
    max-height: 30px;
    padding: 0 !important;
    box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.12);
    // box-shadow: var(--el-box-shadow-dark);
    display: flex;
    align-items: center;
    justify-content: center;
}

.abcd.warning {
    // box-shadow: 0px 0px 6px rgba(250, 43, 43, 0.12);
    box-shadow: 0 0 15px rgba(255, 50, 50, 0.4);
    // box-shadow: 0px 16px 48px 16px rgba(250, 43, 43, 0.08), 0px 12px 32px rgba(250, 43, 43, 0.12), 0px 8px 16px -8px rgba(250, 43, 43, 0.16);
}
</style>