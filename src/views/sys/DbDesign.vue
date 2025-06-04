<script setup>
import { ref, watch } from 'vue'
import {
    Edit,
    Plus,
    Delete,
    Select
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
const list_tableDesign = ref([])

const TD_TableDesign = ref([])
const TD_TableDesignColumn = ref([])
const TD_TableDesignSql = ref([])

//控制抽屉是否显示
const visibleDrawer = ref(false)

const mixedTableDesign = ref({
    formData_tableDesign: {
        tableName: '',
        pre_tableName: '',
        sub_tableName: '',
        data_status: 0
    },
    list_tableDesignColumn: [],
    last_tableDesignColumn: {}
})


const option_tableType = { "s": "系统表(system)", "t": "交易表(trade)", "l": "日志表(log)", "m": "主数据表(main)", "ts": "交易子表(tradesub)" }
const option_fieldType = ["varchar", "char", "int", "timestamp", "TEXT", "BLOB"]

//获取主列表
import { getTableDesignListService, getTableDesignService } from '@/api/Db.js'
const getTableDesign = async () => {
    let result = await getTableDesignService('s_table_design');
    TD_TableDesign.value = result.data;
    result = await getTableDesignService('s_table_design_column');
    TD_TableDesignColumn.value = result.data;
    result = await getTableDesignService('s_table_design_sql');
    TD_TableDesignSql.value = result.data;
}


getTableDesign()

const getTableDesignList = async () => {
    let result = await getTableDesignListService();

    list_tableDesign.value = result.data;
}

getTableDesignList()

// 监听 B 和 C 的变化，自动更新 A
watch([() => mixedTableDesign.value.formData_tableDesign.tableType, () => mixedTableDesign.value.formData_tableDesign.sub_tableName], ([type, sub]) => {
    let pre_tableName = type ? type + '_' : ''
    mixedTableDesign.value.formData_tableDesign.pre_tableName = pre_tableName
    mixedTableDesign.value.formData_tableDesign.tableName = pre_tableName + sub
}, { immediate: true })

// const handleInput = (value) => {
//     console.log(value)
//     // 使用正则表达式过滤非字母和非下划线字符
//     const filteredValue = value.replace(/^_+/, '').replace(/[^0-9a-zA-Z_]/g, '').replace('__', '_').toLowerCase();
//     if (filteredValue !== value) {
//         // 仅当内容被修改时更新（避免循环触发）
//         formData_tableDesign.value.sub_tableName = filteredValue;
//     }
// };

const handleBlur = (event) => {
    const nativeInput = event.target; // 直接从事件对象获取DOM元素
    console.log(nativeInput);
    // 1. 直接修改DOM值
    nativeInput.value = nativeInput.value.replace(/_+$/g, '');

    // 2. 强制触发input事件保持响应式同步
    nativeInput.dispatchEvent(new Event('input'));

    // // 使用正则表达式匹配并移除末尾的下划线
    // mixedTableDesign.value.formData_tableDesign.sub_tableName = mixedTableDesign.value.formData_tableDesign.sub_tableName.replace(/_+$/g, '');
};


//添加地区
const addColumn = () => {
    mixedTableDesign.value.list_tableDesignColumn.push(
        {
            dataStatus: '0',
            fieldIndex: '',
            columnName: '',
            columnComment: '',
            fieldType: '',
            fieldLength: '',
            fieldEnum: [],
            addingEnum: false,
            tempEnum: '',
            editingIndex: ''
        },
    );
}


// 枚举输入完成
const handleInputConfirm = (row) => {
    if (row.tempEnum) {
        row.fieldEnum.push(row.tempEnum)
    }
    row.addingEnum = false
    row.tempEnum = ''
}

// 删除枚举
const handleClose = (row, tag) => {
    row.fieldEnum.splice(row.fieldEnum.indexOf(tag), 1)
}

//添加枚举
const addEnum = (row) => {
    row.fieldEnum.push('')
    editEnum(row, '', row.fieldEnum.length - 1);
}
//编辑枚举
const editEnum = (row, tag, index) => {
    row.tempEnum = tag;
    row.editingIndex = index;
}
//删除枚举
const delete_Enum = (row, tag, index) => {
    row.editingIndex = ''
    row.fieldEnum.splice(index, 1)
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
    if (tempEnum==tag) {
        row.editingIndex = ''
        row.tempEnum = ''
        return
    }
    if (row.fieldEnum.includes(tempEnum)) {
        ElMessage.warning('相同的枚举已存在, 请重新输入');
        return
    }

    // 获取已有枚举类型
    let enumType = '';
    for (const item of row.fieldEnum) {
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
        const keyList = row.fieldEnum.map(item => item.split('-')[0]);
        if (keyList.includes(tempEnum.split('-')[0])) {
            ElMessage.warning('key重复, 请重新输入');
            return
        }
        const valueList = row.fieldEnum.map(item => item.split('-')[1]);
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
    row.fieldEnum[index] = tempEnum
    row.tempEnum = ''
}

</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>数据库管理</span>
                <div class="extra">
                    <el-button type="primary" @click="getTableDesignList">刷新</el-button>
                    <el-button type="primary" @click="visibleDrawer = true">新增表</el-button>
                </div>
            </div>
        </template>
        <el-table :data="list_tableDesign" style="width: 100%">
            <el-table-column width="55px" label="序号" type="index"> </el-table-column>
            <el-table-column v-for="field in TD_TableDesign" :label="field.columnComment" :key="field.columnName"
                :prop="field.columnName"></el-table-column>
            <!-- <el-table-column label="操作" width="100">
                <template #default="{ row }">
                    {{ row.tableName }}
                    <el-button :icon="Edit" circle plain type="primary"></el-button>
                    <el-button :icon="Delete" circle plain type="danger"></el-button>
                </template>
            </el-table-column> -->
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>
        {{ TD_TableDesign }}

        <!-- 抽屉 -->
        <el-drawer v-model="visibleDrawer" title="新增表" direction="rtl" size="90%">
            <!-- 添加文章表单 -->
            <el-form :model="mixedTableDesign.formData_tableDesign" label-width="100px">
                <el-form-item class="itemOne" label="表分类">
                    <el-radio-group v-model="mixedTableDesign.formData_tableDesign.tableType">
                        <el-radio-button v-for="(value, key, index) in option_tableType" :label="key" :key="key">
                            {{ value }}
                        </el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="表名">
                    <el-input v-model="mixedTableDesign.formData_tableDesign.sub_tableName"
                        placeholder="多个英文单词使用下划线拼接,长度不超过40个字符"
                        v-input-filter="{ regex: /[^0-9a-zA-Z_]/g, maxLength: 40, upOrLower: 'lower', otherMothed: (value) => value.replace(/^_+/, '').replace('__', '_') }"
                        @blur="handleBlur">
                        <template #prepend>{{ mixedTableDesign.formData_tableDesign.pre_tableName }}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="表注释">
                    <el-input v-model="mixedTableDesign.formData_tableDesign.tableComment" placeholder="长度不超过40个字符"
                        v-input-filter="{ maxLength: 40, notAlloweList: [' '] }"></el-input>
                </el-form-item>
            </el-form>

            <!-- 数据 -->
            <el-table :data="mixedTableDesign.list_tableDesignColumn" table-layout="auto">
                <el-table-column label="序号" prop="fieldIndex" width="55" align="center"></el-table-column>
                <el-table-column prop="data_status" label="状态" align="center">
                    <template #default="{ row }">
                        <span v-if="mixedTableDesign.formData_tableDesign.data_status == '0'">待建表</span>
                        <span v-else-if="row.data_status == '0'">新增中</span>
                        <span v-else-if="row.data_status == '1'">正常</span>
                        <span v-else-if="row.data_status == '2'">禁用</span>
                        <span v-else-if="row.data_status == '3'">编辑中</span>
                        <span v-else-if="row.data_status == '9'">废弃</span>
                    </template>
                </el-table-column>
                <!-- <el-table-column label="表名" prop="tableName">
                    {{ mixedTableDesign.formData_tableDesign.tableName }}
                </el-table-column> -->
                <el-table-column label="列名" prop="columnName" align="center">
                    <template #default="{ row }">
                        <span v-if="row.dataStatus == 1">{{ row.columnName }}</span>
                        <el-input v-model="row.columnName" v-if="row.dataStatus != 1"
                            placeholder="多个英文单词使用下划线拼接,长度不超过40个字符"
                            v-input-filter="{ regex: /[^0-9a-zA-Z_]/g, maxLength: 40, upOrLower: 'lower', otherMothed: (value) => value.replace(/^_+/, '').replace('__', '_') }"
                            @blur="handleBlur">
                        </el-input>
                    </template>
                </el-table-column>
                <el-table-column label="列注释" prop="columnComment" align="center">
                    <template #default="{ row }">
                        <span v-if="row.dataStatus == 1">{{ row.columnComment }}</span>
                        <el-input v-model="row.columnComment" v-if="row.dataStatus != 1" placeholder="长度不超过40个字符"
                            v-input-filter="{ maxLength: 40, notAlloweList: [' ', ':'] }">
                        </el-input>
                    </template>
                </el-table-column>
                <el-table-column label="字段类型" prop="fieldType" align="center">
                    <template #default="{ row }">
                        <span v-if="row.dataStatus == 1">{{ row.fieldType }}</span>
                        <el-select v-model="row.fieldType" v-if="row.dataStatus != 1" placeholder="请选择字段类型">
                            <el-option v-for="(key, index) in option_fieldType" :key="key" :label="key" value="key" />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="字段长度" prop="fieldLength" align="center">
                    <template #default="{ row }">
                        <span v-if="row.dataStatus == 1">{{ row.fieldLength }}</span>
                        <el-input-number v-model="row.fieldLength" v-if="row.dataStatus != 1" />
                    </template>
                </el-table-column>

                <el-table-column label="字段枚举" prop="fieldEnum" align="center">
                    <template #default="{ row }">
                        <el-tag v-if="row.dataStatus == 1" v-for="(tag, index) in row.fieldEnum" :key="index">
                            {{ tag }}
                        </el-tag>
                        <template v-if="row.dataStatus != 1">
                            <!-- closable @close="handleClose(row, tag)" -->
                            <el-tag v-for="(tag, index) in row.fieldEnum" :key="index"
                                @dblclick="editEnum(row, tag, index)">
                                <template v-if="row.editingIndex === index">
                                    <div style="display: flex;align-items: center;margin: 0 -7px;">
                                        <el-input style="width: 100px;" v-model="row.tempEnum" size="small"
                                            v-input-filter="{
                                                maxLength: 30,
                                                notAlloweList: [' ', ',', ';', ':'],
                                                otherMothed: (value) => value.replace(/^-+/, '').replace('--', '-')
                                            }" />
                                        <el-icon color="#f56c6c" style="margin: 0 3px;"
                                            @click="delete_Enum(row, tag, index)">
                                            <Delete />
                                        </el-icon>
                                        <el-icon color="#67c23a" style="margin: 0 3px;"
                                            @click="confirm_Enum(row, tag, index)">
                                            <Select />
                                        </el-icon>
                                    </div>
                                </template>

                                <span v-else>{{ tag }}</span>
                            </el-tag>
                            <!-- <el-input v-if="row.addingEnum" ref="InputRef" v-model="row.tempEnum" style="width: 100px;"
                                size="small" @keyup.enter="handleInputConfirm(row)" @blur="handleInputConfirm(row)" /> -->
                            <el-button v-if="row.editingIndex === ''" :icon="Plus" @click="addEnum(row)" text
                                type="primary"></el-button>
                        </template>
                    </template>
                </el-table-column>






                <!-- <el-table-column prop="areaId" label="地区ID" width="70"></el-table-column>
                <el-table-column prop="areaName" label="地区名">
                    <template slot-scope="{row}">
                        <span v-if="row.status == 1">{{ row.areaName }}</span>
                        <el-input v-model="row.areaName" v-if="row.status != 1" placeholder="请输入地区名"></el-input>
                    </template>
                </el-table-column>
                <el-table-column prop="resume" label="简述">
                    <template slot-scope="{row}">
                        <span v-if="row.status == 1">{{ row.resume }}</span>
                        <el-input v-model="row.resume" v-if="row.status != 1" placeholder="请输入"></el-input>
                    </template>
                </el-table-column>
                <el-table-column prop="detail" label="详述">
                    <template slot-scope="{row}">
                        <span v-if="row.status == 1">{{ row.detail }}</span>
                        <el-input v-model="row.detail" type="textarea" :rows="1" v-if="row.status != 1"
                            placeholder="请输入"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template slot-scope="scope">
                        <el-button @click="submitAddArea(scope.row, scope.$index)" v-if="scope.row.status == 0"
                            type="primary" size="small">提交添加</el-button>
                        <el-button @click="modifyArea(scope.row, scope.$index)" v-if="scope.row.status == 1"
                            size="small">修改</el-button>
                        <el-button @click="deleteArea(scope.row, scope.$index)" v-if="scope.row.status == 1"
                            type="warning" size="small">删除</el-button>
                        <el-button @click="submitModifyArea(scope.row, scope.$index)" v-if="scope.row.status == 2"
                            type="primary" size="small">提交修改</el-button>
                        <el-button @click="areaCannel(scope.row, scope.$index)" v-if="scope.row.status != 1"
                            size="small">取消</el-button>
                    </template>
                </el-table-column> -->
            </el-table>

            <el-button type="primary" @click="addColumn()">添加字段</el-button>


            <el-button type="primary" @click="addTable('已发布')">保存</el-button>
            <el-button type="info" @click="createTableAndEntity('草稿')">创建表和实体类</el-button>
            <el-button type="info" @click="createTableAndEntity('草稿')">查看最新建表语句</el-button>
            <br><br><br>
            {{ TD_TableDesignColumn }}
            <br><br><br>
            {{ TD_TableDesign }}
            <br><br><br>
            {{ mixedTableDesign }}
        </el-drawer>
    </el-card>
    <!-- <el-dialog v-model="dialog_addEnum" title="编辑字段枚举" width="500">
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogFormVisible = false">Cancel</el-button>
                <el-button type="primary" @click="dialogFormVisible = false">
                    Confirm
                </el-button>
            </div>
        </template>
    </el-dialog> -->
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
</style>