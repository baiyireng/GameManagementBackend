# 文字游戏编辑器开发手册

## 目录

- [简介](#简介)
- [功能模块](#功能模块)
- [数据模型](#数据模型)
- [界面设计](#界面设计)
- [组件结构](#组件结构)
- [接口与模拟数据](#接口与模拟数据)
- [扩展建议](#扩展建议)
- [开发计划](#开发计划)

## 简介

本开发手册旨在为文字类游戏编辑器提供完整的开发指南，涵盖角色、事件、场地等核心模块的设计与实现。适用于前端开发者快速搭建和迭代功能。

## 功能模块

### 1. 角色编辑器（CharacterEditor.vue）

- 支持输入角色的基本信息（名称、描述、图片）
- 可添加/删除/修改角色属性
- 属性之间可建立关联关系（如：魅力影响谈判成功率）
- 支持上传本地图片或输入图片URL

### 2. 事件编辑器（EventEditor.vue）

- 编辑事件标题与描述
- 添加多个选项，每个选项包含文本、效果、奖励和惩罚
- 支持设置随机奖励范围和概率
- 后续可集成流程图可视化编辑器

### 3. 场地编辑器（LocationEditor.vue）

- 输入场地的基础信息（名称、描述、背景图）
- 配置场地属性（环境类型、天气系统、特殊效果）
- 关联事件（指定固定事件池和随机事件权重）

### 4. 技能编辑器（SkillEditor.vue）

- 左侧表单区填写技能基本信息（名称、描述、类型、冷却、消耗等）
- 右侧效果区以列表形式展示所有技能效果，支持增删改查
- 新增效果按钮弹出模态框选择效果类型，并设置参数
- 预览区域展示技能组合后的总效果
- 支持公式字段输入，如 `attack * 2 + level * 5`
- 支持 Buff/Debuff 系统联动配置
- 可绑定到角色、怪物、装备、建筑等多个对象上使用

### 6. 游戏流程编辑（EditGame.vue）

```
interface GameEditorEntry {
    character: string; // 角色编辑器路径
    event: string; // 事件编辑器路径
    location: string; // 场地编辑器路径
    skill: string; // 技能编辑器路径
}
```

- 提供角色、事件、场地、技能编辑器的快捷入口
- 集成 Vue Flow 实现可视化流程图编辑
- 支持节点拖拽与连线配置
- 后续可扩展为完整的可视化开发环境

## 数据模型

### 1. 角色（Character）

```ts
interface Character {
    name: string;
    description: string;
    image: {
        url: string;
    };
    properties: Array<{
        key: string;
        description: string;
        value: string | number | boolean;
        type: 'string' | 'number' | 'boolean';
        popoverVisible: boolean;
    }>;
}
```

### 2. 事件（Event）

```ts
interface Event {
    title: string;
    content: string;
    image: {
        url: string;
    };
    icon: {
        url: string;
    };
    triggerCondition?: {
        name: string; // 公式名称（如：角色属性判断）
        description: string; // 描述（如：角色魅力>15）
        formula: string; // 实际公式（如：charisma > 15）
    };
    options: Array<{
        text: string;
        effects: object;
        rewards?: object;
        penalties?: object;
        condition?: string; // 显示条件（如：角色属性大于某值）
        conditionFormula?: {
            name: string;
            description: string;
            formula: string;
        }; // 条件公式
        nextEventId?: string; // 后续事件ID
    }>;
    rewardRange?: {
        min: number;
        max: number;
    };
    probability?: number;
}
```

### 3. 场地（Location）

```ts
interface Location {
    name: string;
    description: string;
    backgroundImage: {
        url: string;
    };
    environmentType: string;
    weatherSystem: string;
    specialEffects: Record<string, any>;
    fixedEvents: string[];
    eventWeights: Record<string, number>;
    properties: Array<{
        key: string;
        description: string;
        value: string | number | boolean;
        type: 'string' | 'number' | 'boolean';
        popoverVisible: boolean;
    }>;
}
```

### 4. 技能（Skill）

```ts
interface CharacterSkill {
    id: string;
    name: string;
    description: string;
    icon: {
        url: string;
    };
    image: {
        url: string;
    };
    type: 'active' | 'passive';
    cooldown: number;
    cost: number;
    costType: 'mp' | 'sp' | 'hp' | 'none';
    triggerLimit?: {
        levelRequired: number;
        conditionFormula?: {
            name: string;
            description: string;
            formula: string;
        };
    };
    targetType: 'self' | 'enemy' | 'ally' | 'all' | 'single_enemy' | 'single_ally';
    effects: Array<{
        effectType: 'damage' | 'heal' | 'buff' | 'debuff' | 'stun' | 'custom';
        targetType: 'self' | 'enemy' | 'ally' | 'all';
        value?: number;
        percentage?: number;
        duration?: number;
        formula?: {
            name: string;
            description: string;
            formula: string;
        };
        buffId?: string;
    }>;
    priority?: number;
    tags?: string[];
    applicableTo: Array<'character' | 'monster' | 'equipment' | 'building'>;
}
```

### 5. 技能编辑器（SkillEditor.vue）

- 左侧表单区填写技能基本信息（名称、描述、类型、冷却、消耗等）
- 右侧效果区以列表形式展示所有技能效果，支持增删改查
- 新增效果按钮弹出模态框选择效果类型，并设置参数
- 预览区域展示技能组合后的总效果
- 支持公式字段输入，如 `attack * 2 + level * 5`
- 支持 Buff/Debuff 系统联动配置
- 可绑定到角色、怪物、装备、建筑等多个对象上使用
- 使用 FormulaEditor 组件支持完整 FormulaField 对象编辑

## 界面设计

### 1. 角色编辑器

- 使用 `el-form` 组织表单结构
- 图片上传使用 `ImageUploader.vue` 组件，支持 URL 输入与本地上传
- 属性编辑使用 `PropertyEditor.vue` 组件，支持动态增删属性项

### 2. 事件编辑器

- 使用嵌套表单管理选项及其子项（效果、奖励、惩罚）
- 滑块或输入框设定奖励范围和概率
- 插入图片上传字段，用于设置事件插图

### 3. 场地编辑器

- 使用多标签页组织不同类别的配置项
- 提供事件选择器用于绑定事件ID
- 支持权重分配输入框和下拉选择

### 4. 技能编辑器

- 左侧表单区填写技能基本信息（名称、描述、冷却、消耗等）
- 右侧效果区以列表形式展示所有技能效果，支持增删改查
- 新增效果按钮弹出模态框选择效果类型，并设置参数
- 预览区域展示技能组合后的总效果

## 组件结构

### 1. PropertyEditor.vue

- 可复用的属性编辑器组件
- 支持多种数据类型（字符串、数字、布尔值）
- 描述列支持长文本，并通过 `el-popover` 展示完整内容

### 2. ImageUploader.vue

- 可复用的图片上传组件
- 支持 URL 输入与本地上传（自动转为 Base64 预览）
- 使用 `v-model` 绑定数据，便于集成到表单中

## 接口与模拟数据

### 1. 模拟数据（mock/games.json）

- 包含角色、事件、场地的示例数据
- 用于开发阶段测试和调试

### 2. 请求封装（utils/request.ts）

- 封装获取、保存角色、事件和场地的接口方法
- 实现本地存储模拟，以便在页面刷新后保留数据

## 扩展建议

### 1. **模块化与组件复用**

- 将通用 UI 组件（如属性编辑器、事件选择器等）提取为独立组件，便于在角色、事件、场地编辑器中复用

### 2. **数据校验机制**

- 在保存前对输入进行验证，比如：
    - 角色名称不能为空
    - 属性值必须为数字且不能为负数
    - 事件权重总和不能超过 100%

### 3. **状态管理（可选）**

- 如果项目规模较大或需要跨组件共享状态（如当前编辑的角色、事件等），可以考虑引入 `Pinia` 状态管理库

### 4. **国际化支持（i18n）**

- 对于未来可能有国际化需求的项目，建议提前集成 i18n 插件

### 5. **权限控制**

- 对于“新增”、“编辑”、“删除”等敏感操作，建议加入权限判断逻辑，避免未授权访问

### 6. **版本控制与历史记录**

- 在保存前记录变更历史，提供“撤销”功能

### 7. **可视化编辑器（后续迭代）**

- 考虑使用 Vue Flow 构建事件流程图，提升编辑体验

### 8. **性能优化**

- 对大型数据集使用虚拟滚动（如使用 `vue-virtual-scroller`）提高渲染效率
- 使用 `keep-alive` 缓存频繁切换的编辑器页面

## 开发计划

### 第一阶段：基础编辑器搭建

- ✅ 角色编辑器（CharacterEditor.vue）
- ✅ 场地编辑器（LocationEditor.vue）
- ✅ 图片上传组件（ImageUploader.vue）
- ✅ 属性编辑组件（PropertyEditor.vue）
- ✅ 路由与菜单集成

### 第二阶段：事件与技能编辑器开发

- ✅ 事件编辑器（EventEditor.vue）
- ✅ 技能编辑器（SkillEditor.vue）
- 🟡 事件流程图可视化模块（Vue Flow）
- 🟡 事件与技能的数据绑定

### 第三阶段：数据持久化与接口联调

- 🟡 整合 `request.ts` 接口，替换 mock 数据
- 🟡 添加表单校验机制（Vuelidate / VeeValidate）
- 🟡 实现本地缓存与数据导出功能

### 第四阶段：高级功能与优化

- 🟢 权限控制与用户角色管理
- 🟢 国际化支持（i18n）
- 🟢 版本控制与撤销机制
- 🟢 性能优化（虚拟滚动、keep-alive）
