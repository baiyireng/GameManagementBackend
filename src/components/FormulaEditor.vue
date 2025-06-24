<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

// 定义公式类型
interface FormulaField {
    name: string; // 公式名称（如：伤害计算）
    description: string; // 描述（如：力量 × 2 + 等级 × 5）
    formula: string; // 实际公式（如：attack * 2 + level * 5）
}

// 可用变量列表
const availableVariables = [
    { label: '角色属性', value: 'attack', group: '角色' },
    { label: '角色魅力', value: 'charisma', group: '角色' },
    { label: '角色力量', value: 'strength', group: '角色' },
    { label: '角色等级', value: 'level', group: '角色' },
    { label: '当前HP', value: 'hp', group: '状态' },
    { label: '最大HP', value: 'maxHp', group: '状态' },
    { label: '金币', value: 'gold', group: '资源' },
];

// 暴露 props
const props = defineProps<{
    modelValue: FormulaField;
}>();

// 暴露事件
const emit = defineEmits<{
    (e: 'update:modelValue', value: FormulaField): void;
}>();

// 更新表单数据
const updateFormula = () => {
    emit('update:modelValue', {
        name: props.modelValue?.name || '自定义公式',
        description: props.modelValue?.description || '请输入表达式',
        formula: formula.value,
    });
};
// 插入变量到公式中
const insertVariable = (variable: string, input: string) => {
    if (!input) {
        formula.value = variable + ' ';
        updateFormula();
        return;
    }
    const lastChar = input.slice(-1);

    // 如果最后一个字符是空格，则清空输入再插入
    if (lastChar === ' ') {
        formula.value = formula.value.trim() + ' ' + variable + ' ';
    } else {
        // 否则替换掉最后一个字符（假设是前缀字符）
        formula.value = formula.value.slice(0, -1) + variable + ' ';
    }
    updateFormula();
    filterSuggestions(formula.value);
};

// 输入框引用
const formula = ref('');

// 初始化时赋值
const initFormula = () => {
    if (props.modelValue && props.modelValue.formula) {
        formula.value = props.modelValue.formula;
    } else {
        formula.value = '';
    }
};

// 监听props变化
watch(
    () => props.modelValue,
    () => {
        initFormula();
    },
);

// 在组件挂载后初始化数据
onMounted(() => {
    initFormula();
});

// 过滤建议列表
const filteredSuggestions = ref<typeof availableVariables>([]);

// 输入搜索时过滤建议
const onInput = (value: string) => {
    formula.value = value;
    updateFormula();
    filterSuggestions(value);
};

// 过滤建议项
const filterSuggestions = (input: string) => {
    if (!input) {
        filteredSuggestions.value = [];
        return;
    }

    const lowerInput = input.toLowerCase();
    filteredSuggestions.value = availableVariables.filter(
        (item) =>
            item.label.toLowerCase().includes(lowerInput) ||
            item.value.toLowerCase().includes(lowerInput),
    );
};
</script>

<template>
    <div class="formula-editor">
        <el-form label-width="100px">
            <!-- 公式名称 -->
            <el-form-item label="公式名称">
                <el-input v-model="modelValue.name" disabled />
            </el-form-item>

            <el-form-item label="描述">
                <el-input v-model="modelValue.description" disabled />
            </el-form-item>

            <el-form-item label="表达式">
                <div class="formula-input-container">
                    <el-input
                        v-model="formula"
                        placeholder="如：attack * 2 + level * 5"
                        class="formula-input"
                        @input="onInput"
                        @keyup.space="() => filterSuggestions(formula)"
                    />

                    <div v-if="filteredSuggestions.length" class="suggestion-box">
                        <div
                            v-for="(item, index) in filteredSuggestions"
                            :key="index"
                            class="suggestion-item"
                            @click="insertVariable(item.value)"
                        >
                            <span class="suggestion-label">{{ item.label }}</span>
                            <span class="suggestion-value">({{ item.value }})</span>
                        </div>
                    </div>
                </div>
            </el-form-item>

            <!-- 可用变量提示 -->
            <div class="variable-hint">
                <strong>可用变量：</strong>
                <ul>
                    <li v-for="(item, index) in availableVariables" :key="index">
                        {{ item.label }} ({{ item.value }})
                    </li>
                </ul>
            </div>
        </el-form>
    </div>
</template>

<style scoped>
.formula-editor {
    margin-top: 16px;
}

.formula-input-container {
    position: relative;
}

.formula-input {
    width: 100%;
}

.suggestion-box {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid #ddd;
    border-top: none;
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.suggestion-item:hover {
    background-color: #f5f7fa;
}

.suggestion-label {
    font-weight: bold;
}

.suggestion-value {
    color: #999;
    margin-left: 8px;
}

.variable-hint {
    margin-top: 12px;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 4px;
    font-size: 13px;
    color: #666;
}

.variable-hint ul {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
}

.variable-hint ul li {
    display: inline-block;
    margin-right: 12px;
}
</style>