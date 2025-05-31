<script setup lang="ts">
import { ref } from 'vue';
import { ElForm } from 'element-plus';
// 尝试使用相对路径导入，假设 utils 目录与当前文件的相对位置是 ../utils
import request from '../utils/request'; // 导入封装的axios

interface LoginForm {
    username: string;
    password: string;
}

const form = ref<LoginForm>({ username: '', password: '' });
const formRef = ref<InstanceType<typeof ElForm>>();

const rules = ref({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度3-20位', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度6-20位', trigger: 'blur' },
    ],
});

const handleLogin = async () => {
    formRef.value?.validate(async (valid) => {
        if (valid) {
            try {
                // 调用登录接口（假设后端接口为POST /api/login）
                const token = await request.post('/api/login', {
                    username: form.value.username,
                    password: form.value.password,
                });
                // 由于 token 是 AxiosResponse 类型，需要提取其中的数据部分，通常响应数据在 data 属性中
                localStorage.setItem('mock-token', token.data);
                window.location.href = '/';
            } catch (error) {
                console.error('登录失败:', error);
            }
        }
    });
};
</script>

<template>
    <!-- PC 适配：左右分栏布局 -->
    <el-row class="login-container" type="flex" justify="center" align="middle">
        <!-- 左侧背景区（占 6 列，PC 端突出品牌） -->
        <el-col :span="12" class="login-bg">
            <h1 class="slogan">游戏管理后台</h1>
            <p class="desc">高效管理游戏信息，轻松完成编辑与发布</p>
        </el-col>

        <!-- 右侧表单区（占 6 列，聚焦登录操作） -->
        <el-col :span="12" class="login-form">
            <el-card class="login-card" shadow="never">
                <h2 class="title">管理员登录</h2>
                <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
                    <el-form-item label="用户名" prop="username">
                        <el-input
                            v-model="form.username"
                            placeholder="请输入用户名"
                            style="height: 40px; font-size: 14px"
                        />
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input
                            v-model="form.password"
                            type="password"
                            placeholder="请输入密码"
                            style="height: 40px; font-size: 14px"
                        />
                    </el-form-item>
                    <el-form-item class="login-button-wrapper">
                        <el-button class="login-button" type="primary" @click="handleLogin">
                            立即登录
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-col>
    </el-row>
</template>

<style lang="less" scoped>
:deep(.el-form-item__error) {
    color: #ff4d4f; // 更醒目的错误颜色
    font-size: 13px;
    padding: 4px 8px;
    background: #fff1f0; // 浅红色背景
    border-radius: 4px;
    border-left: 3px solid #ff4d4f;
    margin-top: 4px;
    position: relative;

    &::before {
        content: '!';
        position: absolute;
        left: -20px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        background: #ff4d4f;
        color: white;
        border-radius: 50%;
        text-align: center;
        line-height: 16px;
        font-weight: bold;
    }
}

.login-container {
    height: 100vh;
    margin: 0; // 新增：消除默认边距
    overflow: hidden; // 新增：防止内容溢出

    .login-bg {
        height: 100vh; // 关键修复：确保高度铺满
        min-height: 600px; // 新增：防止内容过小时变形
        padding: 0 80px;
        background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
        /* 更现代的渐变配色 */
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .slogan {
        font-size: 2.8em;
        margin-bottom: 20px;
        font-weight: 500;
        letter-spacing: 1px;
    }

    .desc {
        font-size: 1.3em;
        line-height: 1.8;
        opacity: 0.9;
        max-width: 480px;
    }

    .login-form {
        background: #f8f9fa;
        /* 统一背景色 */
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh; // 新增：确保高度一致
    }
}

.login-card {
    width: 440px;
    padding: 50px 40px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    background: linear-gradient(145deg, #ffffff 0%, #f8faff 100%); // 新增渐变背景

    .title {
        margin-bottom: 30px;
        position: relative;
        text-align: center;

        &::after {
            content: '';
            display: block;
            width: 60px;
            height: 3px;
            background: #409eff;
            margin: 15px auto 0;
            border-radius: 2px;
        }
    }
}

.el-form-item {
    margin-bottom: 28px; // 增加表单项间距

    :deep(.el-form-item__label) {
        color: #606266;
        font-weight: 500;
        padding-bottom: 8px;
    }
}
.login-button-wrapper .el-form-item__content {
    margin: auto;
    background-color: red;
}
.el-input__wrapper {
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &.is-focus {
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3) !important;
    }
}

.el-button--primary {
    margin-top: 20px; // 增加上边距
    width: 100%;
    height: 44px;
    font-size: 16px;
    border: none;
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%); // 渐变背景
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(64, 158, 255, 0.4); // 悬停投影增强
        opacity: 0.95;
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
    }
}

/* 移动端适配（保留PC主样式） */
@media (max-width: 992px) {
    .el-button--primary {
        height: 48px; // 移动端增大点击区域
        font-size: 17px;
    }

    .login-bg {
        display: none;
    }

    .login-form {
        width: 100% !important;
    }

    .login-card {
        padding: 40px 30px;
    }
}
</style>
