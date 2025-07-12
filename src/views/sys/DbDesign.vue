<script setup>

const TDS_TableDesign = ref([])
const TDS_TableDesignColumn = ref([])
const TDS_TableDesignSql = ref([])
const INIT_getTableDesign = () => {
    // 获取表设计
    $Requests.get('/tableDesign/getTableDesign', { params: { tableName: 's_table_design' } })
        .then((response) => {
            if (response.code === 200) {
                TDS_TableDesign.value = response.data;
            }
        })
    $Requests.get('/tableDesign/getTableDesign', { params: { tableName: 's_table_design_column' } })
        .then((response) => {
            if (response.code === 200) {
                TDS_TableDesignColumn.value = response.data;
            }
        })
    $Requests.get('/tableDesign/getTableDesign', { params: { tableName: 's_table_design_sql' } })
        .then((response) => {
            if (response.code === 200) {
                TDS_TableDesignSql.value = response.data;
            }
        })
}

const OPT_tableType = ref({})    // 表类型
const OPT_fieldType = ref([])
const OPT_YN = { "Y": "是", "N": "否" }

const INIT_getOPT = () => {
    // 获取选项
    $Requests.get('/tableDesignColumn/getOption', { params: { tableName: 's_table_design', columnName: 'table_type' } })
        .then((response) => {
            if (response.code === 200) {
                OPT_tableType.value = response.data;
            }
        })
    $Requests.get('/tableDesignColumn/getOption', { params: { tableName: 's_table_design_column', columnName: 'field_type' } })
        .then((response) => {
            if (response.code === 200) {
                OPT_fieldType.value = response.data;
            }
        })
}

onMounted(() => {
    // 页面加载时获取表设计
    INIT_getTableDesign();
    // 获取选项
    INIT_getOPT();
    // 获取表设计列表
    ACT_getTableDesignList();
})

// 过滤表设计
const Fielded_TDS_TableDesign = computed(() => {
    return TDS_TableDesign.value.filter(field => !['createUser', 'createTime', 'updateUser', 'updateTime'].includes(field.columnName))
})



const ACT_getTableDesignList = () => {

    // 获取表设计列表
    $Requests.get('/tableDesign/getTableDesignList')
        .then((response) => {
            if (response.code === 200) {
                list_tableDesign.value = response.data;
            }
        })
}



const list_tableDesign = ref([])



//控制抽屉是否显示
const SHOW_Drawer = ref(false)
const title_Drawer = ref('')

const FD_mixedTableDesign = ref({})

const init_mixedTableDesign = () => {
    FD_mixedTableDesign.value = {
        tableType: '',
        tableName: '',
        pre_tableName: '',
        sub_tableName: '',
        dataStatus: '0',
        list_tableDesignColumn: [],
        list_uniqueKey: [],
        last_tableDesignSql: {}
    }
}

const ACT_showTableDesign = (row) => {
    $Requests.get('/tableDesign/getTableDesignDetail', {
        params: { tableName: row.tableName }
        // signal: controller.signal,
        // timeout: 5000
    }).then((response) => {
        if (response.code !== 200) {
            return
        }
        SHOW_Drawer.value = true
        title_Drawer.value = '表设计详情'
        init_mixedTableDesign()
        nextTick(() => {
            FORM_addTable.value.resetFields()
            FD_mixedTableDesign.value = response.data
            FD_mixedTableDesign.value.sub_tableName = response.data.tableName.substring(response.data.tableName.indexOf('_') + 1)
            // mixedTableDesign.value.pre_tableName = response.data.tableName.substring(0, response.data.tableName.indexOf('_'))
        })
    })
}

const ACT_editTableDesign = (tableName) => {
    $Requests.get('/tableDesign/getTableDesignDetail', {
        params: { tableName: tableName }
    }).then((response) => {
        if (response.code !== 200) {
            return
        }
        SHOW_Drawer.value = true
        title_Drawer.value = '修改表设计'
        init_mixedTableDesign()
        nextTick(() => {
            FORM_addTable.value.resetFields()
            FD_mixedTableDesign.value = response.data
            FD_mixedTableDesign.value.sub_tableName = response.data.tableName.substring(response.data.tableName.indexOf('_') + 1)
        })
    }).catch(err => {
        console.log(err);
    })
}

const ACT_addTable = () => {
    SHOW_Drawer.value = true
    title_Drawer.value = '新增表'
    init_mixedTableDesign()
    nextTick(() => {
        FORM_addTable.value.resetFields()
    })
}



const dealWithMixedTableDesignBeforeSBM = () => {
    // 处理 mixedTableDesign 的数据, 确保提交前的数据格式正确
    for (const tableDesignColumn of FD_mixedTableDesign.value.list_tableDesignColumn) {
        const fieldEnumArray = tableDesignColumn.fieldEnumArray
        if (fieldEnumArray && fieldEnumArray.length) {
            tableDesignColumn.fieldEnum = fieldEnumArray.join(',')
        } else {
            tableDesignColumn.fieldEnum = null
        }
    }

    for (const uniqueKey of FD_mixedTableDesign.value.list_uniqueKey) {
        uniqueKey.uniqueKeyColumn = uniqueKey.uniqueKeyColumnArray.join(',')
    }
}

/**
 * 提交保存表设计
 */
const SBM_saveTableDesign = () => {
    FORM_addTable.value.validate((valid, fields) => {
        if (!valid) {
            ElMessage.warning('请检查输入项');
            return false
        }

        dealWithMixedTableDesignBeforeSBM()

        // 调用接口保存数据库设计
        $Requests.post('/tableDesign/saveTableDesign', FD_mixedTableDesign.value, { showSuccessMsg: true })
            .then((response) => {
                if (response.code === 200) {
                    // 保存成功, 刷新列表
                    SHOW_Drawer.value = false
                    ACT_getTableDesignList()
                }
            })
    })

}

/**
 * 提交建表
 */
const SBM_createTableAndEntity = () => {
    FORM_addTable.value.validate((valid, fields) => {
        if (!valid) {
            ElMessage.warning('请检查输入项');
            return false
        }
        ElMessageBox.confirm(
            '警告, 建表后表名不可再次修改, 是否建表?',
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        ).then(() => {

            dealWithMixedTableDesignBeforeSBM()

            // 调用接口,完成建表
            $Requests.post('/tableDesign/createTableAndEntity', FD_mixedTableDesign.value, { showSuccessMsg: true })
                .then((response) => {
                    if (response.code === 200) {
                        // 跳转首页
                        SHOW_Drawer.value = false
                        ACT_getTableDesignList()
                    }
                })
        })
    })

}

/**
 * 提交删除表
 */
const SBM_deleteTableDesign = (row) => {

    ElMessageBox.confirm(
        '警告, 确定要删除这个表设计吗?',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        // 调用接口,完成登录
        $Requests.post('/tableDesign/deleteTableDesign', row, { showSuccessMsg: true })
            .then((response) => {
                if (response.code === 200) {
                    ACT_getTableDesignList()
                }
            })
    })

}

/**
 * 提交新增列
 */
const SBM_addColumn = (row, index) => {
    FORM_addTable.value.validate((valid, fields) => {
        if (!valid) {
            ElMessage.warning('请检查输入项');
            return false
        }

        // 弹窗确认操作
        ElMessageBox.confirm(
            '添加字段前, 请先提交代码到Git?',
            '提示',
            {
                confirmButtonText: '添加字段',
                cancelButtonText: '取消',
                type: 'warning',
            }
        ).then(() => {

            const fieldEnumArray = row.fieldEnumArray
            if (fieldEnumArray && fieldEnumArray.length) {
                row.fieldEnum = fieldEnumArray.join(',')
            } else {
                row.fieldEnum = null
            }

            row.tableId = FD_mixedTableDesign.value.tableId
            row.tableName = FD_mixedTableDesign.value.tableName

            $Requests.post('/tableDesign/addColumn', row, { showSuccessMsg: true })
                .then((response) => {
                    if (response.code === 200) {
                        // 添加列成功, 刷新编辑页面
                        FD_mixedTableDesign.value.list_tableDesignColumn[index] = response.data
                    }
                })
        })


    })

}

/**
 * 提交修改列
 */
const SBM_changeColumn = (row, index) => {
    FORM_addTable.value.validate((valid, fields) => {
        if (!valid) {
            ElMessage.warning('请检查输入项');
            return false
        }

        const fieldEnumArray = row.fieldEnumArray
        if (fieldEnumArray && fieldEnumArray.length) {
            row.fieldEnum = fieldEnumArray.join(',')
        } else {
            row.fieldEnum = null
        }

        row.tableId = FD_mixedTableDesign.value.tableId
        row.tableName = FD_mixedTableDesign.value.tableName

        $Requests.post('/tableDesign/changeColumn', row, { showSuccessMsg: true })
            .then((response) => {
                if (response.code === 200) {
                    // 修改列成功, 刷新编辑页面
                    FD_mixedTableDesign.value.list_tableDesignColumn[index] = response.data
                }
            })

    })

}


const FORM_addTable = ref(null);

//定义表单校验规则
const rules = {
    tableType: [
        { required: true, message: '请选择表类型', trigger: 'change' }
    ],
    sub_tableName: [
        { required: true, message: '请输入表名', trigger: 'change' },
        { min: 3, max: 40, message: '长度为3~40位单词下划线拼接', trigger: 'change' }
    ],
    tableComment: [
        { required: true, message: '请输入表注释', trigger: 'change' }
    ]
}




// 监听 B 和 C 的变化，自动更新 A
watch([() => FD_mixedTableDesign.value.tableType, () => FD_mixedTableDesign.value.sub_tableName], ([type, sub]) => {

    let pre_tableName = type ? type + '_' : ''
    FD_mixedTableDesign.value.pre_tableName = pre_tableName
    FD_mixedTableDesign.value.tableName = pre_tableName + sub
}, { immediate: true })

const handleBlur = (event) => {
    const nativeInput = event.target; // 直接从事件对象获取DOM元素
    // 1. 直接修改DOM值
    nativeInput.value = nativeInput.value.replace(/_+$/g, '');
    // 2. 强制触发input事件保持响应式同步
    nativeInput.dispatchEvent(new Event('input'));
};


//添加列
const ACT_addColumn = () => {
    FD_mixedTableDesign.value.list_tableDesignColumn.push(
        {
            dataStatus: '0',
            fieldIndex: '',
            columnName: '',
            columnComment: '',
            keyYn: 'N',
            nullAbleYn: 'N',
            fieldType: '',
            fieldLength: '',
            fieldEnumArray: [],
            tempEnum: '',
            editingIndex: '',
            needLength: false,
            canEnum: false
        },
    );
}

//修改列类型事件(控制长度的输入)
const fieldTypeChange = (row, val) => {
    if (["varchar", "char"].includes(val)) {
        row.needLength = true;
        row.canEnum = true;
    } else {
        row.needLength = false;
        row.canEnum = false;
    }
    row.fieldLength = ''
    row.fieldEnumArray = []
    row.defaultValue = ''
}

//修改列是否主键事件(控制是否可控)
const CHG_keyYn = (row, val) => {
    if (val == "Y") {
        row.nullAbleYn = "N";
    }
}

//删除字段
const ACT_deleteColumn = (row, index) => {
    FD_mixedTableDesign.value.list_tableDesignColumn.splice(index, 1)
}


//修改字段
const ACT_changeColumn = (row, index) => {
    FD_mixedTableDesign.value.tempColumn = $Com.deepClone(row);
    row.dataStatus = '3'
}

//取消修改/新增字段
const ACT_cancelChangeColumn = (row, index) => {
    FD_mixedTableDesign.value.list_tableDesignColumn[index] = FD_mixedTableDesign.value.tempColumn
}

//添加枚举
const addEnum = (row) => {
    if (!row.fieldEnumArray) {
        row.fieldEnumArray = []
    }
    row.fieldEnumArray.push('')
    editEnum(row, '', row.fieldEnumArray.length - 1);
}
//编辑枚举
const editEnum = (row, tag, index) => {
    row.tempEnum = tag;
    row.editingIndex = index;
}
//删除枚举
const delete_Enum = (row, tag, index) => {
    row.editingIndex = ''
    row.fieldEnumArray.splice(index, 1)
    row.tempEnum = ''
}
//取消修改枚举
const cancelModify_Enum = (row, tag, index) => {
    if (!tag) {
        row.fieldEnumArray.splice(index, 1)
    }
    row.editingIndex = ''
    row.tempEnum = ''
}
//确认枚举
const confirm_Enum = (row, tag, index) => {
    let tempEnum = row.tempEnum.replace(/-+$/g, '');
    // 值为空则删除枚举
    if (!tempEnum) {
        delete_Enum(row, tag, index)
        return
    }
    // 值未变则退出
    if (tempEnum == tag) {
        row.editingIndex = ''
        row.tempEnum = ''
        return
    }
    if (row.fieldEnumArray.includes(tempEnum)) {
        ElMessage.warning('相同的枚举已存在, 请重新输入');
        return
    }

    // 获取已有枚举类型
    let enumType = '';
    for (const item of row.fieldEnumArray) {
        if (item) {
            enumType = 'set'
        }
        if (item.includes('-')) {
            enumType = 'map'
            break
        };
    }

    if (enumType == 'map') {
        if (!tempEnum.includes('-')) {
            ElMessage.warning('已有枚举格式为key-value形式, 请保持格式一致');
            return
        }
        const keyList = row.fieldEnumArray.filter((_, i) => i !== index) // 排除指定索引
            .map(item => item.split('-')[0]);
        if (keyList.includes(tempEnum.split('-')[0])) {
            ElMessage.warning('key重复, 请重新输入');
            return
        }
        const valueList = row.fieldEnumArray.filter((_, i) => i !== index) // 排除指定索引
            .map(item => item.split('-')[1]);
        if (valueList.includes(tempEnum.split('-')[1])) {
            ElMessage.warning('value重复, 请重新输入');
            return
        }
    }

    if (enumType == 'set') {
        if (tempEnum.includes('-')) {
            ElMessage.warning('已有枚举格式是单体形式, 不要使用key-value形式');
            return
        }
    }
    row.editingIndex = ''
    row.fieldEnumArray[index] = tempEnum
    row.tempEnum = ''
}


//添加唯一约束
const ACT_addUniqueKey = () => {
    if (FD_mixedTableDesign.value.list_tableDesignColumn.length == 0) {
        ElMessage.warning('请先添加字段');
        return;
    }
    if (!FD_mixedTableDesign.value.list_uniqueKey) {
        FD_mixedTableDesign.value.list_uniqueKey = [];
    }
    FD_mixedTableDesign.value.list_uniqueKey.push({
        dataStatus: '0',
        uniqueKeyName: '新建唯一约束',
        uniqueKeyColumnArray: [],
        uniqueKeyColumn: '',
    });
}

//删除唯一约束
const ACT_deleteUniqueKey = (row, index) => {
    FD_mixedTableDesign.value.list_uniqueKey.splice(index, 1)
}

/**
 * 提交新增唯一约束
 */
const SBM_addUniqueKey = (row, index) => {
    FORM_addTable.value.validate((valid, fields) => {
        if (!valid) {
            ElMessage.warning('请检查输入项');
            return false
        }


        const key = FD_mixedTableDesign.value.list_tableDesignColumn.filter((item) => item.keyYn == 'Y').map((item) => item.columnName)
        if ($Com.arraysEqual(key, row.uniqueKeyColumnArray)) {
            ElMessage.warning('唯一约束不能与主键重复');
            return false
        }


        const uniqueKeys = FD_mixedTableDesign.value.list_uniqueKey.filter((item) => item.dataStatus == '1').map((item) => item.uniqueKeyColumnArray)
        for (const uniqueKey of uniqueKeys) {
            if ($Com.arraysEqual(uniqueKey, row.uniqueKeyColumnArray)) {
                ElMessage.warning('唯一约束不能与已存在的唯一约束重复');
                return false
            }
        }

        row.uniqueKeyColumn = row.uniqueKeyColumnArray.join(',')
        row.tableId = FD_mixedTableDesign.value.tableId
        row.tableName = FD_mixedTableDesign.value.tableName

        // 调用接口, 完成添加唯一约束
        $Requests.post('/tableDesign/addUniqueKey', row, { showSuccessMsg: true })
            .then((response) => {
                if (response.code === 200) {
                    // 添加列成功, 刷新编辑页面
                    FD_mixedTableDesign.value.list_uniqueKey[index] = response.data
                }
            })

    })

}


/**
 * 提交删除唯一约束
 */
const SBM_deleteUniqueKey = (row, index) => {
    ElMessageBox.confirm(
        '警告, 确定要删除这个唯一约束吗?',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {

        row.tableName = FD_mixedTableDesign.value.tableName

        // 调用接口,完成登录
        $Requests.post('/tableDesign/deleteUniqueKey', row, { showSuccessMsg: true })
            .then((response) => {
                if (response.code === 200) {
                    FD_mixedTableDesign.value.list_uniqueKey.splice(index, 1);
                }
            })
    })
}


const DLG_lastSql = ref(false);

// 查看最新建表SQL
const ACT_showLastSql = () => {
    $Requests.get('/tableDesignSql/getLastTableDesignSql', { params: { tableId: FD_mixedTableDesign.value.tableId } })
        .then((response) => {
            if (response.code === 200) {
                FD_mixedTableDesign.value.last_tableDesignSql = response.data;
                if (!FD_mixedTableDesign.value.last_tableDesignSql || !FD_mixedTableDesign.value.last_tableDesignSql.lastCreateSql) {
                    ElMessage.warning('没有上次生成的SQL');
                    return;
                }
                DLG_lastSql.value = true;
            }
        })

}



// 核心复制逻辑
const handleCopy = async () => {
    // 现代浏览器方案（优先使用）
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(FD_mixedTableDesign.value.last_tableDesignSql.lastCreateSql);
        ElMessage.success('SQL已复制到剪贴板');
        DLG_lastSql.value = false
    }
};


const DLG_generateTD = ref(false);

const tableName = ref('');

const ACT_generateTD = () => {
    DLG_generateTD.value = true
    tableName.value = ''
}

/**
 * 提交从现有表生成表设计
 */
const SBM_generateTD = () => {
    if (!tableName.value || tableName.value.trim() === '') {
        ElMessage.warning('请输入现有表名');
        return false
    }

    $Requests.get('/tableDesign/generateTableDesign', { params: { tableName: tableName.value }, showSuccessMsg: true })
        .then((response) => {
            if (response.code === 200) {
                DLG_generateTD.value = false
                ACT_getTableDesignList()
            }
        })
}



// 定义可复用的校验函数（接收额外参数）
const VIT_required = (param) => {
    return {
        validator: (rule, value, callback) => {

            if (Array.isArray(param) && param.length === 0) {
                callback(new Error('请至少选择一项'));
                return;
            }

            if (!param) {
                callback(new Error());
            } else {
                callback();
            }
        }
    }
}

const VIT_notExist = () => {
    return {
        validator: (rule, value, callback) => {
            callback(new Error());
        }
    }
}

</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>数据库管理</span>
                <div class="extra">
                    <el-button type="primary" @click="ACT_getTableDesignList">刷新</el-button>
                    <el-button type="primary" @click="ACT_addTable">新增表</el-button>
                    <el-button type="primary" @click="ACT_generateTD">从现有表生成表设计</el-button>
                </div>
            </div>
        </template>
        <!-- show-overflow-tooltip -->
        <el-table :data="list_tableDesign" border style="width: 100%">
            <el-table-column width="55px" label="序号" type="index"> </el-table-column>
            <el-table-column v-for="field in Fielded_TDS_TableDesign" :key="field.columnName"
                :label="field.columnComment" :prop="field.columnName">
                <template #default="{ row }" v-if="field.type == 'lv'">
                    {{ field.lvs[row[field.columnName]] }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
                <template #default="{ row }">
                    <el-icon style="margin: 0 3px;" @click="ACT_showTableDesign(row)">
                        <Tickets />
                    </el-icon>
                    <el-icon color="#409eff" style="margin: 0 3px;" @click="ACT_editTableDesign(row.tableName)">
                        <Edit />
                    </el-icon>
                    <el-icon color="#f56c6c" style="margin: 0 3px;" @click="SBM_deleteTableDesign(row)"
                        v-if="row.dataStatus == '0'">
                        <Delete />
                    </el-icon>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>
        {{ TDS_TableDesign }}

        <!-- 抽屉 -->
        <el-drawer v-model="SHOW_Drawer" :title="title_Drawer" direction="rtl" size="90%">
            <!-- 新增表表单 -->
            <el-form ref="FORM_addTable" :model="FD_mixedTableDesign" label-width="100px" :rules="rules"
                :disabled="title_Drawer == '表设计详情'" size="small">
                <el-divider content-position="left" style="margin-top: 20px;">表信息</el-divider>

                <el-form-item class="itemOne" label="表分类" prop="tableType">
                    <el-radio-group v-model="FD_mixedTableDesign.tableType"
                        v-if="FD_mixedTableDesign.dataStatus == '0'">
                        <el-radio-button v-for="(value, key, index) in OPT_tableType" :value="key" :key="key">
                            {{ value }}
                        </el-radio-button>
                    </el-radio-group>
                    <span v-else>{{ FD_mixedTableDesign.tableType }}</span>
                </el-form-item>
                <el-form-item label="表名" prop="sub_tableName" style="width: 700px">
                    <el-input v-model="FD_mixedTableDesign.sub_tableName" placeholder="多个英文单词使用下划线拼接,长度不超过40个字符"
                        v-input-filter="{ regex: /[^0-9a-zA-Z_]/g, maxLength: 40, upOrLower: 'lower', otherMothed: (value) => value.replace(/^_+/, '').replace('__', '_') }"
                        @blur="handleBlur" v-if="FD_mixedTableDesign.dataStatus == '0'" v-input-en-only>
                        <template #prepend>{{ FD_mixedTableDesign.pre_tableName }}</template>
                    </el-input>
                    <span v-else>{{ FD_mixedTableDesign.tableName }}</span>
                </el-form-item>
                <el-form-item label="表注释" prop="tableComment" style="width: 700px">
                    <el-input v-model="FD_mixedTableDesign.tableComment" placeholder="长度不超过40个字符"
                        v-input-filter="{ maxLength: 40, notAlloweList: [' '] }"
                        v-if="FD_mixedTableDesign.dataStatus == '0'"></el-input>
                    <span v-else>{{ FD_mixedTableDesign.tableComment }}</span>
                </el-form-item>


                <!-- 字段信息 -->
                <el-divider content-position="left" style="margin-top: 70px;">字段信息</el-divider>


                <el-table :data="FD_mixedTableDesign.list_tableDesignColumn" border table-layout="auto">
                    <el-table-column label="序号" prop="fieldIndex" width="55" align="center">
                        <template #default="{ row, $index }">
                            {{ row.ordinalPosition || row.fieldIndex }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="dataStatus" label="状态" width="70" align="center">
                        <template #default="{ row }">
                            <span v-if="FD_mixedTableDesign.dataStatus == '0'">待建表</span>
                            <span v-else-if="row.dataStatus == '0'">添加中</span>
                            <span v-else-if="row.dataStatus == '1'">正常</span>
                            <!-- <span v-else-if="row.dataStatus == '2'">禁用</span> -->
                            <span v-else-if="row.dataStatus == '3'">编辑中</span>
                            <!-- <span v-else-if="row.dataStatus == '9'">废弃</span> -->
                        </template>
                    </el-table-column>
                    <el-table-column label="列名" prop="columnName" align="center">
                        <template #default="{ row }">
                            <el-form-item v-if="FD_mixedTableDesign.dataStatus == '0' || row.dataStatus != 1"
                                prop="columnName" :rules="VIT_required(row.columnName)">
                                <el-input v-model="row.columnName" @blur="handleBlur" v-input-filter="{
                                    regex: /[^0-9a-zA-Z_]/g,
                                    maxLength: 40, upOrLower: 'lower',
                                    otherMothed: (value) => value.replace(/^[_0-9]+/, '').replace('__', '_')
                                }" v-input-en-only>
                                </el-input>
                            </el-form-item>
                            <span v-else>{{ row.columnName }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="驼峰列名" prop="columnName" align="center" v-if="title_Drawer == '表设计详情'">
                        <template #default="{ row }">
                            <span>{{ $Com.toCamelCase(row.columnName) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="列注释" prop="columnComment" align="center">
                        <template #default="{ row }">
                            <el-form-item v-if="FD_mixedTableDesign.dataStatus == '0' || row.dataStatus != 1"
                                prop="columnComment" :rules="VIT_required(row.columnComment)">
                                <el-input v-model="row.columnComment"
                                    v-input-filter="{ maxLength: 40, notAlloweList: [' ', ':', ','] }">
                                </el-input>
                            </el-form-item>
                            <span v-else>{{ row.columnComment }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="是否主键" prop="keyYn" width="90" align="center">
                        <template #default="{ row }">
                            <el-form-item v-if="FD_mixedTableDesign.dataStatus == '0' || row.dataStatus != 1"
                                prop="keyYn" :rules="VIT_required(row.keyYn)">
                                <el-checkbox v-model="row.keyYn" size="large" true-value="Y" false-value="N"
                                    @change="(val) => CHG_keyYn(row, val)" />
                            </el-form-item>
                            <span v-else>{{ row.keyYn }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="是否可空" prop="nullAbleYn" width="90" align="center">
                        <template #default="{ row }">
                            <el-form-item v-if="FD_mixedTableDesign.dataStatus == '0' || row.dataStatus != 1"
                                prop="nullAbleYn" :rules="VIT_required(row.nullAbleYn)">
                                <el-switch v-model="row.nullAbleYn" inline-prompt active-text="是" active-value="Y"
                                    inactive-text="否" inactive-value="N" :disabled="row.keyYn == 'Y'" />
                            </el-form-item>
                            <span v-else>{{ row.nullAbleYn }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="字段类型" prop="fieldType" width="140" align="center">
                        <template #default="{ row }">
                            <el-form-item v-if="FD_mixedTableDesign.dataStatus == '0' || row.dataStatus != 1"
                                prop="fieldType" :rules="VIT_required(row.fieldType)">
                                <el-select v-model="row.fieldType" placeholder="请选择字段类型"
                                    @change="(val) => fieldTypeChange(row, val)">
                                    <el-option v-for="(key, index) in OPT_fieldType" :key="key" :label="key"
                                        :value="key" />
                                </el-select>
                            </el-form-item>
                            <span v-else>{{ row.fieldType }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="字段长度" prop="fieldLength" width="90" align="center">
                        <template #default="{ row }">
                            <el-form-item
                                v-if="(FD_mixedTableDesign.dataStatus == '0' || row.dataStatus != 1) && row.needLength"
                                prop="fieldLength" :rules="[VIT_required(row.fieldLength)]">
                                <el-input v-model="row.fieldLength"
                                    v-input-filter="{ regex: /[^0-9]/g, maxLength: 4, otherMothed: (value) => value.replace(/^0+/, '') }">
                                </el-input>
                            </el-form-item>

                            <span v-else>{{ row.fieldLength }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="字段枚举" prop="fieldEnumArray" align="center">
                        <template #default="{ row }">
                            <template
                                v-if="(FD_mixedTableDesign.dataStatus == '0' || row.dataStatus != 1) && row.canEnum">
                                <el-tag v-for="(tag, index) in row.fieldEnumArray" :key="index"
                                    @dblclick="editEnum(row, tag, index)">
                                    <template v-if="row.editingIndex === index">
                                        <div style="display: flex;align-items: center;margin: 0 -7px;">
                                            <el-form-item prop="tempEnum" :rules="[VIT_notExist()]">
                                                <el-input style="width: 100px;" v-model="row.tempEnum" size="small"
                                                    v-input-filter="{
                                                        maxLength: 30,
                                                        notAlloweList: [' ', ',', ';', ':'],
                                                        otherMothed: (value) => value.replace(/^-+/, '').replace('--', '-')
                                                    }" />
                                            </el-form-item>


                                            <el-icon color="#67c23a" style="margin: 0 3px;"
                                                @click="confirm_Enum(row, tag, index)">
                                                <Select />
                                            </el-icon>
                                            <el-icon color="#909399" style="margin: 0 3px;"
                                                @click="cancelModify_Enum(row, tag, index)">
                                                <Close />
                                            </el-icon>
                                            <el-icon color="#f56c6c" style="margin: 0 3px;"
                                                @click="delete_Enum(row, tag, index)">
                                                <Delete />
                                            </el-icon>
                                        </div>
                                    </template>

                                    <span v-else>{{ tag }}</span>
                                </el-tag>
                                <el-button v-if="!Number.isInteger(parseInt(row.editingIndex))" icon="Plus"
                                    @click="addEnum(row)" text type="primary"></el-button>
                            </template>
                            <el-tag v-else v-for="(tag, index) in row.fieldEnumArray" :key="index">
                                {{ tag }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <!-- <el-table-column label="默认值" prop="defaultValue" width="90" align="center">
                        <template #default="{ row }">
                            <el-form-item v-if="mixedTableDesign.dataStatus == '0' || row.dataStatus != 1"
                                prop="defaultValue">
                                <el-input v-model="row.defaultValue">
                                </el-input>
                            </el-form-item>
                            <span v-else>{{ row.defaultValue }}</span>
                        </template>
                    </el-table-column> -->
                    <el-table-column label="操作" align="center" width="170" v-if="title_Drawer != '表设计详情'">
                        <template #default="{ row, $index }">
                            <template v-if="FD_mixedTableDesign.dataStatus === '0'">
                                <el-button @click="ACT_deleteColumn(row, $index)" size="small">删除</el-button>
                            </template>
                            <template v-else>
                                <el-button @click="SBM_addColumn(row, $index)" v-if="row.dataStatus === '0'"
                                    type="primary" size="small">提交添加</el-button>
                                <el-button @click="ACT_deleteColumn(row, $index)" v-if="row.dataStatus === '0'"
                                    size="small">取消</el-button>
                                <el-button @click="ACT_changeColumn(row, $index)" v-if="row.dataStatus === '1'"
                                    size="small">修改</el-button>
                                <el-button @click="SBM_changeColumn(row, $index)" v-if="row.dataStatus === '3'"
                                    type="primary" size="small">提交修改</el-button>
                                <el-button @click="ACT_cancelChangeColumn(row, $index)" v-if="row.dataStatus === '3'"
                                    size="small">取消</el-button>
                            </template>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 唯一约束 -->
                <el-divider content-position="left" style="margin-top: 70px;">唯一约束</el-divider>

                <el-table :data="FD_mixedTableDesign.list_uniqueKey" table-layout="auto">
                    <el-table-column prop="uniqueKeyName" label="约束名称" align="center" width="150px">
                    </el-table-column>
                    <el-table-column label="约束字段" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item class="itemOne" prop="uniqueKeyColumnArray"
                                :rules="[VIT_required(row.uniqueKeyColumnArray)]">
                                <el-checkbox-group v-model="row.uniqueKeyColumnArray" :disabled="row.dataStatus != '0'">
                                    <el-checkbox-button
                                        v-for="(value, index) in FD_mixedTableDesign.list_tableDesignColumn"
                                        :value="value.columnName" :key="index">
                                        {{ value.columnName }}
                                    </el-checkbox-button>
                                </el-checkbox-group>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="170">
                        <template #default="{ row, $index }">
                            <template v-if="FD_mixedTableDesign.dataStatus === '0'">
                                <el-button @click="ACT_deleteUniqueKey(row, $index)" size="small">删除</el-button>
                            </template>
                            <template v-else>
                                <el-button @click="SBM_addUniqueKey(row, $index)" v-if="row.dataStatus === '0'"
                                    type="primary" size="small">提交添加</el-button>
                                <el-button @click="ACT_deleteUniqueKey(row, $index)" v-if="row.dataStatus === '0'"
                                    size="small">取消</el-button>
                                <el-button @click="SBM_deleteUniqueKey(row, $index)" v-if="row.dataStatus === '1'"
                                    size="small">删除</el-button>
                            </template>
                        </template>
                    </el-table-column>

                </el-table>

            </el-form>

            <template #footer>
                <div style="flex: auto">
                    <el-button type="primary" @click="ACT_addColumn()" v-if="title_Drawer != '表设计详情'">添加字段</el-button>
                    <el-button type="primary" @click="ACT_addUniqueKey()"
                        v-if="title_Drawer != '表设计详情'">添加唯一约束</el-button>
                    <el-button type="primary" @click="SBM_saveTableDesign"
                        v-if="FD_mixedTableDesign.dataStatus == '0'">保存</el-button>
                    <el-button type="primary" @click="SBM_createTableAndEntity"
                        v-if="FD_mixedTableDesign.dataStatus == '0'">创建表和实体类</el-button>
                    <el-button type="primary" @click="ACT_showLastSql"
                        v-if="FD_mixedTableDesign.dataStatus == '1'">查看最新建表语句</el-button>
                </div>
            </template>
        </el-drawer>
    </el-card>

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

    <el-dialog v-model="DLG_generateTD" title="从现有表生成表设计" width="500">
        <el-input v-model="tableName" placeholder="请输入现有表名"
            v-input-filter="{ regex: /[^0-9a-zA-Z_]/g, maxLength: 40, upOrLower: 'lower', otherMothed: (value) => value.replace(/^_+/, '').replace('__', '_') }"
            @blur="handleBlur">
        </el-input>
        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="SBM_generateTD">生成表设计</el-button>
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