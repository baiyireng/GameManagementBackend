<script setup lang="ts">
import { ref } from 'vue';
import PropertyEditor from '@/components/PropertyEditor.vue';
import ImageUploader from '@/components/ImageUploader.vue';

// 定义场地类型
interface Location {
    name: string;
    description: string;
    backgroundImage: {
        url: string;
    };
    environmentType: string;
    weatherSystem: string;
    specialEffects: Record<string, any>;
    fixedEvents: string[];
    eventWeights: Record<string, number>;
    properties: Array<{
        key: string;
        description: string;
        value: string | number | boolean;
        type: 'string' | 'number' | 'boolean';
        popoverVisible: boolean;
    }>;
}

// 初始化表单数据
const formData = ref<Location>({
    name: '',
    description: '',
    backgroundImage: {
        url: 'https://via.placeholder.com/600x200',
    },
    environmentType: '',
    weatherSystem: '',
    specialEffects: {},
    fixedEvents: [],
    eventWeights: {},
    properties: [],
});

// 提交表单
const submitForm = () => {
    console.log('保存场地数据:', formData.value);
    // TODO: 实际保存逻辑
};
const updateProperties = (props: Character['properties']) => {
    formData.value.properties = props;
};
</script>

<template>
    <el-card class="location-editor">
        <template #header>
            <div class="card-header">
                <span>场地编辑器</span>
            </div>
        </template>

        <el-form :model="formData" label-width="150px" style="max-width: 1000px">
            <!-- 场地名称 -->
            <el-form-item label="场地名称">
                <el-input v-model="formData.name" />
            </el-form-item>

            <!-- 描述 -->
            <el-form-item label="描述">
                <el-input v-model="formData.description" type="textarea" :rows="3" />
            </el-form-item>

            <!-- 背景图片上传 -->
            <el-form-item label="背景图片">
                <el-input v-model="formData.backgroundImage.url" placeholder="请输入图片URL" />
                <ImageUploader v-model:model-value="formData.backgroundImage" :show-input="false" />
            </el-form-item>

            <!-- 环境类型 -->
            <el-form-item label="环境类型">
                <el-input v-model="formData.environmentType" placeholder="如：森林、城市、沙漠" />
            </el-form-item>

            <!-- 天气系统 -->
            <el-form-item label="天气系统">
                <el-input v-model="formData.weatherSystem" placeholder="如：晴朗、雨天、暴风雪" />
            </el-form-item>

            <!-- 特殊效果 -->
            <el-form-item label="特殊效果">
                <el-input
                    v-model="formData.specialEffects.description"
                    placeholder="如：夜晚视野降低50%"
                />
            </el-form-item>

            <!-- 固定事件池 -->
            <el-form-item label="固定事件池">
                <el-input v-model="formData.fixedEvents[0]" placeholder="事件ID，多个用逗号分隔" />
            </el-form-item>

            <!-- 随机事件权重 -->
            <el-form-item label="随机事件权重">
                <el-input
                    v-model="formData.eventWeights.exampleEventId"
                    placeholder="事件ID:权重，如 eventId:0.3"
                />
            </el-form-item>

            <!-- 属性编辑器 -->
            <el-form-item label="场地属性">
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
.location-editor {
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