<script setup lang="ts">
import { useBoardStore } from '@/stores/board';
import { Board } from '@/types';
import { ref } from 'vue';

const props = defineProps<{
    board: Board | null;
    viewMode: string;
}>();

const emit = defineEmits(['viewChange']);

const boardStore = useBoardStore();
const newMemberUsername = ref('');
const op = ref();

const toggleAddMember = (event: Event) => {
    op.value.toggle(event);
};

const addMember = async () => {
    if (newMemberUsername.value.trim() && props.board) {
        try {
            await boardStore.addMemberToBoard(props.board.id, newMemberUsername.value.trim());
            newMemberUsername.value = '';
        } catch (error) {
            console.error('Error adding member:', error);
        }
    }
};
</script>

<template>
    <div class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold">{{ board?.name }}</h1>
            <Button severity="contrast" label="Kanban" :class="{ 'p-button-outlined': viewMode !== 'kanban' }" @click="emit('viewChange', 'kanban')">
                <template #icon>
                    <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="5.5" y1="12" x2="5.5" y2="2.18557e-08" stroke="currentColor" />
                        <line x1="10.5" y1="12" x2="10.5" y2="2.18557e-08" stroke="currentColor" />
                        <rect x="0.5" y="0.5" width="15" height="12" rx="0.5" stroke="currentColor" />
                    </svg>
                </template>
            </Button>
            <Button severity="contrast" icon="pi pi-list" label="List" :class="{ 'p-button-outlined': viewMode !== 'list' }" @click="emit('viewChange', 'list')" />
            <Button severity="contrast" icon="pi pi-chart-line" label="Project Overview" :class="{ 'p-button-outlined': viewMode !== 'overview' }" @click="emit('viewChange', 'overview')" />
        </div>
        <Button icon="pi pi-user-plus" @click="toggleAddMember" />
    </div>
    <Popover ref="op">
        <div class="flex flex-col gap-4 w-[25rem]">
            <div>
                <span class="block mb-2 font-medium">Invite Member</span>
                <InputGroup>
                    <InputText v-model="newMemberUsername" />
                    <Button label="Add" icon="pi pi-users" @click="addMember"></Button>
                </InputGroup>
            </div>
            <div>
                <span class="block mb-2 font-medium">Board Members</span>
                <ul class="flex flex-col gap-4 p-0 m-0 list-none">
                    <li v-for="member in board?.members" :key="member.id" class="flex items-center gap-2">
                        <div>
                            <span class="font-medium">{{ member.username }}</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </Popover>
</template>
<style scoped>
.p-button-outlined .custom-icon line,
.p-button-outlined .custom-icon rect {
    stroke: var(--p-button-outlined-contrast-color);
}
</style>
