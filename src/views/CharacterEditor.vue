<script setup lang="ts">
import { ref } from 'vue';
import PropertyEditor from '@/components/PropertyEditor.vue';

// 定义角色类型
interface Character {
    name: string;
    description: string;
    image: string;
    properties: Array<{
        key: string;
        description: string;
        value: string | number | boolean;
        type: 'string' | 'number' | 'boolean';
        popoverVisible: boolean;
    }>;
}

// 初始化表单数据
const formData = ref<Character>({
    name: '',
    description: '',
    image: 'https://via.placeholder.com/150',
    properties: [],
});

// 提交表单
const submitForm = () => {
    console.log('保存角色数据:', formData.value);
    // TODO: 实际保存逻辑
};
</script>

<template>
    <el-card class="character-editor">
        <template #header>
            <div class="card-header">
                <span>角色编辑器</span>
            </div>
        </template>

        <el-form :model="formData" label-width="120px" style="max-width: 900px">
            <!-- 角色名称 -->
            <el-form-item label="角色名称">
                <el-input v-model="formData.name" />
            </el-form-item>

            <!-- 描述 -->
            <el-form-item label="描述">
                <el-input v-model="formData.description" type="textarea" :rows="3" />
            </el-form-item>

            <!-- 图片地址 -->
            <el-form-item label="图片地址">
                <el-input v-model="formData.image" placeholder="请输入图片URL" />
            </el-form-item>

            <!-- 属性编辑器 -->
            <el-form-item label="角色属性">
                <PropertyEditor
                    :properties="formData.properties"
                    @update:properties="(props) => (formData.properties = props)"
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
.character-editor {
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