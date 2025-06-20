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
            <el-button type="primary" @click="handleLogout">退出登录</el-button>
        </el-header>

        <!-- 主体内容 -->
        <el-container>
            <!-- 侧边菜单 -->
            <el-aside width="200px" class="sidebar">
                <el-menu
                    default-active="/games"
                    router
                    background-color="#f8f9fa"
                    text-color="#303133"
                    active-text-color="#409eff"
                    :collapse-transition="false"
                >
                    <el-menu-item index="/games">游戏管理</el-menu-item>
                    <el-menu-item index="/users">用户管理</el-menu-item>
                    <el-menu-item index="/settings">系统设置</el-menu-item>
                    <el-menu-item index="/edit-character">角色编辑器</el-menu-item>
                    <el-menu-item index="/edit-event">事件编辑器</el-menu-item>
                    <el-menu-item index="/edit-location">场地编辑器</el-menu-item>
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
    overflow: hidden;

    .header {
        height: 60px !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); /* 更符合游戏主题的渐变 */
    }

    .sidebar {
        height: calc(100vh - 60px);
        overflow-y: auto;
        border-right: 1px solid #e6e9ed;

        /* 菜单悬停效果 */
        .el-menu-item {
            transition: all 0.3s;
            &:hover {
                background-color: #e6f4ff;
            }
        }
    }
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    padding: 0 30px;
    font-size: 18px;
}

.content {
    padding: 24px;
    background: #f8f9fa; /* 内容区浅背景 */
    overflow-y: auto; /* 支持内容滚动 */
}
</style>
