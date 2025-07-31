<script setup>

import { useLoginUserStore } from '@/stores/loginUser'
import ClampedText from '@/components/ClampedText.vue'
const loginUserStore = useLoginUserStore()

const SHOW_workerFilter = ref(false)
const FLD_worker = ref([])
const LIST_worker = ref([])





const ACT_GetWorkerList = () => {
    $Requests.get('/worker/getWorkerList')
        .then((response) => {
            if (response.code === 200) {
                LIST_worker.value = response.data;
                FLD_worker.value = response.data.slice(0, 15).map(item => item.workerId)
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

const FLDLIST_workerAndAttendance = computed(() => {
    return LIST_workerAndAttendance.value.filter(workerAndAttendance => FLD_worker.value.includes(workerAndAttendance.workerId))
})

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
    ACT_GetWorkerAndAttendanceList()
})
const dateColumns = ref([])
const editDate = ref($Com.getYMD())

// 生成日历列
const generateCalendar = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const days = new Date(year, month + 1, 0).getDate()

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
    if (new Date(year, month - 1) < new Date(2025, 0)) {
        return
    }
    currentMonth.value = new Date(year, month - 1)
}
const ACT_nextMonth = () => {
    // 下一月
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()
    if (new Date(year, month + 1) > new Date()) {
        return
    }
    currentMonth.value = new Date(year, month + 1)
}



// 计算总工资
const calculateTotal = (row) => {
    let total = 0
    dateColumns.value.forEach(column => {
        if (row[column.date]) {
            total += row[column.date].dayPay
        }
    })
    return total
}

// 导出数据
const exportData = () => {
    const exportData = LIST_workerAndAttendance.value.map(worker => ({
        name: worker.name,
        details: worker
    }))
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
    FD_attendance.value = $Com.deepCopy(row, FD_attendance.value);
    FD_attendance.value = $Com.deepCopy(date, FD_attendance.value);
}

// 控制监视执行的标志变量
const shouldWatchFD_attendance = ref(true);

// 监视上午出工和下午出工
watch(() => FD_attendance.value.morningYn,
    (newVal, oldVal) => {
        if (!shouldWatchFD_attendance.value) return; // 检查标志变量
        if (newVal === 'Y') {
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
        if (!shouldWatchFD_attendance.value) return; // 检查标志变量
        if (newVal === 'Y') {
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
        if (!shouldWatchFD_attendance.value) return; // 检查标志变量
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
        // 提交新增
        if (TT_attendance.value == '新增出工记录') {
            $Requests.post('/workerAttendance/addWorkerAttendance', FD_attendance.value, { showSuccessMsg: true })
                .then((response) => {
                    if (response.code === 200) {
                        SHOW_attendance.value = false
                        ACT_GetWorkerAndAttendanceList()
                    }
                })
        } else { // 提交更新
            $Requests.post('/workerAttendance/updateWorkerAttendance', FD_attendance.value, { showSuccessMsg: true })
                .then((response) => {
                    if (response.code === 200) {
                        SHOW_attendance.value = false
                        ACT_GetWorkerAndAttendanceList()
                    }
                })
        }

    })

}

const ACT_ViewAttendance = (row, attendance) => {
    shouldWatchFD_attendance.value = false;
    TT_attendance.value = "查看出工记录";
    SHOW_attendance.value = true;
    init_FD_attendance();

    FD_attendance.value = $Com.deepCopy(attendance, FD_attendance.value);
    FD_attendance.value.personName = row.personName;
    FD_attendance.value.phoneNum = row.phoneNum;
    nextTick(() => {
        shouldWatchFD_attendance.value = true;
    })
}

const ACT_EditAttendance = (row, attendance) => {
    shouldWatchFD_attendance.value = false;
    TT_attendance.value = "修改出工记录";
    SHOW_attendance.value = true;
    init_FD_attendance();

    FD_attendance.value = $Com.deepCopy(attendance, FD_attendance.value);
    FD_attendance.value.personName = row.personName;
    FD_attendance.value.phoneNum = row.phoneNum;
    nextTick(() => {
        shouldWatchFD_attendance.value = true;
    })
}



const SHOW_print = ref(false);





const printConfig = {
    id: 'printArea',
    // popTitle: ' ', // 空标题避免浏览器默认标题
    extraHead: ` 
    <style>
      /* 关键：设置横向布局 */
      @page {
        size: A4 landscape; /* landscape 表示横向 */
        margin: 0;
      }
      
      body {
        /* 横向尺寸：297mm宽 x 210mm高 */
        width: 297mm !important;
        max-width: 297mm !important;
        min-width: 297mm !important;
        height: 179mm !important;
        max-height: 179mm !important;
        min-height: 179mm !important;
        padding: 15mm;
      }

        
      /* 隐藏不需要的元素 */
      .no-print {
        display: none !important;
      }

    </style>
  `,
    beforeOpenCallback: () => {
        console.log('开始打印前准备');
    },
    closeCallback: () => {
        console.log('打印窗口已关闭');
    }
};

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
                    <el-button type="success" @click="SHOW_print = true">打印</el-button>
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
        <div class="controller">
            <div class="cont-item">
                <div class="item-title">
                    <el-text size="large">缩放比例 : </el-text>
                </div>
                <div class="item-content">
                    <el-button @click="WIDTH_dateColumn -= 1" icon="Minus" text></el-button>
                    <el-slider v-model="WIDTH_dateColumn" :step="1" :max="60" :min="20" style="width: 200px;" />
                    <el-button @click="WIDTH_dateColumn += 1" icon="Plus" text></el-button>
                </div>
            </div>

            <div class="cont-item">
                <div class="item-title">
                    <el-text size="large">注释 : </el-text>
                </div>
                <div class="item-content">
                    <el-button class="example-btn" type="warning" plain>
                        记录中
                    </el-button>
                    <el-button class="example-btn" type="primary" plain>
                        待结算
                    </el-button>
                    <el-button class="example-btn" type="info" plain>
                        已结算
                    </el-button>
                </div>
            </div>

            <div class="cont-item">
                <div class="item-title">
                    <el-text size="large">月份 : </el-text>
                </div>
                <div class="item-content">
                    <!-- 上一月 -->
                    <el-button @click="ACT_preMonth">上一月</el-button>
                    <el-date-picker v-model="currentMonth" type="month" placeholder="选择月份" :clearable="false"
                        :disabled-date="(date) => (date <= new Date('2025-01-01')) || (date > new Date())">
                    </el-date-picker>
                    <!-- 下一月 -->
                    <el-button @click="ACT_nextMonth">下一月</el-button>
                </div>
            </div>
        </div>


        <!-- 工资表格 -->
        <el-table :data="FLDLIST_workerAndAttendance" style="width: 100%" row-key="id">
            <!-- 固定姓名列 -->
            <el-table-column prop="personName" label="姓名" width="100" fixed></el-table-column>

            <!-- 动态日期列 -->
            <el-table-column v-for="(date, index) in dateColumns" :key="date.date" :label="date.day"
                :width="WIDTH_dateColumn" align="center"
                :class-name="(date.date == editDate) ? 'editDateColumn' : (date.date > $Com.getYMD()) ? 'unArriveDateColumn' : ''"
                :label-class-name="(date.date == editDate) ? 'editDateColumn' : (date.date > $Com.getYMD()) ? 'unArriveDateColumn' : ''">

                <template #header>
                    <div class="date-column-header"
                        @dblclick="editDate = (date.date <= $Com.getYMD()) ? date.date : $Com.getYMD()">
                        <div>{{ date.day }}</div>
                        <div>{{ date.weekName }}</div>
                    </div>
                </template>

                <template #default="{ row }">
                    <div v-if="date.date > $Com.getYMD()"></div>
                    <div v-else>
                        <div v-if="row[date.date]">
                            <el-tooltip placement="bottom" effect="light" popper-class="attendance-tooltip"
                                :show-after="1000">
                                <div v-if="row[date.date].tradeStatus === '已结算'">
                                    <el-button class="abcd" type="info" plain disabled>
                                        {{ row[date.date].dayPay }}
                                    </el-button>
                                </div>
                                <div v-if="row[date.date].tradeStatus === '待结算'">
                                    <el-button class="abcd" type="primary" plain :disabled="date.date != editDate"
                                        @dblclick="(date.date != editDate) ? '' : ACT_EditAttendance(row, row[date.date])">
                                        {{ row[date.date].dayPay }}
                                    </el-button>
                                </div>
                                <div v-if="row[date.date].tradeStatus === '记录中'">
                                    <el-button class="abcd" type="warning" plain :disabled="date.date != editDate"
                                        @dblclick="(date.date != editDate) ? '' : ACT_EditAttendance(row, row[date.date])">
                                        {{ row[date.date].dayPay }}
                                    </el-button>
                                </div>
                                <template #content>
                                    <div class="attendance-card"
                                        :style="{ color: row[date.date].tradeStatus == '已结算' ? '#909399' : row[date.date].tradeStatus == '待结算' ? '#409EFF' : '#E6A23C' }">
                                        <div class="up">
                                            <div>
                                                {{ row[date.date].personName }}
                                            </div>
                                            <div>{{ date.date }}</div>
                                        </div>
                                        <div class="middle">
                                            <div class="half">
                                                <div class="half-name">上午:</div>
                                                <div class="half-pay">
                                                    <div v-if="row[date.date].morningYn == 'N'">未出工</div>
                                                    <div v-else>
                                                        {{ row[date.date].morningPay }}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="half">
                                                <div class="half-name">下午:</div>
                                                <div class="half-pay">
                                                    <div v-if="!row[date.date].afternoonYn">未记录</div>
                                                    <div v-else-if="row[date.date].afternoonYn == 'N'">未出工</div>
                                                    <div v-else>
                                                        {{ row[date.date].afternoonPay }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="down">
                                            <ClampedText :text="row[date.date].remark" />
                                        </div>
                                    </div>

                                </template>
                            </el-tooltip>
                        </div>
                        <el-button class="abcd" plain v-else :disabled="date.date != editDate"
                            @dblclick="(date.date == editDate) && ACT_AddAttendance(row, date)">
                            空
                        </el-button>
                    </div>
                </template>

            </el-table-column>

            <!-- 总计列 -->
            <el-table-column label="总计" width="100" fixed="right">
                <template #default="{ row }">
                    {{ calculateTotal(row) }}
                </template>
            </el-table-column>
        </el-table>
    </el-card>

    <!-- 出工记录表单对话框 -->
    <el-dialog :title="TT_attendance" v-model="SHOW_attendance" width="50%">
        <div style="padding: 10px 50px 20px 20px;">
            <div style="font-size: 40px; font-weight: bold; text-align: center;">
                {{ FD_attendance.date }}
            </div>

            <el-form ref="FORM_attendance" :model="FD_attendance" label-width="80px"
                style="padding: 40px 50px 20px 20px;" :rules="rules" :disabled="TT_attendance == '查看出工记录'">
                <el-row>
                    <el-form-item label="工人名称" prop="personName" v-inline-flex="50" required>
                        <el-input v-model="FD_attendance.personName" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="手机号" prop="phoneNum" v-inline-flex="50" required>
                        <el-input v-model="FD_attendance.phoneNum" disabled></el-input>
                    </el-form-item>
                </el-row>
                <el-row>
                    <el-form-item label="上午出工" prop="morningYn" v-inline-flex="50">
                        <el-radio-group v-model="FD_attendance.morningYn">
                            <el-radio-button v-for="(value, key) in OPT_YN" :key="key" :label="value" :value="key" />
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="上午工钱" prop="morningPay" v-if="FD_attendance.morningYn == 'Y'"
                        v-inline-flex="50">
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
        </div>

        <template #footer>
            <el-button @click="SHOW_attendance = false">{{ TT_attendance != '查看出工记录' ? '取消' : '关闭' }}</el-button>
            <el-button type="primary" @click="SBM_saveAttendance" v-if="TT_attendance != '查看出工记录'">提交</el-button>
        </template>
    </el-dialog>

    <el-dialog v-model="SHOW_print" title="打印预览" width="90%" :show-close="false" top="3vh">
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
        <div id="printArea" class="print-paper"
            style="width: 297mm; height: 209mm;padding: 15px;box-sizing: border-box;margin: 0 auto;background: white;box-shadow: 0 0 5px rgba(0,0,0,0.1);">
            <div class="controller">

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
                    <el-text size="large">月份 : {{ $Com.getYM(currentMonth) }} </el-text>
                </div>
            </div>

            <!-- 工资表格 -->
            <el-table :data="FLDLIST_workerAndAttendance" style="width: 100%" row-key="id" border>
                <!-- 固定姓名列 -->
                <el-table-column prop="personName" label="姓名" width="75mm" fixed></el-table-column>

                <!-- 动态日期列 -->
                <el-table-column v-for="(date, index) in dateColumns" :key="date.date" :label="date.day" width="30mm"
                    align="center">

                    <template #header>
                        <div class="date-column-header">
                            <div>{{ date.day }}</div>
                            <div>{{ date.weekName }}</div>
                        </div>
                    </template>

                    <template #default="{ row }">
                        <div v-if="date.date > $Com.getYMD()"></div>
                        <div v-else>
                            <div v-if="row[date.date]">
                                <el-text v-if="row[date.date].tradeStatus === '已结算'">
                                    {{ row[date.date].dayPay }}
                                </el-text>
                                <el-text type="primary" v-if="row[date.date].tradeStatus === '待结算'">
                                    {{ row[date.date].dayPay }}
                                </el-text>
                                <el-text type="warning" v-if="row[date.date].tradeStatus === '记录中'">
                                    {{ row[date.date].dayPay }}
                                </el-text>

                            </div>
                            <el-text type="info" v-else>
                                无
                            </el-text>
                        </div>
                    </template>

                </el-table-column>

                <!-- 总计列 -->
                <el-table-column label="总计" width="75mm" fixed="right">
                    <template #default="{ row }">
                        {{ calculateTotal(row) }}
                    </template>
                </el-table-column>
            </el-table>
        </div>
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
    // 鼠标样式
    cursor: pointer;
    // 文本不可选
    user-select: none;
    -webkit-user-select: none;
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

    // .abcd.is-disabled {
    //     // pointer-events: none;
    //     /* 彻底禁用所有指针事件 */
    // }
}

:deep().el-table__body {
    .editDateColumn {
        background-color: #d9ecff;
    }

    .unArriveDateColumn {
        background-color: #f9f9fb;
    }

    tr.hover-row {
        td.editDateColumn {
            background-color: #d9ecff;
        }
    }
}

:deep().el-table__header {
    .editDateColumn {
        background-color: #409eff;
        color: white;
        border-radius: 7px;
        box-shadow: var(--el-box-shadow);
    }

    .unArriveDateColumn {
        background-color: #fafcfe;
        color: #d0d3d9;
    }
}

.controller {
    display: flex;
    justify-content: space-between;
    padding: 0px 20px 25px;

    .cont-item {
        border: 2px solid #a0cfff;
        border-radius: 12px;

        .item-title {
            border-bottom: 1px solid #a0cfff;
            padding: 5px 10px;
        }

        .item-content {
            display: flex;
            align-items: center;
            padding: 5px 10px;

            .example-btn {
                pointer-events: none;
            }
        }

    }
}

.attendance-tooltip {
    .attendance-card {
        width: 100px;
        display: flex;
        flex-direction: column;

        .up {
            display: flex;
            flex-direction: column;
        }

        .middle {
            .half {
                display: flex;

                .half-name {
                    width: 40px;
                }
            }
        }

        .down {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            /* 限制两行 */
            line-clamp: 2;
            /* 限制两行 */
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

}
</style>