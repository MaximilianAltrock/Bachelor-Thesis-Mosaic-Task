<template>
    <Card class="board-item cursor-pointer transition-all duration-200 hover:shadow-2 aspect-[2/1]" @click="navigateToBoard">
        <template #title>
            {{ board.name }}
        </template>
    </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import { useRouter } from 'vue-router';

const props = defineProps<{
    board: {
        id: number;
        name: string;
    };
}>();

const router = useRouter();

const navigateToBoard = () => {
    router.push(`/board/${props.board.id}`);
};
</script>

<style scoped>
.board-item {
    width: 100%;
    transition: all 0.2s ease;
}

.board-item:hover {
    transform: translateY(-4px);
}
</style>
