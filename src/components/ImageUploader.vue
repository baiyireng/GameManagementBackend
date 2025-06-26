<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

// 定义上传类型
interface UploadConfig {
    url: string; // 图片地址
}

const props = defineProps<{
    modelValue: UploadConfig;
    showInput?: boolean; // 控制是否显示输入框
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: UploadConfig): void;
}>();

// 模拟上传方法（可根据实际需求替换为接口调用）
const handleUpload = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
        const newUrl = e.target?.result as string;
        emit('update:modelValue', { ...props.modelValue, url: newUrl });
    };

    reader.readAsDataURL(file);
};
</script>

<template>
    <div class="image-uploader">
        <el-form-item v-if="showInput !== false" label="图片地址">
            <el-input v-model="modelValue.url" placeholder="请输入图片URL" style="width: 100%" />
        </el-form-item>

        <el-form-item label="图片预览">
            <div class="image-preview-container">
                <el-upload
                    action="javascript:void(0)"
                    :show-file-list="false"
                    :on-change="(file) => handleUpload(file?.raw)"
                >
                    <div class="image-preview-wrapper">
                        <img v-if="modelValue.url" :src="modelValue.url" alt="预览图" />
                        <span v-else>点击上传图片</span>
                    </div>
                </el-upload>
            </div>
        </el-form-item>
    </div>
</template>

<style scoped>
.image-uploader {
    margin-top: 16px;
}

.image-preview-container {
    border: 1px solid #eee;
    padding: 8px;
    border-radius: 4px;
    background-color: #f9f9f9;
}

.image-preview-wrapper {
    width: 300px;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px dashed #ccc;
    border-radius: 4px;
    cursor: pointer;
    transition: border-color 0.3s;
    overflow: hidden;
}

.image-preview-wrapper:hover {
    border-color: #409eff;
}

.image-preview-wrapper img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>
