<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import {
    ElTabs,
    ElTabPane,
    ElForm,
    ElFormItem,
    ElInput,
    ElSelect,
    ElOption,
    ElSwitch,
    ElInputNumber,
    ElButton,
    ElColorPicker,
} from 'element-plus';
import FormulaEditor from './FormulaEditor.vue';
import ImageUploader from './ImageUploader.vue';
import PropertyEditor from './PropertyEditor.vue';

// 定义属性
const props = defineProps({
    node: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(['update:node']);

// 节点数据的本地副本
const localNodeData = ref({ ...props.node });

// 监听外部节点变化
watch(
    () => props.node,
    (newNode) => {
        localNodeData.value = { ...newNode };
    },
    { deep: true },
);

// 更新节点数据
const updateNodeData = (field, value) => {
    localNodeData.value = {
        ...localNodeData.value,
        [field]: value,
    };
    emit('update:node', localNodeData.value);
};

// 更新节点标签
const updateNodeLabel = (value) => {
    updateNodeData('label', value);
};

// 更新节点数据中的特定字段
const updateNodeDataField = (field, value) => {
    const newData = {
        ...localNodeData.value.data,
        [field]: value,
    };
    updateNodeData('data', newData);
};

// 添加选项（用于选择节点）
const addOption = () => {
    if (!localNodeData.value.data.options) {
        localNodeData.value.data.options = [];
    }

    localNodeData.value.data.options.push({
        id: `option-${Date.now()}`,
        text: '新选项',
        condition: '',
        nextNodeId: '',
        consequences: {},
    });

    updateNodeData('data', { ...localNodeData.value.data });
};

// 删除选项
const removeOption = (index) => {
    localNodeData.value.data.options.splice(index, 1);
    updateNodeData('data', { ...localNodeData.value.data });
};

// 更新选项数据
const updateOption = (index, field, value) => {
    localNodeData.value.data.options[index][field] = value;
    updateNodeData('data', { ...localNodeData.value.data });
};

// 节点类型显示名称
const nodeTypeNames = {
    event: '事件节点',
    choice: '选择节点',
    reward: '奖励节点',
    condition: '条件节点',
    character: '角色节点',
    location: '场地节点',
    skill: '技能节点',
};

// 计算当前节点类型的显示名称
const nodeTypeName = computed(() => {
    return nodeTypeNames[localNodeData.value.data?.category] || '未知节点';
});

// 初始化节点属性
const initNodeProperties = () => {
    if (!localNodeData.value.data.properties) {
        localNodeData.value.data.properties = [];
    }
};

// 更新节点属性
const updateProperties = (properties) => {
    initNodeProperties();
    localNodeData.value.data.properties = properties;
    updateNodeData('data', { ...localNodeData.value.data });
};
</script>

<template>
    <el-card class="node-property-editor">
        <template #header>
            <div class="card-header">
                <span>{{ nodeTypeName }} 属性编辑</span>
            </div>
        </template>

        <el-tabs>
            <!-- 基本信息标签页 -->
            <el-tab-pane label="基本信息">
                <el-form label-position="top">
                    <el-form-item label="节点ID">
                        <el-input v-model="localNodeData.id" disabled />
                    </el-form-item>

                    <el-form-item label="节点名称">
                        <el-input v-model="localNodeData.label" @change="updateNodeLabel" />
                    </el-form-item>

                    <!-- 节点样式 -->
                    <el-form-item label="节点颜色">
                        <el-color-picker
                            v-model="localNodeData.style.backgroundColor"
                            @change="
                                (val) =>
                                    updateNodeData('style', {
                                        ...localNodeData.style,
                                        backgroundColor: val,
                                    })
                            "
                        />
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <!-- 事件节点特有属性 -->
            <el-tab-pane v-if="localNodeData.data?.category === 'event'" label="内容">
                <el-form label-position="top">
                    <el-form-item label="事件标题">
                        <el-input
                            v-model="localNodeData.data.title"
                            @change="(val) => updateNodeDataField('title', val)"
                        />
                    </el-form-item>

                    <el-form-item label="事件描述">
                        <el-input
                            v-model="localNodeData.data.content"
                            type="textarea"
                            :rows="4"
                            @change="(val) => updateNodeDataField('content', val)"
                        />
                    </el-form-item>

                    <el-form-item label="背景图片">
                        <ImageUploader
                            :image-url="localNodeData.data.backgroundImage"
                            @update:image-url="(val) => updateNodeDataField('backgroundImage', val)"
                        />
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <!-- 选择节点特有属性 -->
            <el-tab-pane v-if="localNodeData.data?.category === 'choice'" label="选项">
                <el-button type="primary" @click="addOption">添加选项</el-button>

                <div
                    v-for="(option, index) in localNodeData.data.options"
                    :key="option.id"
                    class="option-item"
                >
                    <el-divider>选项 {{ index + 1 }}</el-divider>

                    <el-form label-position="top">
                        <el-form-item label="选项文本">
                            <el-input
                                v-model="option.text"
                                @change="(val) => updateOption(index, 'text', val)"
                            />
                        </el-form-item>

                        <el-form-item label="下一个节点ID">
                            <el-input
                                v-model="option.nextNodeId"
                                @change="(val) => updateOption(index, 'nextNodeId', val)"
                            />
                        </el-form-item>

                        <el-form-item label="显示条件">
                            <FormulaEditor
                                :formula="option.condition"
                                @update:formula="(val) => updateOption(index, 'condition', val)"
                            />
                        </el-form-item>

                        <el-button type="danger" @click="removeOption(index)">删除选项</el-button>
                    </el-form>
                </div>
            </el-tab-pane>

            <!-- 奖励节点特有属性 -->
            <el-tab-pane v-if="localNodeData.data?.category === 'reward'" label="奖励">
                <el-form label-position="top">
                    <el-form-item label="奖励类型">
                        <el-select
                            v-model="localNodeData.data.rewardType"
                            @change="(val) => updateNodeDataField('rewardType', val)"
                        >
                            <el-option label="物品" value="item" />
                            <el-option label="属性点" value="attribute" />
                            <el-option label="技能" value="skill" />
                            <el-option label="其他" value="other" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="奖励数量">
                        <el-input-number
                            v-model="localNodeData.data.amount"
                            :min="0"
                            @change="(val) => updateNodeDataField('amount', val)"
                        />
                    </el-form-item>

                    <el-form-item label="奖励描述">
                        <el-input
                            v-model="localNodeData.data.description"
                            type="textarea"
                            :rows="3"
                            @change="(val) => updateNodeDataField('description', val)"
                        />
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <!-- 条件节点特有属性 -->
            <el-tab-pane v-if="localNodeData.data?.category === 'condition'" label="条件">
                <el-form label-position="top">
                    <el-form-item label="条件表达式">
                        <FormulaEditor
                            :formula="localNodeData.data.condition"
                            @update:formula="(val) => updateNodeDataField('condition', val)"
                        />
                    </el-form-item>

                    <el-form-item label="条件满足时的下一步">
                        <el-input
                            v-model="localNodeData.data.trueNodeId"
                            @change="(val) => updateNodeDataField('trueNodeId', val)"
                        />
                    </el-form-item>

                    <el-form-item label="条件不满足时的下一步">
                        <el-input
                            v-model="localNodeData.data.falseNodeId"
                            @change="(val) => updateNodeDataField('falseNodeId', val)"
                        />
                    </el-form-item>

                    <el-form-item label="条件描述">
                        <el-input
                            v-model="localNodeData.data.description"
                            type="textarea"
                            :rows="2"
                            @change="(val) => updateNodeDataField('description', val)"
                        />
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <!-- 自定义属性标签页 -->
            <el-tab-pane label="自定义属性">
                <PropertyEditor
                    :properties="localNodeData.data.properties || []"
                    @update:properties="updateProperties"
                />
            </el-tab-pane>
        </el-tabs>
    </el-card>
</template>

<style lang="less" scoped>
.node-property-editor {
    margin: 24px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .card-header {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
    }
}

.option-item {
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #f9fafb;
}
</style>