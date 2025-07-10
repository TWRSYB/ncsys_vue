<script setup>

import { useUserInfoStore } from '@/stores/userInfo';
import { computed } from 'vue';
const userInfoStore = useUserInfoStore()



const TDS_CornCobPurchase = ref([])
const TDS_CornCobPurchaseWeighRecord = ref([])

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
        tradeStates: ''
    },
    pageNum: 1,
    pageSize: 10,
    sortField: '',
    sortOrder: '',
    total: 0
})

const ACT_GetList = () => {

    $Requests.post('/cornCobPurchase/getList', QUERY_Main.value)
        .then(response => {
            if (response.code === 200) {
                // 成功获取用户列表
                TD_List.value = response.data;
                QUERY_Main.value.total = response.total;
            }
        })

}

onMounted(() => {
    // 页面加载时获取表设计
    $TDS.setTableDesign(TDS_CornCobPurchase, 't_corn_cob_purchase');
    $TDS.setTableDesign(TDS_CornCobPurchaseWeighRecord, 'ts_corn_cob_purchase_weigh_record');
    // 获取交易列表
    ACT_GetList()
})

const OPT_clearingForm = computed(() => {
    try {
        return TDS_CornCobPurchase.value.filter(item => item.columnName === 'clearingForm')[0].types
    } catch (error) {
        return {}
    }
});

const OPT_tradeStatus = computed(() => {
    try {
        return TDS_CornCobPurchase.value.filter(item => item.columnName === 'tradeStatus')[0].types
    } catch (error) {
        return []
    }
});

const OPT_YN = { "Y": "是", "N": "否" }

const OPT_carrier = computed(() => {
    try {
        return TDS_CornCobPurchaseWeighRecord.value.filter(item => item.columnName === 'carrier')[0].types
    } catch (error) {
        return {}
    }
});


// 过滤表设计
const FLDTDS_CornCobPurchase = computed(() => {
    if (userInfoStore.info.roleCode == 'sysAdmin') {
        // 如果不是管理员,则过滤掉敏感字段
        return TDS_CornCobPurchase.value.filter(field => !['qualityMouldRate', 'qualityHumidity', 'remark', 'dataStatus', 'createUser', 'createTime', 'updateUser', 'updateTime'].includes(field.columnName))
    }
    if (userInfoStore.info.roleCode == 'manager') {
        // 如果是普通用户,则过滤掉敏感字段
        return TDS_CornCobPurchase.value.filter(field => !['dataStatus', 'createUser', 'createTime', 'updateUser', 'updateTime'].includes(field.columnName))
    }
    if (userInfoStore.info.roleCode == 'operator') {
        // 如果是工人,则过滤掉敏感字段
        return TDS_CornCobPurchase.value.filter(field => !['dataStatus', 'createUser', 'createTime', 'updateUser', 'updateTime'].includes(field.columnName))
    }
    return []
})









//控制抽屉是否显示
const SHOW_addTrade = ref(false)
const FORM_Trade = ref(null)
const ACT_SHOW_addTrade = () => {

    // 显示抽屉
    SHOW_addTrade.value = true;
    init_FD_Trade(); // 初始化表单数据
    nextTick(() => {
        // 重置表单数据
        FORM_Trade.value.resetFields();
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
            address: '' // 出售人地址
        },
        qualityMouldRate: '',  // 霉菌率
        qualityHumidity: '',    // 湿度
        threshingYn: '', // 是否脱粒
        clearingForm: '', // 结算方式
        unitPrice: '', // 单价
        totalWeight: '', // 总重量
        totalPrice: '', // 总价
        premium: '', // 溢价
        remark: '', // 备注
        tradeStatus: '', // 交易状态
        list_weighBeforeThresh: [], // 称重列表
        sum_weightBeforeThresh: {
            weightCount: 0, // 称重次数
            grossWeight: 0, // 毛重
            tareWeight: 0, // 皮重
            netWeight: 0, // 净重
        },
        list_weighAfterThresh: [], // 称重列表
        sum_weightAfterThresh: {
            weightCount: 0, // 称重次数
            grossWeight: 0, // 毛重
            tareWeight: 0, // 皮重
            netWeight: 0, // 净重
        },
    }
}

const calculateTrade2 = computed(() => {
    let { threshingYn, unitPrice, sum_weightBeforeThresh, sum_weightAfterThresh } = FD_Trade.value
    if (threshingYn === 'Y') {
        // 如果脱粒
        return {
            totalWeight: sum_weightAfterThresh.netWeight,
            totalPrice: (sum_weightAfterThresh.netWeight * 2 * unitPrice).toFixed(2)
        }
    } else if (threshingYn === 'N') {
        // 如果不脱粒
        return {
            totalWeight: sum_weightBeforeThresh.netWeight,
            totalPrice: (sum_weightBeforeThresh.netWeight * 2 * unitPrice).toFixed(2)
        }
    }
    return { totalWeight: 0, totalPrice: 0 }
})


//定义表单校验规则
const rules = {
    tradeDate: [
        { required: true, message: '请选择交易日期', trigger: 'blur' }
    ],

    threshingYn: [
        { required: true, message: '请选择是否脱粒', trigger: 'change' }
    ],
    clearingForm: [
        { required: true, message: '请选择结算方式', trigger: 'change' }
    ],
    planClearingDate: [
        { required: true, message: '请选择计划结单日期', trigger: 'change' }
    ],

    unitPrice: [
        { required: true, message: '请输入单价', trigger: 'change' }
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
            // 姓名不能包含空格
            { pattern: /^[^\s]*$/, message: '姓名不能包含空格', trigger: 'change' }
        ],
    },

}


const SBM_addTrade = () => {
    // 提交新增用户前先校验表单
    FORM_Trade.value.validate((valid, fields) => {
        if (!valid) {
            // 表单校验不通过
            ElMessage.warning('请检查输入项');
            return false;
        }
        // 提交新增用户
        $Requests.post('/sys/addTrade', FD_Trade.value, { showSuccessMsg: true })
            .then(result => {
                if (result.code === 200) {
                    // 成功新增用户
                    SHOW_addTrade.value = false;
                    ACT_GetList(); // 刷新用户列表
                }
            })
    });

}

const ACT_addBeforeWeight = () => {
    FD_Trade.value.list_weighBeforeThresh.push({})
};


const ACT_addAfterWeight = () => {
    FD_Trade.value.list_weighAfterThresh.push({})
};

// 计算交易
const calculateTrade = () => {
    calculateTrade1(FD_Trade.value.list_weighBeforeThresh, FD_Trade.value.sum_weightBeforeThresh)
    calculateTrade1(FD_Trade.value.list_weighAfterThresh, FD_Trade.value.sum_weightAfterThresh)
};

const calculateTrade1 = (list, sum) => {
    sum.weightCount = 0
    sum.grossWeight = 0
    sum.tareWeight = 0
    sum.netWeight = 0
    if (list.length > 0) {
        list.forEach((row) => {
            if (row.grossWeight && row.tareWeight) {
                if (row.tareWeight >= row.grossWeight) {
                    row.netWeight = '毛重必须大于皮重'
                    return
                } else {
                    row.netWeight = row.grossWeight - row.tareWeight
                    sum.weightCount += 1
                    sum.grossWeight = sum.grossWeight + Number(row.grossWeight)
                    sum.tareWeight = sum.tareWeight + Number(row.tareWeight)
                    sum.netWeight = sum.netWeight + Number(row.netWeight)
                }
            }
        });
    }
};



</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>玉米棒收购</span>
                <div class="extra">
                    <el-button type="primary" @click="ACT_GetList">刷新</el-button>
                    <el-button type="primary" @click="ACT_SHOW_addTrade"
                        v-if="['sysAdmin', 'manager', 'operator'].includes(userInfoStore.info.roleCode)">新增交易</el-button>
                </div>
            </div>
        </template>

        <!-- 搜索表单 -->
        <el-form inline ref="FORM_Search" :model="QUERY_Main.params" label-width="100px" class="search-form">

            <el-form-item label="交易日期" prop="tradeDate">
                <el-date-picker v-model="QUERY_Main.params.tradeDate" placeholder="选择日期" value-format="YYYY-MM-DD" />
            </el-form-item>


            <el-form-item label="出售人" prop="seller">
                <el-input v-model="QUERY_Main.params.seller" placeholder="输入姓名或手机号"></el-input>
            </el-form-item>

            <el-form-item label="交易状态" prop="tradeStates">
                <el-select placeholder="请选择" v-model="QUERY_Main.params.tradeStates" clearable>
                    <el-option v-for="(item) in OPT_tradeStatus" :key="item" :label="item" :value="item"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="是否脱粒" prop="threshingYn">
                <el-select placeholder="请选择" v-model="QUERY_Main.params.threshingYn" clearable>
                    <el-option v-for="(value, key) in OPT_YN" :key="key" :label="value" :value="key"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item class="search-btn">
                <el-button type="primary" @click="ACT_GetList">搜索</el-button>
                <el-button @click="FORM_Search.resetFields()">重置</el-button>
            </el-form-item>
        </el-form>


        <el-table :data="TD_List" style="width: 100%">
            <el-table-column v-for="field in FLDTDS_CornCobPurchase" :key="field.columnName"
                :label="field.columnComment" :prop="field.columnName">
                <template #default="{ row }" v-if="field.type == 'lv'">
                    {{ field.lvs[row[field.columnName]] }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100" v-if="userInfoStore.info.roleCode == 'sysAdmin'">
                <template #default="{ row }">
                    <el-button icon="Edit" circle plain type="primary"></el-button>
                    <el-button icon="Delete" circle plain type="danger"></el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>
        {{ TDS_CornCobPurchase }}
        <br />
        {{ OPT_tradeStatus }}
        <!-- 分页条 -->
        <!-- <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[3, 5, 10, 15]"
            layout="jumper, total, sizes, prev, pager, next" background :total="total" @size-change="onSizeChange"
            @current-change="onCurrentChange" style="margin-top: 20px; justify-content: flex-end" /> -->

        <!-- 新增 -->
        <el-drawer v-model="SHOW_addTrade" title="新增收购" direction="rtl" size="80%">
            <el-form ref="FORM_Trade" :model="FD_Trade" label-width="110px" :rules="rules">
                <el-row>
                    <el-form-item label="交易日期" prop="tradeDate" v-inline-flex>
                        <el-date-picker v-model="FD_Trade.tradeDate" placeholder="交易日期" value-format="YYYY-MM-DD">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="是否脱粒" prop="threshingYn" v-inline-flex>
                        <el-radio-group v-model="FD_Trade.threshingYn">
                            <el-radio-button v-for="(value, key, index) in OPT_YN" :key="key" :value="key">{{ value
                                }}</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="结算方式" prop="clearingForm" v-inline-flex>
                        <el-radio-group placeholder="请选择" v-model="FD_Trade.clearingForm">
                            <el-radio-button v-for="(value, index) in OPT_clearingForm" :value="value" :key="value">
                                {{ value }}
                            </el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="计划结算日期" prop="planClearingDate" v-inline-flex
                        v-if="FD_Trade.clearingForm == '延结'">
                        <el-date-picker v-model="FD_Trade.planClearingDate" placeholder="选择日期"
                            value-format="YYYY-MM-DD">
                        </el-date-picker>
                    </el-form-item>
                </el-row>



                <el-row>
                    <el-form-item label="单价" prop="unitPrice" v-inline-flex>
                        <el-input v-model="FD_Trade.unitPrice" placeholder="单价" v-input-double @paste.prevent>
                            <template #append>元/斤</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="霉菌率" prop="qualityMouldRate" v-inline-flex>
                        <el-input v-model="FD_Trade.qualityMouldRate" placeholder="霉菌率"></el-input>
                    </el-form-item>
                    <el-form-item label="湿度" prop="qualityHumidity" v-inline-flex>
                        <el-input v-model="FD_Trade.qualityHumidity" placeholder="湿度"></el-input>
                    </el-form-item>
                </el-row>


                <el-form-item label="备注" prop="remark">
                    <el-input v-model="FD_Trade.remark" type="textarea" placeholder="备注" autosize></el-input>
                </el-form-item>

                <el-divider content-position="left" style="margin-top: 70px;">出售人</el-divider>

                <el-form-item label="手机号" prop="sellerInfo.phoneNum" style="width: 25%;display: inline-flex;">
                    <el-input v-model="FD_Trade.sellerInfo.phoneNum" placeholder="手机号"></el-input>
                </el-form-item>
                <el-form-item label="姓名" prop="sellerInfo.personName" style="width: 25%;display: inline-flex;">
                    <el-input v-model="FD_Trade.sellerInfo.personName" placeholder="姓名"></el-input>
                </el-form-item>
                <el-form-item label="地址" prop="sellerInfo.address" style="width: 40%;display: inline-flex;">
                    <el-input v-model="FD_Trade.sellerInfo.address" placeholder="地址"></el-input>
                </el-form-item>




                <el-divider content-position="left" style="margin-top: 70px;">过磅记录</el-divider>
                <el-card>
                    <template #header>
                        <div class="header">
                            <span>脱粒前过磅</span>
                            <div class="extra">
                                <el-button type="primary" size="small" @click="ACT_addBeforeWeight">添加</el-button>
                            </div>
                        </div>
                    </template>
                    <el-table :data="FD_Trade.list_weighBeforeThresh" style="width: 100%" border>
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
                                <el-input v-model="row.verhicleNum" placeholder="请输入车牌号" />
                            </template>
                        </el-table-column>
                        <el-table-column label="毛重(kg)" prop="grossWeight">
                            <template #default="{ row }">
                                <el-form-item prop="grossWeight" :rules="$VLD.VIT_required(row.grossWeight)">
                                    <el-input v-model="row.grossWeight" placeholder="请输入毛重" v-input-int="1"
                                        @change="calculateTrade" />
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column label="皮重(kg)" prop="tareWeight">
                            <template #default="{ row }">
                                <el-form-item prop="tareWeight" :rules="$VLD.VIT_required(row.tareWeight)">
                                    <el-input v-model="row.tareWeight" placeholder="请输入皮重" v-input-int
                                        @change="calculateTrade" />
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
                                <el-input v-model="row.remark" placeholder="请输入备注" autosize type="textarea"></el-input>
                            </template>
                        </el-table-column>
                    </el-table>
                    <template #footer>
                        <div style="display: flex; justify-content: space-between; color: #7d8087; font-size: 18px;">
                            <span>合计</span>
                            <div>
                                <span>毛重:</span>&nbsp;<span>{{ FD_Trade.sum_weightBeforeThresh.grossWeight
                                    }}&nbsp;</span><span>kg</span>
                                &nbsp;&nbsp;&nbsp;
                                <span>皮重:</span>&nbsp;<span>{{ FD_Trade.sum_weightBeforeThresh.tareWeight
                                    }}&nbsp;</span><span>kg</span>
                                &nbsp;&nbsp;&nbsp;
                                <span>净重:</span>&nbsp;<span>{{ FD_Trade.sum_weightBeforeThresh.netWeight
                                    }}&nbsp;</span><span>kg</span>
                            </div>
                        </div>
                    </template>
                </el-card>
                <el-card style="margin-top: 10px;" v-if="FD_Trade.threshingYn == 'Y'">
                    <template #header>
                        <div class="header">
                            <span>脱粒后过磅</span>
                            <div class="extra">
                                <el-button type="primary" size="small" @click="ACT_addAfterWeight">添加</el-button>
                            </div>
                        </div>
                    </template>
                    <el-table :data="FD_Trade.list_weighAfterThresh" style="width: 100%" border>
                        <el-table-column type="index" width="60" />
                        <el-table-column label="车牌号" prop="verhicleNum">
                            <template #default="{ row }">
                                <el-input v-model="row.verhicleNum" placeholder="请输入车牌号" />
                            </template>
                        </el-table-column>
                        <el-table-column label="毛重(kg)" prop="grossWeight">
                            <template #default="{ row }">
                                <el-form-item prop="grossWeight" :rules="$VLD.VIT_required(row.grossWeight)">
                                    <el-input v-model="row.grossWeight" placeholder="请输入毛重" @change="calculateTrade"
                                        v-input-int="1" />
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column label="皮重(kg)" prop="tareWeight">
                            <template #default="{ row }">
                                <el-form-item prop="tareWeight" :rules="$VLD.VIT_required(row.tareWeight)">
                                    <el-input v-model="row.tareWeight" placeholder="请输入皮重" @change="calculateTrade"
                                        v-input-int />
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
                                <el-input v-model="row.remark" placeholder="请输入备注" autosize type="textarea"></el-input>
                            </template>
                        </el-table-column>
                    </el-table>
                    <template #footer>
                        <div style="display: flex; justify-content: space-between; color: #7d8087; font-size: 18px;">
                            <span>合计</span>
                            <div>
                                <span>毛重:</span>&nbsp;<span>{{ FD_Trade.sum_weightAfterThresh.grossWeight
                                    }}&nbsp;</span><span>T</span>
                                &nbsp;&nbsp;&nbsp;
                                <span>皮重:</span>&nbsp;<span>{{ FD_Trade.sum_weightAfterThresh.tareWeight
                                    }}&nbsp;</span><span>T</span>
                                &nbsp;&nbsp;&nbsp;
                                <span>净重:</span>&nbsp;<span>{{ FD_Trade.sum_weightAfterThresh.netWeight
                                    }}&nbsp;</span><span>T</span>
                            </div>
                        </div>
                    </template>
                </el-card>


                <!-- <el-divider content-position="left" style="margin-top: 70px;">计算</el-divider>

                <el-form-item label="总重量" prop="totalWeight" v-inline-flex>
                    <el-input v-model="FD_Trade.totalWeight" placeholder="总重量"></el-input>
                </el-form-item>
                <el-form-item label="总价" prop="totalPrice" v-inline-flex>
                    <el-input v-model="FD_Trade.totalPrice" placeholder="总价"></el-input>
                </el-form-item> -->



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
                        <el-button type="primary" @click="SBM_addTrade">保存</el-button>
                        <el-button type="primary" @click="SBM_addTrade">收购结束</el-button>
                    </div>
                </div>
            </template>
            {{ FD_Trade }}
            {{ TDS_CornCobPurchaseWeighRecord }}
        </el-drawer>
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

/* 抽屉样式 */
.avatar-uploader {
    :deep() {
        .avatar {
            width: 178px;
            height: 178px;
            display: block;
        }

        .el-upload {
            border: 1px dashed var(--el-border-color);
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);
        }

        .el-upload:hover {
            border-color: var(--el-color-primary);
        }

        .el-icon.avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 178px;
            height: 178px;
            text-align: center;
        }
    }
}

.editor {
    width: 100%;

    :deep(.ql-editor) {
        min-height: 200px;
    }
}
</style>