<script setup lang="ts">
import { useBoardStore } from '@/stores/board';
import { computed } from 'vue';
import draggable from 'vuedraggable/src/vuedraggable';
import TaskListItem from './TaskListItem.vue';

const boardStore = useBoardStore();

const allTasks = computed(() => {
    const tasks = boardStore.tasks
        .map((task) => ({
            ...task,
            listName: boardStore.lists.find((list) => list.id === task.list)?.name || 'Unknown List'
        }))
        .sort((a, b) => {
            const listA = boardStore.lists.find((list) => list.id === a.list)?.position || 0;
            const listB = boardStore.lists.find((list) => list.id === b.list)?.position || 0;
            if (listA === listB) {
                return a.position - b.position;
            }
            return listA - listB;
        });
    return tasks;
});
const onTaskMove = async (event: { moved?: { element: any; newIndex: number } }) => {
    const { moved } = event;
    if (moved && boardStore.currentBoard) {
        const task = moved.element;
        const newListId = boardStore.currentBoard.lists[Math.floor(moved.newIndex / boardStore.currentBoard.lists.length)].id;
        const newPositionInList = moved.newIndex % boardStore.currentBoard.lists.length;

        try {
            await boardStore.moveTask(task.id, newListId, newPositionInList);
        } catch (error) {
            console.error('Error moving task:', error);
        }
    }
};
</script>

<template>
    <div class="list-view">
        <draggable :list="allTasks" group="tasks" @change="onTaskMove" item-key="id" class="task-list">
            <template #item="{ element: task }">
                <TaskListItem :task="task" :listName="task.listName" :key="task.id" />
            </template>
        </draggable>
    </div>
</template>

<style scoped>
.list-view {
    max-width: 800px;
    margin: 0 auto;
}

.task-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>
