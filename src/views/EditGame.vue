<script setup lang="ts">
import { ref, markRaw, computed } from 'vue';
import { VueFlow, useNodes, useEdges } from '@vue-flow/core';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../utils/request';
import NodePropertyEditor from '../components/NodePropertyEditor.vue';

// 定义游戏编辑入口数据结构
interface GameEditorEntry {
    character: string; // 角色编辑器路径
    event: string; // 事件编辑器路径
    location: string; // 场地编辑器路径
    skill: string; // 技能编辑器路径
}

// 当前编辑的游戏信息
const currentGame = ref({
    id: 1,
    name: '冒险之旅',
    editorEntry: {
        character: '/edit-character',
        event: '/edit-event',
        location: '/edit-location',
        skill: '/edit-skill',
    },
});

// 初始化流程图数据
const nodes = ref([
    {
        id: 'character-editor',
        type: 'input',
        label: '角色编辑',
        position: { x: 250, y: 5 },
        data: { category: 'character' },
    },
    {
        id: 'event-editor',
        label: '事件编辑',
        position: { x: 100, y: 100 },
        data: { category: 'event' },
    },
    {
        id: 'location-editor',
        label: '场地编辑',
        position: { x: 400, y: 100 },
        data: { category: 'location' },
    },
    {
        id: 'skill-editor',
        type: 'output',
        label: '技能编辑',
        position: { x: 250, y: 200 },
        data: { category: 'skill' },
    },
]);

const edges = ref([
    { id: 'e1-2', source: 'character-editor', target: 'event-editor', type: 'default' },
    { id: 'e1-3', source: 'character-editor', target: 'location-editor', type: 'default' },
    { id: 'e2-4', source: 'event-editor', target: 'skill-editor', type: 'default' },
    { id: 'e3-4', source: 'location-editor', target: 'skill-editor', type: 'default' },
]);

// 新增节点模板
const nodeTemplates = markRaw({
    character: {
        id: '',
        type: 'input',
        label: '新角色节点',
        position: { x: 0, y: 0 },
        data: { category: 'character' },
    },
    event: {
        id: '',
        label: '新事件节点',
        position: { x: 0, y: 0 },
        data: {
            category: 'event',
            title: '新事件',
            content: '事件描述内容',
            backgroundImage: '',
        },
    },
    location: {
        id: '',
        label: '新场地节点',
        position: { x: 0, y: 0 },
        data: { category: 'location' },
    },
    skill: {
        id: '',
        type: 'output',
        label: '新技能节点',
        position: { x: 0, y: 0 },
        data: { category: 'skill' },
    },
    // 新增节点类型
    choice: {
        id: '',
        label: '新选择节点',
        position: { x: 0, y: 0 },
        data: {
            category: 'choice',
            options: [
                {
                    id: `option-${Date.now()}`,
                    text: '默认选项',
                    condition: '',
                    nextNodeId: '',
                    consequences: {},
                },
            ],
        },
    },
    reward: {
        id: '',
        label: '新奖励节点',
        position: { x: 0, y: 0 },
        data: {
            category: 'reward',
            rewardType: 'item',
            amount: 1,
            description: '获得奖励',
        },
    },
    condition: {
        id: '',
        label: '新条件节点',
        position: { x: 0, y: 0 },
        data: {
            category: 'condition',
            condition: '',
            trueNodeId: '',
            falseNodeId: '',
            description: '条件判断',
        },
    },
});

// 当前选中的节点
const selectedNode = ref(null);

// 节点点击事件
const onNodeClick = (event, node) => {
    selectedNode.value = node;
};

// 新增节点方法
const addNode = (type) => {
    const template = nodeTemplates[type];
    if (!template) return;

    // 计算新节点ID
    const nodeId = `${type}-editor-${nodes.value.length + 1}`;

    // 创建新节点
    const newNode = {
        ...template,
        id: nodeId,
        position: {
            x: Math.random() * 300 + 100,
            y: Math.random() * 300 + 300,
        },
    };

    // 添加新节点
    nodes.value.push(newNode);
    refreshFlowChart();
};

// 删除节点方法
const removeNode = () => {
    if (!selectedNode.value) return;

    // 获取要删除的节点ID
    const nodeIdToRemove = selectedNode.value.id;

    // 显示确认对话框
    ElMessageBox.confirm(`确定要删除节点 "${selectedNode.value.label}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(() => {
            // 过滤掉被选中节点
            nodes.value = nodes.value.filter((node) => node.id !== nodeIdToRemove);

            // 移除与该节点相关的连线
            edges.value = edges.value.filter(
                (edge) => edge.source !== nodeIdToRemove && edge.target !== nodeIdToRemove,
            );

            // 清除选中状态
            selectedNode.value = null;

            // 刷新流程图
            refreshFlowChart();

            // 显示成功消息
            ElMessage.success('节点已成功删除');
        })
        .catch(() => {
            ElMessage.info('已取消删除');
        });
};

// 自动连接规则
const autoConnectRules = {
    character: ['event', 'location', 'condition'],
    event: ['event', 'skill', 'choice', 'reward', 'condition'],
    location: ['event', 'skill', 'condition'],
    skill: [],
    choice: ['event', 'reward', 'condition'],
    reward: ['event', 'choice', 'condition'],
    condition: ['event', 'choice', 'reward'],
};

// 节点拖拽结束事件
const onNodeDragStop = (event, node) => {
    // 检查是否需要自动创建连接线
    // 确保 node.data 和 node.data.category 存在，并且 autoConnectRules 中有对应的规则
    const category = node?.data?.category;
    const rules = category ? autoConnectRules[category] : [];

    const targetNodes = nodes.value.filter(
        (n) => n?.id !== node?.id && n?.data?.category && rules?.includes(n.data.category),
    );

    // 如果有可连接的节点，则创建连接线
    if (targetNodes.length > 0) {
        const newEdge = {
            id: `e${node.id}-${targetNodes[0].id}`,
            source: node.id,
            target: targetNodes[0].id,
            type: 'default',
        };

        edges.value.push(newEdge);
        refreshFlowChart();
    }
};

// 手动连接节点时的事件处理
const onConnect = (params) => {
    // 确保新创建的边有 type 属性
    const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        type: 'default',
    };

    edges.value.push(newEdge);
    refreshFlowChart();

    // 阻止默认的边创建行为，因为我们已经手动添加了边
    return false;
};

// 全屏流程图编辑器可见性
const flowEditorVisible = ref(false);

// 手动触发流程图重新渲染
const refreshFlowChart = () => {
    // 创建新的节点数组引用，避免响应式数据未更新
    nodes.value = [...nodes.value];
    edges.value = [...edges.value];
};

// 打开流程图编辑器
const openFlowEditor = () => {
    flowEditorVisible.value = true;
    // 确保DOM更新后再刷新流程图
    setTimeout(() => {
        refreshFlowChart();
        // 如果有选中的节点，确保在全屏模式下仍然保持选中状态
        if (selectedNode.value) {
            const node = nodes.value.find((n) => n.id === selectedNode.value.id);
            if (node) {
                selectedNode.value = node;
            }
        }
    }, 100);
};

// 关闭流程图编辑器
const closeFlowEditor = () => {
    flowEditorVisible.value = false;
    // 延迟执行以确保 DOM 更新完成
    setTimeout(refreshFlowChart, 300);
};

// 保存流程图数据
const saveFlowData = () => {
    ElMessage.success('流程图数据已保存');
    console.log('保存的节点数据:', nodes.value);
    console.log('保存的边数据:', edges.value);
};

// 重置流程图数据
const resetFlowData = () => {
    ElMessageBox.confirm('是否确认重置流程图数据？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(() => {
            // TODO: 实际重置逻辑
            ElMessage.success('流程图数据已重置');
        })
        .catch(() => {
            ElMessage.info('操作已取消');
        });
};

import { defineComponent } from 'vue';
import { ElButton } from 'element-plus';

// 自定义节点组件
const CustomNode = defineComponent({
    name: 'CustomNode',
    components: { ElButton },
    props: ['node'],
    setup(props) {
        // 获取外部的 selectedNode 和 removeNode
        return { selectedNode, removeNode };
    },
    template: `
        <div class="custom-node" :class="'node-' + node.data.category">
            <div class="node-header">
                {{ node.label }}
                <el-button
                    v-if="selectedNode && selectedNode.id === node.id"
                    icon="Delete"
                    circle
                    size="small"
                    @click.stop="removeNode"
                    style="float: right; margin-top: -5px"
                    title="删除节点"
                />
            </div>
            <div class="node-content">
                <p v-if="node.data.category">类型: {{ node.data.category }}</p>
                
                <!-- 事件节点特定内容 -->
                <template v-if="node.data.category === 'event' && node.data.title">
                    <p>标题: {{ node.data.title }}</p>
                    <p v-if="node.data.content" class="truncate-text">描述: {{ node.data.content }}</p>
                </template>
                
                <!-- 选择节点特定内容 -->
                <template v-if="node.data.category === 'choice' && node.data.options">
                    <p>选项数量: {{ node.data.options.length }}</p>
                    <p v-if="node.data.options.length > 0" class="truncate-text">
                        首选项: {{ node.data.options[0].text }}
                    </p>
                </template>
                
                <!-- 奖励节点特定内容 -->
                <template v-if="node.data.category === 'reward'">
                    <p>奖励类型: {{ node.data.rewardType }}</p>
                    <p v-if="node.data.description" class="truncate-text">
                        描述: {{ node.data.description }}
                    </p>
                </template>
                
                <!-- 条件节点特定内容 -->
                <template v-if="node.data.category === 'condition'">
                    <p class="truncate-text">条件: {{ node.data.condition || '未设置' }}</p>
                    <p class="truncate-text">描述: {{ node.data.description }}</p>
                </template>
            </div>
        </div>
    `,
});

// 自定义边组件
const CustomEdge = defineComponent({
    name: 'CustomEdge',
    props: ['edge'],
    template: `
        <div class="custom-edge">
            <span class="edge-label">{{ edge?.label || '' }}</span>
        </div>
    `,
});

// 自定义节点类型
const nodeTypes = markRaw({
    custom: { component: CustomNode },
});

// 自定义边类型
const edgeTypes = markRaw({
    default: { component: CustomEdge },
});

// 注册自定义组件
const components = {
    customNode: CustomNode,
    customEdge: CustomEdge,
};
</script>

<template>
    <el-card class="edit-game">
        <template #header>
            <div class="card-header">
                <span>编辑游戏：{{ currentGame.name }}</span>
            </div>
        </template>

        <el-row :gutter="20" class="editor-cards">
            <!-- 角色编辑 -->
            <el-col :span="6">
                <el-card
                    class="game-editor-card"
                    @click="() => $router.push(currentGame.editorEntry.character)"
                >
                    <div class="card-content">
                        <i class="el-icon-user-solid"></i>
                        <div class="card-title">角色编辑</div>
                        <div class="card-desc">管理游戏中的角色与属性</div>
                    </div>
                </el-card>
            </el-col>

            <!-- 事件编辑 -->
            <el-col :span="6">
                <el-card
                    class="game-editor-card"
                    @click="() => $router.push(currentGame.editorEntry.event)"
                >
                    <div class="card-content">
                        <i class="el-icon-timer"></i>
                        <div class="card-title">事件编辑</div>
                        <div class="card-desc">配置剧情事件与选项逻辑</div>
                    </div>
                </el-card>
            </el-col>

            <!-- 场地编辑 -->
            <el-col :span="6">
                <el-card
                    class="game-editor-card"
                    @click="() => $router.push(currentGame.editorEntry.location)"
                >
                    <div class="card-content">
                        <i class="el-icon-map-location"></i>
                        <div class="card-title">场地编辑</div>
                        <div class="card-desc">设置场景、地图与环境配置</div>
                    </div>
                </el-card>
            </el-col>

            <!-- 技能编辑 -->
            <el-col :span="6">
                <el-card
                    class="game-editor-card"
                    @click="() => $router.push(currentGame.editorEntry.skill)"
                >
                    <div class="card-content">
                        <i class="el-icon-lightning"></i>
                        <div class="card-title">技能编辑</div>
                        <div class="card-desc">定义技能系统与效果联动</div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 可视化流程图区域 -->
        <el-card
            class="visual-flow-editor"
            style="margin-top: 30px; width: calc(100% - 2px); height: 490px"
        >
            <template #header>
                <div class="card-header">
                    <span>可视化流程图</span>
                    <div>
                        <el-tooltip
                            content="点击节点可以选中并编辑属性，选中节点后可以删除"
                            placement="top"
                        >
                            <el-button icon="QuestionFilled" circle></el-button>
                        </el-tooltip>
                        <el-button type="primary" icon="Edit" @click="openFlowEditor"
                            >全屏编辑</el-button
                        >
                    </div>
                </div>
            </template>

            <div class="flow-container">
                <VueFlow
                    class="floow_card_body"
                    :nodes="nodes"
                    :edges="edges"
                    :node-types="{ custom: { component: CustomNode } }"
                    :edge-types="edgeTypes"
                    style="width: 100%; height: 100%"
                    @node-click="onNodeClick"
                    @node-drag-stop="onNodeDragStop"
                    @connect="onConnect"
                >
                    <template #node-custom="{ node }">
                        <component :is="components.customNode" :node="node" />
                    </template>

                    <template #edge-default="{ edge }">
                        <component :is="components.customEdge" :edge="edge" />
                    </template>
                </VueFlow>
            </div>

            <!-- 节点操作面板 -->
            <div class="flow-control-panel">
                <h4>节点操作</h4>
                <el-button-group class="node-button-group">
                    <el-button size="small" icon="User" @click="addNode('character')"
                        >添加角色节点</el-button
                    >
                    <el-button size="small" icon="Bell" @click="addNode('event')"
                        >添加事件节点</el-button
                    >
                    <el-button size="small" icon="Location" @click="addNode('location')"
                        >添加场地节点</el-button
                    >
                    <el-button size="small" icon="Star" @click="addNode('skill')"
                        >添加技能节点</el-button
                    >
                </el-button-group>

                <h4 style="margin-top: 10px">高级节点</h4>
                <el-button-group class="node-button-group">
                    <el-button
                        size="small"
                        type="success"
                        icon="SwitchButton"
                        @click="addNode('choice')"
                        >添加选择节点</el-button
                    >
                    <el-button size="small" type="success" icon="Present" @click="addNode('reward')"
                        >添加奖励节点</el-button
                    >
                    <el-button
                        size="small"
                        type="success"
                        icon="Connection"
                        @click="addNode('condition')"
                        >添加条件节点</el-button
                    >
                </el-button-group>

                <div v-if="selectedNode" style="margin-top: 15px">
                    <h4>当前选中节点</h4>
                    <p>ID: {{ selectedNode.id }}</p>
                    <p>类型: {{ selectedNode.data.category }}</p>
                    <p>
                        位置: ({{ Math.round(selectedNode.position.x) }},
                        {{ Math.round(selectedNode.position.y) }})
                    </p>
                </div>
            </div>
        </el-card>
    </el-card>

    <el-dialog
        v-model="flowEditorVisible"
        title="可视化流程图编辑器"
        :fullscreen="true"
        :show-close="false"
        class="flow-editor-dialog"
    >
        <div class="flow-editor-header">
            <span>当前游戏：{{ currentGame.name }}</span>
            <div class="flow-editor-controls">
                <el-button icon="Check" @click="saveFlowData">保存</el-button>
                <el-button icon="RefreshLeft" @click="resetFlowData">重置</el-button>
                <el-button icon="CloseBold" @click="closeFlowEditor">关闭</el-button>
            </div>
        </div>

        <div class="flow-editor-content">
            <div class="flow-editor-sidebar">
                <!-- 全屏模式下的节点操作面板 -->
                <div class="fullscreen-control-panel">
                    <h3>添加节点</h3>
                    <div class="node-buttons">
                        <h4>基本节点</h4>
                        <el-button-group class="node-button-group">
                            <el-button size="default" icon="User" @click="addNode('character')"
                                >角色节点</el-button
                            >
                            <el-button size="default" icon="Bell" @click="addNode('event')"
                                >事件节点</el-button
                            >
                            <el-button size="default" icon="Location" @click="addNode('location')"
                                >场地节点</el-button
                            >
                            <el-button size="default" icon="Star" @click="addNode('skill')"
                                >技能节点</el-button
                            >
                        </el-button-group>

                        <h4 style="margin-top: 15px">高级节点</h4>
                        <el-button-group class="node-button-group">
                            <el-button
                                size="default"
                                type="success"
                                icon="SwitchButton"
                                @click="addNode('choice')"
                                >选择节点</el-button
                            >
                            <el-button
                                size="default"
                                type="success"
                                icon="Present"
                                @click="addNode('reward')"
                                >奖励节点</el-button
                            >
                            <el-button
                                size="default"
                                type="success"
                                icon="Connection"
                                @click="addNode('condition')"
                                >条件节点</el-button
                            >
                        </el-button-group>
                    </div>

                    <div v-if="selectedNode" style="margin-top: 20px">
                        <h3>当前选中节点</h3>
                        <p><strong>ID:</strong> {{ selectedNode.id }}</p>
                        <p><strong>类型:</strong> {{ selectedNode.data.category }}</p>
                        <p>
                            <strong>位置:</strong> ({{ Math.round(selectedNode.position.x) }},
                            {{ Math.round(selectedNode.position.y) }})
                        </p>
                    </div>
                </div>
            </div>

            <div class="flow-editor-main">
                <VueFlow
                    v-model:nodes="nodes"
                    v-model:edges="edges"
                    :node-types="{ custom: { component: CustomNode } }"
                    :edge-types="{ default: { component: CustomEdge } }"
                    style="width: 100%; height: 100vh; overflow: auto"
                    @node-click="onNodeClick"
                    @node-drag-stop="onNodeDragStop"
                    @connect="onConnect"
                >
                    <template #node-custom="{ node }">
                        <component :is="components.customNode" :node="node" />
                    </template>

                    <template #edge-default="{ edge }">
                        <component :is="components.customEdge" :edge="edge" />
                    </template>
                </VueFlow>
            </div>

            <!-- 节点属性编辑面板 -->
            <div v-if="selectedNode" class="node-property-panel">
                <h3>节点属性编辑</h3>
                <NodePropertyEditor
                    :node="selectedNode"
                    @update:node="
                        (updatedNode) => {
                            // 更新节点数据
                            const index = nodes.value.findIndex((n) => n.id === updatedNode.id);
                            if (index !== -1) {
                                // 使用解构赋值确保响应式更新
                                nodes.value[index] = { ...nodes.value[index], ...updatedNode };

                                // 更新选中的节点，确保属性面板显示最新的节点属性
                                selectedNode.value = nodes.value[index];

                                // 刷新流程图
                                refreshFlowChart();

                                // 显示成功消息
                                ElMessage.success('节点属性已更新');
                            }
                        }
                    "
                />
            </div>
        </div>
    </el-dialog>
</template>

<style>
/* these are necessary styles for vue flow */
@import '@vue-flow/core/dist/style.css';

/* this contains the default theme, these are optional styles */
@import '@vue-flow/core/dist/theme-default.css';

/* 自定义流程图画布样式 */
:deep(.vue-flow__container) {
    background-color: #f0f2f5; /* 浅灰色背景 */
}

:deep(.vue-flow__pane) {
    background-image: radial-gradient(#e4e7ed 1px, transparent 1px);
    background-size: 20px 20px; /* 网格大小 */
}
</style>

<style lang="less" scoped>
.edit-game {
    margin: 24px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .card-header {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
    }
}

.editor-cards {
    margin-bottom: 24px;
}

.game-editor-card {
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-5px);
    }
}

.card-content {
    text-align: center;
    padding: 20px 0;
}

.card-title {
    margin: 10px 0 5px;
    font-size: 16px;
    font-weight: bold;
}

.card-desc {
    font-size: 13px;
    color: #999;
}

.visual-flow-editor {
    p {
        margin: 0;
        font-size: 14px;
        color: #666;
    }

    .flow-container {
        width: 100%;
        min-height: 450px;
        max-height: 600px;
        overflow: auto;
    }
}

.flow-control-panel {
    margin-top: 20px;
    padding: 15px;
    background-color: #f0f2f5;
    border-radius: 4px;
    border: 1px solid #d4d7de;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    h4 {
        margin-top: 0;
        margin-bottom: 10px;
        color: #303133;
        font-weight: 600;
    }

    .node-button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .el-button {
            margin-right: 0;
        }
    }
}

:deep(.vue-flow__node) {
    display: block !important;
    min-width: 180px;
    background: #ffffff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
}

.node-header {
    padding: 8px 12px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    font-weight: 600;
}

.node-content {
    padding: 8px 12px;
    font-size: 12px;
    color: #666;

    .truncate-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 160px;
    }
}

:deep(.vue-flow__edge) {
    display: block !important;
}

.flow-editor-dialog {
    .el-dialog__header {
        padding: 0;
        border-bottom: none;
    }

    .el-dialog__body {
        padding: 0;
        height: calc(100vh - 120px);
    }
}

.flow-editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
}

.flow-editor-controls {
    display: flex;
    gap: 10px;
}

.flow-editor-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
}

.flow-editor-sidebar {
    width: 220px;
    height: 100%;
    background-color: #f5f7fa;
    border-right: 1px solid #e4e7ed;
    padding: 15px;
    overflow-y: auto;
}

.fullscreen-control-panel {
    h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #303133;
    }

    h4 {
        margin-bottom: 10px;
        color: #606266;
    }

    .node-button-group {
        display: flex;
        flex-direction: column;
        width: 100%;

        .el-button {
            margin-bottom: 8px;
            justify-content: flex-start;
        }
    }
}

.flow-editor-main {
    flex: 1;
    height: 100%;
    position: relative;
}

.node-property-panel {
    width: 300px;
    height: 100%;
    background-color: #f5f7fa;
    border-left: 1px solid #e4e7ed;
    padding: 15px;
    overflow-y: auto;
}

.node-buttons {
    margin-bottom: 20px;
}

:deep(.vue-flow__container) {
    height: 100vh !important;
    width: 100% !important;
}

:deep(.el-dialog__body) {
    height: 100vh !important;
    width: 100% !important;
}

// /* 确保非全屏时 vue-flow 容器仍能正确渲染 */
:deep(.floow_card_body .vue-flow__container) {
    height: 100% !important;
}

:deep(.floow_card_body) {
    width: 100% !important;
    height: 490px !important;
}
</style>