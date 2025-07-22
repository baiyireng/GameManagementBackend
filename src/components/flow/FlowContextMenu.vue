<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Edit, Delete, CopyDocument, Connection } from '@element-plus/icons-vue';

// 定义组件的 props
const props = defineProps({
    visible: {
        type: Boolean,
        required: true,
    },
    x: {
        type: Number,
        required: true,
    },
    y: {
        type: Number,
        required: true,
    },
    node: {
        type: Object,
        required: false,
        default: null,
    },
});

// 定义事件
const emit = defineEmits([
    'edit-node',
    'delete-node',
    'duplicate-node',
    'start-connecting',
    'close',
]);

// 菜单位置
const menuStyle = ref({
    top: '0px',
    left: '0px',
});

// 监听位置变化
watch(
    () => [props.x, props.y],
    ([x, y]) => {
        menuStyle.value = {
            top: `${y}px`,
            left: `${x}px`,
        };
    },
    { immediate: true },
);

// 处理菜单项点击
const handleEditNode = () => {
    emit('edit-node', props.node);
    emit('close');
};

const handleDeleteNode = () => {
    emit('delete-node', props.node.id);
    emit('close');
};

const handleDuplicateNode = () => {
    emit('duplicate-node', props.node);
    emit('close');
};

const handleStartConnecting = () => {
    emit('start-connecting', props.node);
    emit('close');
};

// 点击外部关闭菜单
const handleClickOutside = (event) => {
    const menu = document.querySelector('.node-context-menu');
    if (menu && !menu.contains(event.target) && props.visible) {
        emit('close');
    }
};

// 监听点击事件
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
    <div v-if="visible" class="node-context-menu" :style="menuStyle">
        <ul>
            <li @click="handleEditNode">
                <el-icon><Edit /></el-icon> 编辑节点
            </li>
            <li @click="handleDeleteNode">
                <el-icon><Delete /></el-icon> 删除节点
            </li>
            <li @click="handleDuplicateNode">
                <el-icon><CopyDocument /></el-icon> 复制节点
            </li>
            <li @click="handleStartConnecting">
                <el-icon><Connection /></el-icon> 连接到其他节点
            </li>
        </ul>
    </div>
</template>