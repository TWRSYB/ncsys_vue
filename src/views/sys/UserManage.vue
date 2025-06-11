<script setup>




//文章列表数据模型
const userList = ref([])


//回显文章分类
import { getUserListService } from '@/api/user.js'
const getUserList = async () => {
    let result = await getUserListService();

    userList.value = result.data;
}




getUserList()

//控制抽屉是否显示
const visibleDrawer = ref(false)
//添加表单数据模型
const articleModel = ref({
    title: '',
    categoryId: '',
    coverImg: '',
    content: '',
    state: ''
})






</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>用户管理</span>
                <div class="extra">
                    <el-button type="primary" @click="getUserList">刷新</el-button>
                    <el-button type="primary" @click="visibleDrawer = true">新增用户</el-button>
                </div>
            </div>
        </template>

        <!-- * 用户ID  userId;
     * 登录码  loginCode;  
     * 登录密码  loginPassword;  
     * 用户名  userName;  
     * 手机号  phoneNum;  
     * 角色:sysAdmin-系统管理员,manager-管理员,operator-操作员  roleCode;  
     * 数据状态:0-未生效,1-生效,2-禁用,9-废弃  dataStatus;  
     * 创建用户  createUser;  
     * 创建时间  createTime;  
     * 最后更新用户  updateUser;  
     * 最后更新时间  updateTime; -->
        <!-- 文章列表 -->
        <el-table :data="userList" style="width: 100%">
            <el-table-column label="用户ID" prop="userId"></el-table-column>
            <el-table-column label="登录码" prop="loginCode"></el-table-column>
            <el-table-column label="登录密码" prop="loginPassword"> </el-table-column>
            <el-table-column label="用户名" prop="userName"></el-table-column>
            <el-table-column label="手机号" prop="phoneNum"></el-table-column>
            <el-table-column label="角色" prop="roleCode"></el-table-column>
            <el-table-column label="数据状态" prop="dataStatus"></el-table-column>
            <el-table-column label="创建用户" prop="createUser"></el-table-column>
            <el-table-column label="创建时间" prop="createTime"></el-table-column>
            <el-table-column label="最后更新用户" prop="updateUser"></el-table-column>
            <el-table-column label="最后更新时间" prop="updateTime"></el-table-column>
            <el-table-column label="操作" width="100">
                <template #default="{ row }">
                    <el-button icon="Edit" circle plain type="primary"></el-button>
                    <el-button icon="Delete" circle plain type="danger"></el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>
        <!-- 分页条 -->
        <!-- <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[3, 5, 10, 15]"
            layout="jumper, total, sizes, prev, pager, next" background :total="total" @size-change="onSizeChange"
            @current-change="onCurrentChange" style="margin-top: 20px; justify-content: flex-end" /> -->

        <!-- 抽屉 -->
        <el-drawer v-model="visibleDrawer" title="添加文章" direction="rtl" size="50%">
            <!-- 添加文章表单 -->
            <el-form :model="articleModel" label-width="100px">
                <el-form-item label="文章标题">
                    <el-input v-model="articleModel.title" placeholder="请输入标题"></el-input>
                </el-form-item>
                <el-form-item label="文章分类">
                    <el-select placeholder="请选择" v-model="articleModel.categoryId">
                        <el-option v-for="c in userList" :key="c.id" :label="c.categoryName" :value="c.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="文章封面">

                    <!-- 
                        auto-upload:设置是否自动上传
                        action:设置服务器接口路径
                        name:设置上传的文件字段名
                        headers:设置上传的请求头
                        on-success:设置上传成功的回调函数
                     -->

                    <el-upload class="avatar-uploader" :auto-upload="true" :show-file-list="false" action="/api/upload"
                        name="file" :headers="{ 'Authorization': tokenStore.token }" :on-success="uploadSuccess">
                        <img v-if="articleModel.coverImg" :src="articleModel.coverImg" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>
                <!-- <el-form-item label="文章内容">
                    <div class="editor">
                        <quill-editor theme="snow" v-model:content="articleModel.content" contentType="html">
                        </quill-editor>
                    </div>
                </el-form-item> -->
                <el-form-item>
                    <el-button type="primary" @click="addArticle('已发布')">发布</el-button>
                    <el-button type="info" @click="addArticle('草稿')">草稿</el-button>
                </el-form-item>
            </el-form>
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