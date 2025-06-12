<script setup>

//获取主列表
import { getTableDesignListService, getTableDesignService, saveTableDesignService } from '@/api/Db.js'

const getTableDesign = async () => {
    let result = await getTableDesignService('s_table_design');
    TD_TableDesign.value = result.data;
    result = await getTableDesignService('s_table_design_column');
    TD_TableDesignColumn.value = result.data;
    result = await getTableDesignService('s_table_design_sql');
    TD_TableDesignSql.value = result.data;
}

onMounted(() => {
    // 获取表设计
    getTableDesign();
    getTableDesignList();
}) 




const getTableDesignList = async () => {
    let result = await getTableDesignListService();

    list_tableDesign.value = result.data;
}



const list_tableDesign = ref([])

const TD_TableDesign = ref([])
const TD_TableDesignColumn = ref([])
const TD_TableDesignSql = ref([])

//控制抽屉是否显示
const visibleDrawer = ref(false)
const title_Drawer = ref('')

const mixedTableDesign = ref({})

const init_mixedTableDesign = () => {
    mixedTableDesign.value = {
        tableType: '',
        tableName: '',
        pre_tableName: '',
        sub_tableName: '',
        dataStatus: 0,
        list_tableDesignColumn: [],
        last_tableDesignSql: {}
    }
}

const show_tableDesign = (row) => {
    $Requests.get('/tableDesign/getTableDesignDetail', {
        params: { tableName: row.tableName }
        // signal: controller.signal,
        // timeout: 5000
    }).then((response) => {
        if (response.code !== 200) {
            return
        }
        visibleDrawer.value = true
        title_Drawer.value = '表设计详情'
        init_mixedTableDesign()
        nextTick(() => {
            form_addTable.value.resetFields()
            mixedTableDesign.value = response.data
            mixedTableDesign.value.sub_tableName = response.data.tableName.substring(response.data.tableName.indexOf('_') + 1)
            // mixedTableDesign.value.pre_tableName = response.data.tableName.substring(0, response.data.tableName.indexOf('_'))
        })
    }).catch(err => {
        console.log(err);
    })
}

const ACT_editTableDesign = (tableName) => {
    $Requests.get('/tableDesign/getTableDesignDetail', {
        params: { tableName: tableName }
    }).then((response) => {
        if (response.code !== 200) {
            return
        }
        visibleDrawer.value = true
        title_Drawer.value = '修改表设计'
        init_mixedTableDesign()
        nextTick(() => {
            form_addTable.value.resetFields()
            mixedTableDesign.value = response.data
            mixedTableDesign.value.sub_tableName = response.data.tableName.substring(response.data.tableName.indexOf('_') + 1)
        })
    }).catch(err => {
        console.log(err);
    })
}

const addTable = () => {
    visibleDrawer.value = true
    title_Drawer.value = '新增表'
    init_mixedTableDesign()
    nextTick(() => {
        form_addTable.value.resetFields()
    })
}





/**
 * 提交保存表设计
 */
const SBM_saveTableDesign = async () => {
    let valid = await form_addTable.value.validate((valid, fields) => {
        if (!valid) {
            ElMessage.warning('请检查输入项');
        }
        return valid
    })

    if (valid) {

        for (const tableDesignColumn of mixedTableDesign.value.list_tableDesignColumn) {
            const fieldEnumArray = tableDesignColumn.fieldEnumArray
            if (fieldEnumArray && fieldEnumArray.length) {
                tableDesignColumn.fieldEnum = JSON.stringify(fieldEnumArray)
            } else {
                tableDesignColumn.fieldEnum = null
            }
        }

        // 调用接口,完成登录
        let result = await saveTableDesignService(mixedTableDesign.value);
        ElMessage.success(result.message || '登录成功')
        // 跳转首页
        visibleDrawer.value = false
        getTableDesignList()
    }
}

/**
 * 提交建表
 */
const SBM_createTableAndEntity = () => {
    form_addTable.value.validate((valid, fields) => {
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
            for (const tableDesignColumn of mixedTableDesign.value.list_tableDesignColumn) {
                const fieldEnumArray = tableDesignColumn.fieldEnumArray
                if (fieldEnumArray && fieldEnumArray.length) {
                    tableDesignColumn.fieldEnum = JSON.stringify(fieldEnumArray)
                } else {
                    tableDesignColumn.fieldEnum = null
                }
            }

            // 调用接口,完成登录
            $Requests.post('/tableDesign/createTableAndEntity', mixedTableDesign.value)
                .then((response) => {
                    if (response.code === 200) {
                        // 跳转首页
                        visibleDrawer.value = false
                        getTableDesignList()
                    }
                })
        })
    })

}

/**
 * 提交新增列
 */
const SBM_addColumn = (row, index) => {
    form_addTable.value.validate((valid, fields) => {
        if (!valid) {
            ElMessage.warning('请检查输入项');
            return false
        }

        const fieldEnumArray = row.fieldEnumArray
        if (fieldEnumArray && fieldEnumArray.length) {
            row.fieldEnum = JSON.stringify(fieldEnumArray)
        } else {
            row.fieldEnum = null
        }

        row.tableId = mixedTableDesign.value.tableId
        row.tableName = mixedTableDesign.value.tableName

        $Requests.post('/tableDesign/addColumn', row, { showSuccessMsg: true })
            .then((response) => {
                if (response.code === 200) {
                    // 添加列成功, 刷新编辑页面
                    ACT_editTableDesign(row.tableName)
                }
            })
    })

}

/**
 * 提交修改列
 */
const SMB_modifyColumn = (row, index) => {
    form_addTable.value.validate((valid, fields) => {
        if (!valid) {
            ElMessage.warning('请检查输入项');
            return false
        }

        const fieldEnumArray = row.fieldEnumArray
        if (fieldEnumArray && fieldEnumArray.length) {
            row.fieldEnum = JSON.stringify(fieldEnumArray)
        } else {
            row.fieldEnum = null
        }

        row.tableId = mixedTableDesign.value.tableId
        row.tableName = mixedTableDesign.value.tableName

        ElMessage.warning('功能还没开发');

    })

}


const form_addTable = ref(null);

//定义表单校验规则
const rules = {
    tableType: [
        { required: true, message: '请选择表类型', trigger: 'change' }
    ],
    sub_tableName: [
        { required: true, message: '请输入表名', trigger: 'change' },
        { min: 5, max: 40, message: '长度为5~40位单词下划线拼接', trigger: 'change' }
    ],
    tableComment: [
        { required: true, message: '请输入表注释', trigger: 'change' }
    ]
}


const option_tableType = { "s": "系统表(system)", "t": "交易表(trade)", "l": "日志表(log)", "m": "主数据表(main)", "ts": "交易子表(tradesub)" }
const option_fieldType = ["varchar", "char", "int", "timestamp", "TEXT", "BLOB", "JSON"]
const option_YN = { "Y": "是", "N": "否" }



// 监听 B 和 C 的变化，自动更新 A
watch([() => mixedTableDesign.value.tableType, () => mixedTableDesign.value.sub_tableName], ([type, sub]) => {
    console.log(type, sub);

    let pre_tableName = type ? type + '_' : ''
    mixedTableDesign.value.pre_tableName = pre_tableName
    mixedTableDesign.value.tableName = pre_tableName + sub
}, { immediate: true })

const handleBlur = (event) => {
    const nativeInput = event.target; // 直接从事件对象获取DOM元素
    // 1. 直接修改DOM值
    nativeInput.value = nativeInput.value.replace(/_+$/g, '');
    // 2. 强制触发input事件保持响应式同步
    nativeInput.dispatchEvent(new Event('input'));
};


//添加列
const addColumn = () => {
    mixedTableDesign.value.list_tableDesignColumn.push(
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
    mixedTableDesign.value.list_tableDesignColumn.splice(index, 1)
}


//修改字段
const ACT_modifyColumn = (row, index) => {
    mixedTableDesign.value.tempColumn = $Com.deepClone(row);
    row.dataStatus = '3'
}

//取消修改/新增字段
const ACT_cancelChangeColumn = (row, index) => {
    mixedTableDesign.value.list_tableDesignColumn[index] = mixedTableDesign.value.tempColumn
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

// 定义可复用的校验函数（接收额外参数）
const VIT_required = (param) => {
    return {
        validator: (rule, value, callback) => {
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
                    <el-button type="primary" @click="getTableDesignList">刷新</el-button>
                    <el-button type="primary" @click="addTable">新增表</el-button>
                </div>
            </div>
        </template>
        <el-table :data="list_tableDesign" style="width: 100%">
            <el-table-column width="55px" label="序号" type="index"> </el-table-column>
            <el-table-column v-for="field in TD_TableDesign" :label="field.columnComment" :key="field.columnName"
                :prop="field.columnName"></el-table-column>
            <el-table-column label="操作" width="100">
                <template #default="{ row }">
                    <el-icon style="margin: 0 3px;" @click="show_tableDesign(row)">
                        <Tickets />
                    </el-icon>
                    <el-icon color="#409eff" style="margin: 0 3px;" @click="ACT_editTableDesign(row.tableName)">
                        <Edit />
                    </el-icon>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>
        {{ TD_TableDesign }}

        <!-- 抽屉 -->
        <el-drawer v-model="visibleDrawer" :title="title_Drawer" direction="rtl" size="90%">
            <!-- 新增表表单 -->
            <el-form ref="form_addTable" :model="mixedTableDesign" label-width="100px" :rules="rules"
                :disabled="title_Drawer == '表设计详情'">
                <el-form-item class="itemOne" label="表分类" prop="tableType">
                    <el-radio-group v-model="mixedTableDesign.tableType" v-if="mixedTableDesign.dataStatus == '0'">
                        <el-radio-button v-for="(value, key, index) in option_tableType" :value="key" :key="key">
                            {{ value }}
                        </el-radio-button>
                    </el-radio-group>
                    <span v-else>{{ mixedTableDesign.tableType }}</span>
                </el-form-item>
                <el-form-item label="表名" prop="sub_tableName">
                    <el-input v-model="mixedTableDesign.sub_tableName" placeholder="多个英文单词使用下划线拼接,长度不超过40个字符"
                        v-input-filter="{ regex: /[^0-9a-zA-Z_]/g, maxLength: 40, upOrLower: 'lower', otherMothed: (value) => value.replace(/^_+/, '').replace('__', '_') }"
                        @blur="handleBlur" v-if="mixedTableDesign.dataStatus == '0'">
                        <template #prepend>{{ mixedTableDesign.pre_tableName }}</template>
                    </el-input>
                    <span v-else>{{ mixedTableDesign.tableName }}</span>
                </el-form-item>
                <el-form-item label="表注释" prop="tableComment">
                    <el-input v-model="mixedTableDesign.tableComment" placeholder="长度不超过40个字符"
                        v-input-filter="{ maxLength: 40, notAlloweList: [' '] }"
                        v-if="mixedTableDesign.dataStatus == '0'"></el-input>
                    <span v-else>{{ mixedTableDesign.tableComment }}</span>
                </el-form-item>
                <!-- 数据 -->
                <el-table :data="mixedTableDesign.list_tableDesignColumn" table-layout="auto">
                    <el-table-column label="序号" prop="fieldIndex" width="55" align="center">
                        <template #default="{ row, $index }">
                            {{ row.ordinalPosition || row.fieldIndex }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="dataStatus" label="状态" width="100" align="center">
                        <template #default="{ row }">
                            <span v-if="mixedTableDesign.dataStatus == '0'">待建表</span>
                            <span v-else-if="row.dataStatus == '0'">添加中</span>
                            <span v-else-if="row.dataStatus == '1'">正常</span>
                            <!-- <span v-else-if="row.dataStatus == '2'">禁用</span> -->
                            <span v-else-if="row.dataStatus == '3'">编辑中</span>
                            <!-- <span v-else-if="row.dataStatus == '9'">废弃</span> -->
                        </template>
                    </el-table-column>
                    <el-table-column label="列名" prop="columnName" align="center">
                        <template #default="{ row }">
                            <el-form-item v-if="mixedTableDesign.dataStatus == '0' || row.dataStatus != 1"
                                prop="columnName" :rules="VIT_required(row.columnName)">
                                <el-input v-model="row.columnName" @blur="handleBlur" v-input-filter="{
                                    regex: /[^0-9a-zA-Z_]/g,
                                    maxLength: 40, upOrLower: 'lower',
                                    otherMothed: (value) => value.replace(/^[_0-9]+/, '').replace('__', '_')
                                }">
                                </el-input>
                            </el-form-item>
                            <span v-else>{{ row.columnName }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="列注释" prop="columnComment" align="center">
                        <template #default="{ row }">
                            <el-form-item v-if="mixedTableDesign.dataStatus == '0' || row.dataStatus != 1"
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
                            <el-form-item v-if="mixedTableDesign.dataStatus == '0' || row.dataStatus != 1" prop="keyYn"
                                :rules="VIT_required(row.keyYn)">
                                <el-checkbox v-model="row.keyYn" size="large" true-value="Y" false-value="N"
                                    @change="(val) => CHG_keyYn(row, val)" />
                            </el-form-item>
                            <span v-else>{{ row.keyYn }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="是否可空" prop="nullAbleYn" width="90" align="center">
                        <template #default="{ row }">
                            <el-form-item v-if="mixedTableDesign.dataStatus == '0' || row.dataStatus != 1"
                                prop="nullAbleYn" :rules="VIT_required(row.nullAbleYn)">
                                <el-switch v-model="row.nullAbleYn" inline-prompt active-text="是" active-value="Y"
                                    inactive-text="否" inactive-value="N" :disabled="row.keyYn == 'Y'" />
                            </el-form-item>
                            <span v-else>{{ row.nullAbleYn }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="字段类型" prop="fieldType" width="140" align="center">
                        <template #default="{ row }">
                            <el-form-item v-if="mixedTableDesign.dataStatus == '0' || row.dataStatus != 1"
                                prop="fieldType" :rules="VIT_required(row.fieldType)">
                                <el-select v-model="row.fieldType" placeholder="请选择字段类型"
                                    @change="(val) => fieldTypeChange(row, val)">
                                    <el-option v-for="(key, index) in option_fieldType" :key="key" :label="key"
                                        :value="key" />
                                </el-select>
                            </el-form-item>
                            <span v-else>{{ row.fieldType }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="字段长度" prop="fieldLength" width="90" align="center">
                        <template #default="{ row }">
                            <el-form-item
                                v-if="(mixedTableDesign.dataStatus == '0' || row.dataStatus != 1) && row.needLength"
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
                            <template v-if="(mixedTableDesign.dataStatus == '0' || row.dataStatus != 1) && row.canEnum">
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
                    <el-table-column label="操作" align="center" width="170">
                        <template #default="{ row, $index }">
                            <template v-if="mixedTableDesign.dataStatus === '0'">
                                <el-button @click="ACT_deleteColumn(row, $index)" size="small">删除</el-button>
                            </template>
                            <template v-else>
                                <el-button @click="SBM_addColumn(row, $index)" v-if="row.dataStatus === '0'"
                                    type="primary" size="small">提交添加</el-button>
                                <el-button @click="ACT_deleteColumn(row, $index)" v-if="row.dataStatus === '0'"
                                    size="small">取消</el-button>
                                <el-button @click="ACT_modifyColumn(row, $index)" v-if="row.dataStatus === '1'"
                                    size="small">修改</el-button>
                                <el-button @click="SMB_modifyColumn(row, $index)" v-if="row.dataStatus === '3'"
                                    type="primary" size="small">提交修改</el-button>
                                <el-button @click="ACT_cancelChangeColumn(row, $index)" v-if="row.dataStatus === '3'"
                                    size="small">取消</el-button>
                            </template>
                        </template>
                    </el-table-column>
                </el-table>
            </el-form>

            <template #footer>
                <div style="flex: auto">
                    <el-button type="primary" @click="addColumn()">添加字段</el-button>
                    <el-button type="primary" @click="SBM_saveTableDesign"
                        v-if="mixedTableDesign.dataStatus == '0'">保存</el-button>
                    <el-button type="primary" @click="SBM_createTableAndEntity"
                        v-if="mixedTableDesign.dataStatus == '0'">创建表和实体类</el-button>
                    <el-button type="primary" @click="SBM_createTableAndEntity('草稿')">查看最新建表语句</el-button>
                </div>
            </template>




            <br><br><br>
            {{ TD_TableDesignColumn }}
            <br><br><br>
            {{ TD_TableDesign }}
            <br><br><br>
            {{ mixedTableDesign }}
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

/* 穿透 scoped 作用域，直接修改子组件样式 */
.el-table {
    :deep(.el-form-item__content) {
        margin-left: 0 !important;
        justify-content: center;
    }

    .el-form-item {
        display: flex;
        --font-size: 14px;
        margin-bottom: 0;
    }
}
</style>