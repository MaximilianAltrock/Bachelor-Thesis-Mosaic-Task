<script setup>
import { useBoardStore } from '@/stores/board';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppMenuItem from './AppMenuItem.vue';

const boardStore = useBoardStore();
const router = useRouter();

const menuModel = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
    },
    {
        label: 'Journal',
        items: [{ label: 'Journal', icon: 'pi pi-fw pi-book', to: '/journal' }]
    },
    {
        label: 'Boards',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'All Boards',
                icon: 'pi pi-fw pi-folder-open',
                items: []
            }
        ]
    }
]);

const updateBoardsInMenu = () => {
    const boardsMenuItem = menuModel.value.find((item) => item.label === 'Boards');
    if (boardsMenuItem && boardsMenuItem.items[0]) {
        boardsMenuItem.items[0].items = boardStore.boards.map((board) => ({
            label: board.name,
            icon: 'pi pi-fw pi-file',
            command: () => {
                router.push(`/board/${board.id}`);
            }
        }));
    }
};

const loadBoards = async () => {
    await boardStore.fetchBoards();
    updateBoardsInMenu();
};

onMounted(() => {
    if (boardStore.boards.length === 0) {
        loadBoards();
    }
});

watch(
    () => boardStore.boards,
    () => {
        updateBoardsInMenu();
    },
    { deep: true }
);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in menuModel" :key="i">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
