<script setup lang="ts">
import { ref, markRaw, computed, reactive, onMounted, onUnmounted } from 'vue';
import { VueFlow, useNodes, useEdges } from '@vue-flow/core';
import { ElMessage, ElMessageBox, ElTooltip } from 'element-plus';
import NodePropertyModal from '@/components/NodePropertyModal.vue';
import { Edit, Delete, CopyDocument, Connection } from '@element-plus/icons-vue';
import request from '../utils/request';
import NodePropertyEditor from '../components/NodePropertyEditor.vue';

// 导入自定义组件
import CustomNode from '@/components/flow/CustomNode.vue';
import CustomEdge from '@/components/flow/CustomEdge.vue';
import FlowContextMenu from '@/components/flow/FlowContextMenu.vue';
import ConnectingModeIndicator from '@/components/flow/ConnectingModeIndicator.vue';

// 导入工具函数
import {
    createNode,
    createEdge,
    canConnect,
    getConnectionCompatibility,
    duplicateNode as duplicateNodeUtil,
    exportFlowToJson,
    importFlowFromJson,
    getDefaultNodeData,
    getNodeTypeName,
    getNodeTypeIcon,
} from '@/utils/flowUtils';

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
        type: 'custom',
        label: '角色编辑',
        position: { x: 250, y: 5 },
        data: { category: 'character' },
    },
    {
        id: 'event-editor',
        type: 'custom',
        label: '事件编辑',
        position: { x: 100, y: 100 },
        data: { category: 'event' },
    },
    {
        id: 'location-editor',
        type: 'custom',
        label: '场地编辑',
        position: { x: 400, y: 100 },
        data: { category: 'location' },
    },
    {
        id: 'skill-editor',
        type: 'custom',
        label: '技能编辑',
        position: { x: 250, y: 200 },
        data: { category: 'skill' },
    },
]);

const edges = ref([
    {
        id: 'e1-2',
        source: 'character-editor',
        target: 'event-editor',
        type: 'default',
        animated: false,
        style: { stroke: '#409EFF' },
        markerEnd: {
            type: 'arrowclosed',
            width: 20,
            height: 20,
            color: '#409EFF',
        },
    },
    {
        id: 'e1-3',
        source: 'character-editor',
        target: 'location-editor',
        type: 'default',
        animated: false,
        style: { stroke: '#409EFF' },
        markerEnd: {
            type: 'arrowclosed',
            width: 20,
            height: 20,
            color: '#409EFF',
        },
    },
    {
        id: 'e2-4',
        source: 'event-editor',
        target: 'skill-editor',
        type: 'default',
        animated: false,
        style: { stroke: '#409EFF' },
        markerEnd: {
            type: 'arrowclosed',
            width: 20,
            height: 20,
            color: '#409EFF',
        },
    },
    {
        id: 'e3-4',
        source: 'location-editor',
        target: 'skill-editor',
        type: 'default',
        animated: false,
        style: { stroke: '#409EFF' },
        markerEnd: {
            type: 'arrowclosed',
            width: 20,
            height: 20,
            color: '#409EFF',
        },
    },
]);

// 新增节点模板
const nodeTemplates = markRaw({
    character: {
        id: '',
        type: 'custom',
        label: '新角色节点',
        position: { x: 0, y: 0 },
        data: { category: 'character' },
    },
    event: {
        id: '',
        type: 'custom',
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
        type: 'custom',
        label: '新场地节点',
        position: { x: 0, y: 0 },
        data: { category: 'location' },
    },
    skill: {
        id: '',
        type: 'custom',
        label: '新技能节点',
        position: { x: 0, y: 0 },
        data: { category: 'skill' },
    },
    // 新增节点类型
    choice: {
        id: '',
        type: 'custom',
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
        type: 'custom',
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
        type: 'custom',
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
    mouseX: 0,
    mouseY: 0,
    showConnectionLine: false,
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
    if (connectingMode.active && connectingMode.sourceNode) {
        console.log('连接模式下点击节点，创建连接');

        // 直接调用createConnection函数，所有验证逻辑都在该函数中处理
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

    // 如果连接模式处于激活状态，也取消连接模式
    // if (connectingMode.active) {
    //     cancelConnectingMode();
    // }
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

    // 创建节点数据的深拷贝，避免在编辑过程中直接修改原始数据
    selectedNode.value = JSON.parse(JSON.stringify(contextMenu.node));

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
        // 如果不在全屏模式，打开节点属性模态框
        propertyModalVisible.value = true;
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

// 鼠标移动事件处理函数
const handleMouseMove = (event) => {
    if (!connectingMode.active || !connectingMode.sourceNode) {
        return; // 如果连接模式未激活或源节点未设置，则不处理
    }

    // 获取鼠标相对于流程图容器的位置
    const flowContainer = document.querySelector('.vue-flow__container');
    if (!flowContainer) {
        return; // 如果找不到流程图容器，则不处理
    }

    const rect = flowContainer.getBoundingClientRect();
    const { clientX, clientY } = event;

    // 计算鼠标相对于流程图容器的位置
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    // 更新连接模式状态
    connectingMode.mouseX = mouseX;
    connectingMode.mouseY = mouseY;

    // 确保显示连接线
    connectingMode.showConnectionLine = true;

    // 更新临时连接线
    const tempLine = document.querySelector('.temp-connection-line path');
    if (tempLine) {
        // 获取源节点的位置
        const sourceNode = document.querySelector(`[data-id="${connectingMode.sourceNode.id}"]`);
        if (sourceNode) {
            const sourceRect = sourceNode.getBoundingClientRect();
            // 计算源节点中心点相对于流程图容器的位置
            const sourceX = sourceRect.left + sourceRect.width / 2 - rect.left;
            const sourceY = sourceRect.top + sourceRect.height / 2 - rect.top;

            // 更新连接线路径
            tempLine.setAttribute('d', `M ${sourceX},${sourceY} L ${mouseX},${mouseY}`);
        }
    }

    // 高亮可能的目标节点
    const sourceNode = nodes.value.find((n) => n.id === connectingMode.sourceNode.id);
    if (sourceNode) {
        highlightPossibleTargets(sourceNode);
    }

    // 防止过多的日志输出，只在调试时使用
    // console.log('鼠标移动:', {
    //     mousePos: { x: connectingMode.mouseX, y: connectingMode.mouseY },
    //     sourcePos: {
    //         x: connectingMode.sourceNode.position.x,
    //         y: connectingMode.sourceNode.position.y,
    //     },
    // });
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

    // 先移除之前可能存在的鼠标移动事件监听器
    document.removeEventListener('mousemove', handleMouseMove);

    // 创建源节点的深拷贝，避免引用问题
    const sourceNodeCopy = {
        id: node.id,
        label: node.label || '未命名节点',
        category: node.data?.category,
        position: { ...node.position }, // 创建位置对象的副本
    };

    // 设置连接模式状态
    connectingMode.active = true;
    connectingMode.sourceNode = sourceNodeCopy;

    // 初始化鼠标位置为源节点位置
    connectingMode.mouseX = node.position.x;
    connectingMode.mouseY = node.position.y;
    connectingMode.showConnectionLine = true;

    // 添加鼠标移动事件监听器
    document.addEventListener('mousemove', handleMouseMove);

    // 添加连接模式激活类
    const flowContainer = document.querySelector('.vue-flow__container');
    if (flowContainer) {
        flowContainer.classList.add('connecting-mode-active');
    }

    // 高亮所有可能的目标节点
    highlightPossibleTargets(node);

    // 关闭右键菜单
    closeContextMenu();

    // 显示提示
    ElMessage({
        message: `正在从节点 "${node.label || node.id}" 创建连接，请点击目标节点`,
        type: 'info',
        duration: 3000,
    });

    console.log('连接模式已激活，源节点:', connectingMode.sourceNode);
};

// 高亮可能的目标节点
const highlightPossibleTargets = (sourceNode) => {
    if (!sourceNode || !sourceNode.data?.category) return;

    const sourceCategory = sourceNode.data.category;
    const allowedTargets = autoConnectRules[sourceCategory] || [];

    // 获取所有节点元素
    const nodeElements = document.querySelectorAll('.vue-flow__node');

    // 遍历所有节点，根据兼容性添加或移除高亮类
    nodeElements.forEach((el) => {
        const nodeId = el.getAttribute('data-id');

        // 跳过源节点自身
        if (nodeId === sourceNode.id) return;

        // 查找对应的节点数据
        const nodeData = nodes.value.find((n) => n.id === nodeId);
        if (!nodeData || !nodeData.data?.category) return;

        const targetCategory = nodeData.data.category;

        // 检查是否是允许的目标类型
        if (allowedTargets.includes(targetCategory)) {
            el.classList.add('possible-target');
            el.classList.add('compatible-target');
        } else {
            el.classList.add('possible-target');
            el.classList.add('incompatible-target');
        }
    });
};

// 取消连接模式
const cancelConnectingMode = () => {
    console.log('退出连接模式');

    // 先移除鼠标移动事件监听器，避免状态更新后仍然触发事件
    document.removeEventListener('mousemove', handleMouseMove);

    // 重置连接模式状态
    connectingMode.active = false;
    connectingMode.sourceNode = null;
    connectingMode.showConnectionLine = false;
    connectingMode.mouseX = 0;
    connectingMode.mouseY = 0;

    // 移除连接模式激活类
    const flowContainer = document.querySelector('.vue-flow__container');
    if (flowContainer) {
        flowContainer.classList.remove('connecting-mode-active');
    }

    // 移除所有可能目标节点的高亮
    const nodeElements = document.querySelectorAll('.vue-flow__node');
    nodeElements.forEach((el) => {
        el.classList.remove('possible-target');
        el.classList.remove('compatible-target');
        el.classList.remove('incompatible-target');
    });

    // 通知Vue Flow更新
    setTimeout(() => {
        const vueFlowInstance = document.querySelector('.vue-flow');
        if (vueFlowInstance) {
            // 触发一个鼠标移动事件，强制Vue Flow重新渲染
            const event = new MouseEvent('mousemove', {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            vueFlowInstance.dispatchEvent(event);
        }
    }, 0);
};

// 在连接模式下创建连接
const createConnection = (targetNode) => {
    if (!targetNode || !targetNode.id) {
        console.error('无效的目标节点参数:', targetNode);
        cancelConnectingMode();
        return;
    }

    console.log('尝试创建连接，目标节点:', targetNode.id);

    // 验证源节点
    if (!connectingMode.sourceNode || !connectingMode.sourceNode.id) {
        console.error('无效的源节点:', connectingMode.sourceNode);
        ElMessage.error('无法创建连接: 源节点无效');
        cancelConnectingMode();
        return;
    }

    // 确保源节点和目标节点不同
    if (connectingMode.sourceNode.id === targetNode.id) {
        console.log('无法连接到同一节点');
        ElMessage.warning('无法连接到同一节点');
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
        cancelConnectingMode();
        return;
    }

    // 检查节点类型兼容性
    const sourceCategory = connectingMode.sourceNode.category;
    const targetCategory = targetNode.data?.category;

    if (!sourceCategory || !targetCategory) {
        console.error('节点类别未定义:', { sourceCategory, targetCategory });
        ElMessage.error('无法创建连接: 节点类别未定义');
        cancelConnectingMode();
        return;
    }

    const allowedTargets = autoConnectRules[sourceCategory] || [];
    if (!allowedTargets.includes(targetCategory)) {
        console.log(`无法连接: ${sourceCategory} 类型节点不能连接到 ${targetCategory} 类型节点`);
        ElMessage.warning(`${sourceCategory} 类型节点不能连接到 ${targetCategory} 类型节点`);
        cancelConnectingMode();
        return;
    }

    try {
        // 创建新连接
        const newEdge = {
            id: `edge_${connectingMode.sourceNode.id}_${targetNode.id}_${Date.now()}`,
            source: connectingMode.sourceNode.id,
            target: targetNode.id,
            sourceHandle: 'source', // 指定源连接点
            targetHandle: 'target', // 指定目标连接点
            type: 'default',
            animated: false,
            label: '',
            style: { stroke: '#409EFF' }, // 使用主题蓝色
            markerEnd: {
                type: 'arrowclosed',
                width: 20,
                height: 20,
                color: '#409EFF',
            },
            data: {
                sourceCategory: sourceCategory,
                targetCategory: targetCategory,
            },
        };

        console.log('创建新连接:', newEdge);

        // 添加新连接
        edges.value.push(newEdge);

        // 刷新流程图
        refreshFlowChart();

        ElMessage.success('连接已创建');
    } catch (error) {
        console.error('创建连接时发生错误:', error);
        ElMessage.error('创建连接失败: ' + (error.message || '未知错误'));
    } finally {
        // 无论成功还是失败，都退出连接模式
        cancelConnectingMode();
    }
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
            animated: false,
            style: { stroke: '#409EFF' }, // 使用主题蓝色
            markerEnd: {
                type: 'arrowclosed',
                width: 20,

                color: '#409EFF',
            },
        };

        edges.value.push(newEdge);
        refreshFlowChart();
    }
};

// 手动连接节点时的事件处理
const onConnect = (params) => {
    console.log('onConnect 事件触发，参数:', params);

    // 检查参数是否完整
    if (!params.source || !params.target) {
        console.error('连接参数不完整:', params);
        ElMessage.error('无法创建连接：参数不完整');
        return; // 如果参数不完整，终止函数执行
    }

    // 检查是否已存在相同的连接
    const connectionExists = edges.value.some(
        (edge) => edge.source === params.source && edge.target === params.target,
    );

    if (connectionExists) {
        console.log('连接已存在，无法创建重复连接');
        ElMessage.warning('连接已存在');
        return;
    }

    // 确保新创建的边有所有必要属性
    const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}-${Date.now()}`,
        type: 'default',
        animated: false,
        label: '',
        style: { stroke: '#409EFF' }, // 使用主题蓝色
        markerEnd: {
            type: 'arrowclosed',
            width: 20,
            height: 20,
            color: '#409EFF',
        },
    };

    console.log('创建新连接:', newEdge);

    // 添加新连接
    edges.value.push(newEdge);

    // 刷新流程图
    refreshFlowChart();

    // 显示成功消息
    ElMessage.success('连接已创建');

    // 如果处于连接模式，退出连接模式
    if (connectingMode.active) {
        cancelConnectingMode();
    }
};

// 全屏流程图编辑器可见性
const flowEditorVisible = ref(false);
// 节点属性模态框可见性
const propertyModalVisible = ref(false);

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

// 标记流程图为已修改状态
const setModified = (value) => {
    // 这里可以添加更多逻辑，比如显示保存提示、更新UI状态等
    console.log('流程图已修改:', value);
    // 如果需要，可以添加一个状态变量来跟踪修改状态
    // isModified.value = value;
};

// 处理节点属性模态框保存
const handlePropertySave = (updatedNode) => {
    if (!updatedNode || !selectedNode.value) return;

    // 更新节点数据
    Object.assign(selectedNode.value, updatedNode);

    // 更新图表中的节点
    const node = nodes.value.find((n) => n.id === updatedNode.id);
    if (node) {
        // 更新节点属性
        Object.assign(node, updatedNode);

        // 刷新流程图
        refreshFlowChart();

        // 标记为已修改
        setModified(true);
    }
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

// 自定义节点类型
const nodeTypes = markRaw({
    custom: CustomNode,
});

// 自定义边类型
const edgeTypes = markRaw({
    default: CustomEdge,
});
const updateNodeFun = (updatedNode) => {
    // 确保nodes.value存在且是数组
    if (nodes.value && Array.isArray(nodes.value)) {
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
        } else {
            console.error('未找到要更新的节点:', updatedNode.id);
            ElMessage.error('更新失败：未找到节点');
        }
    } else {
        console.error('nodes.value不是有效数组:', nodes.value);
        ElMessage.error('更新失败：节点列表无效');
    }
};
</script>

<template>
    <el-card class="edit-game">
        <template #header>
            <div class="card-header">
                <span>编辑游戏：{{ currentGame.name }}</span>
            </div>

            <!-- 节点属性模态框 -->
            <NodePropertyModal
                v-model:visible="propertyModalVisible"
                :node="selectedNode"
                @save="handlePropertySave"
                @close="selectedNode = null"
            />
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
                            content="点击节点可以选中并编辑属性，在非全屏模式下会打开属性编辑对话框，在全屏模式下会在右侧显示属性面板"
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
                    :node-types="nodeTypes"
                    :edge-types="edgeTypes"
                    :connect-on-click="true"
                    style="width: 100%; height: 100%"
                    @node-click="onNodeClick"
                    @node-context-menu="onNodeContextMenu"
                    @node-drag-stop="onNodeDragStop"
                    @connect="onConnect"
                    @pane-click="closeContextMenu"
                >
                    <template #edge-default="props">
                        <CustomEdge v-bind="props" />
                    </template>

                    <template #node-custom="props">
                        <CustomNode v-bind="props" />
                    </template>

                    <template #connection-line="{ sourceX, sourceY, targetX, targetY }">
                        <path
                            :d="`M ${sourceX},${sourceY} L ${targetX},${targetY}`"
                            class="vue-flow__connection-path"
                            stroke="#409EFF"
                            stroke-width="2"
                            fill="none"
                        />
                    </template>

                    <template #edge-marker>
                        <marker
                            id="arrowclosed"
                            viewBox="0 0 10 10"
                            refX="5"
                            refY="5"
                            markerWidth="8"
                            markerHeight="8"
                            orient="auto-start-reverse"
                        >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#409EFF" />
                        </marker>
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
                    :node-types="nodeTypes"
                    :edge-types="edgeTypes"
                    :connect-on-click="true"
                    style="width: 100%; height: 100vh; overflow: auto"
                    @node-click="onNodeClick"
                    @node-context-menu="onNodeContextMenu"
                    @node-drag-stop="onNodeDragStop"
                    @connect="onConnect"
                    @pane-click="closeContextMenu"
                >
                    <template #edge-default="props">
                        <CustomEdge v-bind="props" />
                    </template>

                    <template #node-custom="props">
                        <CustomNode v-bind="props" />
                    </template>

                    <template #connection-line="{ sourceX, sourceY, targetX, targetY }">
                        <path
                            :d="`M ${sourceX},${sourceY} L ${targetX},${targetY}`"
                            class="vue-flow__connection-path"
                            stroke="#409EFF"
                            stroke-width="2"
                            fill="none"
                        />
                    </template>

                    <template #edge-marker>
                        <marker
                            id="arrowclosed"
                            viewBox="0 0 10 10"
                            refX="5"
                            refY="5"
                            markerWidth="8"
                            markerHeight="8"
                            orient="auto-start-reverse"
                        >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#409EFF" />
                        </marker>
                    </template>
                </VueFlow>
            </div>

            <!-- 节点属性编辑面板 -->
            <div v-if="selectedNode" class="node-property-panel">
                <h3>节点属性编辑</h3>
                <NodePropertyEditor :node="selectedNode" @update:node="updateNodeFun" />
            </div>
        </div>
    </el-dialog>
    <!-- 使用导入的组件替换内联组件 -->
    <teleport to="body">
        <!-- 节点右键菜单 -->
        <FlowContextMenu
            :visible="contextMenu.visible"
            :x="contextMenu.x"
            :y="contextMenu.y"
            :node="contextMenu.node"
            @edit-node="editNode"
            @delete-node="removeContextMenuNode"
            @duplicate-node="duplicateNode"
            @start-connecting="startConnectingNodes"
            @close="closeContextMenu"
        />

        <!-- 连接模式提示 -->
        <ConnectingModeIndicator
            :visible="connectingMode.active"
            :source-node="connectingMode.sourceNode"
            @cancel-connecting="cancelConnectingMode"
        />

        <!-- 临时连接线 -->
        <svg
            v-if="connectingMode.active && connectingMode.showConnectionLine"
            class="temp-connection-line"
            style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
            "
        >
            <g>
                <path
                    :d="`M ${connectingMode.sourceNode?.position.x + 180},${
                        connectingMode.sourceNode?.position.y + 50
                    } L ${connectingMode.mouseX},${connectingMode.mouseY}`"
                    stroke="#409EFF"
                    stroke-width="2"
                    fill="none"
                    stroke-dasharray="5,5"
                />
                <!-- 添加箭头 -->
                <marker
                    id="temp-arrow"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#409EFF" />
                </marker>
                <!-- 添加起点和终点指示器 -->
                <circle
                    :cx="connectingMode.sourceNode?.position.x + 180"
                    :cy="connectingMode.sourceNode?.position.y + 50"
                    r="4"
                    fill="#409EFF"
                />
                <circle
                    :cx="connectingMode.mouseX"
                    :cy="connectingMode.mouseY"
                    r="4"
                    fill="#409EFF"
                    opacity="0.6"
                />
            </g>
        </svg>
    </teleport>
</template>

<style>
/* 导入外部CSS文件 */
@import '../assets/styles/gameEditor.css';
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

/* 节点连接点样式 */
.node-handles {
    position: relative;
    width: 100%;
    height: 0;
}

.node-handle {
    position: absolute;
    width: 16px;
    height: 16px;
    background: #fff;
    border: 2px solid #409eff;
    border-radius: 50%;
    cursor: crosshair;
    z-index: 10;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.node-handle:hover {
    transform: scale(1.3);
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.4);
}

.node-handle.source {
    top: -25px;
    right: 10px;
}

.node-handle.target {
    bottom: -25px;
    left: 10px;
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

/* 连接模式下的连接点高亮 */
:deep(.vue-flow__node) .node-handle {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.vue-flow__node) .node-handle:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.3);
}

/* 连接模式激活时的动画效果 */
.connecting-mode-active :deep(.vue-flow__node) .node-handle {
    animation: pulse 1.5s infinite;
}

/* 可能的目标节点样式 */
:deep(.vue-flow__node.possible-target) {
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.5);
    transform: scale(1.03);
    transition: all 0.3s ease;
}

:deep(.vue-flow__node.possible-target:hover) {
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.8);
    transform: scale(1.05);
}

/* 临时连接线样式 */
.temp-connection-line {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
}

/* 连接模式下的鼠标样式 */
.connecting-mode-active :deep(.vue-flow__pane) {
    cursor: crosshair;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.7);
    }
    70% {
        box-shadow: 0 0 0 6px rgba(64, 158, 255, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
    }
}

/* 节点类型样式 */
.custom-node.node-event {
    border-left: 4px solid #67c23a;
}

.custom-node.node-choice {
    border-left: 4px solid #e6a23c;
}

.custom-node.node-reward {
    border-left: 4px solid #f56c6c;
}

.custom-node.node-condition {
    border-left: 4px solid #409eff;
}

.custom-node.node-character {
    border-left: 4px solid #9254de;
}

.custom-node.node-location {
    border-left: 4px solid #ff9800;
}

.custom-node.node-skill {
    border-left: 4px solid #00bcd4;
}

/* 选中节点样式 */
.custom-node.selected {
    box-shadow: 0 0 0 2px #409eff;
}

/* 边标签样式 */
:deep(.vue-flow__edge-text) {
    fill: #606266;
    font-size: 12px;
    pointer-events: none;
    background-color: white;
    padding: 2px 4px;
    border-radius: 4px;
}

:deep(.vue-flow__edge-path) {
    stroke-width: 2px;
}

:deep(.vue-flow__edge.animated .vue-flow__edge-path) {
    stroke-dasharray: 5;
    animation: dashdraw 0.5s linear infinite;
}

@keyframes dashdraw {
    from {
        stroke-dashoffset: 10;
    }
    to {
        stroke-dashoffset: 0;
    }
}

/* 兼容和不兼容目标节点样式 */
:deep(.vue-flow__node.compatible-target) {
    box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.6); /* 绿色阴影表示兼容 */
    border-color: #67c23a;
}

:deep(.vue-flow__node.incompatible-target) {
    box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.6); /* 红色阴影表示不兼容 */
    border-color: #f56c6c;
    opacity: 0.7;
}

/* 连接线样式增强 */
:deep(.vue-flow__edge) {
    transition: stroke-width 0.2s ease;
}

:deep(.vue-flow__edge:hover) {
    stroke-width: 3px;
    cursor: pointer;
}

:deep(.vue-flow__edge.selected) {
    stroke-width: 3px;
    stroke: #409eff;
}

/* 临时连接线增强样式 */
.temp-connection-line path {
    stroke-dasharray: 5, 5;
    animation: dash 1s linear infinite;
    pointer-events: none;
}

@keyframes dash {
    to {
        stroke-dashoffset: -10;
    }
}

/* 连接模式下的节点样式 */
.connecting-mode-active :deep(.vue-flow__node) {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.connecting-mode-active :deep(.vue-flow__node:hover) {
    transform: scale(1.05);
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.3);
}

/* 节点拖拽时的样式 */
:deep(.vue-flow__node.dragging) {
    z-index: 1000;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* 节点连接点悬停效果增强 */
.node-handle:hover {
    transform: scale(1.3);
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.4);
    z-index: 1001;
}

/* 连接模式指示器增强 */
.connecting-mode-indicator .el-alert {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slide-down 0.3s ease;
}

@keyframes slide-down {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>