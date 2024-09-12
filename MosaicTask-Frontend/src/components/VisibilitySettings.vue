<script setup lang="ts">
import type { User } from '@/types';
import { ref, watch } from 'vue';

const props = defineProps<{
    visibility: string;
    sharedWith: number[];
    shareableUsers: User[];
}>();

const emit = defineEmits<{
    (e: 'update:visibility', visibility: string, sharedWith: number[]): void;
}>();

const localVisibility = ref(props.visibility);
const localSharedWith = ref(props.sharedWith);

watch(
    () => props.visibility,
    (newVisibility) => {
        localVisibility.value = newVisibility;
    }
);

watch(
    () => props.sharedWith,
    (newSharedWith) => {
        localSharedWith.value = newSharedWith;
    }
);

const saveVisibilityChanges = () => {
    if (localVisibility.value === 'shared' && localSharedWith.value.length === 0) {
        console.error('Please select at least one user to share with.');
        return;
    }

    emit('update:visibility', localVisibility.value, localVisibility.value === 'shared' ? localSharedWith.value : []);
};
</script>

<template>
    <div class="flex flex-col gap-4 w-[20rem]">
        <div>
            <span class="block mb-2 font-medium">Select visibility</span>
        </div>
        <div>
            <RadioButton v-model="localVisibility" value="public" inputId="public" />
            <label for="public" class="ml-2">Public</label>
        </div>
        <div>
            <RadioButton v-model="localVisibility" value="private" inputId="private" />
            <label for="private" class="ml-2">Private</label>
        </div>
        <div>
            <RadioButton v-model="localVisibility" value="shared" inputId="shared" />
            <label for="shared" class="ml-2">Shared</label>
        </div>

        <div v-if="localVisibility === 'shared'">
            <h4>Select users:</h4>
            <MultiSelect :options="shareableUsers" v-model="localSharedWith" optionLabel="username" optionValue="id" display="chip" filter placeholder="Select users" class="w-full md:w-80" />
        </div>

        <Button label="Save" @click="saveVisibilityChanges" />
    </div>
</template>
