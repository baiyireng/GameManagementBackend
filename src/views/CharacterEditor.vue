<script setup lang="ts">
import { ref } from 'vue';
import PropertyEditor from '@/components/PropertyEditor.vue';
import ImageUploader from '@/components/ImageUploader.vue';

// 定义角色类型
interface Character {
    name: string;
    description: string;
    image: {
        url: string;
    };
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
    image: {
        url: 'https://via.placeholder.com/150',
    },
    properties: [],
});

const updateProperties = (props: Character['properties']) => {
    formData.value.properties = props;
};

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

        <el-form :model="formData" label-width="120px" style="max-width: 1000px">
            <!-- 角色名称 -->
            <el-form-item label="角色名称">
                <el-input v-model="formData.name" />
            </el-form-item>

            <!-- 描述 -->
            <el-form-item label="描述">
                <el-input v-model="formData.description" type="textarea" :rows="3" />
            </el-form-item>

            <!-- 图片上传 -->
            <el-form-item label="角色图片">
                <el-input v-model="formData.image.url" placeholder="请输入图片URL" />
                <ImageUploader v-model:model-value="formData.image" :show-input="false" />
            </el-form-item>

            <!-- 属性编辑器 -->
            <el-form-item label="角色属性">
                <PropertyEditor
                    :properties="formData.properties"
                    @update:properties="updateProperties"
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

:deep(.el-card__body) {
    max-height: calc(100vh - 248px);
    overflow-y: auto;
}
</style>