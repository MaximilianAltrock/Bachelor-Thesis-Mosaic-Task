<script setup lang="ts">
import ListComponent from '@/components/KanbanList.vue';
import { useBoardStore } from '@/stores/board';
import { computed, ref } from 'vue';
import draggable from 'vuedraggable/src/vuedraggable';

const boardStore = useBoardStore();
const op2 = ref();
const newTaskListName = ref('');

const onListMove = async (event: any) => {
    const { moved } = event;
    if (moved) {
        const listId = boardStore.sortedLists[moved.newIndex].id;
        try {
            await boardStore.moveList(listId, moved.newIndex);
        } catch (error) {
            console.error('Error moving list:', error);
        }
    }
};
const addList = () => {
    const listName = newTaskListName.value;
    if (listName && boardStore.currentBoard) {
        boardStore.createList(listName, boardStore.currentBoard.id);
        newTaskListName.value = '';
        toggleNewTaskPopover(event);
    }
};

const listModelValue = computed(() => boardStore.sortedLists);

const toggleNewTaskPopover = (event) => {
    newTaskListName.value = '';
    op2.value.toggle(event);
};
</script>
<template>
    <div class="flex space-x-8">
        <draggable :list="listModelValue" group="lists" @change="onListMove" item-key="id" class="flex space-x-8">
            <template #item="{ element }">
                <ListComponent :list="element" />
            </template>
        </draggable>
        <div class="justify-center p-4">
            <Button icon="pi pi-plus" label="New list" @click="toggleNewTaskPopover" />
        </div>
    </div>
    <Popover ref="op2">
        <div class="flex flex-col gap-4 w-[15rem]">
            <InputGroup>
                <InputText v-model="newTaskListName" />
                <Button icon="pi pi-check" @click="addList" severity="secondary"></Button>
            </InputGroup>
        </div>
    </Popover>
</template>

<style scoped>
.sortable-ghost {
    background: rgba(66, 66, 66, 0.3);
}
</style>
