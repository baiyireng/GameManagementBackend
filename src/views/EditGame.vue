<script setup lang="ts">
import { ref } from 'vue';
import { VueFlow, useNodes, useEdges } from '@vue-flow/core';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../utils/request';

// 定义游戏编辑入口数据结构
interface GameEditorEntry {
    character: string; // 角色编辑器路径
    event: string; // 事件编辑器路径
    location: string; // 场地编辑器路径
    skill: string; // 技能编辑器路径
}

// 当前编辑的游戏信息
const currentGame = ref({
    id: 1,
    name: '冒险之旅',
    editorEntry: {
        character: '/edit-character',
        event: '/edit-event',
        location: '/edit-location',
        skill: '/edit-skill',
    },
});

// 流程图数据
const nodes = ref([
    {
        id: 'character-editor',
        type: 'input',
        label: '角色编辑',
        position: { x: 250, y: 5 },
    },
    {
        id: 'event-editor',
        label: '事件编辑',
        position: { x: 100, y: 100 },
    },
    {
        id: 'location-editor',
        label: '场地编辑',
        position: { x: 400, y: 100 },
    },
    {
        id: 'skill-editor',
        type: 'output',
        label: '技能编辑',
        position: { x: 250, y: 200 },
    },
]);

const edges = ref([
    { id: 'e1-2', source: 'character-editor', target: 'event-editor' },
    { id: 'e1-3', source: 'character-editor', target: 'location-editor' },
    { id: 'e2-4', source: 'event-editor', target: 'skill-editor' },
    { id: 'e3-4', source: 'location-editor', target: 'skill-editor' },
]);

// 全屏流程图编辑器可见性
const flowEditorVisible = ref(false);

// 打开流程图编辑器
const openFlowEditor = () => {
    flowEditorVisible.value = true;
};

// 关闭流程图编辑器
const closeFlowEditor = () => {
    flowEditorVisible.value = false;
};

// 保存流程图数据
const saveFlowData = () => {
    ElMessage.success('流程图数据已保存');
    console.log('保存的节点数据:', nodes.value);
    console.log('保存的边数据:', edges.value);
};

// 重置流程图数据
const resetFlowData = () => {
    ElMessageBox.confirm('是否确认重置流程图数据？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(() => {
            // TODO: 实际重置逻辑
            ElMessage.success('流程图数据已重置');
        })
        .catch(() => {
            ElMessage.info('操作已取消');
        });
};
</script>

<template>
    <el-card class="edit-game">
        <template #header>
            <div class="card-header">
                <span>编辑游戏：{{ currentGame.name }}</span>
            </div>
        </template>

        <el-row :gutter="20" class="editor-cards">
            <!-- 角色编辑 -->
            <el-col :span="6">
                <el-card
                    class="game-editor-card"
                    @click="() => $router.push(currentGame.editorEntry.character)"
                >
                    <div class="card-content">
                        <i class="el-icon-user-solid"></i>
                        <div class="card-title">角色编辑</div>
                        <div class="card-desc">管理游戏中的角色与属性</div>
                    </div>
                </el-card>
            </el-col>

            <!-- 事件编辑 -->
            <el-col :span="6">
                <el-card
                    class="game-editor-card"
                    @click="() => $router.push(currentGame.editorEntry.event)"
                >
                    <div class="card-content">
                        <i class="el-icon-timer"></i>
                        <div class="card-title">事件编辑</div>
                        <div class="card-desc">配置剧情事件与选项逻辑</div>
                    </div>
                </el-card>
            </el-col>

            <!-- 场地编辑 -->
            <el-col :span="6">
                <el-card
                    class="game-editor-card"
                    @click="() => $router.push(currentGame.editorEntry.location)"
                >
                    <div class="card-content">
                        <i class="el-icon-map-location"></i>
                        <div class="card-title">场地编辑</div>
                        <div class="card-desc">设置场景、地图与环境配置</div>
                    </div>
                </el-card>
            </el-col>

            <!-- 技能编辑 -->
            <el-col :span="6">
                <el-card
                    class="game-editor-card"
                    @click="() => $router.push(currentGame.editorEntry.skill)"
                >
                    <div class="card-content">
                        <i class="el-icon-lightning"></i>
                        <div class="card-title">技能编辑</div>
                        <div class="card-desc">定义技能系统与效果联动</div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 可视化流程图区域 -->
        <el-card
            class="visual-flow-editor"
            style="margin-top: 30px; width: calc(100% - 2px); height: 490px"
        >
            <template #header>
                <div class="card-header">
                    <span>可视化流程图</span>
                    <el-button type="primary" icon="Edit" @click="openFlowEditor"
                        >全屏编辑</el-button
                    >
                </div>
            </template>

            <div class="flow-container">
                <VueFlow class="floow_card_body" :nodes="nodes" :edges="edges" />
            </div>
        </el-card>
    </el-card>

    <el-dialog
        v-model="flowEditorVisible"
        title="可视化流程图编辑器"
        :fullscreen="true"
        :show-close="false"
        class="flow-editor-dialog"
    >
        <div class="flow-editor-header">
            <span>当前游戏：{{ currentGame.name }}</span>
            <div class="flow-editor-controls">
                <el-button icon="Check" @click="saveFlowData">保存</el-button>
                <el-button icon="RefreshLeft" @click="resetFlowData">重置</el-button>
                <el-button icon="CloseBold" @click="closeFlowEditor">关闭</el-button>
            </div>
        </div>

        <div class="flow-editor-content">
            <VueFlow v-model:nodes="nodes" v-model:edges="edges" />
        </div>
    </el-dialog>
</template>
<style>
/* these are necessary styles for vue flow */
@import '@vue-flow/core/dist/style.css';

/* this contains the default theme, these are optional styles */
@import '@vue-flow/core/dist/theme-default.css';
</style>
<style lang="less" scoped>
.edit-game {
    margin: 24px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .card-header {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
    }
}

.editor-cards {
    margin-bottom: 24px;
}

.game-editor-card {
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-5px);
    }
}

.card-content {
    text-align: center;
    padding: 20px 0;
}

.card-title {
    margin: 10px 0 5px;
    font-size: 16px;
    font-weight: bold;
}

.card-desc {
    font-size: 13px;
    color: #999;
}

.visual-flow-editor {
    p {
        margin: 0;
        font-size: 14px;
        color: #666;
    }

    .flow-container {
        width: 100%;
        height: 450px;
    }
}

.flow-editor-dialog {
    .el-dialog__header {
        padding: 0;
        border-bottom: none;
    }

    .el-dialog__body {
        padding: 0;
        height: calc(100vh - 120px);
    }
}

.flow-editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
}

.flow-editor-controls {
    display: flex;
    gap: 10px;
}

.flow-editor-content {
    width: 100%;
    height: 100%;
}
:deep(.el-card__body) {
    width: calc(100% - 40px);
    height: calc(100% - 108px);
}
:deep(.vue-flow__container) {
    height: calc(100% - 82px);
}
</style>