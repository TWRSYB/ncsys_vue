<script setup>

import { useLoginUserStore } from '@/stores/loginUser'
const loginUserStore = useLoginUserStore()

const SHOW_workerFilter = ref(false)
const FLD_worker = ref([])
const LIST_worker = ref([])





const ACT_GetWorkerList = () => {
    $Requests.get('/worker/getWorkerList')
        .then((response) => {
            if (response.code === 200) {
                LIST_worker.value = response.data;
            }
        })
}


const OPT_YN = { "Y": "是", "N": "否" }

// 工人出工数据
const LIST_workerAndAttendance = ref([])

const ACT_GetWorkerAndAttendanceList = () => {
    const ym = $Com.getYM(currentMonth.value)
    $Requests.get('/workerAttendance/getWorkerAndAttendanceList', { params: { ym } })
        .then((response) => {
            if (response.code === 200) {
                LIST_workerAndAttendance.value = response.data;
            }
        })
}

const WIDTH_dateColumn = ref(
    localStorage.getItem('widthDateColumn')
        ? parseInt(localStorage.getItem('widthDateColumn'))
        : 40
)

watch(WIDTH_dateColumn, (newVal) => {
    localStorage.setItem('widthDateColumn', newVal)
})

// 日期相关
const currentMonth = ref(new Date())
watch(currentMonth, (newVal) => {
    generateCalendar(newVal)
})
const dateColumns = ref([])
const editDate = ref('')

// 生成日历列
const generateCalendar = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    editDate.value = `${year}-${String(month + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    dateColumns.value = Array.from({ length: days }, (_, i) => {
        const day = i + 1
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        // 获取星期
        const week = new Date(dateStr).getDay()
        const weekName = ['日', '一', '二', '三', '四', '五', '六'][week]

        return {
            date: dateStr,
            day: String(day),
            week: week,
            weekName: weekName
        }
    })
}

const ACT_preMonth = () => {
    // 上一月
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()
    currentMonth.value = new Date(year, month - 1)
}
const ACT_nextMonth = () => {
    // 下一月
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()
    currentMonth.value = new Date(year, month + 1)
}



// 计算总工资
const calculateTotal = (worker) => {

}

// 导出数据
const exportData = () => {
    const exportData = LIST_workerAndAttendance.value.map(worker => ({
        name: worker.name,
        details: worker
    }))
    console.log('导出数据：', exportData)
    ElMessage.success('数据已导出到控制台')
}

onMounted(() => {
    // 获取工人列表
    ACT_GetWorkerList()
    // 获取考勤列表
    ACT_GetWorkerAndAttendanceList()
    // 初始化默认数据
    generateCalendar(new Date())
})

const SHOW_attendance = ref(false)
const TT_attendance = ref('')
const FORM_attendance = ref(null)
const FD_attendance = ref({})

const init_FD_attendance = () => {
    FD_attendance.value = {
        workerId: '', // 工人ID
        personName: '', // 工人姓名
        phoneNum: '', // 工人手机号
        dailyPay: '', // 日工资
        attendanceId: '', // 出工ID
        date: '', // 日期
        morningYn: '', // 上午出工与否
        morningPay: '', // 上午工钱
        afternoonYn: '', // 下午出工与否
        afternoonPay: '', // 下午工钱
        dayPay: '', // 当日工钱
        clearYn: '', // 结算与否
        clearDate: '', // 结算日期
        clearId: '', // 结算ID
        remark: '', // 备注
    }
}

const ACT_AddAttendance = (row, date) => {
    TT_attendance.value = "新增出工记录";
    SHOW_attendance.value = true;
    init_FD_attendance();
    nextTick(() => {
        // 重置表单数据
        FORM_attendance.value.resetFields();
        FD_attendance.value = $Com.deepCopy(row, FD_attendance.value);
        FD_attendance.value = $Com.deepCopy(date, FD_attendance.value);
    })
}

// 监视上午出工和下午出工
watch(() => FD_attendance.value.morningYn,
    (newVal, oldVal) => {
        if (newVal === 'Y') {
            FD_attendance.value.morningPay = newVal.dailyPay
            const dailyPay = FD_attendance.value.dailyPay || 80
            const halfPay = dailyPay / 2
            FD_attendance.value.morningPay = halfPay
        } else {
            FD_attendance.value.morningPay = ''
        }
    }
)
watch(() => FD_attendance.value.afternoonYn,
    (newVal, oldVal) => {
        if (newVal === 'Y') {
            FD_attendance.value.afternoonPay = newVal.dailyPay
            const dailyPay = FD_attendance.value.dailyPay || 80
            const halfPay = dailyPay / 2
            FD_attendance.value.afternoonPay = halfPay
        } else {
            FD_attendance.value.afternoonPay = ''
        }
    }
)

// 监视上午和下午工钱的变动
watch(() => [FD_attendance.value.morningPay, FD_attendance.value.afternoonPay],
    (newVal, oldVal) => {
        const morningPay = +FD_attendance.value.morningPay || 0
        const afternoonPay = +FD_attendance.value.afternoonPay || 0
        FD_attendance.value.dayPay = morningPay + afternoonPay
    }
)


//定义表单校验规则
const rules = {
    morningYn: [
        { required: true, message: '请选择出工与否', trigger: 'change' }
    ],
    morningPay: [
        { required: true, message: '请输入工钱', trigger: 'change' }
    ],
    afternoonPay: [
        { required: true, message: '请输入工钱', trigger: 'change' }
    ],
}

const SBM_saveAttendance = () => {
    FORM_attendance.value.validate((valid, fields) => {
        if (!valid) {
            // 表单校验不通过
            ElMessage.warning('录入和检查必要的信息后再保存');
            return false;
        }
        $Requests.post('/workerAttendance/addWorkerAttendance', FD_attendance.value, { showSuccessMsg: true })
            .then((response) => {
                if (response.code === 200) {
                    SHOW_attendance.value = false
                    ACT_GetWorkerAndAttendanceList()
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
                    <div> 出工记录 </div>
                    <el-icon class="field-filter-icon" @click.stop="SHOW_workerFilter = !SHOW_workerFilter"
                        v-if="['sysAdmin', 'manager'].includes(loginUserStore.loginUser.roleCode)">
                        <SVG_ChoosePeoples />
                    </el-icon>
                </div>
                <div class="extra">
                    <el-button type="success" @click="exportData">导出数据</el-button>
                </div>
            </div>
            <div class="field-filter" v-if="SHOW_workerFilter" v-click-outside="() => SHOW_workerFilter = false">

                <el-checkbox-group v-model="FLD_worker" style="display: flex; flex-wrap: wrap;">
                    <el-checkbox-button v-for="(worker, index) in LIST_worker" :key="worker.workerId"
                        :value="worker.workerId">
                        {{ worker.personName + ' ' + worker.phoneNum }}
                    </el-checkbox-button>
                </el-checkbox-group>
            </div>
        </template>

        <!-- 操作栏
        <div class="toolbar">
            <el-date-picker v-model="currentMonth" type="month" placeholder="选择月份" @change="generateCalendar" />
            <el-slider v-model="WIDTH_dateColumn" :step="1" :max="60" :min="20" />
        </div> -->

        <!-- 搜索表单 -->
        <div style="display: flex; justify-content: space-between; padding: 5px 20px 20px;">
            <div style="display: flex; align-items: center;">
                <el-text size="large">缩放比例</el-text>
                <el-button @click="WIDTH_dateColumn -= 1" icon="Minus" text></el-button>
                <el-slider v-model="WIDTH_dateColumn" :step="1" :max="60" :min="20" style="width: 200px;" />
                <el-button @click="WIDTH_dateColumn += 1" icon="Plus" text></el-button>
            </div>


            <div>
                <!-- 上一月 -->
                <el-button @click="ACT_preMonth">上一月</el-button>
                <el-date-picker v-model="currentMonth" type="month" placeholder="选择月份" :clearable="false">
                </el-date-picker>
                <!-- 下一月 -->
                <el-button @click="ACT_nextMonth">下一月</el-button>
            </div>
        </div>
        {{ currentMonth }}


        <!-- 工资表格 -->
        <el-table :data="LIST_workerAndAttendance" style="width: 100%" row-key="id" height="600">
            <!-- 固定姓名列 -->
            <el-table-column prop="personName" label="姓名" width="100" fixed></el-table-column>

            <!-- 动态日期列 -->
            <el-table-column v-for="(date, index) in dateColumns" :key="index" :label="date.day"
                :width="WIDTH_dateColumn" align="center">

                <template #header>
                    <div class="date-column-header">
                        <div>{{ date.day }}</div>
                        <div>{{ date.weekName }}</div>
                    </div>
                </template>

                <template #default="{ row }">
                    <div v-if="row[date.date]">
                        {{ (row[date.date].morningPay | 0) + (row[date.date].afternoonPay | 0) }}
                    </div>
                    <!-- 一个悬浮的正方形 -->
                    <!-- <div class="square" v-else></div> -->
                    <!-- <button class="convex-button" v-else>空</button> -->
                    <el-button class="abcd" v-else @click="ACT_AddAttendance(row, date)">空</el-button>

                </template>

            </el-table-column>

            <!-- 总计列 -->
            <el-table-column label="总计" width="120" fixed="right">
                <template #default="{ row }">
                    {{ calculateTotal(row) }}
                </template>
            </el-table-column>
        </el-table>
        {{ LIST_workerAndAttendance }}
        <br>
        dateColumns: {{ dateColumns }}
        <br>
        editDate: {{ editDate }}
    </el-card>

    <!-- 出工记录表单对话框 -->
    <el-dialog :title="TT_attendance" v-model="SHOW_attendance" width="50%">
        <el-form ref="FORM_attendance" :model="FD_attendance" label-width="80px" style="padding: 40px 50px 20px 20px;"
            :rules="rules">
            <el-row>
                <el-form-item label="工人名称" prop="personName" v-inline-flex="50" required>
                    <el-input v-model="FD_attendance.personName" disabled></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phoneNum" v-inline-flex="50" required>
                    <el-input v-model="FD_attendance.phoneNum" disabled></el-input>
                </el-form-item>
            </el-row>
            <el-form-item label="日期" prop="date" v-inline-flex="50" required>
                <el-input v-model="FD_attendance.date" disabled></el-input>
            </el-form-item>
            <el-row>
                <el-form-item label="上午出工" prop="morningYn" v-inline-flex="50">
                    <el-radio-group v-model="FD_attendance.morningYn">
                        <el-radio-button v-for="(value, key) in OPT_YN" :key="key" :label="value" :value="key" />
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="上午工钱" prop="morningPay" v-if="FD_attendance.morningYn == 'Y'" v-inline-flex="50">
                    <el-input v-model="FD_attendance.morningPay" v-input-int="1"></el-input>
                </el-form-item>
            </el-row>

            <el-row>
                <el-form-item label="下午出工" prop="afternoonYn" v-inline-flex="50">
                    <el-radio-group v-model="FD_attendance.afternoonYn">
                        <el-radio-button v-for="(value, key) in OPT_YN" :key="key" :label="value" :value="key" />
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="下午工钱" prop="afternoonPay" v-if="FD_attendance.afternoonYn == 'Y'"
                    v-inline-flex="50">
                    <el-input v-model="FD_attendance.afternoonPay" v-input-int="1"></el-input>
                </el-form-item>
            </el-row>

            <el-form-item label="备注" prop="remark">
                <el-input v-model="FD_attendance.remark" type="textarea" :autosize="{ minRows: 2 }"></el-input>
            </el-form-item>


        </el-form>
        <template #footer>
            <el-button @click="SHOW_attendance = false">取消</el-button>
            <el-button type="primary" @click="SBM_saveAttendance">提交</el-button>
        </template>
        {{ FD_attendance }}
    </el-dialog>

</template>



<style lang="scss" scoped>
.toolbar {
    margin-bottom: 20px;
    display: flex;
    gap: 15px;
}

.table-wrapper {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
}

.el-table {
    --el-table-header-bg-color: #f5f7fa;
}

.el-input-number {
    width: 100%;
}

.square {
    border-radius: 30%;
    border: 1px solid #ebeef5;
    box-shadow: 0 -2px -12px 0 rgba(0, 0, 0, 0.1);
    background-color: #fff;
    width: 30px;
    height: 30px;
}

.date-column-header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}



.convex-button {
    /* 动态尺寸设置 */
    aspect-ratio: 1/1;
    width: 90%;
    height: auto;

    /* 等于父容器最小边 */


    /* 视觉样式 */
    background: white;
    border: none;
    border-radius: 30%;
    cursor: pointer;

    /* 立体效果 */
    box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.1),
        inset 0 -2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    /* 文字样式 */
    color: #999;
}

/* 悬停效果 */
.convex-button:hover {
    box-shadow:
        0 6px 16px rgba(0, 0, 0, 0.15),
        inset 0 -3px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

/* 点击效果 */
.convex-button:active {
    box-shadow:
        inset 0 4px 8px rgba(0, 0, 0, 0.1),
        0 2px 4px rgba(0, 0, 0, 0.05);
    transform: translateY(1px);
}

:deep().cell {
    display: flex;
    align-items: center;
    justify-content: center;

    .abcd {
        min-width: 30px;
        max-width: 30px;
        min-height: 30px;
        max-height: 30px;
        padding: 0 !important;
        box-shadow: var(--el-box-shadow-lighter);
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>