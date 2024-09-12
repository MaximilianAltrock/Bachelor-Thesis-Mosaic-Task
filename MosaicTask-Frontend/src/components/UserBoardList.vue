<template>
    <div class="card">
        <div class="text-xl font-semibold">My Boards</div>
        <DataView :value="boards" :layout="layout">
            <template #header>
                <div class="flex justify-end">
                    <Button label="New Board" icon="pi pi-plus" @click="$emit('open-new-board-modal')" />
                </div>
            </template>
            <template #grid="slotProps">
                <div class="grid grid-cols-12 pt-2">
                    <div v-for="(item, index) in slotProps.items" :key="index" class="col-span-12 p-2 sm:col-span-6 lg:col-span-4">
                        <div class="flex flex-col p-6 border rounded border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900">
                            <div class="flex flex-row items-start">
                                <div>
                                    <div class="mt-1 text-lg font-medium">{{ item.name }}</div>
                                </div>
                            </div>
                            <div class="flex flex-col">
                                <div class="flex gap-2 pt-4">
                                    <Button icon="pi pi-clipboard" label="View" @click="$router.push(`/board/${item.id}`)" class="flex-auto whitespace-nowrap"></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </DataView>
    </div>
</template>

<script setup lang="ts">
import { useBoardStore } from '@/stores/board';
import { computed, ref } from 'vue';

const props = defineProps<{
    visible: boolean;
    newBoard: { name: string; description: string };
}>();

const emit = defineEmits<{
    (e: 'open-new-board-modal'): void;
}>();

const boardStore = useBoardStore();
const boards = computed(() => boardStore.boards);
const layout = ref('grid');
</script>

<style scoped>
.new-board-item {
    transition: all 0.2s ease;
}

.new-board-item:hover {
    transform: translateY(-4px);
}
</style>
