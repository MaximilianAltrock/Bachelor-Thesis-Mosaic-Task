<script setup lang="ts">
import BoardHeader from '@/components/BoardHeader.vue';
import KanbanView from '@/components/KanbanView.vue';
import ListView from '@/components/ListView.vue';
import ProjectOverview from '@/components/ProjectOverview.vue';
import { useBoardStore } from '@/stores/board';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const boardStore = useBoardStore();
const loading = ref(true);
const viewMode = ref('kanban');
const props = defineProps<{ boardId: string }>();

onMounted(async () => {
    const boardId = Number(props.boardId);
    try {
        await boardStore.fetchBoardById(boardId);
    } catch (err) {
        console.error('Error fetching board:', err);
        if (boardStore.error === "You don't have permission to access this board.") {
            router.push('/auth/access');
        }
    } finally {
        loading.value = false;
    }
});

watch(
    () => route.params.boardId,
    (newBoardId) => {
        boardStore.clearSelectedTask();
        boardStore.fetchBoardById(newBoardId);
    }
);

const handleViewChange = (newViewMode: string) => {
    viewMode.value = newViewMode;
};
</script>

<template>
    <div v-if="loading">Loading...</div>
    <div v-else-if="boardStore.error" class="text-red-500">
        {{ boardStore.error }}
    </div>
    <div v-else class="flex flex-col h-full">
        <BoardHeader :board="boardStore.currentBoard" :viewMode="viewMode" @view-change="handleViewChange" />
        <Divider />
        <main class="flex-1 p-6 overflow-x-auto">
            <KanbanView v-if="viewMode === 'kanban'" />
            <ListView v-else-if="viewMode === 'list'" />
            <ProjectOverview v-else-if="viewMode === 'overview'" :board="boardStore.currentBoard" />
        </main>
    </div>
</template>

<style scoped>
.overflow-x-auto {
    overflow-x: auto;
    white-space: nowrap;
}
</style>
