<template>
    <el-dialog
        v-model="dialogVisible"
        title="节点属性编辑"
        width="60%"
        :before-close="handleClose"
        destroy-on-close
    >
        <div class="node-property-modal-content">
            <NodePropertyEditor
                v-if="currentNode"
                :node="currentNode"
                @update:node="handleNodeUpdate"
            />
        </div>

        <template #footer>
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" @click="handleSave">保存</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import NodePropertyEditor from './NodePropertyEditor.vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    node: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(['update:visible', 'save']);

// 对话框可见性
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value),
});

// 当前编辑的节点（创建副本以避免直接修改原始数据）
const currentNode = ref(props.node ? JSON.parse(JSON.stringify(props.node)) : null);

// 监听外部节点变化
watch(
    () => props.node,
    (newNode) => {
        if (newNode) {
            currentNode.value = JSON.parse(JSON.stringify(newNode));
        }
    },
    { deep: true },
);

// 处理节点更新
const handleNodeUpdate = (updatedNode) => {
    currentNode.value = updatedNode;
};

// 关闭对话框
const handleClose = () => {
    dialogVisible.value = false;
};

// 保存节点
const handleSave = () => {
    if (!currentNode.value) {
        ElMessage.warning('没有节点数据可保存');
        return;
    }

    emit('save', currentNode.value);
    handleClose();
    ElMessage.success('节点属性已保存');
};
</script>

<style scoped>
.node-property-modal-content {
    max-height: 70vh;
    overflow-y: auto;
    padding: 0 10px;
}
</style>