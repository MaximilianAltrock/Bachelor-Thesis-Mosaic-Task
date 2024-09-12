<script setup lang="ts">
import type { Task } from '@/types';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
    tasks: Task[];
    selectedTask: number | null;
}>();

const emit = defineEmits<{
    (e: 'update:task', taskId: number | null): void;
}>();

const selectedTaskId = ref<number | null>(props.selectedTask);

watch(
    () => props.selectedTask,
    (newValue) => {
        selectedTaskId.value = newValue;
    }
);

const taskOptions = computed(() => [{ id: null, title: 'None' }, ...props.tasks]);

const linkTask = () => {
    emit('update:task', selectedTaskId.value);
};
</script>

<template>
    <div class="flex flex-col gap-4 w-[20rem]">
        <div>
            <span class="block mb-2 font-medium">Select Task to Link</span>
            <Select :options="taskOptions" v-model="selectedTaskId" filter optionLabel="title" optionValue="id" placeholder="Select task" />
        </div>

        <Button label="Link Task" @click="linkTask" />
    </div>
</template>
