<script setup lang="ts">
import JournalEntryContent from '@/components/JournalEntryContent.vue';
import JournalEntryFooter from '@/components/JournalEntryFooter.vue';
import JournalEntryTitle from '@/components/JournalEntryTitle.vue';
import type { JournalEntry, Task, User } from '@/types';
import { ref, watch } from 'vue';

const props = defineProps<{
    entry: JournalEntry;
    shareableUsers: User[];
    availableTasks: Task[];
}>();

const emit = defineEmits<{
    (e: 'update-entry', entry: JournalEntry): void;
    (e: 'delete-entry', id: number): void;
}>();

const localEntry = ref({ ...props.entry });
const editingTitle = ref(false);
const editingContent = ref(false);

watch(
    () => props.entry,
    (newEntry) => {
        localEntry.value = { ...newEntry };
    },
    { deep: true }
);

const toggleEditTitle = () => {
    editingTitle.value = !editingTitle.value;
};

const toggleEditContent = () => {
    editingContent.value = !editingContent.value;
};

const updateTitle = async (newTitle: string) => {
    localEntry.value.title = newTitle;
    await saveEntry();
    editingTitle.value = false;
};

const updateContent = async (newContent: string) => {
    localEntry.value.content = newContent;
    await saveEntry();
    editingContent.value = false;
};

const updateMood = async (mood: { valence: number; arousal: number }) => {
    localEntry.value.valence = mood.valence;
    localEntry.value.arousal = mood.arousal;
    await saveEntry();
};

const updateVisibility = async (visibility: string, sharedWith: number[]) => {
    localEntry.value.visibility = visibility;
    localEntry.value.shared_with = sharedWith;
    await saveEntry();
};

const updateTask = async (taskId: number | null) => {
    localEntry.value.task = taskId;
    await saveEntry();
};

const saveEntry = async () => {
    emit('update-entry', localEntry.value);
};
</script>
<template>
    <Card style="width: 40rem; overflow: hidden">
        <template #title>
            <JournalEntryTitle :entry="localEntry" :editing-title="editingTitle" @update:title="updateTitle" @toggle-edit="toggleEditTitle" />
        </template>
        <template #content>
            <JournalEntryContent :entry="entry" :editing-content="editingContent" @update:content="updateContent" @toggle-edit="toggleEditContent" />
        </template>
        <<template #footer>
            <JournalEntryFooter
                :entry="localEntry"
                :shareable-users="shareableUsers"
                :available-tasks="availableTasks"
                @update:mood="updateMood"
                @update:visibility="updateVisibility"
                @update:task="updateTask"
                @delete="$emit('delete-entry', localEntry.id)"
            />
        </template>
    </Card>
</template>
