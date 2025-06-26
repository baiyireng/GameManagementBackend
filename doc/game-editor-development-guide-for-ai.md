# 文字游戏编辑器开发指南

## 简介

本开发指南旨在为文字类游戏编辑器提供完整的开发说明，涵盖角色、事件、场地等核心模块的设计与实现。适用于前端开发者快速搭建和迭代功能。

## 开发计划

### 第一阶段：基础编辑器搭建

- ✅ 角色编辑器（CharacterEditor.vue）
- ✅ 场地编辑器（LocationEditor.vue）
- ✅ 图片上传组件（ImageUploader.vue）
- ✅ 属性编辑组件（PropertyEditor.vue）
- ✅ 路由与菜单集成

### 第二阶段：事件与技能编辑器开发

- ✅ 事件编辑器（EventEditor.vue）
- 🟡 技能编辑器（SkillEditor.vue）
- 🟡 事件流程图可视化模块（Vue Flow）
- 🟡 事件与技能的数据绑定

### 第三阶段：数据持久化与接口联调

- 🟡 整合 request.ts 接口，替换 mock 数据
- 🟡 添加表单校验机制（Vuelidate / VeeValidate）
- 🟡 实现本地缓存与数据导出功能

### 第四阶段：高级功能与优化

- 🟢 权限控制与用户角色管理
- 🟢 国际化支持（i18n）
- 🟢 版本控制与撤销机制
- 🟢 性能优化（虚拟滚动、keep-alive）
