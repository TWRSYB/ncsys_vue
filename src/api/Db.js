import request from '@/utils/request.js'

//文章列表查询
export const getTableDesignService = ()=>{
   return  request.get('/tableDesign/getTableDesign',)
}