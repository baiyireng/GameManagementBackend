<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';

// 定义组件属性
const props = defineProps({
    node: {
        type: Object,
        required: true,
    },
});

// 定义事件
const emit = defineEmits(['update:node']);

// 创建节点数据的本地副本，以便编辑
const localNode = ref({ ...props.node });

// 监听外部节点变化
watch(
    () => props.node,
    (newNode) => {
        localNode.value = { ...newNode };
    },
    { deep: true },
);

// 计算节点类型
const nodeType = computed(() => localNode.value?.data?.category || '');

// 更新节点属性的方法
const updateNodeProperty = (path, value) => {
    // 使用路径更新嵌套属性
    const pathArray = path.split('.');
    let current = localNode.value;

    // 遍历路径直到倒数第二个元素
    for (let i = 0; i < pathArray.length - 1; i++) {
        if (!current[pathArray[i]]) {
            current[pathArray[i]] = {};
        }
        current = current[pathArray[i]];
    }

    // 设置最后一个属性的值
    current[pathArray[pathArray.length - 1]] = value;

    // 发出更新事件
    emit('update:node', { ...localNode.value });
};

// 添加选项（针对选择节点）
const addOption = () => {
    if (!localNode.value.data.options) {
        localNode.value.data.options = [];
    }

    localNode.value.data.options.push({
        id: `option-${Date.now()}`,
        text: '新选项',
        condition: '',
        nextNodeId: '',
        consequences: {},
    });

    emit('update:node', { ...localNode.value });
    ElMessage.success('已添加新选项');
};

// 删除选项（针对选择节点）
const removeOption = (index) => {
    localNode.value.data.options.splice(index, 1);
    emit('update:node', { ...localNode.value });
    ElMessage.success('已删除选项');
};

// 奖励类型选项
const rewardTypes = [
    { value: 'item', label: '物品' },
    { value: 'currency', label: '货币' },
    { value: 'experience', label: '经验' },
    { value: 'skill', label: '技能' },
    { value: 'achievement', label: '成就' },
];
</script>

<template>
    <div class="node-property-editor">
        <!-- 基本属性编辑（所有节点通用） -->
        <div class="property-section">
            <h4>基本属性</h4>
            <el-form label-position="top" size="small">
                <el-form-item label="节点ID">
                    <el-input v-model="localNode.id" disabled />
                </el-form-item>

                <el-form-item label="节点标签">
                    <el-input
                        v-model="localNode.label"
                        @change="updateNodeProperty('label', localNode.label)"
                    />
                </el-form-item>

                <el-form-item label="节点类型">
                    <el-input v-model="nodeType" disabled />
                </el-form-item>
            </el-form>
        </div>

        <!-- 事件节点特定属性 -->
        <div v-if="nodeType === 'event'" class="property-section">
            <h4>事件属性</h4>
            <el-form label-position="top" size="small">
                <el-form-item label="事件标题">
                    <el-input
                        v-model="localNode.data.title"
                        @change="updateNodeProperty('data.title', localNode.data.title)"
                    />
                </el-form-item>

                <el-form-item label="事件描述">
                    <el-input
                        v-model="localNode.data.content"
                        type="textarea"
                        :rows="4"
                        @change="updateNodeProperty('data.content', localNode.data.content)"
                    />
                </el-form-item>

                <el-form-item label="背景图片">
                    <el-input
                        v-model="localNode.data.backgroundImage"
                        placeholder="输入图片URL"
                        @change="
                            updateNodeProperty(
                                'data.backgroundImage',
                                localNode.data.backgroundImage,
                            )
                        "
                    />
                </el-form-item>
            </el-form>
        </div>

        <!-- 选择节点特定属性 -->
        <div v-if="nodeType === 'choice'" class="property-section">
            <h4>选择属性</h4>
            <el-form label-position="top" size="small">
                <div
                    v-for="(option, index) in localNode.data.options"
                    :key="option.id"
                    class="option-item"
                >
                    <div class="option-header">
                        <h5>选项 {{ index + 1 }}</h5>
                        <el-button
                            type="danger"
                            size="small"
                            icon="Delete"
                            circle
                            @click="removeOption(index)"
                        />
                    </div>

                    <el-form-item label="选项文本">
                        <el-input
                            v-model="option.text"
                            @change="updateNodeProperty(`data.options.${index}.text`, option.text)"
                        />
                    </el-form-item>

                    <el-form-item label="条件表达式">
                        <el-input
                            v-model="option.condition"
                            placeholder="例如: player.level >= 5"
                            @change="
                                updateNodeProperty(
                                    `data.options.${index}.condition`,
                                    option.condition,
                                )
                            "
                        />
                    </el-form-item>

                    <el-form-item label="下一个节点ID">
                        <el-input
                            v-model="option.nextNodeId"
                            placeholder="选择后跳转的节点ID"
                            @change="
                                updateNodeProperty(
                                    `data.options.${index}.nextNodeId`,
                                    option.nextNodeId,
                                )
                            "
                        />
                    </el-form-item>
                </div>

                <el-button type="primary" size="small" @click="addOption">添加选项</el-button>
            </el-form>
        </div>

        <!-- 奖励节点特定属性 -->
        <div v-if="nodeType === 'reward'" class="property-section">
            <h4>奖励属性</h4>
            <el-form label-position="top" size="small">
                <el-form-item label="奖励类型">
                    <el-select
                        v-model="localNode.data.rewardType"
                        placeholder="选择奖励类型"
                        @change="updateNodeProperty('data.rewardType', localNode.data.rewardType)"
                    >
                        <el-option
                            v-for="type in rewardTypes"
                            :key="type.value"
                            :label="type.label"
                            :value="type.value"
                        />
                    </el-select>
                </el-form-item>

                <el-form-item label="数量">
                    <el-input-number
                        v-model="localNode.data.amount"
                        :min="1"
                        @change="updateNodeProperty('data.amount', localNode.data.amount)"
                    />
                </el-form-item>

                <el-form-item label="描述">
                    <el-input
                        v-model="localNode.data.description"
                        type="textarea"
                        :rows="3"
                        @change="updateNodeProperty('data.description', localNode.data.description)"
                    />
                </el-form-item>
            </el-form>
        </div>

        <!-- 条件节点特定属性 -->
        <div v-if="nodeType === 'condition'" class="property-section">
            <h4>条件属性</h4>
            <el-form label-position="top" size="small">
                <el-form-item label="条件表达式">
                    <el-input
                        v-model="localNode.data.condition"
                        placeholder="例如: player.gold >= 100"
                        @change="updateNodeProperty('data.condition', localNode.data.condition)"
                    />
                </el-form-item>

                <el-form-item label="条件为真时跳转节点ID">
                    <el-input
                        v-model="localNode.data.trueNodeId"
                        placeholder="条件满足时跳转的节点ID"
                        @change="updateNodeProperty('data.trueNodeId', localNode.data.trueNodeId)"
                    />
                </el-form-item>

                <el-form-item label="条件为假时跳转节点ID">
                    <el-input
                        v-model="localNode.data.falseNodeId"
                        placeholder="条件不满足时跳转的节点ID"
                        @change="updateNodeProperty('data.falseNodeId', localNode.data.falseNodeId)"
                    />
                </el-form-item>

                <el-form-item label="描述">
                    <el-input
                        v-model="localNode.data.description"
                        type="textarea"
                        :rows="3"
                        @change="updateNodeProperty('data.description', localNode.data.description)"
                    />
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<style lang="less" scoped>
.node-property-editor {
    padding: 10px;
}

.property-section {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
        border-bottom: none;
    }

    h4 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 16px;
        color: #303133;
    }
}

.option-item {
    margin-bottom: 15px;
    padding: 10px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background-color: #f9fafc;

    .option-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        h5 {
            margin: 0;
            font-size: 14px;
            color: #606266;
        }
    }
}
</style>