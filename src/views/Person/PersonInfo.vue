<script setup>

const TD_Person = ref([])

const list_person = ref([])




const INIT_getTableDesign = () => {
    $Requests.get('/tableDesign/getTableDesign', { params: { tableName: 'm_person' } }).then(res => {
        if (res.code === 200) {
            TD_Person.value = res.data
        }
    })
};

const ACT_getPersonList = () => {
    $Requests.post('/person/getPersonList', {
        page: 1,
        limit: 1000
    }).then(res => {
        if (res.code === 200) {
            list_person.value = res.data.list
        }
    })
};

onMounted(() => {
    INIT_getTableDesign();
    ACT_getPersonList();


});
</script>

<template>
    <el-table :data="list_person" style="width: 100%" border stripe>
        <el-table-column width="55px" label="序号" type="index"> </el-table-column>
        <el-table-column v-for="field in $Com.TD_filter(TD_Person)" :key="field.columnName" :label="field.columnComment"
            :prop="field.columnName" align="center">
            <template #default="{ row }" v-if="field.type == 'lv'">
                {{ field.lvs[row[field.columnName]] }}
            </template>
        </el-table-column>
    </el-table>
</template>


<style lang="scss" scoped></style>