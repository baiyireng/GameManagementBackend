<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PropertyEditor from '@/components/PropertyEditor.vue';
import ImageUploader from '@/components/ImageUploader.vue';
import { getEvent, saveEvent } from '@/utils/request';

// 定义事件选项类型
interface EventOption {
    text: string; // 选项文本
    effects: Record<string, any>; // 效果（如：{ hp: -10, mp: +5 }）
    rewards?: Record<string, any>; // 奖励内容（例如：金币、道具等）
    penalties?: Record<string, any>; // 惩罚内容（例如：生命值减少）
    condition?: string; // 显示条件（如：角色属性大于某值）
}

// 定义事件类型
interface GameEvent {
    id: string;
    title: string; // 事件标题
    content: string; // 事件描述
    image: {
        url: string;
    };
    triggerCondition?: string; // 触发条件（如：角色魅力>15）
    options: EventOption[]; // 可选分支列表
    rewardRange?: {
        min: number;
        max: number;
    };
    probability?: number;
}

// 初始化表单数据
const formData = ref<GameEvent>({
    id: 'event_001',
    title: '',
    content: '',
    image: {
        url: 'https://via.placeholder.com/600x200',
    },
    options: [],
    rewardRange: { min: 0, max: 0 },
    probability: 1,
});

// 加载事件数据
const loadEventData = async () => {
    try {
        const data = await getEvent(formData.value.id);
        if (data) {
            formData.value = data;
        }
    } catch (error) {
        console.error('加载事件数据失败:', error);
    }
};

// 提交表单
const submitForm = async () => {
    try {
        await saveEvent(formData.value);
        console.log('事件数据保存成功:', formData.value);
    } catch (error) {
        console.error('保存事件数据失败:', error);
    }
};

// 页面加载时获取事件数据
onMounted(() => {
    loadEventData();
});
</script>

<template>
    <el-card class="event-editor">
        <template #header>
            <div class="card-header">
                <span>事件编辑器</span>
            </div>
        </template>

        <el-form :model="formData" label-width="120px" style="max-width: 900px">
            <!-- 事件触发条件 -->
            <el-form-item label="触发条件">
                <el-input v-model="formData.triggerCondition" placeholder="如：角色魅力>15" />
            </el-form-item>

            <!-- 事件标题 -->
            <el-form-item label="事件标题">
                <el-input v-model="formData.title" />
            </el-form-item>

            <!-- 事件插图 -->
            <el-form-item label="事件插图">
                <ImageUploader v-model:model-value="formData.image" :show-input="true" />
            </el-form-item>

            <!-- 事件内容 -->
            <el-form-item label="事件内容">
                <el-input v-model="formData.content" type="textarea" :rows="3" />
            </el-form-item>

            <!-- 奖励范围 -->
            <el-form-item label="随机奖励范围">
                <div style="display: flex; gap: 10px">
                    <el-input-number
                        v-model="formData.rewardRange.min"
                        :min="0"
                        placeholder="最小值"
                    />
                    <el-input-number
                        v-model="formData.rewardRange.max"
                        :min="0"
                        placeholder="最大值"
                    />
                </div>
            </el-form-item>

            <!-- 随机概率 -->
            <el-form-item label="发生概率">
                <el-slider
                    v-model="formData.probability"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    show-input
                />
            </el-form-item>

            <!-- 选项系统 -->
            <el-form-item label="可选分支">
                <div class="options-list">
                    <div
                        v-for="(option, index) in formData.options"
                        :key="index"
                        class="option-item"
                    >
                        <el-input
                            v-model="option.text"
                            placeholder="选项文本"
                            style="margin-bottom: 10px"
                        />
                        <el-input
                            v-model="option.effects.description"
                            placeholder="效果描述（如：hp:-10）"
                            style="margin-bottom: 10px"
                        />
                        <el-input
                            v-model="option.rewards.description"
                            placeholder="奖励内容（如：金币x10）"
                            style="margin-bottom: 10px"
                        />
                        <el-input
                            v-model="option.penalties.description"
                            placeholder="惩罚内容（如：生命值-20）"
                            style="margin-bottom: 10px"
                        />
                        <el-input
                            v-model="option.condition"
                            placeholder="如：角色力量>10"
                            style="margin-bottom: 10px"
                        />
                        <el-button type="danger" @click="() => formData.options.splice(index, 1)"
                            >删除</el-button
                        >
                    </div>
                    <el-button
                        type="primary"
                        @click="
                            () =>
                                formData.options.push({
                                    text: '',
                                    effects: { description: '' },
                                    rewards: { description: '' },
                                    penalties: { description: '' },
                                })
                        "
                        >新增选项</el-button
                    >
                </div>
            </el-form-item>

            <!-- 提交按钮 -->
            <el-form-item>
                <el-button type="primary" @click="submitForm">保存</el-button>
                <el-button>取消</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<style lang="less" scoped>
.event-editor {
    margin: 24px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .card-header {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
    }
}

.options-list {
    border: 1px solid #e6e9ed;
    padding: 16px;
    border-radius: 4px;
    background-color: #f9f9f9;
}

.option-item {
    padding: 12px;
    margin-bottom: 12px;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 4px;
}
:deep(.el-card__body) {
    max-height: calc(100vh - 248px);
    overflow-y: auto;
}
</style>