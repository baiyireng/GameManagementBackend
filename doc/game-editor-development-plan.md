# 文字游戏编辑器开发计划

## 第一步：设计数据模型

### 1. 定义角色属性（Character）
- **基础信息**：
  - 名称（`name: string`）
  - 描述（`description: string`）
  - 图片地址（`image: string`）
- **属性字段**：
  - 力量（`strength: number`）
  - 智力（`intelligence: number`）
  - 魅力（`charisma: number`）
  - 其他自定义属性（`customProperties: object`）

### 2. 定义事件结构（Event）
- **基本描述**：
  - 标题（`title: string`）
  - 内容（`content: string`）
- **选项系统**：
  - 多个可选分支（`options: Array<{ text: string, effects: object, rewards?: object, penalties?: object }>`）
    - `effects`：影响角色属性的增减（如：力量+5）
    - `rewards`：奖励内容（例如：金币、道具等）
    - `penalties`：惩罚内容（例如：生命值减少）
- **随机机制**：
  - 奖励范围（`rewardRange: { min: number, max: number }`）
  - 随机概率（`probability: number`）

### 3. 定义场地结构（Location）
- **基础信息**：
  - 名称（`name: string`）
  - 描述（`description: string`）
  - 背景图片（`backgroundImage: string`）
- **场地属性**：
  - 环境类型（`environmentType: string`，如：森林、城市、沙漠）
  - 天气系统（`weatherSystem: string`，如：晴朗、雨天、暴风雪）
  - 特殊效果（`specialEffects: object`，如：夜晚视野降低50%）
- **事件关联**：
  - 固定事件池（`fixedEvents: Array<string>`，事件ID列表）
  - 随机事件权重（`eventWeights: Record<string, number>`，事件ID到发生概率的映射）

## 第二步：创建角色编辑界面

### 1. 页面功能
- 支持输入角色的基本信息和图片路径。
- 可添加/删除/修改角色属性。
- 属性之间可以建立关联关系（比如“魅力”影响“谈判成功率”）。

### 2. 技术实现
- 创建 `CharacterEditor.vue` 页面。
- 使用表单组件收集角色数据。
- 提供一个属性列表，支持动态增删属性项。
- 使用树状结构或公式输入框实现属性关联逻辑。

## 第三步：创建事件编辑界面

### 1. 页面功能
- 编辑事件标题与描述。
- 添加多个选项，每个选项包含文本、效果、奖励和惩罚。
- 支持设置随机奖励范围和概率。

### 2. 技术实现
- 创建 `EventEditor.vue` 页面。
- 使用嵌套表单来管理选项及其子项（效果、奖励、惩罚）。
- 使用滑块或输入框设定奖励范围和概率。
- 可使用图形库（如Vue Flow）构建可视化流程图（后期迭代）

## 第四步：创建场地编辑界面

### 1. 页面功能
- 输入场地的基础信息（名称、描述、背景图）。
- 配置场地属性（环境类型、天气系统、特殊效果）。
- 关联事件（指定固定事件池和随机事件权重）。

### 2. 技术实现
- 创建 `LocationEditor.vue` 页面。
- 使用多标签页组织不同类别的配置项。
- 提供事件选择器用于绑定事件ID。
- 支持权重分配输入框和下拉选择。

## 第五步：整合到主菜单和路由中
- 在侧边栏菜单中添加“角色编辑器”、“事件编辑器”和“场地编辑器”入口。
- 添加相应的路由配置，使页面可通过导航访问。

## 第六步：接口模拟与持久化
- 在 `mock/games.json` 中增加角色、事件和场地的数据结构。
- 在 `request.ts` 中定义获取、保存角色、事件和场地的接口方法。
- 实现本地存储模拟，以便在页面刷新后保留数据。

## 补充建议

### 1. **模块化与组件复用**
- 将通用 UI 组件（如属性编辑器、事件选择器等）提取为独立组件，便于在角色、事件、场地编辑器中复用。
- 使用 `@/components` 文件夹统一存放这些共享组件。

**示例结构：**
```
src/
├── components/
│   ├── PropertyEditor.vue       // 属性编辑器
│   ├── EventSelector.vue        // 事件选择器
│   └── WeightedEventList.vue    // 权重事件列表
```

### 2. **数据校验机制**
- 在保存前对输入进行验证，比如：
  - 角色名称不能为空
  - 属性值必须为数字且不能为负数
  - 事件权重总和不能超过 100%
- 可使用 [Vuelidate](https://vuelidate-next.netlify.app/) 或 [VeeValidate](https://vee-validate.logaretm.com/) 实现表单验证。

### 3. **状态管理（可选）**
- 如果项目规模较大或需要跨组件共享状态（如当前编辑的角色、事件等），可以考虑引入 `Pinia` 状态管理库。
- 创建一个 `useGameEditorStore` 存储当前编辑的数据，并在不同页面之间共享。

### 4. **国际化支持（i18n）**
- 如果未来有国际化需求，建议提前集成 i18n 插件。
- 所有用户可见的文本都应通过 `$t()` 方法读取，例如：
```vue
<el-button>{{ $t('buttons.save') }}</el-button>
```

### 5. **权限控制**
- 对于“新增”、“编辑”、“删除”等敏感操作，建议加入权限判断逻辑，避免未授权访问。
- 可通过路由元信息或全局守卫实现简单的权限控制。

### 6. **版本控制与历史记录**
- 在保存前记录变更历史，提供“撤销”功能。
- 可以使用类似 `immer` 的库来简化不可变数据的操作。
- 数据格式中增加 `version` 字段用于版本追踪。

### 7. **可视化编辑器（后续迭代）**
- 考虑使用 Vue Flow 构建事件流程图，提升编辑体验。
- 支持拖拽节点连接事件分支，直观展示游戏逻辑流。

### 8. **性能优化**
- 对大型数据集使用虚拟滚动（如使用 `vue-virtual-scroller`）提高渲染效率。
- 使用 `keep-alive` 缓存频繁切换的编辑器页面。