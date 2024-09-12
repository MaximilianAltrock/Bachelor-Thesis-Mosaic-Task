<script setup lang="ts">
defineProps<{
    visible: boolean;
    entryTitle: string | undefined;
}>();

defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'close'): void;
    (e: 'confirm'): void;
}>();
</script>
<template>
    <Dialog :visible="visible" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="entryTitle">
                Are you sure you want to delete <b>{{ entryTitle }}</b
                >?
            </span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="$emit('close')" />
            <Button label="Yes" icon="pi pi-check" @click="$emit('confirm')" />
        </template>
    </Dialog>
</template>
