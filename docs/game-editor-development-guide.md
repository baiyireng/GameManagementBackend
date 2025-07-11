# 文字游戏编辑器开发手册

## 1. 项目概述

### 1.1 项目目标
开发一个可视化的文字游戏编辑器，使游戏设计者能够直观地构建文字游戏的事件链和决策树，包括事件、选择、奖励等游戏元素。

### 1.2 核心功能
- 可视化流程图编辑
- 多种节点类型支持（事件、选择、奖励、条件等）
- 节点属性自定义
- 游戏流程逻辑构建
- 数据保存与加载

## 2. 功能规划与优先级

### 2.1 节点类型扩展（优先级：高）

#### 2.1.1 事件节点
- **功能**：表示游戏中的故事事件
- **属性**：
  - 事件ID
  - 事件标题
  - 事件描述（支持富文本）
  - 背景图片
  - 音效/背景音乐
  - 显示NPC/角色
  - 事件标签（用于分类和搜索）

#### 2.1.2 选择节点
- **功能**：表示玩家可以做出的选择
- **属性**：
  - 选择ID
  - 选择文本
  - 选择条件（可选，如需要特定属性值）
  - 选择结果（指向下一个事件）
  - 选择后果（属性变化、获得物品等）
  - 是否可见（可根据条件隐藏某些选项）

#### 2.1.3 奖励节点
- **功能**：表示玩家获得的奖励
- **属性**：
  - 奖励ID
  - 奖励类型（物品、属性点、技能等）
  - 奖励数量
  - 奖励描述
  - 奖励效果（对游戏状态的影响）
  - 显示效果（动画、音效等）

#### 2.1.4 条件节点
- **功能**：根据游戏状态或玩家属性决定流程走向
- **属性**：
  - 条件ID
  - 条件表达式（如"勇气>50"）
  - 条件满足时的下一步
  - 条件不满足时的下一步
  - 条件描述（可选，用于调试）

### 2.2 节点属性编辑面板（优先级：高）

#### 2.2.1 通用属性编辑器
- 节点ID编辑
- 节点标题编辑
- 节点描述编辑
- 节点样式设置（颜色、形状等）

#### 2.2.2 富文本编辑器
- 文本格式化（粗体、斜体、下划线等）
- 文本颜色和大小调整
- 插入图片
- 插入变量占位符（如`{player_name}`）

#### 2.2.3 资源选择器
- 图片资源浏览和选择
- 音频资源浏览和选择
- 角色/NPC选择
- 物品选择

#### 2.2.4 条件编辑器
- 变量选择
- 操作符选择（>、<、=、!=等）
- 值输入
- 复合条件构建（AND、OR、NOT）

### 2.3 流程逻辑增强（优先级：中）

#### 2.3.1 条件分支
- 基于玩家属性的分支
- 基于游戏状态的分支
- 基于玩家历史选择的分支
- 多条件复合判断

#### 2.3.2 概率分支
- 随机选择不同事件路径
- 设置各路径概率权重
- 概率分布可视化

#### 2.3.3 变量系统
- 定义游戏变量
- 变量初始值设置
- 变量修改操作
- 变量条件判断
- 变量在事件描述中的使用

#### 2.3.4 循环和跳转
- 支持回到之前的事件点
- 循环次数限制
- 循环条件设置
- 跳转目标选择

### 2.4 预览和测试功能（优先级：中）

#### 2.4.1 游戏流程预览
- 简易游戏界面
- 文本显示
- 选项选择
- 状态显示

#### 2.4.2 测试模式
- 设置初始状态
- 模拟玩家选择
- 查看状态变化
- 重置测试

#### 2.4.3 调试工具
- 断点设置
- 状态检查
- 流程追踪
- 错误提示

### 2.5 数据管理（优先级：中）

#### 2.5.1 保存和加载
- 保存当前游戏流程
- 加载已保存的游戏流程
- 自动保存功能

#### 2.5.2 版本控制
- 创建流程图快照
- 查看历史版本
- 回滚到之前版本

#### 2.5.3 导出和导入
- 导出为JSON格式
- 导入JSON格式的游戏流程
- 与游戏引擎的集成接口

### 2.6 用户界面优化（优先级：低）

#### 2.6.1 节点组织
- 节点分组功能
- 节点折叠/展开
- 节点标签和颜色编码

#### 2.6.2 导航功能
- 缩放控制
- 小地图导航
- 快速定位到特定节点

#### 2.6.3 搜索和过滤
- 按节点类型过滤
- 按节点内容搜索
- 按节点标签过滤

## 3. 技术实现指南

### 3.1 前端架构

#### 3.1.1 技术栈
- Vue 3：前端框架
- Element Plus：UI组件库
- Vue Flow：流程图编辑库
- TinyMCE/Quill：富文本编辑器

#### 3.1.2 组件结构
- MainLayout：主布局组件
- GameEditor：游戏编辑器主组件
- NodePanel：节点类型面板
- PropertyPanel：属性编辑面板
- FlowCanvas：流程图画布
- PreviewPanel：游戏预览面板

### 3.2 节点实现

#### 3.2.1 基础节点类
```typescript
interface BaseNodeData {
  id: string;
  type: string;
  label: string;
  description?: string;
  tags?: string[];
  style?: Record<string, any>;
}
```

#### 3.2.2 事件节点
```typescript
interface EventNodeData extends BaseNodeData {
  type: 'event';
  content: string; // 富文本内容
  backgroundImage?: string;
  audio?: string;
  characters?: string[];
}
```

#### 3.2.3 选择节点
```typescript
interface ChoiceNodeData extends BaseNodeData {
  type: 'choice';
  options: {
    text: string;
    condition?: string;
    nextNodeId?: string;
    consequences?: Record<string, any>;
    visible?: boolean;
  }[];
}
```

#### 3.2.4 奖励节点
```typescript
interface RewardNodeData extends BaseNodeData {
  type: 'reward';
  rewardType: 'item' | 'attribute' | 'skill' | 'other';
  amount: number;
  description: string;
  effects: Record<string, any>;
  animation?: string;
}
```

#### 3.2.5 条件节点
```typescript
interface ConditionNodeData extends BaseNodeData {
  type: 'condition';
  condition: string;
  trueNodeId?: string;
  falseNodeId?: string;
  description?: string;
}
```

### 3.3 属性编辑器实现

#### 3.3.1 通用属性编辑器
- 使用Element Plus的表单组件
- 实时数据绑定
- 属性变更历史记录

#### 3.3.2 富文本编辑器集成
- TinyMCE或Quill集成
- 自定义工具栏
- 图片上传处理
- 变量插入功能

#### 3.3.3 条件编辑器
- 可视化条件构建器
- 变量选择下拉菜单
- 操作符选择
- 值输入/选择

### 3.4 数据存储

#### 3.4.1 数据模型
```typescript
interface GameFlow {
  id: string;
  name: string;
  description?: string;
  nodes: Record<string, BaseNodeData>;
  edges: {
    id: string;
    source: string;
    target: string;
    label?: string;
    type?: string;
  }[];
  variables: {
    name: string;
    type: 'number' | 'string' | 'boolean';
    defaultValue: any;
    description?: string;
  }[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    author?: string;
  };
}
```

#### 3.4.2 API接口
- `GET /api/games/:id` - 获取游戏数据
- `POST /api/games` - 创建新游戏
- `PUT /api/games/:id` - 更新游戏数据
- `DELETE /api/games/:id` - 删除游戏
- `GET /api/games/:id/versions` - 获取游戏版本历史
- `POST /api/games/:id/versions` - 创建新版本
- `GET /api/resources` - 获取可用资源（图片、音频等）

## 4. 实现路线图

### 4.1 第一阶段：基础功能（1-2周）
- [x] 基本流程图编辑器搭建
- [ ] 自定义节点和边的基本实现
- [ ] 节点属性的基本编辑功能
- [ ] 数据保存和加载的基本功能

### 4.2 第二阶段：节点类型扩展（2-3周）
- [ ] 实现事件节点
- [ ] 实现选择节点
- [ ] 实现奖励节点
- [ ] 实现条件节点
- [ ] 节点之间的连接规则

### 4.3 第三阶段：属性编辑器增强（2周）
- [ ] 富文本编辑器集成
- [ ] 资源选择器实现
- [ ] 条件编辑器实现
- [ ] 变量系统实现

### 4.4 第四阶段：流程逻辑和测试（2-3周）
- [ ] 条件分支实现
- [ ] 概率分支实现
- [ ] 游戏预览功能
- [ ] 测试模式实现

### 4.5 第五阶段：优化和扩展（1-2周）
- [ ] UI优化
- [ ] 性能优化
- [ ] 导出和导入功能
- [ ] 版本控制功能

## 5. 最佳实践

### 5.1 节点设计原则
- 保持节点功能单一，避免过于复杂的节点
- 使用清晰的视觉区分不同类型的节点
- 节点标签应简洁明了
- 重要属性应在节点上直接可见

### 5.2 流程图组织
- 从左到右或从上到下的流程方向
- 相关节点应放置在一起
- 使用分组减少视觉复杂度
- 避免边的交叉

### 5.3 数据管理
- 定期保存工作
- 创建关键节点的版本快照
- 使用描述性的版本命名
- 导出重要的游戏流程作为备份

### 5.4 性能考虑
- 限制单个视图中显示的节点数量
- 大型流程图考虑分章节或场景
- 延迟加载不在视图中的节点
- 优化富文本编辑器的性能

## 6. 未来扩展计划

### 6.1 高级功能
- 多人协作编辑
- AI辅助内容生成
- 游戏数据分析工具
- 玩家反馈集成

### 6.2 集成功能
- 与主流游戏引擎的导出插件
- 移动设备预览
- 社区模板分享
- 云端存储和同步

### 6.3 工具扩展
- 对话树专用编辑器
- 角色关系图编辑器
- 物品和技能编辑器
- 世界地图编辑器

## 7. 附录

### 7.1 技术参考
- [Vue 3 文档](https://v3.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Vue Flow 文档](https://vueflow.dev/)
- [TinyMCE 文档](https://www.tiny.cloud/docs/)

### 7.2 游戏设计参考
- 文字游戏设计模式
- 分支叙事最佳实践
- 游戏平衡技巧
- 用户体验设计指南