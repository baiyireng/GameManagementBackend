<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';

// 游戏数据类型定义（根据需求扩展字段）
interface GameItem {
    id: number;
    name: string;
    type: string; // 游戏类型（如：角色扮演/射击）
    platform: string; // 运行端（如：PC/移动端）
    status: '已发布' | '开发中' | '下架'; // 上下架状态
    cover: string; // 封面图路径（支持本地或远程URL）
    updateTime: string; // 更新时间
    releaseTime?: string; // 发布时间（可选）
}

// 表单数据
const formData = ref({
    name: '',
    type: '',
    platform: '',
    status: '已发布' as const,
    cover: 'https://via.placeholder.com/80x60?text=Game+Cover',
    updateTime: new Date().toISOString().slice(0, 16),
});

// 提交表单
const submitForm = async () => {
    try {
        await request.post('/api/addGame', formData.value).then((response) => {
            ElMessage.success('新增游戏成功');
            console.log('新增游戏成功:', response);
            // 重置表单数据
            setTimeout(() => {
                window.location.href = '/games'; // 跳转到游戏列表页面
            }, 3000);
        });
    } catch (error) {
        ElMessage.error('游戏新增失败');
    }
};
</script>

<template>
    <el-card class="add-game-card">
        <template #header>
            <div class="card-header">
                <span>新增游戏</span>
            </div>
        </template>

        <el-form :model="formData" label-width="120px" style="max-width: 600px">
            <!-- 游戏名称 -->
            <el-form-item label="游戏名称">
                <el-input v-model="formData.name" />
            </el-form-item>

            <!-- 游戏类型 -->
            <el-form-item label="游戏类型">
                <el-input v-model="formData.type" />
            </el-form-item>

            <!-- 运行端 -->
            <el-form-item label="运行端">
                <el-select v-model="formData.platform" placeholder="请选择">
                    <el-option label="PC" value="PC" />
                    <el-option label="移动端" value="移动端" />
                </el-select>
            </el-form-item>

            <!-- 上下架状态 -->
            <el-form-item label="上下架状态">
                <el-select v-model="formData.status" placeholder="请选择">
                    <el-option label="已发布" value="已发布" />
                    <el-option label="开发中" value="开发中" />
                    <el-option label="下架" value="下架" />
                </el-select>
            </el-form-item>

            <!-- 封面上传（简化为URL输入） -->
            <el-form-item label="封面">
                <el-input v-model="formData.cover" placeholder="请输入图片URL" />
            </el-form-item>

            <!-- 更新时间 -->
            <el-form-item label="更新时间">
                <el-date-picker
                    v-model="formData.updateTime"
                    type="datetime"
                    placeholder="选择日期和时间"
                    value-format="YYYY-MM-DD HH:mm:ss"
                />
            </el-form-item>

            <!-- 提交按钮 -->
            <el-form-item>
                <el-button type="primary" @click="submitForm">保存</el-button>
                <el-button>取消</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<style lang="less" scoped>
.add-game-card {
    margin: 24px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .card-header {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
    }
}
</style>
