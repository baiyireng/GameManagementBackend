<script setup lang="ts"></script>

<template>
    <!-- 仅保留路由视图，主导航由 MainLayout 处理 -->
    <router-view />
</template>

<style scoped>
/* 移除原 nav 样式，避免与主布局冲突 */
</style>