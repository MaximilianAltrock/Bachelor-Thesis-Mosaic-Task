<script setup lang="ts">
import MoodHistoryChart from '@/components/MoodHistoryChart.vue';
import MoodMatrixHeatmap from '@/components/MoodMatrixHeatmap.vue';
import NewBoardModal from '@/components/NewBoardModal.vue';
import OpenTaskList from '@/components/OpenTaskList.vue';
import UserBoardList from '@/components/UserBoardList.vue';
import { useBoardStore } from '@/stores/board';
import { useDashboardStore } from '@/stores/dashboard';
import { onMounted, ref } from 'vue';

const boardStore = useBoardStore();
const dashboardStore = useDashboardStore();

const isNewBoardModalVisible = ref(false);
const newBoard = ref({ name: '', description: '' });
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
    await fetchData();
});

const fetchData = async () => {
    try {
        isLoading.value = true;
        await Promise.all([boardStore.fetchBoards(), dashboardStore.fetchDashboardData()]);
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        error.value = err.message || 'An error occurred while fetching data.';
    } finally {
        isLoading.value = false;
    }
};

const openNewBoardModal = () => {
    isNewBoardModalVisible.value = true;
};

const closeNewBoardModal = () => {
    isNewBoardModalVisible.value = false;
    newBoard.value = { name: '', description: '' };
};

const createNewBoard = async () => {
    if (!newBoard.value.name.trim()) {
        return;
    }

    try {
        await boardStore.createBoard(newBoard.value);
        closeNewBoardModal();
    } catch (error) {
        console.error('Error creating new board:', error);
    }
};
</script>
<template>
    <div class="grid grid-cols-12 gap-8">
        <MoodHistoryChart class="col-span-12 xl:col-span-6" />
        <MoodMatrixHeatmap class="col-span-12 xl:col-span-6" />
        <OpenTaskList class="col-span-12 xl:col-span-6" />
        <UserBoardList class="col-span-12 xl:col-span-6" :visible="isNewBoardModalVisible" :newBoard="newBoard" @open-new-board-modal="openNewBoardModal" />

        <NewBoardModal v-model:visible="isNewBoardModalVisible" v-model:newBoard="newBoard" @create="createNewBoard" />
    </div>
</template>
