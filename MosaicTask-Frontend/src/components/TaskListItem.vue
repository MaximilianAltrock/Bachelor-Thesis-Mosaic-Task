<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout';
import { useBoardStore } from '@/stores/board';
import { Task } from '@/types';
import { ref, watch } from 'vue';

const props = defineProps<{
    task: Task;
    listName: string;
    isNew?: boolean;
}>();

const boardStore = useBoardStore();
const isEditing = ref(false);
const editedTitle = ref(props.task.title);
const isHovered = ref(false);
const { isTaskSidebarVisible, toggleTaskSidebar } = useLayout();

const textFocus = (el: any) => {
    el.el?.focus();
};

async function saveChanges() {
    try {
        const title = editedTitle.value.trim() || 'Untitled';
        await boardStore.updateTask(props.task.id, { title });
        isEditing.value = false;
    } catch (error) {
        console.error('Failed to save task:', error);
    }
}

async function deleteTask() {
    try {
        await boardStore.deleteTask(props.task.id);
    } catch (error) {
        console.error('Failed to delete task:', error);
    }
}

async function openTaskDetails(event: Event) {
    event.stopPropagation();
    try {
        await boardStore.fetchTaskById(props.task.id);
        if (!isTaskSidebarVisible.value) {
            toggleTaskSidebar();
        }
    } catch (error) {
        console.error('Failed to load task details:', error);
    }
}

const getPrioritySeverity = (priority: number) => {
    switch (priority) {
        case 3:
            return 'danger';
        case 2:
            return 'warning';
        case 1:
            return 'info';
        default:
            return 'secondary';
    }
};

const getComplexitySeverity = (complexity: number) => {
    switch (complexity) {
        case 3:
            return 'danger';
        case 2:
            return 'warning';
        case 1:
            return 'success';
        default:
            return 'secondary';
    }
};
watch(
    () => props.isNew,
    (newValue) => {
        if (newValue) {
            isEditing.value = true;
        }
    },
    { immediate: true }
);
</script>

<template>
    <div class="p-4 task-list-item border-round card" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
        <div class="flex align-items-center place-items-center">
            <Checkbox v-model="task.completed" @change="boardStore.updateTask(task.id, { completed: task.completed })" :binary="true" class="flex-shrink-0" />
            <div class="flex ml-3 flex-grow-1 align-items-center place-items-center">
                <div v-if="!isEditing" class="mr-2 font-bold place-items-center" :class="{ 'line-through': task.completed }" @click="openTaskDetails">{{ task.title }}</div>
                <InputText v-else v-model="editedTitle" @blur="saveChanges" @keyup.enter="saveChanges" @vue:mounted="textFocus" class="flex-grow-1" />
                <div class="flex flex-shrink-0 ml-2 align-items-center">
                    <Button icon="pi pi-pencil" @click.stop="isEditing = true" severity="secondary" text :class="{ 'p-button-hidden': !isHovered && !isEditing }" />
                    <Button icon="pi pi-trash" @click.stop="deleteTask" severity="danger" text :class="{ 'p-button-hidden': !isHovered }" />
                </div>
            </div>
            <div class="flex flex-shrink-0 ml-auto align-items-center place-items-center">
                <Tag severity="info" class="mr-2">{{ task.listName }}</Tag>
                <Badge :value="task.priority_display" :severity="getPrioritySeverity(task.priority)" class="mr-2" />
                <Badge :value="task.complexity_display" :severity="getComplexitySeverity(task.complexity)" class="mr-2" />
                <AvatarGroup>
                    <Avatar v-for="user in task.assigned_to" :key="user.id" :label="user.username.charAt(0).toUpperCase()" shape="circle" :title="user.username" />
                </AvatarGroup>
            </div>
        </div>
    </div>
</template>

<style scoped>
.task-list-item {
    transition: all 0.3s ease;
    cursor: pointer;
}

.p-button-hidden {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
}

.task-list-item:hover .p-button-hidden {
    opacity: 1;
    pointer-events: auto;
}
</style>
