<script setup lang="ts">
import type { JournalEntry } from '@/types';
import { ref } from 'vue';

const props = defineProps<{
    entry: JournalEntry;
    editingContent: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:content', content: string): void;
    (e: 'toggle-edit'): void;
}>();

const localContent = ref(props.entry.content);

const textFocus = (el: any) => {
    el.el?.focus();
};
const saveContent = () => {
    emit('update:content', localContent.value);
};
</script>

<template>
    <div style="min-height: 10rem" class="m-4">
        <Textarea
            v-if="editingContent"
            v-model="localContent"
            @vue:mounted="textFocus"
            @blur="saveContent"
            placeholder="Write something about your thoughts, feelings, and experiences..."
            :autoResize="true"
            rows="5"
            class="w-full border-none focus:outline-none focus:ring-0"
        />
        <p v-else @click="$emit('toggle-edit')" class="cursor-pointer description-text">
            {{ entry.content || 'Write something about your thoughts, feelings, and experiences...' }}
        </p>
    </div>
</template>

<style scoped>
.description-text {
    word-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;
    max-width: 100%;
}
</style>
