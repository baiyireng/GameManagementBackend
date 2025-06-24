<script setup lang="ts">
import { ref } from 'vue';

// 定义 Buff 类型
interface Buff {
    id: string;
    name: string;
    description: string;
    duration: number; // 持续时间（回合）
    effectType: 'buff' | 'debuff';
    stat: string; // 属性名称（如 attack, defense）
    value: number; // 增益值
    formula?: string; // 可选公式字段
}

// 定义技能效果类型
interface SkillEffect {
    effectType: 'damage' | 'heal' | 'buff' | 'debuff' | 'stun' | 'custom';
    targetType: 'self' | 'enemy' | 'ally' | 'all';
    value?: number;
    percentage?: number;
    duration?: number;
    formula?: FormulaField;
    buffId?: string;
    // 新增 buff 字段支持内联定义
    buff?: Buff;
}

// 定义技能类型
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
    effects: SkillEffect[];
    priority?: number;
    tags?: string[];
    applicableTo: Array<'character' | 'monster' | 'equipment' | 'building'>;
}

// 初始化表单数据
const formData = ref<CharacterSkill>({
    id: 'skill_001',
    name: '',
    description: '',
    icon: {
        url: 'https://via.placeholder.com/150',
    },
    image: {
        url: 'https://via.placeholder.com/600x200',
    },
    type: 'active',
    cooldown: 3,
    cost: 10,
    costType: 'mp',
    triggerLimit: {
        levelRequired: 0,
        conditionFormula: {
            name: '条件判断',
            description: '角色属性判断',
            formula: '',
        },
    },
    targetType: 'enemy',
    effects: [],
    priority: 0,
    tags: [],
    applicableTo: ['character'],
});

// 提交表单
const submitForm = () => {
    console.log('保存技能数据:', formData.value);
    // TODO: 实际保存逻辑
};
</script>

<template>
    <el-card class="skill-editor">
        <template #header>
            <div class="card-header">
                <span>技能编辑器</span>
            </div>
        </template>

        <el-form :model="formData" label-width="150px" style="max-width: 1000px">
            <!-- 基础信息 -->
            <el-form-item label="技能名称">
                <el-input v-model="formData.name" />
            </el-form-item>

            <el-form-item label="描述">
                <el-input v-model="formData.description" type="textarea" :rows="3" />
            </el-form-item>

            <el-form-item label="图标">
                <el-input v-model="formData.icon.url" placeholder="请输入图片URL" />
            </el-form-item>

            <el-form-item label="插图">
                <el-input v-model="formData.image.url" placeholder="请输入图片URL" />
            </el-form-item>

            <el-form-item label="技能类型">
                <el-select v-model="formData.type" placeholder="请选择类型">
                    <el-option label="主动技能" value="active" />
                    <el-option label="被动技能" value="passive" />
                </el-select>
            </el-form-item>

            <!-- 冷却与消耗 -->
            <el-form-item label="冷却回合">
                <el-input-number
                    v-model="formData.cooldown"
                    :min="0"
                    placeholder="冷却时间（回合）"
                />
            </el-form-item>

            <el-form-item label="资源消耗">
                <div style="display: flex; gap: 10px">
                    <el-input-number v-model="formData.cost" :min="0" placeholder="消耗值" />
                    <el-select v-model="formData.costType" placeholder="消耗类型">
                        <el-option label="MP" value="mp" />
                        <el-option label="SP" value="sp" />
                        <el-option label="HP" value="hp" />
                        <el-option label="无" value="none" />
                    </el-select>
                </div>
            </el-form-item>

            <!-- 等级限制 -->
            <el-form-item label="等级限制">
                <el-input-number
                    v-model="formData.triggerLimit.levelRequired"
                    :min="0"
                    placeholder="最低等级要求"
                />
            </el-form-item>

            <!-- 目标选择 -->
            <el-form-item label="作用目标">
                <el-select v-model="formData.targetType" placeholder="选择目标">
                    <el-option label="自身" value="self" />
                    <el-option label="敌人" value="enemy" />
                    <el-option label="友方" value="ally" />
                    <el-option label="全体" value="all" />
                    <el-option label="单个敌人" value="single_enemy" />
                    <el-option label="单个友方" value="single_ally" />
                </el-select>
            </el-form-item>

            <!-- 效果配置 -->
            <el-form-item label="技能效果">
                <div class="effects-list">
                    <div
                        v-for="(effect, index) in formData.effects"
                        :key="index"
                        class="effect-item"
                    >
                        <el-select
                            v-model="effect.effectType"
                            placeholder="效果类型"
                            style="margin-bottom: 10px"
                        >
                            <el-option label="伤害" value="damage" />
                            <el-option label="治疗" value="heal" />
                            <el-option label="增益" value="buff" />
                            <el-option label="减益" value="debuff" />
                            <el-option label="眩晕" value="stun" />
                            <el-option label="自定义" value="custom" />
                        </el-select>

                        <el-select
                            v-model="effect.targetType"
                            placeholder="目标类型"
                            style="margin-bottom: 10px"
                        >
                            <el-option label="自身" value="self" />
                            <el-option label="敌人" value="enemy" />
                            <el-option label="友方" value="ally" />
                            <el-option label="全体" value="all" />
                        </el-select>

                        <el-input-number
                            v-if="effect.effectType === 'damage' || effect.effectType === 'heal'"
                            v-model="effect.value"
                            :min="0"
                            placeholder="数值"
                            style="margin-bottom: 10px"
                        />

                        <!-- Buff/Debuff 效果 -->
                        <div
                            v-if="effect.effectType === 'buff' || effect.effectType === 'debuff'"
                            style="
                                margin-bottom: 10px;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                                flex-wrap: wrap;
                            "
                        >
                            <el-input-number
                                v-model="effect.duration"
                                :min="0"
                                placeholder="持续时间（回合）"
                                style="flex: 1 1 100px"
                            />
                            <el-select
                                v-model="effect.stat"
                                placeholder="选择属性"
                                style="flex: 1 1 150px"
                            >
                                <el-option label="攻击力" value="attack" />
                                <el-option label="防御力" value="defense" />
                                <el-option label="生命值" value="hp" />
                                <el-option label="魔法值" value="mp" />
                                <el-option label="魅力" value="charisma" />
                                <el-option label="力量" value="strength" />
                            </el-select>
                            <el-input-number
                                v-model="effect.value"
                                :min="0"
                                placeholder="增益值"
                                style="flex: 1 1 120px"
                            />
                        </div>

                        <!-- 自定义公式 -->
                        <div v-if="effect.effectType === 'custom'" style="margin-bottom: 10px">
                            <FormulaEditor
                                :model-value="
                                    effect.formula ?? {
                                        name: '自定义公式',
                                        description: '请输入表达式',
                                        formula: '',
                                    }
                                "
                                placeholder="如：attack * 2 + level * 5"
                                @update:model-value="(value) => (effect.formula = value)"
                            />
                        </div>

                        <el-button type="danger" @click="() => formData.effects.splice(index, 1)"
                            >删除</el-button
                        >
                    </div>
                    <el-button
                        type="primary"
                        @click="
                            formData.effects.push({
                                effectType: 'damage',
                                targetType: 'enemy',
                                value: 10,
                            })
                        "
                        >新增效果</el-button
                    >
                </div>
            </el-form-item>

            <!-- 适用对象 -->
            <el-form-item label="适用对象">
                <el-select v-model="formData.applicableTo" multiple placeholder="选择适用对象">
                    <el-option label="角色" value="character" />
                    <el-option label="怪物" value="monster" />
                    <el-option label="装备" value="equipment" />
                    <el-option label="建筑" value="building" />
                </el-select>
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
.skill-editor {
    margin: 24px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .card-header {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
    }
}

.effects-list {
    border: 1px solid #e6e9ed;
    padding: 16px;
    border-radius: 4px;
    background-color: #f9f9f9;
}

.effect-item {
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