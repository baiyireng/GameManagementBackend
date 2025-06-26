<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

// 定义属性类型
interface Property {
    key: string;
    description: string; // 属性描述字段
    value: string | number | boolean;
    type: 'string' | 'number' | 'boolean';
}

// 接收父组件传入的属性列表
const props = defineProps<{
    properties: Property[];
}>();

// 向父组件发送属性变更事件
const emit = defineEmits<{
    (e: 'update:properties', properties: Property[]): void;
}>();

// 添加新属性
const addProperty = () => {
    const newProperty = {
        key: `新属性${props.properties.length + 1}`,
        description: '', // 初始化为空描述
        value: '',
        type: 'string',
        popoverVisible: false,
    };
    emit('update:properties', [...props.properties, newProperty]);
};

// 删除属性
const removeProperty = (index: number) => {
    const updatedProperties = props.properties.filter((_, i) => i !== index);
    emit('update:properties', updatedProperties);
};

// 更新属性键值
const updateProperty = (
    index: number,
    field: 'key' | 'description' | 'value' | 'type',
    value: string | number | boolean,
) => {
    const updatedProperties = props.properties.map((prop, i) => {
        if (i === index) {
            // 类型转换处理
            if (field === 'type') {
                const newValue = value === 'number' ? 0 : value === 'boolean' ? false : '';
                return { ...prop, [field]: value, value: newValue };
            }
            return { ...prop, [field]: value };
        }
        return prop;
    });
    emit('update:properties', updatedProperties);
};
</script>

<template>
    <el-card class="property-editor">
        <template #header>
            <div class="card-header">
                <span>属性编辑器</span>
                <el-button type="primary" @click="addProperty">添加属性</el-button>
            </div>
        </template>

        <!-- 属性列表 -->
        <el-table :data="properties" border style="width: 100%" :row-style="{ height: '48px' }">
            <el-table-column label="属性名称" prop="key" width="180">
                <template #default="{ $index }">
                    <el-input
                        v-model="properties[$index].key"
                        placeholder="请输入属性名"
                        style="width: 100%"
                    />
                </template>
            </el-table-column>

            <el-table-column label="描述" prop="description" width="180">
                <template #default="{ $index }">
                    <el-popover
                        v-model:visible="properties[$index].popoverVisible"
                        placement="top-start"
                        trigger="hover"
                        :content="properties[$index].description || '暂无描述'"
                    >
                        <template #reference>
                            <el-input
                                v-model="properties[$index].description"
                                placeholder="请输入描述（支持长文本）"
                                style="width: 100%"
                                :rows="2"
                                type="textarea"
                            />
                        </template>
                    </el-popover>
                </template>
            </el-table-column>

            <el-table-column label="数据类型" prop="type" width="120">
                <template #default="{ $index }">
                    <el-select
                        v-model="properties[$index].type"
                        style="width: 100%"
                        @change="(val) => updateProperty($index, 'type', val)"
                    >
                        <el-option label="字符串" value="string" />
                        <el-option label="数字" value="number" />
                        <el-option label="布尔值" value="boolean" />
                    </el-select>
                </template>
            </el-table-column>

            <el-table-column label="数值" prop="value" width="160">
                <template #default="{ $index }">
                    <div v-if="properties[$index].type === 'string'">
                        <el-input v-model="properties[$index].value" style="width: 100%" />
                    </div>
                    <div v-else-if="properties[$index].type === 'number'">
                        <el-input-number
                            v-model="properties[$index].value"
                            :min="0"
                            style="width: 100%"
                        />
                    </div>
                    <div v-else-if="properties[$index].type === 'boolean'">
                        <el-switch
                            v-model="properties[$index].value"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                        />
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="80">
                <template #default="{ $index }">
                    <el-button type="danger" size="small" @click="removeProperty($index)"
                        >删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>
    </el-card>
</template>

<style lang="less" scoped>
.property-editor {
    margin: 24px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .card-header {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    // 优化表格内边距
    :deep(.el-table__cell) {
        padding: 6px 0;
    }
}
</style>
