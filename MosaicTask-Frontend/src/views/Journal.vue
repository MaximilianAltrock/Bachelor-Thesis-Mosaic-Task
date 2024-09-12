<script setup lang="ts">
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog.vue';
import JournalMonthGroup from '@/components/JournalMonthGroup.vue';
import { useJournalStore } from '@/stores/journal';
import type { JournalEntry, Task, User } from '@/types';
import { format, parseISO } from 'date-fns';
import { computed, onBeforeMount, ref } from 'vue';

const journalStore = useJournalStore();
const deleteJournalEntryDialog = ref(false);
const selectedEntry = ref<JournalEntry | null>(null);
const shareableUsers = ref<User[]>([]);
const availableTasks = ref<Task[]>([]);

onBeforeMount(async () => {
    try {
        await journalStore.fetchJournalEntries();
        shareableUsers.value = await journalStore.fetchShareableUsers();
        availableTasks.value = await journalStore.fetchAvailableTasks();
    } catch (error) {
        console.error('Error loading data:', error);
        // TODO: Implement user-friendly error handling
    }
});

const groupedEntries = computed(() => {
    const grouped: Record<string, JournalEntry[]> = {};
    journalStore.entries.forEach((entry) => {
        const date = parseISO(entry.created_at);
        const monthYear = format(date, 'MMMM, yyyy');
        if (!grouped[monthYear]) {
            grouped[monthYear] = [];
        }
        grouped[monthYear].push(entry);
    });

    // Sort entries within each group by date (newest first)
    Object.keys(grouped).forEach((key) => {
        grouped[key].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    });

    return grouped;
});

const handleFabClick = () => {
    createNewEntry();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const createNewEntry = async () => {
    const now = new Date();
    const newEntry = {
        title: format(now, 'EEEE, MMMM do'),
        content: '',
        visibility: 'private',
        shared_with: [],
        created_at: now.toISOString()
    };
    await journalStore.createJournalEntry(newEntry);
};

const updateEntry = (updatedEntry: JournalEntry) => {
    journalStore.updateJournalEntry(updatedEntry);
};

const showDeleteConfirmation = (entryId: number) => {
    selectedEntry.value = journalStore.entries.find((entry) => entry.id === entryId) || null;
    if (selectedEntry.value) {
        deleteJournalEntryDialog.value = true;
    }
};
const closeDeleteDialog = () => {
    deleteJournalEntryDialog.value = false;
};

const confirmDeleteEntry = async () => {
    if (selectedEntry.value) {
        await journalStore.deleteJournalEntry(selectedEntry.value.id);
        deleteJournalEntryDialog.value = false;
    }
};
</script>
<template>
    <div class="relative">
        <div class="grid grid-cols-1 gap-10">
            <template v-for="(group, monthYear) in groupedEntries" :key="monthYear">
                <JournalMonthGroup :month-year="monthYear" :entries="group" :shareable-users="shareableUsers" :available-tasks="availableTasks" @update-entry="updateEntry" @delete-entry="showDeleteConfirmation" />
            </template>
        </div>
        <Button @click="handleFabClick" icon="pi pi-plus" size="large" severity="primary" rounded class="fixed z-50 bottom-12 right-20 md:right-10 fab-button" style="position: fixed !important; width: 4rem; height: 4rem" />
    </div>
    <DeleteConfirmationDialog v-model:visible="deleteJournalEntryDialog" :entry-title="selectedEntry?.title" @confirm="confirmDeleteEntry" @close="closeDeleteDialog" />
</template>

<style scoped>
.fab-button {
    transition: all 0.3s ease;
}

.fab-button:hover {
    transform: scale(1.1);
}
</style>
