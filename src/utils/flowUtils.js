/**
 * 流程图工具函数
 */

/**
 * 创建新节点
 * @param {string} type 节点类型
 * @param {Object} position 节点位置
 * @param {Object} data 节点数据
 * @returns {Object} 新节点对象
 */
export function createNode(type, position, data = {}) {
  // 生成唯一ID
  const id = `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // 获取节点类型名称
  const typeName = getNodeTypeName(type);
  
  return {
    id,
    type: 'custom', // 使用自定义节点组件
    position,
    label: typeName,
    data: {
      ...getDefaultNodeData(type),
      ...data,
      category: type,
    },
  };
}

/**
 * 创建新边
 * @param {string} source 源节点ID
 * @param {string} target 目标节点ID
 * @param {Object} data 边数据
 * @returns {Object} 新边对象
 */
export function createEdge(source, target, data = {}) {
  return {
    id: `edge_${source}_${target}_${Date.now()}`,
    source,
    target,
    type: 'custom', // 使用自定义边组件
    animated: data.animated || false,
    data: {
      ...data,
    },
  };
}

/**
 * 检查两个节点是否可以连接
 * @param {Object} sourceNode 源节点
 * @param {Object} targetNode 目标节点
 * @returns {boolean} 是否可以连接
 */
export function canConnect(sourceNode, targetNode) {
  if (!sourceNode || !targetNode) return false;
  
  // 不能连接到自己
  if (sourceNode.id === targetNode.id) return false;
  
  // 获取连接兼容性
  const compatibility = getConnectionCompatibility(sourceNode.data.category, targetNode.data.category);
  
  return compatibility.canConnect;
}

/**
 * 获取两种节点类型的连接兼容性
 * @param {string} sourceType 源节点类型
 * @param {string} targetType 目标节点类型
 * @returns {Object} 连接兼容性信息
 */
export function getConnectionCompatibility(sourceType, targetType) {
  // 定义节点类型之间的连接规则
  const connectionRules = {
    event: {
      choice: { canConnect: true, message: '事件可以连接到选择' },
      condition: { canConnect: true, message: '事件可以连接到条件' },
      reward: { canConnect: true, message: '事件可以连接到奖励' },
      event: { canConnect: true, message: '事件可以连接到事件' },
    },
    choice: {
      event: { canConnect: true, message: '选择可以连接到事件' },
      condition: { canConnect: true, message: '选择可以连接到条件' },
      reward: { canConnect: true, message: '选择可以连接到奖励' },
    },
    condition: {
      event: { canConnect: true, message: '条件可以连接到事件' },
      reward: { canConnect: true, message: '条件可以连接到奖励' },
    },
    reward: {
      event: { canConnect: true, message: '奖励可以连接到事件' },
    },
  };
  
  // 检查是否有定义的规则
  if (connectionRules[sourceType] && connectionRules[sourceType][targetType]) {
    return connectionRules[sourceType][targetType];
  }
  
  // 默认不允许连接
  return { canConnect: false, message: `${sourceType} 不能连接到 ${targetType}` };
}

/**
 * 复制节点
 * @param {Object} node 要复制的节点
 * @param {number} offsetX X轴偏移量
 * @param {number} offsetY Y轴偏移量
 * @returns {Object} 复制的新节点
 */
export function duplicateNode(node, offsetX = 50, offsetY = 50) {
  const newPosition = {
    x: node.position.x + offsetX,
    y: node.position.y + offsetY,
  };
  
  return createNode(
    node.data.category,
    newPosition,
    { ...node.data }
  );
}

/**
 * 获取节点类型的默认数据
 * @param {string} type 节点类型
 * @returns {Object} 默认数据
 */
export function getDefaultNodeData(type) {
  switch (type) {
    case 'event':
      return {
        title: '新事件',
        content: '事件描述',
        options: [],
      };
    case 'choice':
      return {
        options: [
          { text: '选项1', nextEventId: '' },
          { text: '选项2', nextEventId: '' },
        ],
      };
    case 'condition':
      return {
        condition: '',
        description: '条件描述',
        trueTarget: '',
        falseTarget: '',
      };
    case 'reward':
      return {
        rewardType: '经验',
        value: 100,
        description: '奖励描述',
      };
    default:
      return {};
  }
}

/**
 * 获取节点类型名称
 * @param {string} type 节点类型
 * @returns {string} 类型名称
 */
export function getNodeTypeName(type) {
  const typeNames = {
    event: '事件',
    choice: '选择',
    condition: '条件',
    reward: '奖励',
  };
  
  return typeNames[type] || type;
}

/**
 * 获取节点类型图标
 * @param {string} type 节点类型
 * @returns {string} 图标名称
 */
export function getNodeTypeIcon(type) {
  const typeIcons = {
    event: 'el-icon-message',
    choice: 'el-icon-fork',
    condition: 'el-icon-question',
    reward: 'el-icon-present',
  };
  
  return typeIcons[type] || 'el-icon-document';
}

/**
 * 获取临时连接线路径
 * @param {Object} sourceNode - 源节点
 * @param {number} mouseX - 鼠标X坐标
 * @param {number} mouseY - 鼠标Y坐标
 * @returns {string} 连接线路径
 */
export function getTempConnectionPath(sourceNode, mouseX, mouseY) {
    // 添加更安全的检查
    if (!sourceNode || !sourceNode.position) {
        return `M 0,0 L 0,0`;
    }

    // 计算源节点右侧中心点，提供默认值
    const sourceX = sourceNode.position.x + (sourceNode.dimensions?.width || 180);
    const sourceY = sourceNode.position.y + (sourceNode.dimensions?.height || 50) / 2;

    // 简单直线路径
    return `M ${sourceX},${sourceY} L ${mouseX || 0},${mouseY || 0}`;
}

/**
 * 使用贝塞尔曲线计算临时连接线路径
 * @param {Object} sourceNode - 源节点
 * @param {number} mouseX - 鼠标X坐标
 * @param {number} mouseY - 鼠标Y坐标
 * @returns {string} 连接线路径
 */
export function getBezierTempConnectionPath(sourceNode, mouseX, mouseY) {
    // 添加更安全的检查
    if (!sourceNode || !sourceNode.position) {
        return `M 0,0 L 0,0`;
    }

    // 计算源节点右侧中心点，提供默认值
    const sourceX = sourceNode.position.x + (sourceNode.dimensions?.width || 180);
    const sourceY = sourceNode.position.y + (sourceNode.dimensions?.height || 50) / 2;

    // 简单直线路径作为备选方案
    return `M ${sourceX},${sourceY} L ${mouseX || 0},${mouseY || 0}`;
}

/**
 * 获取源节点连接点位置
 * @param {Object} sourceNode - 源节点
 * @returns {Object} 连接点坐标
 */
export function getSourceNodeHandlePosition(sourceNode) {
    // 添加更安全的检查
    if (!sourceNode || !sourceNode.position) {
        return { x: 0, y: 0 };
    }

    // 计算右侧连接点位置（源节点），提供默认值
    return {
        x: sourceNode.position.x + (sourceNode.dimensions?.width || 180),
        y: sourceNode.position.y + (sourceNode.dimensions?.height || 50) / 2
    };
}

/**
 * 导出流程图为JSON
 * @param {Array} nodes 节点数组
 * @param {Array} edges 边数组
 * @returns {Object} 流程图JSON对象
 */
export function exportFlowToJson(nodes, edges) {
  return {
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.data.category,
      position: node.position,
      data: node.data,
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: edge.data,
    })),
  };
}

/**
 * 从JSON导入流程图
 * @param {Object} json 流程图JSON对象
 * @returns {Object} 包含节点和边的对象
 */
export function importFlowFromJson(json) {
  if (!json || !json.nodes || !json.edges) {
    return { nodes: [], edges: [] };
  }
  
  const nodes = json.nodes.map(node => ({
    id: node.id,
    type: 'custom',
    position: node.position,
    label: getNodeTypeName(node.data.category),
    data: node.data,
  }));
  
  const edges = json.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'custom',
    animated: edge.data?.animated || false,
    data: edge.data || {},
  }));
  
  return { nodes, edges };
}