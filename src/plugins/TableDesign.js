class TableDesign {
    cache = {}

    async getTableDesign(tableName) {
        if (this.cache[tableName]) return this.cache[tableName]

        try {
            const res = await $Requests.get('/tableDesign/getTableDesign', { params: { tableName } })
            if (res.code === 200) {
                this.cache[tableName] = res.data
                return res.data
            }
            return null
        } catch (error) {
            console.error('获取表格设计失败:', error)
            return null
        }
    }

    setTableDesign(TDS, tableName) {
        if (this.cache[tableName]) {
            TDS.value = this.cache[tableName]
            return
        }
        // 获取表设计
        $Requests.get('/tableDesign/getTableDesign', { params: { tableName } })
            .then((response) => {
                if (response.code === 200) {
                    this.cache[tableName] = response.data;
                    TDS.value = response.data;
                }
            })
    }

}

const tableDesign = new TableDesign()
export default tableDesign