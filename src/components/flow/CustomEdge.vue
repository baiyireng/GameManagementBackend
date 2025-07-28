<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useVueFlow, getBezierPath } from '@vue-flow/core';
import { Delete } from '@element-plus/icons-vue';
import { ElButton } from 'element-plus';

// 定义组件的 props
const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    source: {
        type: String,
        required: true,
    },
    target: {
        type: String,
        required: true,
    },
    sourceX: {
        type: Number,
        required: true,
    },
    sourceY: {
        type: Number,
        required: true,
    },
    targetX: {
        type: Number,
        required: true,
    },
    targetY: {
        type: Number,
        required: true,
    },
    sourcePosition: {
        type: String,
        required: false,
    },
    targetPosition: {
        type: String,
        required: false,
    },
    data: {
        type: Object,
        required: false,
        default: () => ({}),
    },
    markerEnd: {
        type: String,
        required: false,
        default: 'url(#arrowclosed)',
    },
    style: {
        type: Object,
        required: false,
        default: () => ({}),
    },
    selected: {
        type: Boolean,
        required: false,
        default: false,
    },
});

// 定义事件
const emit = defineEmits(['remove-edge']);

// 获取 VueFlow 实例
const { findNode } = useVueFlow();

// 计算边的路径
const edgePath = ref('');
const labelX = ref(0);
const labelY = ref(0);

// 计算边是否被选中
const isSelected = computed(() => props.selected);

// 处理删除边
const handleRemoveEdge = (event) => {
    event.stopPropagation();
    emit('remove-edge', props.id);
};

// 计算边的路径
const updatePath = () => {
    const sourceNode = findNode(props.source);
    const targetNode = findNode(props.target);

    if (!sourceNode || !targetNode) return;

    // 优先使用边数据中存储的连接点坐标
    const sourceX = props.data?.sourceX !== undefined ? props.data.sourceX : props.sourceX;
    const sourceY = props.data?.sourceY !== undefined ? props.data.sourceY : props.sourceY;
    const targetX = props.data?.targetX !== undefined ? props.data.targetX : props.targetX;
    const targetY = props.data?.targetY !== undefined ? props.data.targetY : props.targetY;

    // 使用 getBezierPath 计算贝塞尔曲线路径
    const [path, labelCoords] = getBezierPath({
        sourceX: sourceX,
        sourceY: sourceY,
        sourcePosition: props.sourcePosition,
        targetX: targetX,
        targetY: targetY,
        targetPosition: props.targetPosition,
    });

    edgePath.value = path;
    labelX.value = labelCoords.x;
    labelY.value = labelCoords.y;
};

// 监听坐标变化，更新路径
watch(() => [props.sourceX, props.sourceY, props.targetX, props.targetY], updatePath, {
    immediate: true,
});

onMounted(() => {
    updatePath();
});
</script>

<template>
    <g :class="['vue-flow__edge', { selected: isSelected, animated: data?.animated }]" @click.stop>
        <path
            :d="edgePath"
            class="vue-flow__edge-path"
            :style="style"
            :marker-end="markerEnd || 'url(#arrowclosed)'"
        />
        <text
            v-if="data?.label"
            :x="labelX"
            :y="labelY"
            class="vue-flow__edge-text"
            text-anchor="middle"
            dominant-baseline="middle"
            alignment-baseline="middle"
        >
            {{ data.label }}
        </text>
        <g v-if="isSelected" :transform="`translate(${labelX - 12}, ${labelY - 12})`">
            <rect width="24" height="24" rx="4" fill="white" stroke="#409EFF" stroke-width="1" />
            <el-button
                :icon="Delete"
                circle
                size="small"
                style="position: absolute; transform: translate(-12px, -12px)"
                title="删除连接"
                @click.stop="handleRemoveEdge"
            />
        </g>
    </g>
</template>