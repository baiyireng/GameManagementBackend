<script setup lang="ts">
import { ElAlert } from 'element-plus';

// 定义组件的 props
const props = defineProps({
    visible: {
        type: Boolean,
        required: true,
    },
    sourceNode: {
        type: Object,
        required: false,
        default: null,
    },
});

// 定义事件
const emit = defineEmits(['cancel-connecting']);

// 处理取消连接
const handleCancelConnecting = () => {
    emit('cancel-connecting');
};
</script>

<template>
    <div v-if="visible" class="connecting-mode-indicator">
        <el-alert
            title="连接模式已激活"
            type="info"
            :closable="true"
            show-icon
            @close="handleCancelConnecting"
        >
            <div class="connecting-mode-content">
                <div v-if="sourceNode" class="connecting-source">
                    正在从节点 "{{ sourceNode.label || sourceNode.id }}" 创建连接
                </div>
                <div class="connecting-instructions">点击目标节点完成连接，或点击空白区域取消</div>
            </div>
        </el-alert>
    </div>
</template>