<template>
    <div class="flex items-center mt-2 text-xl text-center">
        <div class="date-display shrink-0">
            <div class="date-day">{{ formatDay(entry.created_at) }}</div>
            <div class="date-month">{{ formatMonth(entry.created_at) }}</div>
        </div>
        <div class="flex justify-center flex-grow">
            <span v-if="!editingTitle" @click="$emit('toggle-edit')" class="text-3xl text-center cursor-pointer custom-font">{{ entry.title }}</span>
            <InputText v-else type="text" v-model="localTitle" @blur="saveTitle" @keyup.enter="saveTitle" @vue:mounted="textFocus" class="w-full text-center" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { JournalEntry } from '@/types';
import { format, parseISO } from 'date-fns';
import { ref } from 'vue';

const props = defineProps<{
    entry: JournalEntry;
    editingTitle: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:title', title: string): void;
    (e: 'toggle-edit'): void;
}>();

const localTitle = ref(props.entry.title);

const formatDay = (dateString: string) => format(parseISO(dateString), 'd');
const formatMonth = (dateString: string) => format(parseISO(dateString), 'MMM');

const textFocus = (el: any) => {
    el.el?.focus();
};

const saveTitle = () => {
    emit('update:title', localTitle.value);
};
</script>

<style scoped>
.custom-font {
    font-family: 'CustomFont', sans-serif;
}

.date-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    margin-right: 1rem;
}

.date-day {
    font-size: 1.2rem;
    font-weight: bold;
    line-height: 1;
}

.date-month {
    font-size: 0.8rem;
    text-transform: uppercase;
}
</style>
