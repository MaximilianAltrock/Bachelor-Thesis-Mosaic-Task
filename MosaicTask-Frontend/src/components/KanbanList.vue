<script setup lang="ts">
import { useBoardStore } from '@/stores/board';
import { List, Task } from '@/types';
import { computed, ref } from 'vue';
import draggable from 'vuedraggable/src/vuedraggable';
import TaskCard from './KanbanCard.vue';

const props = defineProps<{
    list: List;
}>();

const boardStore = useBoardStore();
const tasks = computed(() => boardStore.getTasksByList(props.list.id));
const newTaskId = ref<number | null>(null);
const isEditing = ref(false);
const editedName = ref(props.list.name);

const textFocus = (el: any) => {
    el.el?.focus();
};

const addTask = () => {
    const tempId = Date.now();
    const newTask: Partial<Task> = {
        id: tempId,
        title: '',
        description: '',
        due_date: null,
        priority: 1,
        complexity: 1,
        list: props.list.id,
        assigned_to: [],
        assigned_to_ids: [],
        position: tasks.value.length + 1
    };
    boardStore.addTaskOptimistically(newTask as Task);
    newTaskId.value = tempId;
};
async function deleteList() {
    try {
        await boardStore.deleteList(props.list.id);
    } catch (error) {
        console.error('Failed to delete list:', error);
    }
}
async function saveChanges() {
    try {
        const name = editedName.value.trim() || 'Untitled';
        await boardStore.updateList(props.list.id, { name });
        isEditing.value = false;
    } catch (error) {
        console.error('Failed to save list:', error);
    }
}
const onTaskMove = async (event: any) => {
    const { added, moved } = event;
    if (added) {
        const { element: task, newIndex } = added;
        await boardStore.moveTask(task.id, props.list.id, newIndex);
    } else if (moved) {
        const { element: task, newIndex } = moved;
        await boardStore.moveTask(task.id, props.list.id, newIndex);
    }
};
</script>

<template>
    <div class="p-4 rounded-lg w-80">
        <div class="flex items-center justify-between mb-3">
            <div v-if="!isEditing" class="flex-grow mr-2 truncate" @click="isEditing = true">
                <Tag severity="contrast" style="font-size: medium; cursor: pointer">{{ list.name }}</Tag>
            </div>
            <div v-else class="flex-grow">
                <InputText v-model="editedName" class="w-full" @keyup.enter="saveChanges" @blur="saveChanges" @vue:mounted="textFocus" />
            </div>
            <Button v-if="!isEditing" icon="pi pi-trash" severity="danger" class="p-button-rounded p-button-text" @click="deleteList" />
        </div>
        <draggable :list="tasks" group="tasks" @change="onTaskMove" item-key="id" class="space-y-2 min-h-[50px]">
            <template #item="{ element: task }">
                <TaskCard :task="task" :is-new="task.id === newTaskId" @task-saved="newTaskId = null" />
            </template>
        </draggable>
        <div class="mt-3">
            <Button label="New Task" icon="pi pi-plus" severity="secondary" text class="w-full" style="justify-content: start" @click="addTask" />
        </div>
    </div>
</template>

<style scoped></style>
