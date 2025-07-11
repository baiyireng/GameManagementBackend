<template>
    <el-dialog v-model="visible" title="节点属性" width="50%" :before-close="handleClose">
        <!-- 原有的节点属性编辑内容 -->
        <div class="node-property-panel">
            <el-form label-position="top">
                <el-form-item label="节点ID">
                    <el-input v-model="node.id" disabled />
                </el-form-item>
                <el-form-item label="节点名称">
                    <el-input v-model="node.label" />
                </el-form-item>
                <el-form-item label="节点类型">
                    <el-select v-model="node.data.category">
                        <el-option
                            v-for="category in nodeCategories"
                            :key="category.value"
                            :label="category.label"
                            :value="category.value"
                        />
                    </el-select>
                </el-form-item>
                <!-- 其他属性字段 -->
            </el-form>
        </div>

        <template #footer>
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" @click="handleSave">保存</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    node: {
        type: Object,
        required: true,
    },
    visible: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:visible', 'save']);

const node = ref({ ...props.node });
const nodeCategories = ref([
    { value: 'start', label: '开始节点' },
    { value: 'action', label: '动作节点' },
    { value: 'condition', label: '条件节点' },
    { value: 'end', label: '结束节点' },
]);

watch(
    () => props.node,
    (newVal) => {
        node.value = { ...newVal };
    },
);

const handleClose = () => {
    emit('update:visible', false);
};

const handleSave = () => {
    emit('save', node.value);
    handleClose();
};
</script>

<style scoped>
.node-property-panel {
    max-height: 60vh;
    overflow-y: auto;
    padding: 0 20px;
}
</style>