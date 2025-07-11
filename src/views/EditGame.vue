<script setup lang="ts">
import { ref, markRaw, computed, reactive, onMounted, onUnmounted } from 'vue';
import { VueFlow, useNodes, useEdges } from '@vue-flow/core';
import { ElMessage, ElMessageBox, ElTooltip } from 'element-plus';
import NodePropertyModal from '@/components/NodePropertyModal.vue';
import { Edit, Delete, CopyDocument, Connection } from '@element-plus/icons-vue';
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

// 右键菜单状态
const contextMenu = reactive({
    visible: false,
    x: 0,
    y: 0,
    node: null,
});

// 连接模式状态
const connectingMode = reactive({
    active: false,
    sourceNode: null,
});

// 节点点击事件
const onNodeClick = (...args) => {
    // Vue Flow 可能传递 event 和 node 参数，也可能传递包含 node 的对象
    let node = null;
    if (args.length > 1) {
        // 标准格式: (event, node)
        node = args[1];
    } else if (args[0]?.node) {
        // 可能传递的是 { event, node } 对象
        node = args[0].node;
    } else {
        // 未知格式
        console.error('无法解析节点点击事件参数:', args);
        return;
    }

    if (!node?.id) {
        console.error('无效的节点参数:', node);
        return;
    }

    console.log('节点点击:', node.id);

    // 如果处于连接模式，则创建连接
    if (connectingMode.active) {
        console.log('连接模式下点击节点，创建连接');
        createConnection(node);
        return;
    }

    // 正常模式下选中节点
    console.log('选中节点:', node.id);
    selectedNode.value = node;
};

// 节点右键点击事件
const onNodeContextMenu = (...args) => {
    // Vue Flow 可能传递 event 和 node 参数，也可能传递包含 node 的对象
    let event = null;
    let node = null;

    if (args.length > 1) {
        // 标准格式: (event, node)
        event = args[0];
        node = args[1];
    } else if (args[0]?.node) {
        // 可能传递的是 { event, node } 对象
        event = args[0].event;
        node = args[0].node;
    } else {
        // 未知格式
        console.error('无法解析节点右键事件参数:', args);
        return;
    }

    if (!node?.id) {
        console.error('无效的节点参数:', node);
        return;
    }

    // Vue Flow 可能传递的是自定义事件对象，需要检查原生事件
    const nativeEvent = event.event || event;

    // 阻止默认右键菜单
    if (nativeEvent.preventDefault) {
        nativeEvent.preventDefault();
    }

    // 设置右键菜单位置和节点
    contextMenu.visible = true;
    contextMenu.x = nativeEvent.clientX || 0;
    contextMenu.y = nativeEvent.clientY || 0;
    contextMenu.node = node;

    // 同时选中该节点
    selectedNode.value = node;
};

// 关闭右键菜单
const closeContextMenu = () => {
    contextMenu.visible = false;
    // 确保在关闭菜单后重置当前右键菜单节点
    contextMenu.node = null;
};

// 全局点击事件处理
const handleGlobalClick = (event) => {
    // 如果右键菜单可见，且点击的不是菜单本身，则关闭菜单
    if (contextMenu.visible) {
        const menuElement = document.querySelector('.node-context-menu');
        // 检查点击的元素是否是菜单本身或其子元素
        if (menuElement && !menuElement.contains(event.target)) {
            // 检查点击的元素是否是节点，如果是节点则不关闭菜单
            const isNode = event.target.closest('.vue-flow__node');
            if (!isNode) {
                closeContextMenu();
            }
        }
    }
};

// 确保右键菜单项点击事件正确触发
const handleMenuItemClick = (action, event) => {
    // 阻止事件冒泡
    if (event) {
        event.stopPropagation();
    }

    // 验证右键菜单节点数据
    if (!contextMenu.node?.id) {
        console.error('无效的右键菜单节点:', contextMenu.node);
        ElMessage.error('无法操作: 节点数据无效');
        closeContextMenu();
        return;
    }

    // 执行相应的操作
    if (action === 'edit') {
        editNode();
    } else if (action === 'duplicate') {
        duplicateNode();
    } else if (action === 'connect') {
        startConnectingNodes(contextMenu.node);
    } else if (action === 'remove') {
        removeContextMenuNode();
    }

    // 关闭右键菜单
    closeContextMenu();
};

// 挂载和卸载全局事件监听器
onMounted(() => {
    document.addEventListener('click', handleGlobalClick);
});

onUnmounted(() => {
    document.removeEventListener('click', handleGlobalClick);
});

// 编辑节点
const editNode = () => {
    // 验证节点数据
    if (!contextMenu.node || typeof contextMenu.node !== 'object') {
        console.error('无效的节点参数:', contextMenu.node);
        ElMessage.error('无法编辑: 节点参数无效');
        closeContextMenu();
        return;
    }

    if (!contextMenu.node.id || typeof contextMenu.node.id !== 'string') {
        console.error('节点ID无效:', contextMenu.node.id);
        ElMessage.error('无法编辑: 节点ID无效');
        closeContextMenu();
        return;
    }

    if (!contextMenu.node.data?.category) {
        console.error('节点类别未定义:', contextMenu.node);
        ElMessage.error('无法编辑: 节点类别未定义');
        closeContextMenu();
        return;
    }

    // 确保节点被选中
    selectedNode.value = contextMenu.node;

    // 如果在全屏模式下，聚焦到右侧的属性面板
    if (flowEditorVisible.value) {
        // 滚动属性面板到顶部
        const propertyPanel = document.querySelector('.node-property-panel');
        if (propertyPanel) {
            propertyPanel.scrollTop = 0;

            // 添加一个高亮效果，提示用户属性面板已更新
            propertyPanel.classList.add('panel-highlight');
            setTimeout(() => {
                propertyPanel.classList.remove('panel-highlight');
            }, 1000);
        }
    } else {
        // 如果不在全屏模式，可以显示一个提示
        ElMessage({
            message: `正在编辑节点: ${contextMenu.node.label || contextMenu.node.id}`,
            type: 'info',
            duration: 2000,
        });
    }

    // 最后关闭右键菜单，确保操作完成后再清理
    closeContextMenu();
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

// 从右键菜单删除节点
const removeContextMenuNode = () => {
    if (!contextMenu.node) return;

    // 获取要删除的节点
    const nodeToRemove = contextMenu.node;

    // 关闭右键菜单
    closeContextMenu();

    // 显示确认对话框
    ElMessageBox.confirm(`确定要删除节点 "${nodeToRemove.label}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(() => {
            // 过滤掉要删除的节点
            nodes.value = nodes.value.filter((node) => node.id !== nodeToRemove.id);

            // 移除与该节点相关的连线
            edges.value = edges.value.filter(
                (edge) => edge.source !== nodeToRemove.id && edge.target !== nodeToRemove.id,
            );

            // 如果当前选中的节点是被删除的节点，清除选中状态
            if (selectedNode.value && selectedNode.value.id === nodeToRemove.id) {
                selectedNode.value = null;
            }

            // 刷新流程图
            refreshFlowChart();

            // 显示成功消息
            ElMessage.success('节点已成功删除');
        })
        .catch(() => {
            ElMessage.info('已取消删除');
        });
};

// 复制节点
const duplicateNode = () => {
    if (!contextMenu.node) return;

    // 获取要复制的节点
    const nodeToDuplicate = contextMenu.node;

    // 关闭右键菜单
    closeContextMenu();

    // 创建新节点，复制原节点的属性
    const newNode = {
        id: `node_${Date.now()}`, // 生成唯一ID
        type: nodeToDuplicate.type,
        label: `${nodeToDuplicate.label} (复制)`,
        position: {
            x: nodeToDuplicate.position.x + 50, // 稍微偏移一点，以便看到新节点
            y: nodeToDuplicate.position.y + 50,
        },
        data: {
            ...nodeToDuplicate.data,
            // 可以在这里修改或添加其他属性
        },
    };

    // 添加新节点到节点列表
    nodes.value.push(newNode);

    // 刷新流程图
    refreshFlowChart();

    // 选中新节点
    selectedNode.value = newNode;

    // 显示成功消息
    ElMessage.success('节点已成功复制');
};

// 启动连接模式
const startConnectingNodes = (node) => {
    // 验证节点数据
    if (!node || typeof node !== 'object') {
        console.error('无效的节点参数:', node);
        ElMessage.error('无法启动连接模式: 节点参数无效');
        return;
    }

    if (!node.id || typeof node.id !== 'string') {
        console.error('节点ID无效:', node.id);
        ElMessage.error('无法启动连接模式: 节点ID无效');
        return;
    }

    if (!node.data?.category) {
        console.error('节点类别未定义:', node);
        ElMessage.error('无法启动连接模式: 节点类别未定义');
        return;
    }

    // 设置源节点
    connectingMode.sourceNode = node;
    connectingMode.active = true;

    // 关闭右键菜单
    closeContextMenu();

    // 显示提示
    ElMessage({
        message: `正在从节点 "${node.label || node.id}" 创建连接，请点击目标节点`,
        type: 'info',
        duration: 3000,
    });

    console.log('连接模式已激活，源节点:', {
        id: node.id,
        label: node.label,
        category: node.data.category,
        position: node.position,
    });
};

// 取消连接模式
const cancelConnectingMode = () => {
    console.log('退出连接模式');
    connectingMode.active = false;
    connectingMode.sourceNode = null;
};

// 在连接模式下创建连接
const createConnection = (targetNode) => {
    if (!targetNode || !targetNode.id) {
        console.error('无效的目标节点参数:', targetNode);
        cancelConnectingMode();
        return;
    }

    console.log('尝试创建连接，目标节点:', targetNode.id);

    if (
        !connectingMode.sourceNode ||
        !connectingMode.sourceNode.id ||
        connectingMode.sourceNode.id === targetNode.id
    ) {
        console.log('无法创建连接：源节点无效或与目标节点相同');
        cancelConnectingMode();
        return;
    }

    // 检查是否已存在相同的连接
    const connectionExists = edges.value.some(
        (edge) => edge.source === connectingMode.sourceNode.id && edge.target === targetNode.id,
    );

    if (connectionExists) {
        console.log('连接已存在，无法创建重复连接');
        ElMessage.warning('连接已存在');
    } else {
        // 创建新连接
        const newEdge = {
            id: `edge_${Date.now()}`,
            source: connectingMode.sourceNode.id,
            target: targetNode.id,
            type: 'default',
            animated: false,
            label: '',
            style: { stroke: '#409EFF' }, // 使用主题蓝色
        };

        console.log('创建新连接:', newEdge);

        // 添加新连接
        edges.value.push(newEdge);

        // 刷新流程图
        refreshFlowChart();

        ElMessage.success('连接已创建');
    }

    // 退出连接模式
    cancelConnectingMode();
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
        return { selectedNode, removeNode, onNodeContextMenu };
    },
    template: `
        <div 
            class="custom-node" 
            :class="'node-' + node.data.category"
        >
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
                    @node-context-menu="onNodeContextMenu"
                    @node-drag-stop="onNodeDragStop"
                    @connect="onConnect"
                    @pane-click="closeContextMenu"
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
                    @node-context-menu="onNodeContextMenu"
                    @node-drag-stop="onNodeDragStop"
                    @connect="onConnect"
                    @pane-click="closeContextMenu"
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
    <!-- 节点右键菜单 -->
    <teleport to="body">
        <div
            v-if="contextMenu.visible"
            class="node-context-menu"
            :style="{
                left: `${contextMenu.x}px`,
                top: `${contextMenu.y}px`,
            }"
            @click.stop
        >
            <ul>
                <li @click.stop="handleMenuItemClick('edit', $event)">
                    <el-icon><Edit /></el-icon> 编辑节点
                </li>
                <li @click.stop="handleMenuItemClick('duplicate', $event)">
                    <el-icon><CopyDocument /></el-icon> 复制节点
                </li>
                <li @click.stop="handleMenuItemClick('connect', $event)">
                    <el-icon><Connection /></el-icon> 连接节点
                </li>
                <li @click.stop="handleMenuItemClick('remove', $event)">
                    <el-icon><Delete /></el-icon> 删除节点
                </li>
            </ul>
        </div>

        <!-- 连接模式提示 -->
        <div v-if="connectingMode.active" class="connecting-mode-indicator">
            <el-alert title="连接模式已激活" type="info" :closable="false" show-icon>
                <template #default>
                    从 <strong>{{ connectingMode.sourceNode?.label }}</strong> 连接到...
                    <el-button size="small" @click="cancelConnectingMode">取消</el-button>
                </template>
            </el-alert>
        </div>
    </teleport>
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

/* 节点右键菜单样式 */
.node-context-menu {
    position: fixed;
    z-index: 10000;
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    min-width: 150px;

    ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
            padding: 8px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #606266;

            &:hover {
                background-color: #f5f7fa;
                color: #409eff;
            }

            .el-icon {
                font-size: 16px;
            }
        }
    }
}

/* 属性面板高亮效果 */
.panel-highlight {
    animation: highlight-pulse 1s ease-in-out;
}

@keyframes highlight-pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
    }
}

/* 连接模式提示样式 */
.connecting-mode-indicator {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    width: 400px;
}
</style>