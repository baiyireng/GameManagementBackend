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
    // 确保localNode.value和localNode.value.data存在
    if (!localNode.value || !localNode.value.data) {
        console.error('节点数据无效，无法添加选项');
        ElMessage.error('节点数据无效，无法添加选项');
        return;
    }

    // 确保options数组存在
    if (!localNode.value.data.options) {
        localNode.value.data.options = [];
    }

    // 添加新选项
    localNode.value.data.options.push({
        id: `option-${Date.now()}`,
        text: '新选项',
        condition: '',
        nextNodeId: '',
        consequences: {},
    });

    // 创建完整的节点副本，确保包含id和所有必要属性
    const updatedNode = { ...localNode.value };

    // 发出更新事件
    emit('update:node', updatedNode);
    ElMessage.success('已添加新选项');
};

// 删除选项（针对选择节点）
const removeOption = (index) => {
    // 确保localNode.value和localNode.value.data存在
    if (!localNode.value || !localNode.value.data) {
        console.error('节点数据无效，无法删除选项');
        ElMessage.error('节点数据无效，无法删除选项');
        return;
    }

    // 确保options数组存在
    if (!localNode.value.data.options) {
        console.error('选项数组不存在');
        ElMessage.error('选项数组不存在');
        return;
    }

    localNode.value.data.options.splice(index, 1);

    // 创建完整的节点副本，确保包含id和所有必要属性
    const updatedNode = { ...localNode.value };

    // 发出更新事件
    emit('update:node', updatedNode);
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

// 添加对话选项
const addDialogueOption = () => {
    // 确保localNode.value和localNode.value.data存在
    if (!localNode.value || !localNode.value.data) {
        console.error('节点数据无效，无法添加对话选项');
        ElMessage.error('节点数据无效，无法添加对话选项');
        return;
    }

    // 确保options数组存在
    if (!localNode.value.data.options) {
        localNode.value.data.options = [];
    }

    localNode.value.data.options.push({
        text: '',
        condition: '',
        nextNodeId: '',
    });

    // 创建完整的节点副本，确保包含id和所有必要属性
    const updatedNode = { ...localNode.value };

    // 发出更新事件
    emit('update:node', updatedNode);
    ElMessage.success('已添加新对话选项');
};

// 删除对话选项
const removeDialogueOption = (index) => {
    // 确保localNode.value和localNode.value.data存在
    if (!localNode.value || !localNode.value.data) {
        console.error('节点数据无效，无法删除对话选项');
        ElMessage.error('节点数据无效，无法删除对话选项');
        return;
    }

    if (localNode.value.data.options && localNode.value.data.options.length > index) {
        localNode.value.data.options.splice(index, 1);

        // 创建完整的节点副本，确保包含id和所有必要属性
        const updatedNode = { ...localNode.value };

        // 发出更新事件
        emit('update:node', updatedNode);
        ElMessage.success('已删除对话选项');
    }
};

// 更新对话选项属性
const updateDialogueOption = (index, property, value) => {
    // 确保localNode.value和localNode.value.data存在
    if (!localNode.value || !localNode.value.data) {
        console.error('节点数据无效，无法更新对话选项');
        ElMessage.error('节点数据无效，无法更新对话选项');
        return;
    }

    if (localNode.value.data.options && localNode.value.data.options.length > index) {
        localNode.value.data.options[index][property] = value;

        // 创建完整的节点副本，确保包含id和所有必要属性
        const updatedNode = { ...localNode.value };

        // 发出更新事件
        emit('update:node', updatedNode);
    }
};

// 添加任务目标
const addQuestObjective = () => {
    // 确保localNode.value和localNode.value.data存在
    if (!localNode.value || !localNode.value.data) {
        console.error('节点数据无效，无法添加任务目标');
        ElMessage.error('节点数据无效，无法添加任务目标');
        return;
    }

    // 确保objectives数组存在
    if (!localNode.value.data.objectives) {
        localNode.value.data.objectives = [];
    }

    localNode.value.data.objectives.push({
        description: '',
        type: 'collect',
        amount: 1,
    });

    // 创建完整的节点副本，确保包含id和所有必要属性
    const updatedNode = { ...localNode.value };

    // 发出更新事件
    emit('update:node', updatedNode);
    ElMessage.success('已添加新任务目标');
};

// 删除任务目标
const removeQuestObjective = (index) => {
    // 确保localNode.value和localNode.value.data存在
    if (!localNode.value || !localNode.value.data) {
        console.error('节点数据无效，无法删除任务目标');
        ElMessage.error('节点数据无效，无法删除任务目标');
        return;
    }

    if (localNode.value.data.objectives && localNode.value.data.objectives.length > index) {
        localNode.value.data.objectives.splice(index, 1);

        // 创建完整的节点副本，确保包含id和所有必要属性
        const updatedNode = { ...localNode.value };

        // 发出更新事件
        emit('update:node', updatedNode);
        ElMessage.success('已删除任务目标');
    }
};

// 更新任务目标属性
const updateQuestObjective = (index, property, value) => {
    // 确保localNode.value和localNode.value.data存在
    if (!localNode.value || !localNode.value.data) {
        console.error('节点数据无效，无法更新任务目标');
        ElMessage.error('节点数据无效，无法更新任务目标');
        return;
    }

    if (localNode.value.data.objectives && localNode.value.data.objectives.length > index) {
        localNode.value.data.objectives[index][property] = value;

        // 创建完整的节点副本，确保包含id和所有必要属性
        const updatedNode = { ...localNode.value };

        // 发出更新事件
        emit('update:node', updatedNode);
    }
};

// 添加任务奖励
const addQuestReward = () => {
    // 确保localNode.value和localNode.value.data存在
    if (!localNode.value || !localNode.value.data) {
        console.error('节点数据无效，无法添加任务奖励');
        ElMessage.error('节点数据无效，无法添加任务奖励');
        return;
    }

    // 确保rewards数组存在
    if (!localNode.value.data.rewards) {
        localNode.value.data.rewards = [];
    }

    localNode.value.data.rewards.push({
        description: '',
        type: 'item',
        amount: 1,
    });

    // 创建完整的节点副本，确保包含id和所有必要属性
    const updatedNode = { ...localNode.value };

    // 发出更新事件
    emit('update:node', updatedNode);
    ElMessage.success('已添加新任务奖励');
};

// 删除任务奖励
const removeQuestReward = (index) => {
    // 确保localNode.value和localNode.value.data存在
    if (!localNode.value || !localNode.value.data) {
        console.error('节点数据无效，无法删除任务奖励');
        ElMessage.error('节点数据无效，无法删除任务奖励');
        return;
    }

    if (localNode.value.data.rewards && localNode.value.data.rewards.length > index) {
        localNode.value.data.rewards.splice(index, 1);

        // 创建完整的节点副本，确保包含id和所有必要属性
        const updatedNode = { ...localNode.value };

        // 发出更新事件
        emit('update:node', updatedNode);
        ElMessage.success('已删除任务奖励');
    }
};

// 更新任务奖励属性
const updateQuestReward = (index, property, value) => {
    // 确保localNode.value和localNode.value.data存在
    if (!localNode.value || !localNode.value.data) {
        console.error('节点数据无效，无法更新任务奖励');
        ElMessage.error('节点数据无效，无法更新任务奖励');
        return;
    }

    if (localNode.value.data.rewards && localNode.value.data.rewards.length > index) {
        localNode.value.data.rewards[index][property] = value;

        // 创建完整的节点副本，确保包含id和所有必要属性
        const updatedNode = { ...localNode.value };

        // 发出更新事件
        emit('update:node', updatedNode);
    }
};

// 添加战斗敌人
const addCombatEnemy = () => {
    // 确保localNode.value和localNode.value.data存在
    if (!localNode.value || !localNode.value.data) {
        console.error('节点数据无效，无法添加战斗敌人');
        ElMessage.error('节点数据无效，无法添加战斗敌人');
        return;
    }

    // 确保enemies数组存在
    if (!localNode.value.data.enemies) {
        localNode.value.data.enemies = [];
    }

    localNode.value.data.enemies.push({
        name: '',
        hp: 100,
        attack: 10,
        defense: 5,
        image: '',
        abilities: '',
    });

    // 创建完整的节点副本，确保包含id和所有必要属性
    const updatedNode = { ...localNode.value };

    // 发出更新事件
    emit('update:node', updatedNode);
    ElMessage.success('已添加新敌人');
};

// 删除战斗敌人
const removeCombatEnemy = (index) => {
    // 确保localNode.value和localNode.value.data存在
    if (!localNode.value || !localNode.value.data) {
        console.error('节点数据无效，无法删除战斗敌人');
        ElMessage.error('节点数据无效，无法删除战斗敌人');
        return;
    }

    if (localNode.value.data.enemies && localNode.value.data.enemies.length > index) {
        localNode.value.data.enemies.splice(index, 1);

        // 创建完整的节点副本，确保包含id和所有必要属性
        const updatedNode = { ...localNode.value };

        // 发出更新事件
        emit('update:node', updatedNode);
        ElMessage.success('已删除敌人');
    }
};

// 更新战斗敌人属性
const updateCombatEnemy = (index, property, value) => {
    // 确保localNode.value和localNode.value.data存在
    if (!localNode.value || !localNode.value.data) {
        console.error('节点数据无效，无法更新战斗敌人');
        ElMessage.error('节点数据无效，无法更新战斗敌人');
        return;
    }

    if (localNode.value.data.enemies && localNode.value.data.enemies.length > index) {
        localNode.value.data.enemies[index][property] = value;

        // 创建完整的节点副本，确保包含id和所有必要属性
        const updatedNode = { ...localNode.value };

        // 发出更新事件
        emit('update:node', updatedNode);
    }
};
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

        <!-- 战斗节点特定属性 -->
        <div v-if="nodeType === 'combat'" class="property-section">
            <h4>战斗节点属性</h4>
            <el-form label-position="top" size="small">
                <el-form-item label="战斗名称">
                    <el-input
                        v-model="localNode.data.combatName"
                        placeholder="战斗名称"
                        @change="updateNodeProperty('data.combatName', localNode.data.combatName)"
                    />
                </el-form-item>

                <el-form-item label="战斗描述">
                    <el-input
                        v-model="localNode.data.description"
                        type="textarea"
                        :rows="4"
                        placeholder="战斗场景描述"
                        @change="updateNodeProperty('data.description', localNode.data.description)"
                    />
                </el-form-item>

                <el-form-item label="战斗背景">
                    <el-input
                        v-model="localNode.data.background"
                        placeholder="战斗背景图片URL"
                        @change="updateNodeProperty('data.background', localNode.data.background)"
                    />
                </el-form-item>

                <el-form-item label="战斗音乐">
                    <el-input
                        v-model="localNode.data.music"
                        placeholder="战斗背景音乐URL"
                        @change="updateNodeProperty('data.music', localNode.data.music)"
                    />
                </el-form-item>

                <el-form-item label="战斗难度">
                    <el-rate
                        v-model="localNode.data.difficulty"
                        :max="5"
                        @change="updateNodeProperty('data.difficulty', localNode.data.difficulty)"
                    />
                </el-form-item>

                <el-divider>敌人列表</el-divider>

                <div
                    v-for="(enemy, index) in localNode.data.enemies || []"
                    :key="index"
                    class="combat-enemy"
                >
                    <el-row :gutter="10">
                        <el-col :span="18">
                            <el-form-item :label="`敌人 ${index + 1}`">
                                <el-input
                                    v-model="enemy.name"
                                    placeholder="敌人名称"
                                    @change="updateCombatEnemy(index, 'name', enemy.name)"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6" class="option-actions">
                            <el-button
                                type="danger"
                                size="small"
                                icon="Delete"
                                @click="removeCombatEnemy(index)"
                            >
                                删除
                            </el-button>
                        </el-col>
                    </el-row>

                    <el-row :gutter="10">
                        <el-col :span="8">
                            <el-form-item label="生命值">
                                <el-input-number
                                    v-model="enemy.hp"
                                    :min="1"
                                    @change="updateCombatEnemy(index, 'hp', enemy.hp)"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="攻击力">
                                <el-input-number
                                    v-model="enemy.attack"
                                    :min="0"
                                    @change="updateCombatEnemy(index, 'attack', enemy.attack)"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="防御力">
                                <el-input-number
                                    v-model="enemy.defense"
                                    :min="0"
                                    @change="updateCombatEnemy(index, 'defense', enemy.defense)"
                                />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="敌人图片">
                        <el-input
                            v-model="enemy.image"
                            placeholder="敌人图片URL"
                            @change="updateCombatEnemy(index, 'image', enemy.image)"
                        />
                    </el-form-item>

                    <el-form-item label="特殊能力">
                        <el-input
                            v-model="enemy.abilities"
                            type="textarea"
                            :rows="2"
                            placeholder="敌人特殊能力描述"
                            @change="updateCombatEnemy(index, 'abilities', enemy.abilities)"
                        />
                    </el-form-item>

                    <el-divider v-if="index < (localNode.data.enemies || []).length - 1" />
                </div>

                <el-button type="primary" icon="Plus" @click="addCombatEnemy"> 添加敌人 </el-button>

                <el-divider>战斗结果</el-divider>

                <el-form-item label="胜利后节点ID">
                    <el-input
                        v-model="localNode.data.victoryNodeId"
                        placeholder="战斗胜利后跳转的节点ID"
                        @change="
                            updateNodeProperty('data.victoryNodeId', localNode.data.victoryNodeId)
                        "
                    />
                </el-form-item>

                <el-form-item label="失败后节点ID">
                    <el-input
                        v-model="localNode.data.defeatNodeId"
                        placeholder="战斗失败后跳转的节点ID"
                        @change="
                            updateNodeProperty('data.defeatNodeId', localNode.data.defeatNodeId)
                        "
                    />
                </el-form-item>

                <el-form-item label="逃跑后节点ID">
                    <el-input
                        v-model="localNode.data.escapeNodeId"
                        placeholder="战斗逃跑后跳转的节点ID"
                        @change="
                            updateNodeProperty('data.escapeNodeId', localNode.data.escapeNodeId)
                        "
                    />
                </el-form-item>

                <el-form-item label="允许逃跑">
                    <el-switch
                        v-model="localNode.data.allowEscape"
                        @change="updateNodeProperty('data.allowEscape', localNode.data.allowEscape)"
                    />
                </el-form-item>
            </el-form>
        </div>

        <!-- 对话节点特定属性 -->
        <div v-if="nodeType === 'dialogue'" class="property-section">
            <h4>对话节点属性</h4>
            <el-form label-position="top" size="small">
                <el-form-item label="说话者">
                    <el-input
                        v-model="localNode.data.speaker"
                        placeholder="对话角色名称"
                        @change="updateNodeProperty('data.speaker', localNode.data.speaker)"
                    />
                </el-form-item>

                <el-form-item label="头像">
                    <el-input
                        v-model="localNode.data.avatar"
                        placeholder="角色头像图片URL"
                        @change="updateNodeProperty('data.avatar', localNode.data.avatar)"
                    />
                </el-form-item>

                <el-form-item label="对话内容">
                    <el-input
                        v-model="localNode.data.content"
                        type="textarea"
                        :rows="4"
                        placeholder="角色说的话"
                        @change="updateNodeProperty('data.content', localNode.data.content)"
                    />
                </el-form-item>

                <el-form-item label="情绪">
                    <el-select
                        v-model="localNode.data.emotion"
                        placeholder="选择角色情绪"
                        @change="updateNodeProperty('data.emotion', localNode.data.emotion)"
                    >
                        <el-option label="普通" value="normal" />
                        <el-option label="高兴" value="happy" />
                        <el-option label="悲伤" value="sad" />
                        <el-option label="愤怒" value="angry" />
                        <el-option label="惊讶" value="surprised" />
                    </el-select>
                </el-form-item>

                <el-divider>对话选项</el-divider>

                <div
                    v-for="(option, index) in localNode.data.options || []"
                    :key="index"
                    class="dialogue-option"
                >
                    <el-row :gutter="10">
                        <el-col :span="18">
                            <el-form-item :label="`选项 ${index + 1} 文本`">
                                <el-input
                                    v-model="option.text"
                                    placeholder="玩家可选择的对话选项"
                                    @change="updateDialogueOption(index, 'text', option.text)"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6" class="option-actions">
                            <el-button
                                type="danger"
                                size="small"
                                icon="Delete"
                                @click="removeDialogueOption(index)"
                            >
                                删除
                            </el-button>
                        </el-col>
                    </el-row>

                    <el-form-item label="条件表达式">
                        <el-input
                            v-model="option.condition"
                            placeholder="显示此选项的条件，例如: player.intelligence > 5"
                            @change="updateDialogueOption(index, 'condition', option.condition)"
                        />
                    </el-form-item>

                    <el-form-item label="下一个节点ID">
                        <el-input
                            v-model="option.nextNodeId"
                            placeholder="选择此选项后跳转的节点ID"
                            @change="updateDialogueOption(index, 'nextNodeId', option.nextNodeId)"
                        />
                    </el-form-item>

                    <el-divider v-if="index < (localNode.data.options || []).length - 1" />
                </div>

                <el-button type="primary" icon="Plus" @click="addDialogueOption">
                    添加对话选项
                </el-button>
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

        <!-- 开始节点特定属性 -->
        <div v-if="nodeType === 'start'" class="property-section">
            <h4>开始节点属性</h4>
            <el-form label-position="top" size="small">
                <el-form-item label="初始描述">
                    <el-input
                        v-model="localNode.data.description"
                        type="textarea"
                        :rows="4"
                        placeholder="游戏开始时的描述文本"
                        @change="updateNodeProperty('data.description', localNode.data.description)"
                    />
                </el-form-item>

                <el-form-item label="下一个节点ID">
                    <el-input
                        v-model="localNode.data.nextNodeId"
                        placeholder="开始后跳转的节点ID"
                        @change="updateNodeProperty('data.nextNodeId', localNode.data.nextNodeId)"
                    />
                </el-form-item>

                <el-form-item label="初始设置">
                    <el-input
                        v-model="localNode.data.initialSetup"
                        type="textarea"
                        :rows="3"
                        placeholder="初始游戏状态设置，例如: player.gold = 100; player.health = 100"
                        @change="
                            updateNodeProperty('data.initialSetup', localNode.data.initialSetup)
                        "
                    />
                </el-form-item>
            </el-form>
        </div>

        <!-- 结束节点特定属性 -->
        <div v-if="nodeType === 'end'" class="property-section">
            <h4>结束节点属性</h4>
            <el-form label-position="top" size="small">
                <el-form-item label="结束类型">
                    <el-select
                        v-model="localNode.data.endType"
                        placeholder="选择结束类型"
                        @change="updateNodeProperty('data.endType', localNode.data.endType)"
                    >
                        <el-option label="胜利" value="victory" />
                        <el-option label="失败" value="defeat" />
                        <el-option label="中立" value="neutral" />
                    </el-select>
                </el-form-item>

                <el-form-item label="结束标题">
                    <el-input
                        v-model="localNode.data.title"
                        placeholder="结束画面标题"
                        @change="updateNodeProperty('data.title', localNode.data.title)"
                    />
                </el-form-item>

                <el-form-item label="结束描述">
                    <el-input
                        v-model="localNode.data.description"
                        type="textarea"
                        :rows="4"
                        placeholder="游戏结束时的描述文本"
                        @change="updateNodeProperty('data.description', localNode.data.description)"
                    />
                </el-form-item>

                <el-form-item label="显示统计信息">
                    <el-switch
                        v-model="localNode.data.showStats"
                        @change="updateNodeProperty('data.showStats', localNode.data.showStats)"
                    />
                </el-form-item>
            </el-form>
        </div>

        <!-- 脚本节点特定属性 -->
        <div v-if="nodeType === 'script'" class="property-section">
            <h4>脚本节点属性</h4>
            <el-form label-position="top" size="small">
                <el-form-item label="脚本描述">
                    <el-input
                        v-model="localNode.data.description"
                        placeholder="脚本功能描述"
                        @change="updateNodeProperty('data.description', localNode.data.description)"
                    />
                </el-form-item>

                <el-form-item label="脚本代码">
                    <el-input
                        v-model="localNode.data.script"
                        type="textarea"
                        :rows="8"
                        placeholder="输入JavaScript代码，例如: player.gold += 50; player.experience += 20;"
                        @change="updateNodeProperty('data.script', localNode.data.script)"
                    />
                </el-form-item>

                <el-form-item label="执行时机">
                    <el-select
                        v-model="localNode.data.executionTime"
                        placeholder="选择脚本执行时机"
                        @change="
                            updateNodeProperty('data.executionTime', localNode.data.executionTime)
                        "
                    >
                        <el-option label="进入节点时" value="onEnter" />
                        <el-option label="离开节点时" value="onExit" />
                        <el-option label="两者都执行" value="both" />
                    </el-select>
                </el-form-item>

                <el-form-item label="下一个节点ID">
                    <el-input
                        v-model="localNode.data.nextNodeId"
                        placeholder="脚本执行后跳转的节点ID"
                        @change="updateNodeProperty('data.nextNodeId', localNode.data.nextNodeId)"
                    />
                </el-form-item>
            </el-form>
        </div>

        <!-- 任务节点特定属性 -->
        <div v-if="nodeType === 'quest'" class="property-section">
            <h4>任务节点属性</h4>
            <el-form label-position="top" size="small">
                <el-form-item label="任务名称">
                    <el-input
                        v-model="localNode.data.questName"
                        placeholder="任务名称"
                        @change="updateNodeProperty('data.questName', localNode.data.questName)"
                    />
                </el-form-item>

                <el-form-item label="任务描述">
                    <el-input
                        v-model="localNode.data.description"
                        type="textarea"
                        :rows="4"
                        placeholder="任务详细描述"
                        @change="updateNodeProperty('data.description', localNode.data.description)"
                    />
                </el-form-item>

                <el-form-item label="任务类型">
                    <el-select
                        v-model="localNode.data.questType"
                        placeholder="选择任务类型"
                        @change="updateNodeProperty('data.questType', localNode.data.questType)"
                    >
                        <el-option label="主线任务" value="main" />
                        <el-option label="支线任务" value="side" />
                        <el-option label="日常任务" value="daily" />
                        <el-option label="成就" value="achievement" />
                    </el-select>
                </el-form-item>

                <el-form-item label="任务难度">
                    <el-rate
                        v-model="localNode.data.difficulty"
                        :max="5"
                        @change="updateNodeProperty('data.difficulty', localNode.data.difficulty)"
                    />
                </el-form-item>

                <el-divider>任务目标</el-divider>

                <div
                    v-for="(objective, index) in localNode.data.objectives || []"
                    :key="index"
                    class="quest-objective"
                >
                    <el-row :gutter="10">
                        <el-col :span="18">
                            <el-form-item :label="`目标 ${index + 1}`">
                                <el-input
                                    v-model="objective.description"
                                    placeholder="任务目标描述"
                                    @change="
                                        updateQuestObjective(
                                            index,
                                            'description',
                                            objective.description,
                                        )
                                    "
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6" class="option-actions">
                            <el-button
                                type="danger"
                                size="small"
                                icon="Delete"
                                @click="removeQuestObjective(index)"
                            >
                                删除
                            </el-button>
                        </el-col>
                    </el-row>

                    <el-row :gutter="10">
                        <el-col :span="12">
                            <el-form-item label="目标类型">
                                <el-select
                                    v-model="objective.type"
                                    placeholder="选择目标类型"
                                    @change="updateQuestObjective(index, 'type', objective.type)"
                                >
                                    <el-option label="收集物品" value="collect" />
                                    <el-option label="击败敌人" value="defeat" />
                                    <el-option label="到达地点" value="reach" />
                                    <el-option label="与NPC交谈" value="talk" />
                                    <el-option label="完成事件" value="complete" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="目标数量">
                                <el-input-number
                                    v-model="objective.amount"
                                    :min="1"
                                    @change="
                                        updateQuestObjective(index, 'amount', objective.amount)
                                    "
                                />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-divider v-if="index < (localNode.data.objectives || []).length - 1" />
                </div>

                <el-button type="primary" icon="Plus" @click="addQuestObjective">
                    添加任务目标
                </el-button>

                <el-divider>任务奖励</el-divider>

                <div
                    v-for="(reward, index) in localNode.data.rewards || []"
                    :key="index"
                    class="quest-reward"
                >
                    <el-row :gutter="10">
                        <el-col :span="18">
                            <el-form-item :label="`奖励 ${index + 1}`">
                                <el-input
                                    v-model="reward.description"
                                    placeholder="奖励描述"
                                    @change="
                                        updateQuestReward(index, 'description', reward.description)
                                    "
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6" class="option-actions">
                            <el-button
                                type="danger"
                                size="small"
                                icon="Delete"
                                @click="removeQuestReward(index)"
                            >
                                删除
                            </el-button>
                        </el-col>
                    </el-row>

                    <el-row :gutter="10">
                        <el-col :span="12">
                            <el-form-item label="奖励类型">
                                <el-select
                                    v-model="reward.type"
                                    placeholder="选择奖励类型"
                                    @change="updateQuestReward(index, 'type', reward.type)"
                                >
                                    <el-option label="物品" value="item" />
                                    <el-option label="货币" value="currency" />
                                    <el-option label="经验" value="experience" />
                                    <el-option label="技能" value="skill" />
                                    <el-option label="声望" value="reputation" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="奖励数量">
                                <el-input-number
                                    v-model="reward.amount"
                                    :min="1"
                                    @change="updateQuestReward(index, 'amount', reward.amount)"
                                />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-divider v-if="index < (localNode.data.rewards || []).length - 1" />
                </div>

                <el-button type="primary" icon="Plus" @click="addQuestReward">
                    添加任务奖励
                </el-button>

                <el-divider></el-divider>

                <el-form-item label="完成后跳转节点ID">
                    <el-input
                        v-model="localNode.data.nextNodeId"
                        placeholder="任务完成后跳转的节点ID"
                        @change="updateNodeProperty('data.nextNodeId', localNode.data.nextNodeId)"
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