<script setup lang="ts">
import type { JournalEntry, Task, User } from '@/types';
import { computed, ref } from 'vue';
import MoodTracker from './MoodTracker.vue';
import TaskSelector from './TaskSelector.vue';
import VisibilitySettings from './VisibilitySettings.vue';

const props = defineProps<{
    entry: JournalEntry;
    shareableUsers: User[];
    availableTasks: Task[];
}>();

const emit = defineEmits<{
    (e: 'update:mood', mood: { valence: number; arousal: number }): void;
    (e: 'update:visibility', visibility: string): void;
    (e: 'update:task', taskId: number | null): void;
    (e: 'delete'): void;
}>();

const menu = ref(null);
const taskMenu = ref(null);
const showMoodTracker = ref(false);

const iconClass = 'pi pi-face-smile';

const visibilityIcon = computed(() => {
    switch (props.entry.visibility) {
        case 'private':
            return 'pi pi-lock';
        case 'shared':
            return 'pi pi-users';
        case 'public':
            return 'pi pi-globe';
        default:
            return 'pi pi-question-circle';
    }
});

function calculateIconColor(valence, arousal) {
    if (valence === null || valence === undefined || arousal === null || arousal === undefined) {
        return 'var(--p-button-text-secondary-color)';
    }

    const x = (valence + 1) / 2;
    const y = 1 - (arousal + 1) / 2;
    const topLeft = { r: 255, g: 0, b: 0 };
    const topRight = { r: 255, g: 255, b: 0 };
    const bottomLeft = { r: 255, g: 165, b: 0 };
    const bottomRight = { r: 0, g: 255, b: 0 };
    const topColor = {
        r: topLeft.r * (1 - x) + topRight.r * x,
        g: topLeft.g * (1 - x) + topRight.g * x,
        b: topLeft.b * (1 - x) + topRight.b * x
    };
    const bottomColor = {
        r: bottomLeft.r * (1 - x) + bottomRight.r * x,
        g: bottomLeft.g * (1 - x) + bottomRight.g * x,
        b: bottomLeft.b * (1 - x) + bottomRight.b * x
    };
    const finalColor = {
        r: Math.round(topColor.r * (1 - y) + bottomColor.r * y),
        g: Math.round(topColor.g * (1 - y) + bottomColor.g * y),
        b: Math.round(topColor.b * (1 - y) + bottomColor.b * y)
    };
    return `rgb(${finalColor.r}, ${finalColor.g}, ${finalColor.b})`;
}

const toggleMenu = (event: Event) => {
    (menu.value as any).toggle(event);
};

const openTaskMenu = (event: Event) => {
    (taskMenu.value as any).toggle(event);
};

const openMoodTracker = () => {
    showMoodTracker.value = true;
};

const saveMood = (mood: { valence: number; arousal: number }) => {
    emit('update:mood', mood);
    showMoodTracker.value = false;
};

const updateVisibility = (visibility: string, sharedWith: number[]) => {
    emit('update:visibility', visibility, sharedWith);
    menu.value.hide();
};

const updateTask = (taskId: number | null) => {
    emit('update:task', taskId);
    taskMenu.value.hide();
};

const getSelectedTaskId = (task: number | { id: number } | null | undefined): number | null => {
    if (typeof task === 'number') {
        return task;
    } else if (task && typeof task === 'object' && 'id' in task) {
        return task.id;
    }
    return null;
};
</script>

<template>
    <div class="flex justify-end gap-2 mt-1">
        <Button :icon="iconClass" text rounded v-tooltip.bottom="'Add your mood'" @click="openMoodTracker" :style="{ color: calculateIconColor(entry.valence, entry.arousal) }" :severity="!entry.valence && !entry.arousal ? 'secondary' : ''" />
        <Button :icon="visibilityIcon" severity="secondary" text rounded v-tooltip.bottom="'Change visibility settings'" @click="toggleMenu($event)" aria-haspopup="true" aria-controls="overlay_menu" />
        <Button icon="pi pi-link" :severity="entry.task ? 'success' : 'secondary'" text rounded v-tooltip.bottom="'Link a task'" @click="openTaskMenu" />
        <Button icon="pi pi-trash" text rounded severity="danger" v-tooltip.bottom="'Delete entry'" @click="$emit('delete')" />
    </div>

    <Popover ref="menu">
        <VisibilitySettings :visibility="entry.visibility" :shared-with="entry.shared_with" :shareable-users="shareableUsers" @update:visibility="updateVisibility" />
    </Popover>
    <Popover ref="taskMenu">
        <TaskSelector :tasks="availableTasks" :selected-task="getSelectedTaskId(entry.task)" @update:task="updateTask" />
    </Popover>

    <Dialog v-model:visible="showMoodTracker" modal header="How are you feeling?" class="text-center" :style="{ width: '500px' }">
        <MoodTracker :initial-valence="entry.valence !== null ? entry.valence : 0" :initial-arousal="entry.arousal !== null ? entry.arousal : 0" @save-mood="saveMood" />
    </Dialog>
</template>
