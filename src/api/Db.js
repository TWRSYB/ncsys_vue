import request from '@/utils/request.js'

//
export const getTableDesignListService = ()=>{
   return  request.get('/tableDesign/getTableDesignList',)
}

//
export const getTableDesignService = (tableName)=>{    
   return  request.get('/tableDesign/getTableDesign', {params: {tableName: tableName}})
}

//
export const saveTableDesignService = (mixedTableDesign)=>{    
   return  request.post('/tableDesign/saveTableDesign', mixedTableDesign)
}