<script setup lang="ts">
import { computed } from 'vue';
import { ElButton } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';

// 定义组件的 props
const props = defineProps([
    'id',
    'data',
    'label',
    'selected',
    'type',
    // 添加VueFlow可能传递的其他属性
    'dragging',
    'position',
    'dimensions',
    'zIndex',
    'targetPosition',
    'sourcePosition',
    'isConnectable',
    'selectable',
    'dragHandle',
    'events',
    'connectable',
    'resizing',
]);

// 定义事件
const emit = defineEmits(['node-click', 'node-context-menu', 'remove-node']);

// 计算节点是否被选中
const isSelected = computed(() => props.selected);

// 处理删除节点
const handleRemoveNode = (event) => {
    event.stopPropagation();
    emit('remove-node', props.id);
};

// 处理右键菜单
const handleContextMenu = (event) => {
    emit('node-context-menu', event, props);
};
</script>

<template>
    <div
        class="custom-node"
        :class="['node-' + data.category, { selected: isSelected }]"
        @contextmenu="handleContextMenu"
    >
        <div class="node-header">
            {{ label }}
            <el-button
                v-if="isSelected"
                :icon="Delete"
                circle
                size="small"
                style="float: right; margin-top: -5px"
                title="删除节点"
                @click.stop="handleRemoveNode"
            />
        </div>
        <div class="node-content">
            <p v-if="data.category">类型: {{ data.category }}</p>

            <!-- 事件节点特定内容 -->
            <template v-if="data.category === 'event' && data.title">
                <p>标题: {{ data.title }}</p>
                <p v-if="data.content" class="truncate-text">描述: {{ data.content }}</p>
            </template>

            <!-- 选择节点特定内容 -->
            <template v-if="data.category === 'choice' && data.options">
                <p>选项数量: {{ data.options.length }}</p>
                <p v-if="data.options.length > 0" class="truncate-text">
                    首选项: {{ data.options[0].text }}
                </p>
            </template>

            <!-- 奖励节点特定内容 -->
            <template v-if="data.category === 'reward'">
                <p>奖励类型: {{ data.rewardType }}</p>
                <p v-if="data.description" class="truncate-text">描述: {{ data.description }}</p>
            </template>

            <!-- 条件节点特定内容 -->
            <template v-if="data.category === 'condition'">
                <p class="truncate-text">条件: {{ data.condition || '未设置' }}</p>
                <p class="truncate-text">描述: {{ data.description }}</p>
            </template>
        </div>
        <div class="node-handles">
            <div
                class="node-handle source"
                data-handleid="source"
                data-handlepos="right"
                :data-nodeid="id"
            ></div>
            <div
                class="node-handle target"
                data-handleid="target"
                data-handlepos="left"
                :data-nodeid="id"
            ></div>
        </div>
    </div>
</template>