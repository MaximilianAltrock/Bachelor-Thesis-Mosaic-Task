<script setup lang="ts">
import { useBoardStore } from '@/stores/board';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
    visible: boolean;
    newBoard: { name: string; description: string };
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'update:newBoard', value: { name: string; description: string }): void;
    (e: 'create'): void;
}>();

const boardStore = useBoardStore();
const isCreatingBoard = computed(() => boardStore.isCreatingBoard);

const localNewBoard = ref({ ...props.newBoard });

watch(
    () => props.newBoard,
    (newValue) => {
        localNewBoard.value = { ...newValue };
    },
    { deep: true }
);

const closeModal = () => {
    emit('update:visible', false);
};

const createBoard = () => {
    emit('update:newBoard', localNewBoard.value);
    emit('create');
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :style="{ width: '450px' }" header="Create new board" modal>
        <div class="flex flex-col gap-4">
            <div class="field">
                <label for="name" class="block mb-2 font-medium">Board Name</label>
                <InputText id="name" v-model="localNewBoard.name" autofocus class="w-full" required />
            </div>
            <div class="field">
                <label for="description" class="block mb-2 font-medium">Description</label>
                <Textarea id="description" v-model="localNewBoard.description" class="w-full" rows="3" />
            </div>
        </div>
        <template #footer>
            <Button label="Cancel" icon="pi pi-times" @click="closeModal" text />
            <Button label="Create" icon="pi pi-check" @click="createBoard" :loading="isCreatingBoard" autofocus />
        </template>
    </Dialog>
</template>
