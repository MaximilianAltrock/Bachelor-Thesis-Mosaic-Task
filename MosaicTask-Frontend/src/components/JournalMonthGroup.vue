<template>
    <div class="flex flex-col items-center place-items-center">
        <h2 class="font-bold mb-10 w-full text-center max-w-[40rem] custom-font text-muted-color">{{ monthYear }}</h2>
        <div class="grid w-full grid-cols-1 gap-20 place-items-center">
            <JournalEntry v-for="entry in entries" :key="entry.id" :entry="entry" :shareable-users="shareableUsers" :available-tasks="availableTasks" @update-entry="updateEntry" @delete-entry="$emit('delete-entry', $event)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useJournalStore } from '@/stores/journal';
import type { JournalEntry, Task, User } from '@/types';

const props = defineProps<{
    monthYear: string;
    entries: JournalEntry[];
    shareableUsers: User[];
    availableTasks: Task[];
}>();

const journalStore = useJournalStore();

const updateEntry = (updatedEntry: JournalEntry) => {
    journalStore.updateJournalEntry(updatedEntry);
};
</script>

<style scoped>
.custom-font {
    font-size: 4rem;
    font-family: 'CustomFont', sans-serif;
}
</style>
