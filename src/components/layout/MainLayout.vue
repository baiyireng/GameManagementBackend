<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

// 退出登录逻辑
const handleLogout = () => {
    localStorage.removeItem('mock-token');
    router.push('/login');
};
</script>

<template>
    <el-container class="main-layout">
        <!-- 顶部导航 -->
        <el-header class="header">
            <div class="logo">游戏管理后台</div>
            <el-button type="text" @click="handleLogout">退出登录</el-button>
        </el-header>

        <!-- 主体内容 -->
        <el-container>
            <!-- 侧边菜单 -->
            <el-aside width="200px" class="sidebar">
                <el-menu default-active="/games" router background-color="#f8f9fa" text-color="#303133"
                    active-text-color="#409eff">
                    <el-menu-item index="/games">游戏管理</el-menu-item>
                    <el-menu-item index="/users">用户管理</el-menu-item>
                    <el-menu-item index="/settings">系统设置</el-menu-item>
                </el-menu>
            </el-aside>

            <!-- 内容区域 -->
            <el-main class="content">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<style lang="less" scoped>
.main-layout {
    height: 100vh;
    overflow: hidden; // 新增：防止滚动条问题

    .header {
        height: 60px !important; // 固定高度
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); // 新增：添加投影
    }

    .sidebar {
        height: calc(100vh - 60px); // 动态高度计算
        overflow-y: auto; // 新增：支持菜单滚动
    }
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #409eff;
    color: white;
    padding: 0 30px;
    font-size: 18px;
}

.sidebar {
    border-right: 1px solid #ebeef5;
}

.content {
    padding: 20px;
    background: #fff;
}
</style>