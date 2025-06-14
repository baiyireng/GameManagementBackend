<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '../utils/request';

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

// 初始化表格数据
const gameList = ref<GameItem[]>([]);

// 模拟加载游戏数据（实际应调用接口）
onMounted(async () => {
    try {
        const res = await request.get('/api/games'); // 假设接口返回游戏列表
        console.log(res);

        gameList.value = res;
    } catch (error) {
        ElMessage.error('加载游戏列表失败');
    }
});

// 状态标签颜色映射
const statusColorMap: Record<GameItem['status'], string> = {
    已发布: 'success',
    开发中: 'info',
    下架: 'danger',
};
</script>

<template>
    <el-card class="game-list-card">
        <template #header>
            <div class="card-header">
                <span>游戏列表</span>
            </div>
        </template>

        <!-- 游戏列表表格 -->
        <el-table :data="gameList" stripe border fit>
            <!-- 封面列 -->
            <el-table-column label="封面" width="120">
                <template #default="scope">
                    <el-image
                        :src="scope.row.cover"
                        :preview-src-list="[scope.row.cover]"
                        style="width: 80px; height: 60px; object-fit: cover"
                        :alt="scope.row.name"
                    />
                </template>
            </el-table-column>

            <!-- 名称列 -->
            <el-table-column prop="name" label="游戏名称" width="180" />

            <!-- 类型列 -->
            <el-table-column prop="type" label="游戏类型" width="120" />

            <!-- 运行端列 -->
            <el-table-column prop="platform" label="运行端" width="120">
                <template #default="scope">
                    <el-tag type="success" size="small">{{ scope.row.platform }}</el-tag>
                </template>
            </el-table-column>

            <!-- 状态列 -->
            <el-table-column prop="status" label="上下架状态" width="140">
                <template #default="scope">
                    <el-tag :type="statusColorMap[scope.row.status]" size="medium">
                        {{ scope.row.status }}
                    </el-tag>
                </template>
            </el-table-column>

            <!-- 更新时间列 -->
            <el-table-column prop="updateTime" label="最近更新时间" width="180" />

            <!-- 发布时间列（可选） -->
            <el-table-column prop="releaseTime" label="正式发布时间" width="180" />
        </el-table>
    </el-card>
</template>

<style lang="less" scoped>
.game-list-card {
    margin: 24px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .card-header {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
    }

    // 调整表格内间距
    .el-table__cell {
        padding: 12px 0;
    }
}
</style>
