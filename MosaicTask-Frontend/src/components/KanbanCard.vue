<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout';
import { useBoardStore } from '@/stores/board';
import { Task, User } from '@/types';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
    task: Task;
    isNew?: boolean;
}>();

const emit = defineEmits(['taskSaved']);
const boardStore = useBoardStore();
const isEditing = ref(false);
const editedTitle = ref(props.task.title);
const isHovered = ref(false);
const { isTaskSidebarVisible, toggleTaskSidebar } = useLayout();

const textFocus = (el: any) => {
    el.el?.focus();
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

async function saveChanges() {
    try {
        const title = editedTitle.value.trim() || 'Untitled';
        if (props.isNew) {
            await boardStore.createTask({ ...props.task, title });
        } else {
            await boardStore.updateTask(props.task.id, { title });
        }
        isEditing.value = false;
        emit('taskSaved');
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
const assignedUsers = computed(() => {
    return props.task.assigned_to.map((user: User) => ({
        label: user.username.charAt(0).toUpperCase(),
        username: user.username
    }));
});

async function openTaskDetails(event: Event) {
    event.stopPropagation();
    try {
        await boardStore.fetchTaskById(props.task.id);
        if (!isTaskSidebarVisible.value) {
            toggleTaskSidebar();
        }
    } catch (error) {
        console.error('Failed to load task details:', error);
        // Handle the error appropriately in your UI
    }
}
</script>

<template>
    <Card class="kanban-task" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
        <template #content>
            <div class="flex items-center justify-between">
                <div v-if="!isEditing" class="flex-grow mr-2 truncate">
                    <span class="text-md text-color-secondary" @click="openTaskDetails">{{ task.title }}</span>
                </div>
                <div v-else class="flex-grow">
                    <InputText v-model="editedTitle" class="w-full" @keyup.enter="saveChanges" @blur="saveChanges" @vue:mounted="textFocus" />
                </div>
                <div class="flex items-center">
                    <Button icon="pi pi-pencil" rounded text severity="secondary" @click="isEditing = true" :class="{ 'opacity-0': !isHovered && !isEditing }" />
                    <Button icon="pi pi-trash" rounded text severity="danger" @click="deleteTask" :class="{ 'opacity-0': !isHovered }" />
                </div>
            </div>
        </template>
        <template #footer>
            <div class="flex items-center justify-between">
                <div class="flex space-x-2">
                    <Badge :value="task.priority_display" :severity="getPrioritySeverity(task.priority)" />
                    <Badge :value="task.complexity_display" :severity="getComplexitySeverity(task.complexity)" />
                </div>
                <AvatarGroup>
                    <Avatar v-for="user in assignedUsers" :key="user.username" :label="user.label" shape="circle" :title="user.username" />
                </AvatarGroup>
            </div>
        </template>
    </Card>
</template>

<style scoped>
.kanban-task {
    transition: box-shadow 0.3s ease;
}

.kanban-task:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-button {
    transition: opacity 0.2s ease;
    width: 2rem;
    height: 2rem;
}

.task-button:not(.opacity-0) {
    opacity: 1;
}
</style>
