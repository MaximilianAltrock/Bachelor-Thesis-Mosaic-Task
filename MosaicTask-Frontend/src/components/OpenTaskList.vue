<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard';
import { computed } from 'vue';

const dashboardStore = useDashboardStore();
const tasks = computed(() => dashboardStore.tasks);

const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

const isOverdue = (task) => {
    return !task.completed && new Date(task.due_date) < new Date();
};

const getPriorityLabel = (priority) => {
    const labels = { 1: 'Low', 2: 'Medium', 3: 'High' };
    return labels[priority] || 'No priority set';
};

const getPriorityClass = (priority) => {
    const classes = {
        1: 'text-green-500',
        2: 'text-yellow-500',
        3: 'text-red-500'
    };
    return classes[priority] || '';
};
</script>
<template>
    <div class="card">
        <div class="mb-4 text-xl font-semibold">My tasks</div>
        <DataTable :value="tasks" :rows="5" :paginator="true" responsiveLayout="scroll">
            <Column field="title" header="Title" :sortable="false" style="width: 35%"></Column>
            <Column field="due_date" header="Due Date" :sortable="true" style="width: 35%">
                <template #body="slotProps">
                    <span :class="{ 'text-red-500': isOverdue(slotProps.data) }">
                        {{ formatDate(slotProps.data.due_date) }}
                        <span v-if="isOverdue(slotProps.data)"> (Overdue)</span>
                    </span>
                </template>
            </Column>
            <Column field="priority" header="Priority" :sortable="true" style="width: 35%">
                <template #body="slotProps">
                    <span :class="getPriorityClass(slotProps.data.priority)">
                        {{ getPriorityLabel(slotProps.data.priority) }}
                    </span>
                </template>
            </Column>
            <Column style="width: 15%" header="View">
                <template #body="slotProps">
                    <Button icon="pi pi-search" type="button" label="View Board" class="p-button-text" @click="$router.push(`/board/${slotProps.data.board_id}`)"></Button>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
